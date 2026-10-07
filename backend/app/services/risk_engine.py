"""
ProxyShield Behavioral Fraud Engine
Adaptive Behavioral Fraud Detection Module

Analyzes account behavioral metrics to detect structured fraud patterns:
- Pattern A: NEW_ACCOUNT_CREDIT_BUILD_LOAN_SPIKE (Synthetic identity bust-out / loan fraud)
- Pattern B: DEVICE_CHANGE_TRANSACTION_SPIKE (Account takeover / rapid credential compromise)
"""

import sqlite3
import os
from typing import Dict, Any, List

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "proxyshield.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def analyze_account_behavior(account_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes an account's behavioral signals and evaluates risk against Pattern A and Pattern B.
    Returns a structured behavioral fraud detection result.
    """
    account_id = account_data.get("account_id", "UNKNOWN")
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

    # --- PATTERN A EVALUATION: NEW_ACCOUNT_CREDIT_BUILD_LOAN_SPIKE ---
    pattern_a_points = 0
    pattern_a_reasons = []

    # 1. Young account
    if age <= 150:
        pattern_a_points += 15
        if age <= 120:
            pattern_a_points += 10
        pattern_a_reasons.append("Young account history")

    # 2. Rapid credit score improvement
    if credit_change >= 50:
        pattern_a_points += 20
        if credit_change >= 100:
            pattern_a_points += 10
        pattern_a_reasons.append("Rapid credit score improvement")

    # 3. High credit score achieved
    if credit_score >= 720:
        pattern_a_points += 10
        if credit_score >= 750:
            pattern_a_points += 5

    # 4. Large loan requested relative to history
    if loan_amount >= 100000:
        pattern_a_points += 15
        if loan_amount >= 500000:
            pattern_a_points += 10
        pattern_a_reasons.append("Large loan relative to account history")

    # 5. Large withdrawal after loan
    if withdrawal_amount >= 100000 and loan_amount > 0 and (withdrawal_amount / loan_amount) >= 0.5:
        pattern_a_points += 20
        if (withdrawal_amount / loan_amount) >= 0.8:
            pattern_a_points += 10
        pattern_a_reasons.append("Large withdrawal after loan")

    # 6. Very short withdrawal delay
    if withdrawal_amount > 0 and withdrawal_delay <= 60:
        pattern_a_points += 15
        if withdrawal_delay <= 15:
            pattern_a_points += 10
        pattern_a_reasons.append("Very short withdrawal delay")

    pattern_a_confidence = min(100, pattern_a_points)

    # Filter duplicate reasons while preserving order
    clean_a_reasons = []
    for r in pattern_a_reasons:
        if r not in clean_a_reasons:
            clean_a_reasons.append(r)

    # --- PATTERN B EVALUATION: DEVICE_CHANGE_TRANSACTION_SPIKE ---
    pattern_b_points = 0
    pattern_b_reasons = []

    # 1. New device or IP activity
    if device_count >= 2 or ip_count >= 2:
        pattern_b_points += 25
        if device_count >= 3 or ip_count >= 4:
            pattern_b_points += 15
        pattern_b_reasons.append("Multiple new devices/IP addresses detected")

    # 2. Unusual transaction activity
    if txn_count >= 15 or avg_txn_amount >= 2500:
        pattern_b_points += 20
        pattern_b_reasons.append("Unusual transaction activity spike")

    # 3. Large withdrawal/transfer
    if withdrawal_amount >= 300000:
        pattern_b_points += 25
        pattern_b_reasons.append("Large withdrawal/transfer executed")

    # 4. Rapid activity post device change
    if withdrawal_amount > 0 and withdrawal_delay <= 30 and (device_count >= 2 or ip_count >= 2):
        pattern_b_points += 15
        pattern_b_reasons.append("Rapid activity shortly after device change")

    pattern_b_confidence = min(100, pattern_b_points)

    clean_b_reasons = []
    for r in pattern_b_reasons:
        if r not in clean_b_reasons:
            clean_b_reasons.append(r)

    # --- FINAL COMBINED RISK CALCULATION ---
    # Determine dominant pattern
    if pattern_a_confidence >= 40 and pattern_a_confidence >= pattern_b_confidence:
        detected_pattern = "NEW_ACCOUNT_CREDIT_BUILD_LOAN_SPIKE"
        confidence = pattern_a_confidence
        reasons = clean_a_reasons
        raw_risk = pattern_a_confidence
    elif pattern_b_confidence >= 40:
        detected_pattern = "DEVICE_CHANGE_TRANSACTION_SPIKE"
        confidence = pattern_b_confidence
        reasons = clean_b_reasons
        raw_risk = pattern_b_confidence
    else:
        detected_pattern = "NORMAL_BEHAVIOR"
        confidence = max(pattern_a_confidence, pattern_b_confidence)
        reasons = ["Normal account activity within expected thresholds"] if not clean_a_reasons else clean_a_reasons
        raw_risk = confidence // 2  # Low risk baseline

    # Scale risk score to 0-100 range
    risk_score = min(100, max(0, int(raw_risk)))

    # Determine Risk Level
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
        "pattern": detected_pattern,
        "confidence": confidence,
        "reasons": reasons,
        "recommended_action": recommended_action
    }

def analyze_account_by_id(account_id: str) -> Dict[str, Any]:
    """
    Fetches account data from SQLite database and executes behavioral fraud detection.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise ValueError(f"Account {account_id} not found in database.")

    account_data = dict(row)
    return analyze_account_behavior(account_data)

if __name__ == "__main__":
    # Internal engine test
    result = analyze_account_by_id("C126")
    print("ProxyShield Behavioral Fraud Engine Result:", result)
