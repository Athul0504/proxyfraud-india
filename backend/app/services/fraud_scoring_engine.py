import sqlite3
from typing import List, Dict, Any, Optional
from app.services.fraud_rule_engine import (
    analyze_single_applicant,
    analyze_all_applicants,
    discover_fraud_clusters
)

# ==============================================================================
# PROXYSHIELD PROTOTYPE FRAUD RISK SCORING ENGINE CONFIGURATION
# ==============================================================================
MODEL_NAME = "ProxyShield Prototype Fraud Risk Score"
BASE_SCORE = 0
MAX_SCORE = 100

# Deterministic Weight Table
SIGNAL_WEIGHTS = {
    "SHARED_DEVICE": 15,
    "SHARED_IP": 15,
    "SHARED_BANK_ACCOUNT": 20,
    "RAPID_APPLICATION_CLUSTER": 15,
    "HIGH_TRANSACTION_VELOCITY": 15,
    "TRANSACTION_AMOUNT_SPIKE": 10,
    "RAPID_HIGH_VALUE_ACTIVITY": 15
}

def get_risk_level_and_recommendation(score: int) -> tuple[str, str]:
    """
    Evaluates prototype risk level and recommendation thresholds:
    0–29: LOW -> ALLOW
    30–59: MEDIUM -> MONITOR
    60–79: HIGH -> MANUAL_REVIEW
    80–100: CRITICAL -> BLOCK_OR_ESCALATE
    """
    if score >= 80:
        return "CRITICAL", "BLOCK_OR_ESCALATE"
    elif score >= 60:
        return "HIGH", "MANUAL_REVIEW"
    elif score >= 30:
        return "MEDIUM", "MONITOR"
    else:
        return "LOW", "ALLOW"


def calculate_applicant_risk(conn: sqlite3.Connection, applicant_id: str) -> Optional[Dict[str, Any]]:
    """
    Consumes structured signals produced by Step 5B and converts them into an
    explainable, capped 0-100 risk score and recommendation.
    """
    # 1. Fetch Step 5B signal analysis (reusing Step 5B output)
    step5b_analysis = analyze_single_applicant(conn, applicant_id)
    if not step5b_analysis:
        return None

    detected_signals = step5b_analysis.get("detected_signals", [])

    # 2. Calculate raw score with anti-inflation weight cap per signal type
    raw_score = BASE_SCORE
    score_breakdown: Dict[str, int] = {}
    weighted_signals: List[Dict[str, Any]] = []

    # Track seen signal types to prevent duplicate weight addition
    processed_signal_types = set()

    for sig in detected_signals:
        sig_type = sig["signal_type"]
        weight = SIGNAL_WEIGHTS.get(sig_type, 0)

        # Anti-inflation logic: max 1 contribution per signal_type
        if sig_type not in processed_signal_types:
            processed_signal_types.add(sig_type)
            score_breakdown[sig_type] = weight
            raw_score += weight

        weighted_signals.append({
            "signal_type": sig_type,
            "weight": weight,
            "severity": sig["severity"],
            "description": sig["description"],
            "evidence": sig["evidence"]
        })

    # 3. Cap final score at 100
    final_score = min(raw_score, MAX_SCORE)

    # 4. Determine risk level and recommendation
    risk_level, recommendation = get_risk_level_and_recommendation(final_score)

    return {
        "applicant_id": applicant_id,
        "applicant_name": step5b_analysis.get("applicant_name"),
        "risk_score": final_score,
        "raw_score": raw_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "model_name": MODEL_NAME,
        "score_breakdown": score_breakdown,
        "signals": weighted_signals,
        "related_applicants": step5b_analysis.get("related_applicants", [])
    }


def calculate_all_applicants_risk(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Calculates risk score and recommendations for all applicants in the dataset.
    """
    step5b_analyses = analyze_all_applicants(conn)
    results = []

    for analysis in step5b_analyses:
        app_id = analysis["applicant_id"]
        risk_result = calculate_applicant_risk(conn, app_id)
        if risk_result:
            results.append(risk_result)

    return results


def calculate_cluster_risk(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Evaluates cluster risk scores based on member applicants' scores.
    """
    clusters = discover_fraud_clusters(conn)
    cluster_risks = []

    for c in clusters:
        members = c["member_applicant_ids"]
        member_scores = []

        for m_id in members:
            m_risk = calculate_applicant_risk(conn, m_id)
            if m_risk:
                member_scores.append(m_risk["risk_score"])

        max_score = max(member_scores) if member_scores else 0
        avg_score = round(sum(member_scores) / len(member_scores), 2) if member_scores else 0.0

        risk_level, recommendation = get_risk_level_and_recommendation(max_score)

        cluster_risks.append({
            "cluster_id": c["cluster_id"],
            "cluster_name": c["cluster_name"],
            "member_applicant_ids": members,
            "average_risk_score": avg_score,
            "max_risk_score": max_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "shared_attributes": c["shared_attributes"],
            "description": c["description"]
        })

    return cluster_risks
