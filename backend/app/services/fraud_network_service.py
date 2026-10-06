import sqlite3
from typing import List, Dict, Any
from app.services.fraud_dataset_service import get_all_applicants
from app.services.fraud_scoring_engine import calculate_all_applicants_risk, calculate_cluster_risk

def build_fraud_network_graph(conn: sqlite3.Connection) -> Dict[str, Any]:
    """
    Constructs graph nodes, edges, cluster info, and summary metadata derived directly
    from Step 5A DB data, Step 5B rule signals, and Step 5C risk scores.
    """
    applicants_raw = get_all_applicants(conn)
    app_risk_list = calculate_all_applicants_risk(conn)
    clusters = calculate_cluster_risk(conn)

    # Index risk data by applicant_id
    risk_by_app = {r["applicant_id"]: r for r in app_risk_list}

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # Maps for tracking infrastructure sharing
    device_to_apps: Dict[str, List[str]] = {}
    ip_to_apps: Dict[str, List[str]] = {}
    bank_to_apps: Dict[str, List[str]] = {}

    for app in applicants_raw:
        app_id = app["applicant_id"]
        dev = app["device_id"]
        ip = app["ip_address"]
        bank = app["bank_account_id"]

        if dev:
            device_to_apps.setdefault(dev, []).append(app_id)
        if ip:
            ip_to_apps.setdefault(ip, []).append(app_id)
        if bank:
            bank_to_apps.setdefault(bank, []).append(app_id)

    # 1. Create APPLICANT nodes
    for app in applicants_raw:
        app_id = app["applicant_id"]
        r_info = risk_by_app.get(app_id, {})

        nodes.append({
            "id": app_id,
            "type": "APPLICANT",
            "label": app_id,
            "name": app["applicant_name"],
            "risk_score": r_info.get("risk_score", 0),
            "risk_level": r_info.get("risk_level", "LOW"),
            "recommendation": r_info.get("recommendation", "ALLOW"),
            "signal_count": len(r_info.get("signals", [])),
            "is_shared": False
        })

    # 2. Create DEVICE nodes & edges
    for dev_id, app_ids in device_to_apps.items():
        is_shared = len(app_ids) > 1
        nodes.append({
            "id": dev_id,
            "type": "DEVICE",
            "label": dev_id,
            "applicant_count": len(app_ids),
            "is_shared": is_shared,
            "connected_applicants": sorted(app_ids)
        })

        for app_id in app_ids:
            edges.append({
                "source": app_id,
                "target": dev_id,
                "relationship": "SHARED_DEVICE" if is_shared else "USES_DEVICE",
                "is_shared": is_shared,
                "applicant_count": len(app_ids)
            })

    # 3. Create IP nodes & edges
    for ip_addr, app_ids in ip_to_apps.items():
        is_shared = len(app_ids) > 1
        nodes.append({
            "id": ip_addr,
            "type": "IP",
            "label": ip_addr,
            "applicant_count": len(app_ids),
            "is_shared": is_shared,
            "connected_applicants": sorted(app_ids)
        })

        for app_id in app_ids:
            edges.append({
                "source": app_id,
                "target": ip_addr,
                "relationship": "SHARED_IP" if is_shared else "USES_IP",
                "is_shared": is_shared,
                "applicant_count": len(app_ids)
            })

    # 4. Create BANK_ACCOUNT nodes & edges
    for bank_id, app_ids in bank_to_apps.items():
        is_shared = len(app_ids) > 1
        nodes.append({
            "id": bank_id,
            "type": "BANK_ACCOUNT",
            "label": bank_id,
            "applicant_count": len(app_ids),
            "is_shared": is_shared,
            "connected_applicants": sorted(app_ids)
        })

        for app_id in app_ids:
            edges.append({
                "source": app_id,
                "target": bank_id,
                "relationship": "SHARED_BANK_ACCOUNT" if is_shared else "USES_BANK_ACCOUNT",
                "is_shared": is_shared,
                "applicant_count": len(app_ids)
            })

    # Calculate summary statistics
    shared_devs = [k for k, v in device_to_apps.items() if len(v) > 1]
    shared_ips = [k for k, v in ip_to_apps.items() if len(v) > 1]
    shared_banks = [k for k, v in bank_to_apps.items() if len(v) > 1]

    highest_score = max((r.get("risk_score", 0) for r in app_risk_list), default=0)
    highest_level = "CRITICAL" if highest_score >= 80 else ("HIGH" if highest_score >= 60 else "LOW")
    largest_cluster = max((len(c["member_applicant_ids"]) for c in clusters), default=0)

    summary = {
        "total_applicants": len(applicants_raw),
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "total_clusters": len(clusters),
        "largest_cluster_size": largest_cluster,
        "shared_devices_count": len(shared_devs),
        "shared_ips_count": len(shared_ips),
        "shared_bank_accounts_count": len(shared_banks),
        "highest_risk_score": highest_score,
        "highest_risk_level": highest_level
    }

    return {
        "nodes": nodes,
        "edges": edges,
        "clusters": clusters,
        "summary": summary
    }
