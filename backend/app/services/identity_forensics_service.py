import sqlite3
from typing import List, Dict, Any, Optional, Set
from app.services.fraud_dataset_service import get_all_applicants, get_applicant_by_id

SYNTHETIC_DOCUMENTS = [
    # Normal applicants (APP-1001 to APP-1007)
    {"document_id": "DOC-1001-PAN", "applicant_id": "APP-1001", "document_type": "PAN", "document_number": "SYN-PAN-1001", "name_on_document": "Aarav Sharma", "date_of_birth": "1991-05-14", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1001-AAD", "applicant_id": "APP-1001", "document_type": "AADHAAR", "document_number": "SYN-AAD-1001", "name_on_document": "Aarav Sharma", "date_of_birth": "1991-05-14", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1002-PAN", "applicant_id": "APP-1002", "document_type": "PAN", "document_number": "SYN-PAN-1002", "name_on_document": "Priya Patel", "date_of_birth": "1993-09-22", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1002-AAD", "applicant_id": "APP-1002", "document_type": "AADHAAR", "document_number": "SYN-AAD-1002", "name_on_document": "Priya Patel", "date_of_birth": "1993-09-22", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1003-PAN", "applicant_id": "APP-1003", "document_type": "PAN", "document_number": "SYN-PAN-1003", "name_on_document": "Rohan Mehta", "date_of_birth": "1989-11-03", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1003-AAD", "applicant_id": "APP-1003", "document_type": "AADHAAR", "document_number": "SYN-AAD-1003", "name_on_document": "Rohan Mehta", "date_of_birth": "1989-11-03", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1004-PAN", "applicant_id": "APP-1004", "document_type": "PAN", "document_number": "SYN-PAN-1004", "name_on_document": "Ananya Gupta", "date_of_birth": "1995-02-18", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1004-AAD", "applicant_id": "APP-1004", "document_type": "AADHAAR", "document_number": "SYN-AAD-1004", "name_on_document": "Ananya Gupta", "date_of_birth": "1995-02-18", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1005-PAN", "applicant_id": "APP-1005", "document_type": "PAN", "document_number": "SYN-PAN-1005", "name_on_document": "Vikram Singh", "date_of_birth": "1985-07-30", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1005-AAD", "applicant_id": "APP-1005", "document_type": "AADHAAR", "document_number": "SYN-AAD-1005", "name_on_document": "Vikram Singh", "date_of_birth": "1985-07-30", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1006-PAN", "applicant_id": "APP-1006", "document_type": "PAN", "document_number": "SYN-PAN-1006", "name_on_document": "Sneha Reddy", "date_of_birth": "1992-12-10", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1006-AAD", "applicant_id": "APP-1006", "document_type": "AADHAAR", "document_number": "SYN-AAD-1006", "name_on_document": "Sneha Reddy", "date_of_birth": "1992-12-10", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1007-PAN", "applicant_id": "APP-1007", "document_type": "PAN", "document_number": "SYN-PAN-1007", "name_on_document": "Kabir Nair", "date_of_birth": "1990-04-05", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1007-AAD", "applicant_id": "APP-1007", "document_type": "AADHAAR", "document_number": "SYN-AAD-1007", "name_on_document": "Kabir Nair", "date_of_birth": "1990-04-05", "document_status": "VERIFIED_SYNTHETIC"},

    # --- SUSPICIOUS IDENTITY FORENSICS PATTERNS (APP-1008, APP-1009, APP-1010, APP-1011) ---
    {"document_id": "DOC-1008-PAN", "applicant_id": "APP-1008", "document_type": "PAN", "document_number": "SYN-PAN-GROUP-01", "name_on_document": "Rajesh Verma", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},
    {"document_id": "DOC-1008-AAD", "applicant_id": "APP-1008", "document_type": "AADHAAR", "document_number": "SYN-AAD-GROUP-89", "name_on_document": "Rajesh Verma", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},

    {"document_id": "DOC-1009-PAN", "applicant_id": "APP-1009", "document_type": "PAN", "document_number": "SYN-PAN-GROUP-01", "name_on_document": "Suresh Kumar", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},
    {"document_id": "DOC-1009-AAD", "applicant_id": "APP-1009", "document_type": "AADHAAR", "document_number": "SYN-AAD-GROUP-89", "name_on_document": "Suresh Kumar", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},

    {"document_id": "DOC-1010-PAN", "applicant_id": "APP-1010", "document_type": "PAN", "document_number": "SYN-PAN-GROUP-01", "name_on_document": "Dinesh Kumar Joshi", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},
    {"document_id": "DOC-1010-AAD", "applicant_id": "APP-1010", "document_type": "AADHAAR", "document_number": "SYN-AAD-GROUP-89", "name_on_document": "Dinesh Kumar Joshi", "date_of_birth": "1988-04-15", "document_status": "FLAGGED"},

    {"document_id": "DOC-1011-PAN", "applicant_id": "APP-1011", "document_type": "PAN", "document_number": "SYN-PAN-GROUP-02", "name_on_document": "Rakesh Yadav", "date_of_birth": "1987-08-20", "document_status": "FLAGGED"},
    {"document_id": "DOC-1011-AAD", "applicant_id": "APP-1011", "document_type": "AADHAAR", "document_number": "SYN-AAD-1011", "name_on_document": "Manoj Kumar Yadav", "date_of_birth": "1987-08-20", "document_status": "FLAGGED"},

    # Normal applicants (APP-1012 to APP-1015)
    {"document_id": "DOC-1012-PAN", "applicant_id": "APP-1012", "document_type": "PAN", "document_number": "SYN-PAN-1012", "name_on_document": "Neha Deshmukh", "date_of_birth": "1994-06-11", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1012-AAD", "applicant_id": "APP-1012", "document_type": "AADHAAR", "document_number": "SYN-AAD-1012", "name_on_document": "Neha Deshmukh", "date_of_birth": "1994-06-11", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1013-PAN", "applicant_id": "APP-1013", "document_type": "PAN", "document_number": "SYN-PAN-1013", "name_on_document": "Aditya Iyer", "date_of_birth": "1991-10-08", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1013-AAD", "applicant_id": "APP-1013", "document_type": "AADHAAR", "document_number": "SYN-AAD-1013", "name_on_document": "Aditya Iyer", "date_of_birth": "1991-10-08", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1014-PAN", "applicant_id": "APP-1014", "document_type": "PAN", "document_number": "SYN-PAN-1014", "name_on_document": "Pooja Banerjee", "date_of_birth": "1996-01-25", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1014-AAD", "applicant_id": "APP-1014", "document_type": "AADHAAR", "document_number": "SYN-AAD-1014", "name_on_document": "Pooja Banerjee", "date_of_birth": "1996-01-25", "document_status": "VERIFIED_SYNTHETIC"},

    {"document_id": "DOC-1015-PAN", "applicant_id": "APP-1015", "document_type": "PAN", "document_number": "SYN-PAN-1015", "name_on_document": "Karan Malhotra", "date_of_birth": "1988-03-14", "document_status": "VERIFIED_SYNTHETIC"},
    {"document_id": "DOC-1015-AAD", "applicant_id": "APP-1015", "document_type": "AADHAAR", "document_number": "SYN-AAD-1015", "name_on_document": "Karan Malhotra", "date_of_birth": "1988-03-14", "document_status": "VERIFIED_SYNTHETIC"}
]


def seed_synthetic_identity_documents(conn: sqlite3.Connection):
    """
    Creates identity_documents table and seeds deterministic synthetic documents if empty.
    """
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS identity_documents (
            document_id TEXT PRIMARY KEY,
            applicant_id TEXT NOT NULL,
            document_type TEXT NOT NULL,
            document_number TEXT NOT NULL,
            name_on_document TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            document_status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(applicant_id) REFERENCES applicants(applicant_id)
        );
    """)

    cursor.execute("SELECT COUNT(*) FROM identity_documents")
    count = cursor.fetchone()[0]

    if count == 0:
        for doc in SYNTHETIC_DOCUMENTS:
            cursor.execute("""
                INSERT INTO identity_documents (
                    document_id, applicant_id, document_type, document_number,
                    name_on_document, date_of_birth, document_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                doc["document_id"], doc["applicant_id"], doc["document_type"],
                doc["document_number"], doc["name_on_document"],
                doc["date_of_birth"], doc["document_status"]
            ))
        conn.commit()
        print(f"Seeded {len(SYNTHETIC_DOCUMENTS)} synthetic document records successfully.")
    else:
        print(f"Table identity_documents already contains {count} records. Skipping seed.")


def get_all_documents(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM identity_documents ORDER BY applicant_id ASC, document_type ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_documents_by_applicant(conn: sqlite3.Connection, applicant_id: str) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM identity_documents WHERE applicant_id = ? ORDER BY document_type ASC", (applicant_id,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def detect_identity_forensic_signals(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Evaluates 5 deterministic identity forensics rules across all synthetic document records.
    """
    applicants = get_all_applicants(conn)
    all_docs = get_all_documents(conn)

    app_dict = {a["applicant_id"]: a for a in applicants}
    docs_by_app: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_docs:
        docs_by_app.setdefault(d["applicant_id"], []).append(d)

    signals: List[Dict[str, Any]] = []

    # --------------------------------------------------------------------------
    # RULE 1: DOCUMENT_REUSE (Same document_number associated with multiple applicants)
    # --------------------------------------------------------------------------
    doc_number_groups: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_docs:
        doc_number_groups.setdefault(d["document_number"], []).append(d)

    for doc_num, docs in doc_number_groups.items():
        app_ids = sorted(list(set(d["applicant_id"] for d in docs)))
        if len(app_ids) > 1:
            doc_type = docs[0]["document_type"]
            signals.append({
                "signal_type": "DOCUMENT_REUSE",
                "severity": "CRITICAL" if len(app_ids) >= 3 else "HIGH",
                "description": f"Synthetic document {doc_num} ({doc_type}) is associated with {len(app_ids)} applicants",
                "applicant_ids": app_ids,
                "evidence": {
                    "document_number": doc_num,
                    "document_type": doc_type,
                    "applicant_count": len(app_ids),
                    "sharing_applicants": app_ids
                }
            })

    # --------------------------------------------------------------------------
    # RULE 2: IDENTITY_REUSE (Same DOB & identity attributes across multiple applicants)
    # --------------------------------------------------------------------------
    dob_groups: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_docs:
        dob_groups.setdefault(d["date_of_birth"], []).append(d)

    for dob, docs in dob_groups.items():
        app_ids = sorted(list(set(d["applicant_id"] for d in docs)))
        # Only trigger if DOB is shared across multiple applicants WITH shared document patterns
        if len(app_ids) > 1 and any(d["document_status"] == "FLAGGED" for d in docs):
            signals.append({
                "signal_type": "IDENTITY_REUSE",
                "severity": "HIGH",
                "description": f"Synthetic identity attributes (DOB: {dob}) reused across {len(app_ids)} applicants",
                "applicant_ids": app_ids,
                "evidence": {
                    "date_of_birth": dob,
                    "applicant_count": len(app_ids),
                    "sharing_applicants": app_ids
                }
            })

    # --------------------------------------------------------------------------
    # RULE 3: NAME_MISMATCH (Applicant name differs from name_on_document)
    # --------------------------------------------------------------------------
    for app in applicants:
        app_id = app["applicant_id"]
        app_name = app["applicant_name"].strip().lower()
        my_docs = docs_by_app.get(app_id, [])

        for d in my_docs:
            doc_name = d["name_on_document"].strip().lower()
            # Deterministic comparison: check if primary name words match
            app_words = set(app_name.split())
            doc_words = set(doc_name.split())
            overlap = app_words.intersection(doc_words)

            if len(overlap) == 0:
                signals.append({
                    "signal_type": "NAME_MISMATCH",
                    "severity": "HIGH",
                    "description": f"Name mismatch on {d['document_type']}: Applicant '{app['applicant_name']}' vs Document '{d['name_on_document']}'",
                    "applicant_ids": [app_id],
                    "evidence": {
                        "applicant_id": app_id,
                        "applicant_name": app["applicant_name"],
                        "name_on_document": d["name_on_document"],
                        "document_id": d["document_id"],
                        "document_number": d["document_number"]
                    }
                })

    # --------------------------------------------------------------------------
    # RULE 4: DUPLICATE_DOCUMENT_PATTERN
    # --------------------------------------------------------------------------
    # Detect applicants submitting flagged or shared document numbers
    for app_id, my_docs in docs_by_app.items():
        flagged_docs = [d for d in my_docs if d["document_status"] == "FLAGGED"]
        if len(flagged_docs) >= 2:
            signals.append({
                "signal_type": "DUPLICATE_DOCUMENT_PATTERN",
                "severity": "HIGH",
                "description": f"Applicant {app_id} has {len(flagged_docs)} flagged synthetic document patterns attached",
                "applicant_ids": [app_id],
                "evidence": {
                    "applicant_id": app_id,
                    "flagged_document_count": len(flagged_docs),
                    "document_numbers": [d["document_number"] for d in flagged_docs]
                }
            })

    # --------------------------------------------------------------------------
    # RULE 5: MULTIPLE_DOCUMENTS_FOR_SAME_IDENTITY (Inconsistent names across docs)
    # --------------------------------------------------------------------------
    for app_id, my_docs in docs_by_app.items():
        if len(my_docs) >= 2:
            names = set(d["name_on_document"].strip() for d in my_docs)
            if len(names) > 1:
                signals.append({
                    "signal_type": "MULTIPLE_DOCUMENTS_FOR_SAME_IDENTITY",
                    "severity": "MEDIUM",
                    "description": f"Inconsistent document names for applicant {app_id}: {', '.join(sorted(list(names)))}",
                    "applicant_ids": [app_id],
                    "evidence": {
                        "applicant_id": app_id,
                        "distinct_names": sorted(list(names)),
                        "documents": [f"{d['document_type']}: {d['name_on_document']}" for d in my_docs]
                    }
                })

    return signals


def analyze_applicant_identity(conn: sqlite3.Connection, applicant_id: str) -> Optional[Dict[str, Any]]:
    """
    Performs synthetic document and identity forensic analysis for one applicant.
    """
    applicant = get_applicant_by_id(conn, applicant_id)
    if not applicant:
        return None

    docs = get_documents_by_applicant(conn, applicant_id)
    all_signals = detect_identity_forensic_signals(conn)

    detected = [s for s in all_signals if applicant_id in s["applicant_ids"]]

    related_set: Set[str] = set()
    for sig in detected:
        for other_id in sig["applicant_ids"]:
            if other_id != applicant_id:
                related_set.add(other_id)

    return {
        "applicant_id": applicant_id,
        "applicant_name": applicant["applicant_name"],
        "signal_count": len(detected),
        "detected_signals": detected,
        "related_applicants": sorted(list(related_set)),
        "documents": docs
    }


def analyze_all_applicants_identity(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Performs identity forensic analysis for all synthetic dataset applicants.
    """
    applicants = get_all_applicants(conn)
    all_signals = detect_identity_forensic_signals(conn)

    results = []
    for app in applicants:
        app_id = app["applicant_id"]
        docs = get_documents_by_applicant(conn, app_id)
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
            "documents": docs
        })

    return results


def discover_identity_clusters(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Discovers groups of applicants linked through reused synthetic identity & document information.
    """
    applicants = get_all_applicants(conn)
    all_signals = detect_identity_forensic_signals(conn)
    all_docs = get_all_documents(conn)

    adj: Dict[str, Set[str]] = {app["applicant_id"]: set() for app in applicants}

    for sig in all_signals:
        app_ids = sig["applicant_ids"]
        if len(app_ids) > 1:
            for i in range(len(app_ids)):
                for j in range(i + 1, len(app_ids)):
                    u, v = app_ids[i], app_ids[j]
                    adj[u].add(v)
                    adj[v].add(u)

    visited: Set[str] = set()
    clusters: List[Dict[str, Any]] = []
    counter = 1

    docs_by_app: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_docs:
        docs_by_app.setdefault(d["applicant_id"], []).append(d)

    for app_id in sorted(adj.keys()):
        if app_id not in visited:
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

            if len(component) >= 2:
                comp_set = set(component)
                shared_docs = set()
                shared_dobs = set()

                for m in component:
                    for d in docs_by_app.get(m, []):
                        if d["document_status"] == "FLAGGED":
                            shared_docs.add(d["document_number"])
                            shared_dobs.add(d["date_of_birth"])

                cluster_sigs = []
                sig_descs = set()
                for sig in all_signals:
                    if any(m in comp_set for m in sig["applicant_ids"]):
                        if sig["description"] not in sig_descs:
                            sig_descs.add(sig["description"])
                            cluster_sigs.append(sig["description"])

                clusters.append({
                    "cluster_id": f"ID-CLUSTER-{counter:02d}",
                    "cluster_name": f"Synthetic Document Reuse Cluster #{counter}",
                    "member_applicant_ids": sorted(component),
                    "shared_documents": sorted(list(shared_docs)),
                    "shared_dobs": sorted(list(shared_dobs)),
                    "detected_signals": cluster_sigs,
                    "description": f"Discovered identity cluster of {len(component)} applicants sharing synthetic document identifiers ({', '.join(shared_docs)}) and date-of-birth attributes ({', '.join(shared_dobs)})."
                })
                counter += 1

    return clusters
