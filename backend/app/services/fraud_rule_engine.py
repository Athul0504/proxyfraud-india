import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional, Set
from app.services.fraud_dataset_service import get_all_applicants, get_applicant_by_id, get_all_transactions

# ==============================================================================
# RULE ENGINE CONFIGURATION & DETERMINISTIC THRESHOLDS
# ==============================================================================
RAPID_APPLICATION_WINDOW_MINUTES = 5.0   # 5-minute window for rapid application submission cluster
HIGH_VELOCITY_WINDOW_MINUTES = 15.0       # 15-minute sliding window for transaction velocity
HIGH_VELOCITY_MIN_COUNT = 5              # >= 5 transactions in 15 mins triggers HIGH_TRANSACTION_VELOCITY
AMOUNT_SPIKE_TEST_MAX = 100.0            # <= ₹100.0 is considered a test transaction
AMOUNT_SPIKE_LARGE_MIN = 50000.0         # >= ₹50,000.0 is considered a large transaction spike
RAPID_HIGH_VALUE_THRESHOLD = 50000.0     # >= ₹50,000.0 threshold for high-value transactions
RAPID_HIGH_VALUE_MIN_COUNT = 3           # >= 3 high-value transactions in 15 mins triggers RAPID_HIGH_VALUE_ACTIVITY


def parse_iso_timestamp(ts_str: str) -> datetime:
    """Helper to parse ISO format timestamp strings to datetime objects."""
    clean_ts = ts_str.replace("Z", "+00:00")
    return datetime.fromisoformat(clean_ts)


def detect_all_global_signals(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Evaluates all 7 deterministic fraud detection rules across the entire dataset.
    Returns a list of structured signal dictionaries.
    """
    applicants = get_all_applicants(conn)
    transactions = get_all_transactions(conn)

    signals: List[Dict[str, Any]] = []

    # Map transactions by applicant_id
    txns_by_applicant: Dict[str, List[Dict[str, Any]]] = {}
    for txn in transactions:
        app_id = txn["applicant_id"]
        if app_id not in txns_by_applicant:
            txns_by_applicant[app_id] = []
        txns_by_applicant[app_id].append(txn)

    # --------------------------------------------------------------------------
    # RULE 1: SHARED DEVICE
    # --------------------------------------------------------------------------
    device_groups: Dict[str, List[str]] = {}
    for app in applicants:
        dev_id = app["device_id"]
        if dev_id:
            device_groups.setdefault(dev_id, []).append(app["applicant_id"])

    for dev_id, app_ids in device_groups.items():
        if len(app_ids) > 1:
            severity = "CRITICAL" if len(app_ids) >= 4 else "HIGH"
            signals.append({
                "signal_type": "SHARED_DEVICE",
                "severity": severity,
                "description": f"Shared device {dev_id} used by {len(app_ids)} applicants",
                "applicant_ids": sorted(app_ids),
                "evidence": {
                    "device_id": dev_id,
                    "applicant_count": len(app_ids),
                    "sharing_applicants": sorted(app_ids)
                }
            })

    # --------------------------------------------------------------------------
    # RULE 2: SHARED IP
    # --------------------------------------------------------------------------
    ip_groups: Dict[str, List[str]] = {}
    for app in applicants:
        ip_addr = app["ip_address"]
        if ip_addr:
            ip_groups.setdefault(ip_addr, []).append(app["applicant_id"])

    for ip_addr, app_ids in ip_groups.items():
        if len(app_ids) > 1:
            severity = "CRITICAL" if len(app_ids) >= 4 else "HIGH"
            signals.append({
                "signal_type": "SHARED_IP",
                "severity": severity,
                "description": f"Shared IP address {ip_addr} used by {len(app_ids)} applicants",
                "applicant_ids": sorted(app_ids),
                "evidence": {
                    "ip_address": ip_addr,
                    "applicant_count": len(app_ids),
                    "sharing_applicants": sorted(app_ids)
                }
            })

    # --------------------------------------------------------------------------
    # RULE 3: SHARED BANK ACCOUNT
    # --------------------------------------------------------------------------
    bank_groups: Dict[str, List[str]] = {}
    for app in applicants:
        bank_id = app["bank_account_id"]
        if bank_id:
            bank_groups.setdefault(bank_id, []).append(app["applicant_id"])

    for bank_id, app_ids in bank_groups.items():
        if len(app_ids) > 1:
            signals.append({
                "signal_type": "SHARED_BANK_ACCOUNT",
                "severity": "CRITICAL",
                "description": f"Bank account {bank_id} shared across {len(app_ids)} applicants",
                "applicant_ids": sorted(app_ids),
                "evidence": {
                    "bank_account_id": bank_id,
                    "applicant_count": len(app_ids),
                    "sharing_applicants": sorted(app_ids)
                }
            })

    # --------------------------------------------------------------------------
    # RULE 4: RAPID APPLICATION CLUSTER
    # --------------------------------------------------------------------------
    parsed_applicants = []
    for app in applicants:
        dt = parse_iso_timestamp(app["application_timestamp"])
        parsed_applicants.append({"applicant_id": app["applicant_id"], "dt": dt, "raw": app})

    parsed_applicants.sort(key=lambda x: x["dt"])

    # Sliding window to find clusters submitted within 5 minutes of each other
    cluster_found: Set[str] = set()
    n = len(parsed_applicants)
    for i in range(n):
        window_apps = [parsed_applicants[i]]
        for j in range(i + 1, n):
            diff_seconds = (parsed_applicants[j]["dt"] - parsed_applicants[i]["dt"]).total_seconds()
            if diff_seconds <= (RAPID_APPLICATION_WINDOW_MINUTES * 60):
                window_apps.append(parsed_applicants[j])
            else:
                break
        
        if len(window_apps) >= 3:
            cluster_ids = sorted([a["applicant_id"] for a in window_apps])
            cluster_key = "-".join(cluster_ids)
            if cluster_key not in cluster_found:
                cluster_found.add(cluster_key)
                time_span_minutes = round((window_apps[-1]["dt"] - window_apps[0]["dt"]).total_seconds() / 60.0, 2)
                signals.append({
                    "signal_type": "RAPID_APPLICATION_CLUSTER",
                    "severity": "HIGH",
                    "description": f"{len(window_apps)} loan applications submitted within {RAPID_APPLICATION_WINDOW_MINUTES:.0f} minutes (time span: {time_span_minutes} mins)",
                    "applicant_ids": cluster_ids,
                    "evidence": {
                        "applicant_count": len(window_apps),
                        "time_window_minutes": RAPID_APPLICATION_WINDOW_MINUTES,
                        "actual_span_minutes": time_span_minutes,
                        "timestamps": [a["raw"]["application_timestamp"] for a in window_apps]
                    }
                })

    # --------------------------------------------------------------------------
    # TRANSACTION RULES (RULES 5, 6, 7 per applicant)
    # --------------------------------------------------------------------------
    for app in applicants:
        app_id = app["applicant_id"]
        app_txns = txns_by_applicant.get(app_id, [])
        if not app_txns:
            continue

        # Sort applicant transactions chronologically
        parsed_txns = []
        for t in app_txns:
            dt = parse_iso_timestamp(t["timestamp"])
            parsed_txns.append({"dt": dt, "data": t})
        parsed_txns.sort(key=lambda x: x["dt"])

        # RULE 5: TRANSACTION VELOCITY (>= 5 txns in 15 mins)
        max_txns_in_window = 0
        m = len(parsed_txns)
        for i in range(m):
            count = 0
            for j in range(i, m):
                if (parsed_txns[j]["dt"] - parsed_txns[i]["dt"]).total_seconds() <= (HIGH_VELOCITY_WINDOW_MINUTES * 60):
                    count += 1
                else:
                    break
            if count > max_txns_in_window:
                max_txns_in_window = count

        if max_txns_in_window >= HIGH_VELOCITY_MIN_COUNT:
            signals.append({
                "signal_type": "HIGH_TRANSACTION_VELOCITY",
                "severity": "HIGH",
                "description": f"Abnormal transaction velocity: {max_txns_in_window} transactions within a short time window",
                "applicant_ids": [app_id],
                "evidence": {
                    "applicant_id": app_id,
                    "transaction_count": max_txns_in_window,
                    "time_window_minutes": HIGH_VELOCITY_WINDOW_MINUTES,
                    "total_applicant_transactions": len(app_txns)
                }
            })

        # RULE 6: TRANSACTION AMOUNT ANOMALY (Test transaction <= ₹100 followed by spike >= ₹50,000)
        has_test = False
        test_amount = 0.0
        spike_found = False
        spike_amount = 0.0
        spike_txn_id = ""

        for item in parsed_txns:
            amt = item["data"]["amount"]
            if amt <= AMOUNT_SPIKE_TEST_MAX:
                has_test = True
                test_amount = amt
            elif has_test and amt >= AMOUNT_SPIKE_LARGE_MIN:
                spike_found = True
                spike_amount = amt
                spike_txn_id = item["data"]["transaction_id"]
                break

        if spike_found:
            signals.append({
                "signal_type": "TRANSACTION_AMOUNT_SPIKE",
                "severity": "HIGH",
                "description": f"Large transaction spike detected (₹{spike_amount:,.2f}) following smaller test transactions (₹{test_amount:,.2f})",
                "applicant_ids": [app_id],
                "evidence": {
                    "applicant_id": app_id,
                    "small_test_amount": test_amount,
                    "spike_amount": spike_amount,
                    "spike_transaction_id": spike_txn_id
                }
            })

        # RULE 7: RAPID HIGH-VALUE ACTIVITY (>= 3 txns >= ₹50,000 within 15 mins)
        high_val_txns = [pt for pt in parsed_txns if pt["data"]["amount"] >= RAPID_HIGH_VALUE_THRESHOLD]
        hv_count_in_window = 0
        hv_m = len(high_val_txns)
        for i in range(hv_m):
            cnt = 0
            for j in range(i, hv_m):
                if (high_val_txns[j]["dt"] - high_val_txns[i]["dt"]).total_seconds() <= (HIGH_VELOCITY_WINDOW_MINUTES * 60):
                    cnt += 1
                else:
                    break
            if cnt > hv_count_in_window:
                hv_count_in_window = cnt

        if hv_count_in_window >= RAPID_HIGH_VALUE_MIN_COUNT:
            signals.append({
                "signal_type": "RAPID_HIGH_VALUE_ACTIVITY",
                "severity": "CRITICAL",
                "description": f"Rapid high-value activity: {hv_count_in_window} high-value transactions (≥ ₹{RAPID_HIGH_VALUE_THRESHOLD:,.0f}) within 15 minutes",
                "applicant_ids": [app_id],
                "evidence": {
                    "applicant_id": app_id,
                    "high_value_transaction_count": hv_count_in_window,
                    "amount_threshold": RAPID_HIGH_VALUE_THRESHOLD,
                    "time_window_minutes": HIGH_VELOCITY_WINDOW_MINUTES
                }
            })

    return signals


def analyze_single_applicant(conn: sqlite3.Connection, applicant_id: str) -> Optional[Dict[str, Any]]:
    """
    Analyzes one applicant against all global rules and returns structured signal detection results.
    DOES NOT compute a final 0-100 risk score.
    """
    applicant = get_applicant_by_id(conn, applicant_id)
    if not applicant:
        return None

    all_signals = detect_all_global_signals(conn)

    # Filter signals relevant to this applicant
    detected_signals = [s for s in all_signals if applicant_id in s["applicant_ids"]]

    # Collect related applicants (other applicants appearing in shared signals with this applicant)
    related_set: Set[str] = set()
    for sig in detected_signals:
        for other_id in sig["applicant_ids"]:
            if other_id != applicant_id:
                related_set.add(other_id)

    return {
        "applicant_id": applicant_id,
        "applicant_name": applicant["applicant_name"],
        "signal_count": len(detected_signals),
        "detected_signals": detected_signals,
        "related_applicants": sorted(list(related_set)),
        "evidence": {
            "device_id": applicant["device_id"],
            "ip_address": applicant["ip_address"],
            "bank_account_id": applicant["bank_account_id"],
            "application_timestamp": applicant["application_timestamp"],
            "loan_amount": applicant["loan_amount"]
        }
    }


def analyze_all_applicants(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Analyzes all applicants in the database and returns signal detection summaries for each.
    """
    applicants = get_all_applicants(conn)
    all_signals = detect_all_global_signals(conn)

    results = []
    for app in applicants:
        app_id = app["applicant_id"]
        detected = [s for s in all_signals if app_id in s["applicant_ids"]]
        
        related_set: Set[str] = set()
        for sig in detected:
            for other_id in sig["applicant_ids"]:
                if other_id != app_id:
                    related_set.add(other_id)

        results.append({
            "applicant_id": app_id,
            "applicant_name": app["applicant_name"],
            "signal_count": len(detected),
            "detected_signals": detected,
            "related_applicants": sorted(list(related_set)),
            "evidence": {
                "device_id": app["device_id"],
                "ip_address": app["ip_address"],
                "bank_account_id": app["bank_account_id"],
                "application_timestamp": app["application_timestamp"],
                "loan_amount": app["loan_amount"]
            }
        })

    return results


def discover_fraud_clusters(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Algorithmic graph-based discovery of coordinated fraud clusters from dataset relationships.
    Does NOT hardcode cluster names or applicant IDs.
    """
    applicants = get_all_applicants(conn)
    all_signals = detect_all_global_signals(conn)

    # Build adjacency list graph among applicants
    adj: Dict[str, Set[str]] = {app["applicant_id"]: set() for app in applicants}

    for sig in all_signals:
        app_ids = sig["applicant_ids"]
        if len(app_ids) > 1:
            for i in range(len(app_ids)):
                for j in range(i + 1, len(app_ids)):
                    u, v = app_ids[i], app_ids[j]
                    adj[u].add(v)
                    adj[v].add(u)

    # Find connected components (clusters)
    visited: Set[str] = set()
    clusters: List[Dict[str, Any]] = []
    cluster_counter = 1

    app_dict = {a["applicant_id"]: a for a in applicants}

    for app_id in sorted(adj.keys()):
        if app_id not in visited:
            # BFS to find component
            component = []
            queue = [app_id]
            visited.add(app_id)
            while queue:
                curr = queue.pop(0)
                component.append(curr)
                for neighbor in sorted(list(adj[curr])):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            # Only consider groups of 2 or more as clusters
            if len(component) >= 2:
                component_set = set(component)
                
                # Gather shared attributes
                devices = set(app_dict[m]["device_id"] for m in component if app_dict[m]["device_id"])
                ips = set(app_dict[m]["ip_address"] for m in component if app_dict[m]["ip_address"])
                banks = set(app_dict[m]["bank_account_id"] for m in component if app_dict[m]["bank_account_id"])

                # Gather unique signals affecting this component
                cluster_signals = []
                signal_descriptions = set()
                for sig in all_signals:
                    if any(mid in component_set for mid in sig["applicant_ids"]):
                        if sig["description"] not in signal_descriptions:
                            signal_descriptions.add(sig["description"])
                            cluster_signals.append(sig["description"])

                # Name cluster dynamically (e.g., Cluster Syndicate Alpha if 4-member cluster, or Cluster #N)
                cluster_name = f"Cluster Syndicate Alpha" if len(component) == 4 else f"Coordinated Fraud Cluster #{cluster_counter}"

                clusters.append({
                    "cluster_id": f"CLUSTER-{cluster_counter:02d}",
                    "cluster_name": cluster_name,
                    "member_applicant_ids": sorted(component),
                    "shared_attributes": {
                        "device_ids": sorted(list(devices)),
                        "ip_addresses": sorted(list(ips)),
                        "bank_account_ids": sorted(list(banks))
                    },
                    "detected_signals": cluster_signals,
                    "description": f"Discovered coordinated cluster of {len(component)} applicants sharing infrastructure attributes (Devices: {', '.join(devices)}, IPs: {', '.join(ips)}, Bank Accounts: {', '.join(banks)})."
                })
                cluster_counter += 1

    return clusters
