import sqlite3
from typing import List, Dict, Any, Optional
from app.services.fraud_scoring_engine import calculate_applicant_risk
from app.services.identity_forensics_service import analyze_applicant_identity
from app.services.digital_trust_service import analyze_url_service
from app.services.fraud_dataset_service import get_all_applicants, get_applicant_by_id

# Deterministic URL mappings for dataset applicants (for Digital Trust scoring)
APPLICANT_URL_MAPPINGS = {
    "APP-1008": "https://g00gle-secure-login.com",
    "APP-1009": "https://sbi-secure-login-example.com",
    "APP-1010": "http://verify-bank-credential-login.com",
    "APP-1011": "https://phishing-update-pass.com",
    "APP-88204": "https://g00gle-secure-login.com",
    "APP-9482": "http://verify-login-sub.com",
    "APP-9484": "https://sbi-secure-login-example.com",
}

def get_unified_risk_level_and_action(score: int) -> tuple[str, str]:
    """
    Unified Risk Level & Recommended Action Thresholds:
    0–29   : LOW      -> ALLOW
    30–59  : MEDIUM   -> MONITOR
    60–79  : HIGH     -> MANUAL_REVIEW
    80–100 : CRITICAL -> BLOCK_OR_ESCALATE
    """
    if score >= 80:
        return "CRITICAL", "BLOCK_OR_ESCALATE"
    elif score >= 60:
        return "HIGH", "MANUAL_REVIEW"
    elif score >= 30:
        return "MEDIUM", "MONITOR"
    else:
        return "LOW", "ALLOW"

def calculate_identity_score_from_analysis(id_analysis: Optional[Dict[str, Any]]) -> int:
    """
    Calculates a 0-100 identity forensics risk score based on detected signals.
    """
    if not id_analysis or not id_analysis.get("detected_signals"):
        return 0
    
    weights = {
        "DOCUMENT_REUSE": 40,
        "IDENTITY_REUSE": 30,
        "NAME_MISMATCH": 25,
        "DUPLICATE_DOCUMENT_PATTERN": 25,
        "MULTIPLE_DOCUMENTS_FOR_SAME_IDENTITY": 15
    }
    
    score = 0
    seen = set()
    for sig in id_analysis["detected_signals"]:
        stype = sig.get("signal_type")
        if stype and stype not in seen:
            seen.add(stype)
            score += weights.get(stype, 15)
            
    return min(100, score)

def calculate_digital_trust_score_for_applicant(applicant_id: str) -> int:
    """
    Calculates a 0-100 digital trust risk score based on target URL domain inspection.
    """
    target_url = APPLICANT_URL_MAPPINGS.get(applicant_id, "https://www.google.com")
    try:
        trust_res = analyze_url_service(target_url)
        return trust_res.get("risk_score", 0)
    except Exception:
        return 0

def calculate_unified_risk_for_applicant(conn: sqlite3.Connection, applicant_id: str) -> Optional[Dict[str, Any]]:
    """
    Calculates normalized, explainable Unified Risk Score combining:
    - Financial Fraud: 45%
    - Identity Forensics: 25%
    - Digital Trust: 30%
    """
    applicant = get_applicant_by_id(conn, applicant_id)
    if not applicant:
        return None
        
    # 1. Financial Fraud Module Score (45% weight)
    fraud_risk = calculate_applicant_risk(conn, applicant_id)
    financial_score = fraud_risk["risk_score"] if fraud_risk else 0
    
    # 2. Identity Forensics Module Score (25% weight)
    id_analysis = analyze_applicant_identity(conn, applicant_id)
    identity_score = calculate_identity_score_from_analysis(id_analysis)
    
    # 3. Digital Trust Module Score (30% weight)
    digital_trust_score = calculate_digital_trust_score_for_applicant(applicant_id)
    
    # 4. Normalized Weighted Aggregation
    financial_contrib = round(financial_score * 0.45, 2)
    identity_contrib = round(identity_score * 0.25, 2)
    digital_trust_contrib = round(digital_trust_score * 0.30, 2)
    
    raw_unified = financial_score * 0.45 + identity_score * 0.25 + digital_trust_score * 0.30
    unified_score = min(100, max(0, round(raw_unified)))
    
    # 5. Risk Level & Recommendation
    risk_level, recommended_action = get_unified_risk_level_and_action(unified_score)
    
    # 6. Top Contributing Risk Factors
    top_factors: List[str] = []
    if fraud_risk and fraud_risk.get("signals"):
        for sig in fraud_risk["signals"]:
            top_factors.append(f"[Financial Fraud] {sig['signal_type']}: {sig['description']}")
            
    if id_analysis and id_analysis.get("detected_signals"):
        for sig in id_analysis["detected_signals"]:
            top_factors.append(f"[Identity Forensics] {sig['signal_type']}: {sig['description']}")
            
    if digital_trust_score > 30:
        target_url = APPLICANT_URL_MAPPINGS.get(applicant_id, "https://g00gle-secure-login.com")
        top_factors.append(f"[Digital Trust] High Domain Risk for '{target_url}' (Score: {digital_trust_score}/100)")
        
    if not top_factors:
        top_factors.append("No critical risk signals detected across modules. Clean applicant profile.")
        
    # 7. Human-readable Explanation
    name = applicant.get("applicant_name", applicant_id)
    explanation = (
        f"Applicant {name} ({applicant_id}) received a Unified Risk Score of {unified_score}/100 ({risk_level} RISK). "
        f"Module Contributions: Financial Fraud ({financial_score}/100 → {financial_contrib} pts), "
        f"Identity Forensics ({identity_score}/100 → {identity_contrib} pts), "
        f"and Digital Trust ({digital_trust_score}/100 → {digital_trust_contrib} pts). "
        f"Recommended Action: {recommended_action}."
    )
    
    return {
        "applicant_id": applicant_id,
        "applicant_name": applicant.get("applicant_name"),
        "financial_fraud_score": financial_score,
        "identity_forensics_score": identity_score,
        "digital_trust_score": digital_trust_score,
        "financial_fraud_contribution": financial_contrib,
        "identity_forensics_contribution": identity_contrib,
        "digital_trust_contribution": digital_trust_contrib,
        "unified_score": unified_score,
        "risk_level": risk_level,
        "recommended_action": recommended_action,
        "top_contributing_risk_factors": top_factors,
        "explanation": explanation
    }

def calculate_unified_risk_all(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Calculates Unified Risk Score analysis for all synthetic dataset applicants.
    """
    applicants = get_all_applicants(conn)
    results = []
    for app in applicants:
        app_id = app["applicant_id"]
        res = calculate_unified_risk_for_applicant(conn, app_id)
        if res:
            results.append(res)
    return results
