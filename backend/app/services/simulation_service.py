import sqlite3
import os
from typing import Dict, Any, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "proxyshield.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Deterministic simulation stages map for account progression
SIMULATION_STAGES = {
    0: {
        "simulation_day": 0,
        "account_age_days": 0,
        "credit_score": 650,
        "credit_score_change": 0,
        "transaction_count": 0,
        "average_transaction_amount": 0.0,
        "loan_amount": 0.0,
        "withdrawal_amount": 0.0,
        "withdrawal_delay_minutes": 0,
        "device_count": 1,
        "ip_count": 1,
        "loan_status": "NONE",
        "account_status": "ACTIVE",
        "last_event": "Account created"
    },
    30: {
        "simulation_day": 30,
        "account_age_days": 30,
        "credit_score": 680,
        "credit_score_change": 30,
        "transaction_count": 7,
        "average_transaction_amount": 1500.0,
        "loan_amount": 0.0,
        "withdrawal_amount": 0.0,
        "withdrawal_delay_minutes": 0,
        "device_count": 1,
        "ip_count": 1,
        "loan_status": "NONE",
        "account_status": "ACTIVE",
        "last_event": "Normal account activity"
    },
    60: {
        "simulation_day": 60,
        "account_age_days": 60,
        "credit_score": 725,
        "credit_score_change": 75,
        "transaction_count": 14,
        "average_transaction_amount": 2200.0,
        "loan_amount": 0.0,
        "withdrawal_amount": 0.0,
        "withdrawal_delay_minutes": 0,
        "device_count": 2,
        "ip_count": 2,
        "loan_status": "NONE",
        "account_status": "ACTIVE",
        "last_event": "Rapid credit improvement detected"
    },
    90: {
        "simulation_day": 90,
        "account_age_days": 90,
        "credit_score": 760,
        "credit_score_change": 110,
        "transaction_count": 19,
        "average_transaction_amount": 2400.0,
        "loan_amount": 900000.0,
        "withdrawal_amount": 0.0,
        "withdrawal_delay_minutes": 0,
        "device_count": 2,
        "ip_count": 2,
        "loan_status": "PENDING",
        "account_status": "ACTIVE",
        "last_event": "Large loan requested"
    },
    120: {
        "simulation_day": 120,
        "account_age_days": 120,
        "credit_score": 760,
        "credit_score_change": 110,
        "transaction_count": 22,
        "average_transaction_amount": 2600.0,
        "loan_amount": 900000.0,
        "withdrawal_amount": 810000.0,
        "withdrawal_delay_minutes": 12,
        "device_count": 3,
        "ip_count": 4,
        "loan_status": "PENDING",
        "account_status": "ACTIVE",
        "last_event": "Large withdrawal shortly after loan"
    }
}

def get_account(account_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def set_account_simulation_stage(account_id: str, target_day: int) -> Dict[str, Any]:
    """
    Sets an account directly to a specific deterministic simulation stage (0, 30, 60, 90, 120).
    Updates database fields safely.
    """
    if target_day not in SIMULATION_STAGES:
        raise ValueError(f"Unsupported simulation day: {target_day}. Supported stages: {list(SIMULATION_STAGES.keys())}")

    stage_data = SIMULATION_STAGES[target_day]

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify account exists
    cursor.execute("SELECT account_id FROM accounts WHERE account_id = ?;", (account_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Account {account_id} not found in database.")

    cursor.execute("""
        UPDATE accounts SET
            simulation_day = ?,
            account_age_days = ?,
            credit_score = ?,
            credit_score_change = ?,
            transaction_count = ?,
            average_transaction_amount = ?,
            loan_amount = ?,
            withdrawal_amount = ?,
            withdrawal_delay_minutes = ?,
            device_count = ?,
            ip_count = ?,
            loan_status = ?,
            account_status = ?,
            last_event = ?
        WHERE account_id = ?;
    """, (
        stage_data["simulation_day"],
        stage_data["account_age_days"],
        stage_data["credit_score"],
        stage_data["credit_score_change"],
        stage_data["transaction_count"],
        stage_data["average_transaction_amount"],
        stage_data["loan_amount"],
        stage_data["withdrawal_amount"],
        stage_data["withdrawal_delay_minutes"],
        stage_data["device_count"],
        stage_data["ip_count"],
        stage_data["loan_status"],
        stage_data["account_status"],
        stage_data["last_event"],
        account_id
    ))

    conn.commit()

    cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
    updated_account = dict(cursor.fetchone())
    conn.close()

    print(f"Account {account_id} updated to SIMULATION DAY {target_day}: {stage_data['last_event']}")
    return updated_account

def advance_account_by_30_days(account_id: str) -> Dict[str, Any]:
    """
    Advances an account by 30 simulated days to the next stage (0 -> 30 -> 60 -> 90 -> 120).
    Safe to call repeatedly.
    """
    current_acc = get_account(account_id)
    if not current_acc:
        raise ValueError(f"Account {account_id} not found in database.")

    current_day = current_acc.get("simulation_day", 0) or 0

    if current_day < 30:
        next_stage = 30
    elif current_day < 60:
        next_stage = 60
    elif current_day < 90:
        next_stage = 90
    else:
        next_stage = 120

    return set_account_simulation_stage(account_id, next_stage)

if __name__ == "__main__":
    acc = get_account("C126")
    if acc:
        print("C126 current state:", acc["simulation_day"], acc["last_event"])
