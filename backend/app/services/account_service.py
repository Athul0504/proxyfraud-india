import sqlite3
import os
import re
from typing import Dict, Any, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "proxyshield.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def generate_next_account_id(conn: sqlite3.Connection) -> str:
    """
    Safely generates the next account ID by finding the maximum numeric suffix among existing 'C<num>' account IDs in the database.
    For 125 existing accounts (C1..C125), it will return 'C126'.
    If C126 is created, the subsequent call will return 'C127', and so on.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT account_id FROM accounts;")
    rows = cursor.fetchall()
    
    max_num = 0
    for row in rows:
        acc_id = row[0]
        if acc_id:
            # Match pattern C followed by digits
            match = re.match(r"^C(\d+)$", str(acc_id))
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
                    
    if max_num == 0:
        cursor.execute("SELECT COUNT(*) FROM accounts;")
        max_num = cursor.fetchone()[0]
        
    next_num = max_num + 1
    return f"C{next_num}"

def create_synthetic_account(
    customer_name: str,
    date_of_birth: Optional[str] = "1995-01-01",
    mobile: Optional[str] = "+919800000000",
    email: Optional[str] = "customer@example.com",
    address: Optional[str] = "Mumbai, India",
    occupation: Optional[str] = "Salaried",
    account_type: Optional[str] = "SAVINGS",
    initial_deposit: float = 0.0
) -> Dict[str, Any]:
    """
    Creates a new synthetic bank account with enforced initial values.
    Does not collect sensitive credentials (Aadhaar, PAN, card numbers, passwords, OTPs).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Generate safe dynamic account ID (C126 for the 126th account, C127 for 127th, etc.)
    account_id = generate_next_account_id(conn)

    # Initial default values as specified by requirements
    account_age_days = 0
    credit_score = 650
    credit_score_change = 0
    transaction_count = 0
    average_transaction_amount = 0.0
    loan_amount = 0.0
    withdrawal_amount = 0.0
    withdrawal_delay_minutes = 0
    device_count = 1
    ip_count = 1
    simulation_day = 0
    loan_status = "NONE"
    account_status = "ACTIVE"
    pattern_a_progress = 0
    pattern_b_progress = 0
    last_event = "Account created"

    cursor.execute("""
        INSERT INTO accounts (
            account_id, customer_name, date_of_birth, mobile, email, address, occupation,
            account_type, initial_deposit, account_age_days, credit_score, credit_score_change,
            transaction_count, average_transaction_amount, loan_amount, withdrawal_amount,
            withdrawal_delay_minutes, device_count, ip_count, simulation_day, loan_status,
            account_status, pattern_a_progress, pattern_b_progress, last_event
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?
        );
    """, (
        account_id, customer_name, date_of_birth, mobile, email, address, occupation,
        account_type, initial_deposit, account_age_days, credit_score, credit_score_change,
        transaction_count, average_transaction_amount, loan_amount, withdrawal_amount,
        withdrawal_delay_minutes, device_count, ip_count, simulation_day, loan_status,
        account_status, pattern_a_progress, pattern_b_progress, last_event
    ))

    conn.commit()

    # Fetch inserted account for response
    cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
    new_account = dict(cursor.fetchone())
    conn.close()

    print(f"Successfully created synthetic account: {account_id} for {customer_name}")
    return new_account

if __name__ == "__main__":
    # Internal test check
    conn = get_db_connection()
    next_id = generate_next_account_id(conn)
    print(f"Next calculated account ID would be: {next_id}")
    conn.close()
