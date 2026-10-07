"""
ProxyShield Adaptive Behavioral Intelligence Engine
Tracks recurring behavioral fraud patterns across portfolio accounts and calculates adaptive pattern confidence.
"""

import sqlite3
import os
from typing import Dict, Any, List, Tuple

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "proxyshield.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def compute_raw_pattern_scores(account_data: Dict[str, Any]) -> Tuple[float, List[str], float, List[str]]:
    """
    Computes raw pattern match ratios (0.0 to 1.0) and specific evidence reasons for Pattern A and Pattern B.
    """
    age = account_data.get("account_age_days", 0) or 0
    credit_score = account_data.get("credit_score", 650) or 650
    credit_change = account_data.get("credit_score_change", 0) or 0
    txn_count = account_data.get("transaction_count", 0) or 0
    avg_txn_amount = account_data.get("average_transaction_amount", 0.0) or 0.0
    loan_amount = account_data.get("loan_amount", 0.0) or 0.0
    withdrawal_amount = account_data.get("withdrawal_amount", 0.0) or 0.0
    withdrawal_delay = account_data.get("withdrawal_delay_minutes", 0) or 0
    device_count = account_data.get("device_count", 1) or 1
    ip_count = account_data.get("ip_count", 1) or 1

    # --- PATTERN A EVALUATION ---
    a_score = 0.0
    a_reasons = []

    if age <= 150:
        a_score += 0.20
        if age <= 120:
            a_score += 0.05

    if credit_change >= 50:
        a_score += 0.25
        a_reasons.append("Rapid credit score improvement")

    if credit_score >= 720:
        a_score += 0.10

    if loan_amount >= 100000:
        a_score += 0.20
        a_reasons.append("Large loan relative to account history")

    if withdrawal_amount >= 100000 and loan_amount > 0 and (withdrawal_amount / loan_amount) >= 0.5:
        a_score += 0.20
        a_reasons.append("Large withdrawal after loan")

    if withdrawal_amount > 0 and withdrawal_delay <= 60:
        a_score += 0.15
        a_reasons.append("Very short withdrawal delay")

    a_ratio = min(1.0, a_score)

    # --- PATTERN B EVALUATION ---
    b_score = 0.0
    b_reasons = []

    # Requires established account or new device login
    if device_count >= 2 or ip_count >= 2:
        b_score += 0.30
        b_reasons.append("Multiple new devices/IP addresses detected")

    if txn_count >= 25 or avg_txn_amount >= 3500:
        b_score += 0.25
        b_reasons.append("Unusual transaction activity spike")

    if withdrawal_amount >= 300000:
        b_score += 0.25
        b_reasons.append("Large withdrawal/transfer executed")

    if withdrawal_amount > 0 and withdrawal_delay <= 30 and (device_count >= 2 or ip_count >= 2):
        b_score += 0.20
        b_reasons.append("Rapid activity shortly after device change")

    b_ratio = min(1.0, b_score)

    return a_ratio, a_reasons, b_ratio, b_reasons

def calculate_portfolio_pattern_confidence() -> Dict[str, float]:
    """
    Scans the portfolio database to determine portfolio-wide occurrence of Pattern A and Pattern B.
    Calculates adaptive system confidence values for each pattern (e.g. 65% - 96%).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts;")
    rows = cursor.fetchall()
    conn.close()

    a_early_count = 0
    a_strong_count = 0
    b_early_count = 0
    b_strong_count = 0

    for row in rows:
        acc_dict = dict(row)
        a_ratio, _, b_ratio, _ = compute_raw_pattern_scores(acc_dict)

        if a_ratio >= 0.70:
            a_strong_count += 1
        elif a_ratio >= 0.35:
            a_early_count += 1

        if b_ratio >= 0.70:
            b_strong_count += 1
        elif b_ratio >= 0.35:
            b_early_count += 1

    # Adaptive System Confidence Formula
    sys_conf_a = min(96.0, 65.0 + (3.0 * a_early_count) + (5.0 * a_strong_count))
    sys_conf_b = min(96.0, 65.0 + (3.0 * b_early_count) + (5.0 * b_strong_count))

    return {
        "PATTERN_A_SYSTEM_CONFIDENCE": round(sys_conf_a, 1),
        "PATTERN_B_SYSTEM_CONFIDENCE": round(sys_conf_b, 1),
        "PATTERN_A_STRONG_ACCOUNTS": a_strong_count,
        "PATTERN_A_EARLY_ACCOUNTS": a_early_count,
        "PATTERN_B_STRONG_ACCOUNTS": b_strong_count,
        "PATTERN_B_EARLY_ACCOUNTS": b_early_count
    }

def analyze_account_adaptive(account_id: str) -> Dict[str, Any]:
    """
    Analyzes a target account using the Adaptive Behavioral Intelligence System.
    Combines account signal strength with portfolio pattern confidence.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise ValueError(f"Account {account_id} not found in database.")

    account_data = dict(row)

    # 1. Compute raw signal ratios and evidence
    a_ratio, a_reasons, b_ratio, b_reasons = compute_raw_pattern_scores(account_data)

    # 2. Compute portfolio adaptive system confidence
    portfolio_conf = calculate_portfolio_pattern_confidence()
    sys_conf_a = portfolio_conf["PATTERN_A_SYSTEM_CONFIDENCE"]
    sys_conf_b = portfolio_conf["PATTERN_B_SYSTEM_CONFIDENCE"]

    # 3. Calculate account-level adaptive confidence & risk
    account_conf_a = min(100, int(round(a_ratio * sys_conf_a)))
    account_conf_b = min(100, int(round(b_ratio * sys_conf_b)))

    # Determine dominant pattern
    if a_ratio >= 0.35 and a_ratio >= b_ratio:
        pattern = "NEW_ACCOUNT_CREDIT_BUILD_LOAN_SPIKE"
        confidence = account_conf_a
        reasons = a_reasons
        risk_score = min(100, max(12, int(a_ratio * 95)))
    elif b_ratio >= 0.35:
        pattern = "DEVICE_CHANGE_TRANSACTION_SPIKE"
        confidence = account_conf_b
        reasons = b_reasons
        risk_score = min(100, max(12, int(b_ratio * 95)))
    else:
        pattern = "NORMAL_BEHAVIOR"
        confidence = max(10, int(round(max(a_ratio, b_ratio) * 50)))
        reasons = ["Normal account activity within expected thresholds"]
        risk_score = 12

    # Determine Risk Level & Recommended Action
    if risk_score >= 85:
        risk_level = "CRITICAL"
        recommended_action = "PLACE_ON_HOLD"
    elif risk_score >= 70:
        risk_level = "HIGH"
        recommended_action = "MANUAL_REVIEW"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
        recommended_action = "MONITOR_ACTIVITY"
    else:
        risk_level = "LOW"
        recommended_action = "APPROVE"

    return {
        "account_id": account_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "pattern": pattern,
        "confidence": confidence,
        "reasons": reasons,
        "recommended_action": recommended_action,
        "pattern_a_progress": int(round(a_ratio * 100)),
        "pattern_b_progress": int(round(b_ratio * 100))
    }

if __name__ == "__main__":
    print("Portfolio Confidence:", calculate_portfolio_pattern_confidence())
    print("C126 Adaptive Result:", analyze_account_adaptive("C126"))
