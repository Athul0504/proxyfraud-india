import sqlite3
from typing import List, Dict, Any, Optional

SYNTHETIC_APPLICANTS = [
    # Normal Applicants (APP-1001 to APP-1007)
    {
        "applicant_id": "APP-1001",
        "applicant_name": "Aarav Sharma",
        "application_id": "APPL-2026-001",
        "phone_number": "+919876543210",
        "device_id": "DEV-MOB-1001",
        "ip_address": "103.21.12.101",
        "bank_account_id": "ACC-SB-1001",
        "loan_amount": 50000.0,
        "application_timestamp": "2026-10-01T09:15:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1002",
        "applicant_name": "Priya Patel",
        "application_id": "APPL-2026-002",
        "phone_number": "+919876543211",
        "device_id": "DEV-MOB-1002",
        "ip_address": "103.21.12.102",
        "bank_account_id": "ACC-SB-1002",
        "loan_amount": 75000.0,
        "application_timestamp": "2026-10-01T11:30:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1003",
        "applicant_name": "Rohan Mehta",
        "application_id": "APPL-2026-003",
        "phone_number": "+919876543212",
        "device_id": "DEV-MOB-1003",
        "ip_address": "103.21.12.103",
        "bank_account_id": "ACC-SB-1003",
        "loan_amount": 120000.0,
        "application_timestamp": "2026-10-02T10:00:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1004",
        "applicant_name": "Ananya Gupta",
        "application_id": "APPL-2026-004",
        "phone_number": "+919876543213",
        "device_id": "DEV-MOB-1004",
        "ip_address": "49.36.14.88",
        "bank_account_id": "ACC-SB-1004",
        "loan_amount": 30000.0,
        "application_timestamp": "2026-10-02T14:45:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1005",
        "applicant_name": "Vikram Singh",
        "application_id": "APPL-2026-005",
        "phone_number": "+919876543214",
        "device_id": "DEV-MOB-1005",
        "ip_address": "49.36.14.89",
        "bank_account_id": "ACC-SB-1005",
        "loan_amount": 200000.0,
        "application_timestamp": "2026-10-03T08:20:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1006",
        "applicant_name": "Sneha Reddy",
        "application_id": "APPL-2026-006",
        "phone_number": "+919876543215",
        "device_id": "DEV-MOB-1006",
        "ip_address": "157.33.22.10",
        "bank_account_id": "ACC-SB-1006",
        "loan_amount": 45000.0,
        "application_timestamp": "2026-10-03T16:10:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1007",
        "applicant_name": "Kabir Nair",
        "application_id": "APPL-2026-007",
        "phone_number": "+919876543216",
        "device_id": "DEV-MOB-1007",
        "ip_address": "157.33.22.11",
        "bank_account_id": "ACC-SB-1007",
        "loan_amount": 60000.0,
        "application_timestamp": "2026-10-04T09:00:00Z",
        "initial_status": "APPROVED"
    },

    # --- COORDINATED FRAUD CLUSTER (Cluster Syndicate Alpha) ---
    # Shared device: DEV-EMU-9942X | Shared IP: 185.220.101.45 | Shared Bank Account: ACC-MULE-8899
    # Rapid submission timestamps within 3 minutes (14:00:10 to 14:03:00)
    {
        "applicant_id": "APP-1008",
        "applicant_name": "Rajesh Verma",
        "application_id": "APPL-2026-008",
        "phone_number": "+919999000101",
        "device_id": "DEV-EMU-9942X",
        "ip_address": "185.220.101.45",
        "bank_account_id": "ACC-MULE-8899",
        "loan_amount": 250000.0,
        "application_timestamp": "2026-10-05T14:00:10Z",
        "initial_status": "UNDER_REVIEW"
    },
    {
        "applicant_id": "APP-1009",
        "applicant_name": "Suresh Kumar",
        "application_id": "APPL-2026-009",
        "phone_number": "+919999000102",
        "device_id": "DEV-EMU-9942X",
        "ip_address": "185.220.101.45",
        "bank_account_id": "ACC-MULE-8899",
        "loan_amount": 250000.0,
        "application_timestamp": "2026-10-05T14:01:05Z",
        "initial_status": "UNDER_REVIEW"
    },
    {
        "applicant_id": "APP-1010",
        "applicant_name": "Dinesh Joshi",
        "application_id": "APPL-2026-010",
        "phone_number": "+919999000103",
        "device_id": "DEV-EMU-9942X",
        "ip_address": "185.220.101.45",
        "bank_account_id": "ACC-MULE-8899",
        "loan_amount": 250000.0,
        "application_timestamp": "2026-10-05T14:02:15Z",
        "initial_status": "UNDER_REVIEW"
    },
    {
        "applicant_id": "APP-1011",
        "applicant_name": "Manoj Yadav",
        "application_id": "APPL-2026-011",
        "phone_number": "+919999000104",
        "device_id": "DEV-EMU-9942X",
        "ip_address": "185.220.101.45",
        "bank_account_id": "ACC-MULE-8899",
        "loan_amount": 250000.0,
        "application_timestamp": "2026-10-05T14:03:00Z",
        "initial_status": "REJECTED"
    },

    # Normal Applicants (APP-1012 to APP-1015)
    {
        "applicant_id": "APP-1012",
        "applicant_name": "Neha Deshmukh",
        "application_id": "APPL-2026-012",
        "phone_number": "+919876543220",
        "device_id": "DEV-MOB-1012",
        "ip_address": "122.160.15.5",
        "bank_account_id": "ACC-SB-1012",
        "loan_amount": 80000.0,
        "application_timestamp": "2026-10-05T11:15:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1013",
        "applicant_name": "Aditya Iyer",
        "application_id": "APPL-2026-013",
        "phone_number": "+919876543221",
        "device_id": "DEV-MOB-1013",
        "ip_address": "122.160.15.6",
        "bank_account_id": "ACC-SB-1013",
        "loan_amount": 95000.0,
        "application_timestamp": "2026-10-05T12:00:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1014",
        "applicant_name": "Pooja Banerjee",
        "application_id": "APPL-2026-014",
        "phone_number": "+919876543222",
        "device_id": "DEV-MOB-1014",
        "ip_address": "122.160.15.7",
        "bank_account_id": "ACC-SB-1014",
        "loan_amount": 40000.0,
        "application_timestamp": "2026-10-05T13:30:00Z",
        "initial_status": "APPROVED"
    },
    {
        "applicant_id": "APP-1015",
        "applicant_name": "Karan Malhotra",
        "application_id": "APPL-2026-015",
        "phone_number": "+919876543223",
        "device_id": "DEV-MOB-1015",
        "ip_address": "122.160.15.8",
        "bank_account_id": "ACC-SB-1015",
        "loan_amount": 110000.0,
        "application_timestamp": "2026-10-05T15:20:00Z",
        "initial_status": "APPROVED"
    }
]

# Generate transactions for each applicant
SYNTHETIC_TRANSACTIONS = [
    # APP-1001 (Normal)
    {"transaction_id": "TXN-1001-01", "applicant_id": "APP-1001", "timestamp": "2026-10-01T10:15:00Z", "transaction_type": "transfer", "amount": 5000.0, "merchant": "Swiggy / Groceries", "merchant_category": "Food & Dining", "status": "COMPLETED"},
    {"transaction_id": "TXN-1001-02", "applicant_id": "APP-1001", "timestamp": "2026-10-01T14:22:00Z", "transaction_type": "purchase", "amount": 1200.0, "merchant": "Amazon India", "merchant_category": "E-Commerce", "status": "COMPLETED"},
    {"transaction_id": "TXN-1001-03", "applicant_id": "APP-1001", "timestamp": "2026-10-02T09:10:00Z", "transaction_type": "payment", "amount": 2450.0, "merchant": "Bescom Electricity", "merchant_category": "Utilities", "status": "COMPLETED"},
    {"transaction_id": "TXN-1001-04", "applicant_id": "APP-1001", "timestamp": "2026-10-03T18:40:00Z", "transaction_type": "withdrawal", "amount": 5000.0, "merchant": "SBI ATM Kiosk", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},

    # APP-1002 (Normal)
    {"transaction_id": "TXN-1002-01", "applicant_id": "APP-1002", "timestamp": "2026-10-01T12:00:00Z", "transaction_type": "transfer", "amount": 15000.0, "merchant": "HDFC Housing Rent", "merchant_category": "Real Estate", "status": "COMPLETED"},
    {"transaction_id": "TXN-1002-02", "applicant_id": "APP-1002", "timestamp": "2026-10-02T11:15:00Z", "transaction_type": "purchase", "amount": 3400.0, "merchant": "Myntra Fashion", "merchant_category": "Retail", "status": "COMPLETED"},
    {"transaction_id": "TXN-1002-03", "applicant_id": "APP-1002", "timestamp": "2026-10-03T15:30:00Z", "transaction_type": "transfer", "amount": 8000.0, "merchant": "UPI P2P Transfer", "merchant_category": "P2P Payment", "status": "COMPLETED"},
    {"transaction_id": "TXN-1002-04", "applicant_id": "APP-1002", "timestamp": "2026-10-04T19:20:00Z", "transaction_type": "purchase", "amount": 450.0, "merchant": "Zomato", "merchant_category": "Food & Dining", "status": "COMPLETED"},

    # APP-1003 (Normal)
    {"transaction_id": "TXN-1003-01", "applicant_id": "APP-1003", "timestamp": "2026-10-02T11:00:00Z", "transaction_type": "purchase", "amount": 45000.0, "merchant": "Croma Electronics", "merchant_category": "Electronics", "status": "COMPLETED"},
    {"transaction_id": "TXN-1003-02", "applicant_id": "APP-1003", "timestamp": "2026-10-02T16:30:00Z", "transaction_type": "transfer", "amount": 12000.0, "merchant": "ICICI Credit Card", "merchant_category": "Financial Services", "status": "COMPLETED"},
    {"transaction_id": "TXN-1003-03", "applicant_id": "APP-1003", "timestamp": "2026-10-03T13:00:00Z", "transaction_type": "purchase", "amount": 2800.0, "merchant": "BigBasket", "merchant_category": "Groceries", "status": "COMPLETED"},
    {"transaction_id": "TXN-1003-04", "applicant_id": "APP-1003", "timestamp": "2026-10-04T20:10:00Z", "transaction_type": "withdrawal", "amount": 10000.0, "merchant": "HDFC ATM", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},

    # APP-1004 (Normal)
    {"transaction_id": "TXN-1004-01", "applicant_id": "APP-1004", "timestamp": "2026-10-02T15:30:00Z", "transaction_type": "transfer", "amount": 2500.0, "merchant": "Mobile Recharge", "merchant_category": "Telecom", "status": "COMPLETED"},
    {"transaction_id": "TXN-1004-02", "applicant_id": "APP-1004", "timestamp": "2026-10-03T10:15:00Z", "transaction_type": "purchase", "amount": 1500.0, "merchant": "Reliance Smart", "merchant_category": "Supermarket", "status": "COMPLETED"},
    {"transaction_id": "TXN-1004-03", "applicant_id": "APP-1004", "timestamp": "2026-10-04T12:40:00Z", "transaction_type": "transfer", "amount": 5000.0, "merchant": "UPI P2P Transfer", "merchant_category": "P2P Payment", "status": "COMPLETED"},
    {"transaction_id": "TXN-1004-04", "applicant_id": "APP-1004", "timestamp": "2026-10-05T09:00:00Z", "transaction_type": "purchase", "amount": 850.0, "merchant": "BookMyShow", "merchant_category": "Entertainment", "status": "COMPLETED"},

    # APP-1005 (Normal)
    {"transaction_id": "TXN-1005-01", "applicant_id": "APP-1005", "timestamp": "2026-10-03T09:00:00Z", "transaction_type": "transfer", "amount": 100000.0, "merchant": "Vendor Supplies Corp", "merchant_category": "B2B Trade", "status": "COMPLETED"},
    {"transaction_id": "TXN-1005-02", "applicant_id": "APP-1005", "timestamp": "2026-10-03T14:20:00Z", "transaction_type": "purchase", "amount": 18500.0, "merchant": "Apple Reseller", "merchant_category": "Electronics", "status": "COMPLETED"},
    {"transaction_id": "TXN-1005-03", "applicant_id": "APP-1005", "timestamp": "2026-10-04T11:00:00Z", "transaction_type": "transfer", "amount": 25000.0, "merchant": "Commercial Rent", "merchant_category": "Real Estate", "status": "COMPLETED"},
    {"transaction_id": "TXN-1005-04", "applicant_id": "APP-1005", "timestamp": "2026-10-05T08:30:00Z", "transaction_type": "withdrawal", "amount": 20000.0, "merchant": "Axis Bank ATM", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},

    # APP-1006 (Normal)
    {"transaction_id": "TXN-1006-01", "applicant_id": "APP-1006", "timestamp": "2026-10-03T17:00:00Z", "transaction_type": "purchase", "amount": 3200.0, "merchant": "Nykaa Cosmetics", "merchant_category": "Retail", "status": "COMPLETED"},
    {"transaction_id": "TXN-1006-02", "applicant_id": "APP-1006", "timestamp": "2026-10-04T10:30:00Z", "transaction_type": "transfer", "amount": 7500.0, "merchant": "Society Maintenance", "merchant_category": "Housing", "status": "COMPLETED"},
    {"transaction_id": "TXN-1006-03", "applicant_id": "APP-1006", "timestamp": "2026-10-04T18:15:00Z", "transaction_type": "purchase", "amount": 1200.0, "merchant": "Uber Cabs", "merchant_category": "Transportation", "status": "COMPLETED"},
    {"transaction_id": "TXN-1006-04", "applicant_id": "APP-1006", "timestamp": "2026-10-05T13:00:00Z", "transaction_type": "purchase", "amount": 640.0, "merchant": "Starbucks Coffee", "merchant_category": "Food & Dining", "status": "COMPLETED"},

    # APP-1007 (Normal)
    {"transaction_id": "TXN-1007-01", "applicant_id": "APP-1007", "timestamp": "2026-10-04T09:45:00Z", "transaction_type": "transfer", "amount": 15000.0, "merchant": "Zerodha Broking SIP", "merchant_category": "Investments", "status": "COMPLETED"},
    {"transaction_id": "TXN-1007-02", "applicant_id": "APP-1007", "timestamp": "2026-10-04T15:20:00Z", "transaction_type": "purchase", "amount": 4200.0, "merchant": "Decathlon Sports", "merchant_category": "Retail", "status": "COMPLETED"},
    {"transaction_id": "TXN-1007-03", "applicant_id": "APP-1007", "timestamp": "2026-10-05T10:10:00Z", "transaction_type": "transfer", "amount": 3000.0, "merchant": "ACT Fibernet Bill", "merchant_category": "Utilities", "status": "COMPLETED"},
    {"transaction_id": "TXN-1007-04", "applicant_id": "APP-1007", "timestamp": "2026-10-05T14:50:00Z", "transaction_type": "withdrawal", "amount": 4000.0, "merchant": "Canara ATM", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},

    # --- COORDINATED FRAUD CLUSTER TRANSACTIONS (High Frequency & Amount Spikes) ---
    # APP-1008 (Suspicious - Fraud Syndicate)
    {"transaction_id": "TXN-1008-01", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:05:00Z", "transaction_type": "micro_test", "amount": 10.0, "merchant": "Test Gateway Probe", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1008-02", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:05:30Z", "transaction_type": "micro_test", "amount": 50.0, "merchant": "Wallet Verification", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1008-03", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:06:10Z", "transaction_type": "rapid_transfer", "amount": 180000.0, "merchant": "Offshore Crypto Exchange", "merchant_category": "Cryptocurrency", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1008-04", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:06:45Z", "transaction_type": "rapid_transfer", "amount": 65000.0, "merchant": "Unknown P2P Mule Account", "merchant_category": "P2P Wire", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1008-05", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:07:20Z", "transaction_type": "withdrawal", "amount": 50000.0, "merchant": "Unregistered ATM Kiosk", "merchant_category": "Cash Withdrawal", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1008-06", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:08:00Z", "transaction_type": "rapid_transfer", "amount": 90000.0, "merchant": "High Risk Gift Card Hub", "merchant_category": "Gift Cards", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1008-07", "applicant_id": "APP-1008", "timestamp": "2026-10-05T14:08:40Z", "transaction_type": "rapid_transfer", "amount": 45000.0, "merchant": "Peer Cash Drain Node", "merchant_category": "P2P Wire", "status": "FLAG_SUSPICIOUS"},

    # APP-1009 (Suspicious - Fraud Syndicate)
    {"transaction_id": "TXN-1009-01", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:06:00Z", "transaction_type": "micro_test", "amount": 1.0, "merchant": "Payment Gateway Ping", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1009-02", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:06:25Z", "transaction_type": "micro_test", "amount": 100.0, "merchant": "Prepaid Card Topup Test", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1009-03", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:07:00Z", "transaction_type": "rapid_transfer", "amount": 200000.0, "merchant": "Foreign Wire Gateway", "merchant_category": "Wire Transfer", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1009-04", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:07:35Z", "transaction_type": "rapid_transfer", "amount": 48000.0, "merchant": "Shell Merchant Account", "merchant_category": "Shell Merchant", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1009-05", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:08:10Z", "transaction_type": "withdrawal", "amount": 50000.0, "merchant": "Remote ATM Express", "merchant_category": "Cash Withdrawal", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1009-06", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:08:50Z", "transaction_type": "rapid_transfer", "amount": 120000.0, "merchant": "Crypto Asset Broker", "merchant_category": "Cryptocurrency", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1009-07", "applicant_id": "APP-1009", "timestamp": "2026-10-05T14:09:30Z", "transaction_type": "rapid_transfer", "amount": 30000.0, "merchant": "Anonymous e-Wallet", "merchant_category": "Digital Wallet", "status": "FLAG_SUSPICIOUS"},

    # APP-1010 (Suspicious - Fraud Syndicate)
    {"transaction_id": "TXN-1010-01", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:07:00Z", "transaction_type": "micro_test", "amount": 5.0, "merchant": "Card Tokenization Test", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1010-02", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:07:30Z", "transaction_type": "micro_test", "amount": 20.0, "merchant": "Merchant Test Charge", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1010-03", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:08:05Z", "transaction_type": "rapid_transfer", "amount": 220000.0, "merchant": "Offshore Gaming Portal", "merchant_category": "High Risk Merchant", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1010-04", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:08:45Z", "transaction_type": "rapid_transfer", "amount": 25000.0, "merchant": "Mule Account Transfer B", "merchant_category": "P2P Wire", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1010-05", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:09:15Z", "transaction_type": "withdrawal", "amount": 50000.0, "merchant": "Night ATM Node 4", "merchant_category": "Cash Withdrawal", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1010-06", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:09:50Z", "transaction_type": "rapid_transfer", "amount": 150000.0, "merchant": "Virtual Currency Exchange", "merchant_category": "Cryptocurrency", "status": "FLAG_SUSPICIOUS"},
    {"transaction_id": "TXN-1010-07", "applicant_id": "APP-1010", "timestamp": "2026-10-05T14:10:20Z", "transaction_type": "rapid_transfer", "amount": 35000.0, "merchant": "Unverified P2P Pay", "merchant_category": "Digital Wallet", "status": "FLAG_SUSPICIOUS"},

    # APP-1011 (Suspicious - Fraud Syndicate)
    {"transaction_id": "TXN-1011-01", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:08:00Z", "transaction_type": "micro_test", "amount": 2.0, "merchant": "API Auth Probe", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1011-02", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:08:25Z", "transaction_type": "micro_test", "amount": 10.0, "merchant": "Account Link Test", "merchant_category": "Test Charge", "status": "COMPLETED"},
    {"transaction_id": "TXN-1011-03", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:09:00Z", "transaction_type": "rapid_transfer", "amount": 240000.0, "merchant": "InternationalRemit Inc", "merchant_category": "Remittance", "status": "REJECTED"},
    {"transaction_id": "TXN-1011-04", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:09:35Z", "transaction_type": "rapid_transfer", "amount": 190000.0, "merchant": "Rapid Cash Liquidation", "merchant_category": "P2P Wire", "status": "REJECTED"},
    {"transaction_id": "TXN-1011-05", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:10:10Z", "transaction_type": "withdrawal", "amount": 50000.0, "merchant": "ATM Cash Drain Attempt", "merchant_category": "Cash Withdrawal", "status": "REJECTED"},
    {"transaction_id": "TXN-1011-06", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:10:45Z", "transaction_type": "rapid_transfer", "amount": 110000.0, "merchant": "Unregistered Payment Node", "merchant_category": "Digital Wallet", "status": "REJECTED"},
    {"transaction_id": "TXN-1011-07", "applicant_id": "APP-1011", "timestamp": "2026-10-05T14:11:15Z", "transaction_type": "rapid_transfer", "amount": 60000.0, "merchant": "Dark Pool Transfer", "merchant_category": "High Risk Merchant", "status": "REJECTED"},

    # APP-1012 (Normal)
    {"transaction_id": "TXN-1012-01", "applicant_id": "APP-1012", "timestamp": "2026-10-05T11:45:00Z", "transaction_type": "purchase", "amount": 14500.0, "merchant": "Samsung Digital Plaza", "merchant_category": "Electronics", "status": "COMPLETED"},
    {"transaction_id": "TXN-1012-02", "applicant_id": "APP-1012", "timestamp": "2026-10-05T13:10:00Z", "transaction_type": "transfer", "amount": 6000.0, "merchant": "LIC Insurance Premium", "merchant_category": "Insurance", "status": "COMPLETED"},
    {"transaction_id": "TXN-1012-03", "applicant_id": "APP-1012", "timestamp": "2026-10-05T16:00:00Z", "transaction_type": "purchase", "amount": 1800.0, "merchant": "DMart Supermarket", "merchant_category": "Groceries", "status": "COMPLETED"},
    {"transaction_id": "TXN-1012-04", "applicant_id": "APP-1012", "timestamp": "2026-10-05T18:25:00Z", "transaction_type": "transfer", "amount": 2500.0, "merchant": "UPI P2P Transfer", "merchant_category": "P2P Payment", "status": "COMPLETED"},

    # APP-1013 (Normal)
    {"transaction_id": "TXN-1013-01", "applicant_id": "APP-1013", "timestamp": "2026-10-05T12:30:00Z", "transaction_type": "transfer", "amount": 35000.0, "merchant": "University Tuition Fee", "merchant_category": "Education", "status": "COMPLETED"},
    {"transaction_id": "TXN-1013-02", "applicant_id": "APP-1013", "timestamp": "2026-10-05T14:15:00Z", "transaction_type": "purchase", "amount": 5200.0, "merchant": "Flipkart Electronics", "merchant_category": "E-Commerce", "status": "COMPLETED"},
    {"transaction_id": "TXN-1013-03", "applicant_id": "APP-1013", "timestamp": "2026-10-05T17:40:00Z", "transaction_type": "withdrawal", "amount": 10000.0, "merchant": "Kotak Mahindra ATM", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},
    {"transaction_id": "TXN-1013-04", "applicant_id": "APP-1013", "timestamp": "2026-10-05T19:10:00Z", "transaction_type": "purchase", "amount": 950.0, "merchant": "Swiggy Instamart", "merchant_category": "Groceries", "status": "COMPLETED"},

    # APP-1014 (Normal)
    {"transaction_id": "TXN-1014-01", "applicant_id": "APP-1014", "timestamp": "2026-10-05T14:00:00Z", "transaction_type": "purchase", "amount": 2100.0, "merchant": "Ajio Fashion Store", "merchant_category": "Retail", "status": "COMPLETED"},
    {"transaction_id": "TXN-1014-02", "applicant_id": "APP-1014", "timestamp": "2026-10-05T15:45:00Z", "transaction_type": "transfer", "amount": 4800.0, "merchant": "Piped Gas Utility", "merchant_category": "Utilities", "status": "COMPLETED"},
    {"transaction_id": "TXN-1014-03", "applicant_id": "APP-1014", "timestamp": "2026-10-05T18:00:00Z", "transaction_type": "purchase", "amount": 1100.0, "merchant": "Blinkit Grocery", "merchant_category": "Groceries", "status": "COMPLETED"},
    {"transaction_id": "TXN-1014-04", "applicant_id": "APP-1014", "timestamp": "2026-10-05T20:00:00Z", "transaction_type": "transfer", "amount": 3000.0, "merchant": "UPI Merchant Payment", "merchant_category": "Retail", "status": "COMPLETED"},

    # APP-1015 (Normal)
    {"transaction_id": "TXN-1015-01", "applicant_id": "APP-1015", "timestamp": "2026-10-05T15:50:00Z", "transaction_type": "transfer", "amount": 40000.0, "merchant": "Home Renovation Contractor", "merchant_category": "Services", "status": "COMPLETED"},
    {"transaction_id": "TXN-1015-02", "applicant_id": "APP-1015", "timestamp": "2026-10-05T17:15:00Z", "transaction_type": "purchase", "amount": 8900.0, "merchant": "IKEA Furniture", "merchant_category": "Retail", "status": "COMPLETED"},
    {"transaction_id": "TXN-1015-03", "applicant_id": "APP-1015", "timestamp": "2026-10-05T19:30:00Z", "transaction_type": "withdrawal", "amount": 15000.0, "merchant": "PNB ATM", "merchant_category": "Cash Withdrawal", "status": "COMPLETED"},
    {"transaction_id": "TXN-1015-04", "applicant_id": "APP-1015", "timestamp": "2026-10-05T20:15:00Z", "transaction_type": "purchase", "amount": 1400.0, "merchant": "Shell Fuel Station", "merchant_category": "Fuel", "status": "COMPLETED"}
]


def seed_synthetic_fraud_data(conn: sqlite3.Connection):
    """
    Deterministically populates applicants and transactions tables if empty.
    Ensures zero duplicate creation on server restart.
    """
    cursor = conn.cursor()

    # Create tables if not existing
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applicants (
            applicant_id TEXT PRIMARY KEY,
            applicant_name TEXT NOT NULL,
            application_id TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            device_id TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            bank_account_id TEXT NOT NULL,
            loan_amount REAL NOT NULL,
            application_timestamp TEXT NOT NULL,
            initial_status TEXT NOT NULL
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            applicant_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            amount REAL NOT NULL,
            merchant TEXT NOT NULL,
            merchant_category TEXT,
            status TEXT NOT NULL,
            FOREIGN KEY(applicant_id) REFERENCES applicants(applicant_id)
        );
    """)

    # Check if applicants table already populated
    cursor.execute("SELECT COUNT(*) FROM applicants")
    count = cursor.fetchone()[0]

    if count == 0:
        for app in SYNTHETIC_APPLICANTS:
            cursor.execute("""
                INSERT INTO applicants (
                    applicant_id, applicant_name, application_id, phone_number,
                    device_id, ip_address, bank_account_id, loan_amount,
                    application_timestamp, initial_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                app["applicant_id"], app["applicant_name"], app["application_id"],
                app["phone_number"], app["device_id"], app["ip_address"],
                app["bank_account_id"], app["loan_amount"],
                app["application_timestamp"], app["initial_status"]
            ))

        for txn in SYNTHETIC_TRANSACTIONS:
            cursor.execute("""
                INSERT INTO transactions (
                    transaction_id, applicant_id, timestamp, transaction_type,
                    amount, merchant, merchant_category, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                txn["transaction_id"], txn["applicant_id"], txn["timestamp"],
                txn["transaction_type"], txn["amount"], txn["merchant"],
                txn.get("merchant_category", "General"), txn["status"]
            ))

        conn.commit()
        print(f"Seeded deterministic dataset: {len(SYNTHETIC_APPLICANTS)} applicants, {len(SYNTHETIC_TRANSACTIONS)} transactions.")
    else:
        print(f"Applicants table already populated with {count} records. Skipping seed.")


def get_all_applicants(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applicants ORDER BY applicant_id ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_applicant_by_id(conn: sqlite3.Connection, applicant_id: str) -> Optional[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applicants WHERE applicant_id = ?", (applicant_id,))
    row = cursor.fetchone()
    return dict(row) if row else None


def get_all_transactions(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def get_transactions_by_applicant_id(conn: sqlite3.Connection, applicant_id: str) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE applicant_id = ? ORDER BY timestamp DESC", (applicant_id,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]
