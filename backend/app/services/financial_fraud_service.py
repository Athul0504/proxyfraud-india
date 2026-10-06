def analyze_fraud_service(applicant_data: dict):
    """
    Starter service function for Financial Fraud analysis.
    Real pattern detection logic will be implemented here later.
    """
    return {
        "applicant_id": applicant_data.get("applicant_id", "N/A"),
        "risk_score": 0,
        "risk_level": "LOW",
        "detected_signals": ["Starter endpoint response - Fraud analysis logic not implemented yet"],
        "is_approved": True
    }
