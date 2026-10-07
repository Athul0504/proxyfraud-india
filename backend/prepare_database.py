import sqlite3
import os

# Target database path
DB_PATH = os.path.join(os.path.dirname(__file__), "proxyshield.db")

def prepare_database():
    print(f"Connecting to database at: {DB_PATH}")

    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Required simulation columns and their SQLite types + default SQL clauses
    REQUIRED_COLUMNS = {
        "customer_name": ("TEXT", "DEFAULT 'Customer'"),
        "account_status": ("TEXT", "DEFAULT 'ACTIVE'"),
        "simulation_day": ("INTEGER", "DEFAULT 0"),
        "loan_status": ("TEXT", "DEFAULT 'NONE'"),
        "pattern_a_progress": ("INTEGER", "DEFAULT 0"),
        "pattern_b_progress": ("INTEGER", "DEFAULT 0"),
        "last_event": ("TEXT", "DEFAULT 'INITIALIZED'")
    }

    # 1. Ensure `accounts` table exists without dropping or recreating existing table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            account_id TEXT PRIMARY KEY,
            customer_name TEXT DEFAULT 'Customer',
            account_status TEXT DEFAULT 'ACTIVE',
            simulation_day INTEGER DEFAULT 0,
            loan_status TEXT DEFAULT 'NONE',
            pattern_a_progress INTEGER DEFAULT 0,
            pattern_b_progress INTEGER DEFAULT 0,
            last_event TEXT DEFAULT 'INITIALIZED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()

    # 2. Add missing columns safely if `accounts` table existed previously without them
    cursor.execute("PRAGMA table_info(accounts);")
    existing_cols_info = cursor.fetchall()
    existing_col_names = [col[1] for col in existing_cols_info]
    print(f"Existing columns in 'accounts' table: {existing_col_names}")

    added_columns = []
    for col_name, (col_type, default_clause) in REQUIRED_COLUMNS.items():
        if col_name not in existing_col_names:
            alter_query = f"ALTER TABLE accounts ADD COLUMN {col_name} {col_type} {default_clause};"
            cursor.execute(alter_query)
            added_columns.append(col_name)

    conn.commit()

    if added_columns:
        print(f"Added columns to 'accounts' table: {added_columns}")
    else:
        print("All required simulation columns already exist in 'accounts' table.")

    # 3. Safely initialize accounts up to 125
    cursor.execute("SELECT COUNT(*) FROM accounts;")
    current_count = cursor.fetchone()[0]
    print(f"Current account count before seeding/initialization: {current_count}")

    # Seed list of sample names to make initial 125 accounts clean
    sample_first_names = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Neha", "Rahul", "Sneha", "Aditya", "Pooja",
                          "Karan", "Kavya", "Amit", "Riya", "Siddharth", "Ishita", "Manish", "Divya", "Rajesh", "Tanvi"]
    sample_last_names = ["Sharma", "Patel", "Mehta", "Gupta", "Singh", "Reddy", "Verma", "Joshi", "Kumar", "Shah",
                         "Nair", "Rao", "Deshmukh", "Chopra", "Malhotra", "Bhat", "Iyer", "Saxena", "Choudhury", "Pillai"]

    if current_count < 125:
        accounts_to_add = 125 - current_count
        print(f"Seeding {accounts_to_add} accounts to reach exactly 125 accounts...")
        
        # Determine starting index for new account IDs
        # Read existing account_ids to prevent primary key collision
        cursor.execute("SELECT account_id FROM accounts;")
        existing_ids = set(row[0] for row in cursor.fetchall())

        idx = 1001
        added_count = 0
        while added_count < accounts_to_add:
            acc_id = f"ACC-{idx}"
            if acc_id not in existing_ids:
                fname = sample_first_names[(idx - 1001) % len(sample_first_names)]
                lname = sample_last_names[((idx - 1001) // len(sample_first_names)) % len(sample_last_names)]
                cname = f"{fname} {lname}"

                cursor.execute("""
                    INSERT INTO accounts (
                        account_id, customer_name, account_status, simulation_day, loan_status,
                        pattern_a_progress, pattern_b_progress, last_event
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """, (acc_id, cname, "ACTIVE", 0, "NONE", 0, 0, "INITIALIZED"))
                existing_ids.add(acc_id)
                added_count += 1
            idx += 1

        conn.commit()

    # 4. Backfill any NULL values in existing records for the simulation fields
    cursor.execute("""
        UPDATE accounts SET
            customer_name = COALESCE(customer_name, 'Customer ' || account_id),
            account_status = COALESCE(account_status, 'ACTIVE'),
            simulation_day = COALESCE(simulation_day, 0),
            loan_status = COALESCE(loan_status, 'NONE'),
            pattern_a_progress = COALESCE(pattern_a_progress, 0),
            pattern_b_progress = COALESCE(pattern_b_progress, 0),
            last_event = COALESCE(last_event, 'INITIALIZED')
        WHERE customer_name IS NULL
           OR account_status IS NULL
           OR simulation_day IS NULL
           OR loan_status IS NULL
           OR pattern_a_progress IS NULL
           OR pattern_b_progress IS NULL
           OR last_event IS NULL;
    """)
    conn.commit()

    # 5. Final Verification
    cursor.execute("SELECT COUNT(*) FROM accounts;")
    final_count = cursor.fetchone()[0]

    cursor.execute("PRAGMA table_info(accounts);")
    final_cols = [col[1] for col in cursor.fetchall()]

    conn.close()

    print("\n--- DATABASE PREPARATION SUMMARY ---")
    print(f"Final Account Count: {final_count}")
    print(f"Table Columns: {final_cols}")
    assert final_count == 125, f"Expected 125 accounts, got {final_count}"
    for req_col in REQUIRED_COLUMNS:
        assert req_col in final_cols, f"Missing required column: {req_col}"

    print("Database preparation completed and verified successfully!")
    return final_count, final_cols

if __name__ == "__main__":
    prepare_database()
