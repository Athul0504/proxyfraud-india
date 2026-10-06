import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "proxyshield.db")

def get_db_connection():
    """
    Creates and returns a connection to the SQLite database.
    Row factory is set to sqlite3.Row for dictionary-like access.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes database tables if they do not exist yet.
    Starter tables created for trust logs and fraud checks.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Starter table for Digital Trust url scans
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS url_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            risk_score INTEGER,
            is_suspicious BOOLEAN,
            scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Starter table for Financial Fraud applications
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicant_id TEXT,
            risk_score INTEGER,
            risk_level TEXT,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    conn.commit()

    # Seed synthetic financial dataset (applicants and transactions)
    from app.services.fraud_dataset_service import seed_synthetic_fraud_data
    seed_synthetic_fraud_data(conn)

    # Seed synthetic identity documents dataset
    from app.services.identity_forensics_service import seed_synthetic_identity_documents
    seed_synthetic_identity_documents(conn)

    conn.close()
    print("Database initialized successfully at:", DB_PATH)
