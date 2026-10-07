from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sqlite3
import os

# Import core domain services using package-qualified imports
from app.services.account_service import create_synthetic_account, get_db_connection as get_ac_conn
from app.services.simulation_service import advance_account_by_30_days, set_account_simulation_stage, get_account
from app.services.adaptive_engine import analyze_account_adaptive, calculate_portfolio_pattern_confidence

router = APIRouter(prefix="/api", tags=["ProxyBank Simulation & Behavioral Fraud"])

# --- Request Models ---
class CreateAccountRequest(BaseModel):
    customer_name: str
    date_of_birth: Optional[str] = "1995-01-01"
    mobile: Optional[str] = "+919800000000"
    email: Optional[str] = "user@example.com"
    address: Optional[str] = "Mumbai, India"
    occupation: Optional[str] = "Salaried"
    account_type: Optional[str] = "SAVINGS"
    initial_deposit: Optional[float] = 0.0

class AdvanceSimulationRequest(BaseModel):
    account_id: Optional[str] = "C126"

# --- Helper DB Connection ---
def get_db():
    conn = get_ac_conn()
    return conn

# --- 1. GET /api/dashboard ---
@router.get("/dashboard")
def get_dashboard_summary():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT account_id, loan_status, simulation_day FROM accounts;")
        rows = cursor.fetchall()
        conn.close()

        total_accounts = len(rows)
        if total_accounts == 0:
            return {
                "total_accounts": 0,
                "safe_accounts": 0,
                "suspicious_accounts": 0,
                "critical_accounts": 0,
                "loans_on_hold": 0,
                "current_simulation_day": 0
            }

        safe_cnt = 0
        suspicious_cnt = 0
        critical_cnt = 0
        loans_on_hold = 0
        max_sim_day = 0

        for r in rows:
            acc_id = r[0]
            loan_st = r[1]
            sim_day = r[2] or 0

            if sim_day > max_sim_day:
                max_sim_day = sim_day

            if loan_st in ["ON_HOLD", "HOLD"]:
                loans_on_hold += 1

            analysis = analyze_account_adaptive(acc_id)
            r_level = analysis.get("risk_level", "LOW")

            if r_level == "CRITICAL":
                critical_cnt += 1
            elif r_level in ["MEDIUM", "HIGH"]:
                suspicious_cnt += 1
            else:
                safe_cnt += 1

        return {
            "total_accounts": total_accounts,
            "safe_accounts": safe_cnt,
            "suspicious_accounts": suspicious_cnt,
            "critical_accounts": critical_cnt,
            "loans_on_hold": loans_on_hold,
            "current_simulation_day": max_sim_day
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# --- 2. GET /api/accounts ---
@router.get("/accounts")
def list_accounts(
    account_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    pattern: Optional[str] = None
):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts;")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        results = []
        for acc in rows:
            acc_id = acc["account_id"]

            # Filter by account_id substring if provided
            if account_id and isinstance(account_id, str) and account_id.lower() not in acc_id.lower():
                continue

            analysis = analyze_account_adaptive(acc_id)
            
            # Combine record with analysis
            combined = {**acc, **analysis}

            # Filter by risk_level if provided
            if risk_level and isinstance(risk_level, str) and combined.get("risk_level", "").upper() != risk_level.upper():
                continue

            # Filter by pattern if provided
            if pattern and isinstance(pattern, str) and combined.get("pattern", "").upper() != pattern.upper():
                continue

            results.append(combined)

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve accounts: {str(e)}")

# --- 3. GET /api/accounts/{account_id} ---
@router.get("/accounts/{account_id}")
def get_account_detail(account_id: str):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts WHERE account_id = ?;", (account_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail=f"Account '{account_id}' not found.")

        acc_dict = dict(row)
        analysis = analyze_account_adaptive(account_id)
        return {**acc_dict, **analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching account detail: {str(e)}")

# --- 4. POST /api/accounts/create ---
@router.post("/accounts/create")
def create_account(payload: CreateAccountRequest):
    try:
        new_account = create_synthetic_account(
            customer_name=payload.customer_name,
            date_of_birth=payload.date_of_birth,
            mobile=payload.mobile,
            email=payload.email,
            address=payload.address,
            occupation=payload.occupation,
            account_type=payload.account_type,
            initial_deposit=payload.initial_deposit or 0.0
        )
        return new_account
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create account: {str(e)}")

# --- 5. POST /api/simulation/advance ---
@router.post("/simulation/advance")
def advance_simulation(payload: Optional[AdvanceSimulationRequest] = None):
    try:
        target_acc_id = payload.account_id if (payload and payload.account_id) else "C126"
        
        # Advance target account
        updated_account = advance_account_by_30_days(target_acc_id)

        # Get updated dashboard summary
        dash = get_dashboard_summary()

        return {
            "status": "success",
            "message": f"Successfully advanced simulation for account {target_acc_id} by +30 days.",
            "account_id": target_acc_id,
            "new_simulation_day": updated_account["simulation_day"],
            "last_event": updated_account["last_event"],
            "updated_counts": {
                "safe_accounts": dash["safe_accounts"],
                "suspicious_accounts": dash["suspicious_accounts"],
                "critical_accounts": dash["critical_accounts"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to advance simulation: {str(e)}")

# --- 6. POST /api/accounts/{account_id}/hold ---
@router.post("/accounts/{account_id}/hold")
def place_loan_on_hold(account_id: str):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT account_id, loan_status FROM accounts WHERE account_id = ?;", (account_id,))
        row = cursor.fetchone()

        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Account '{account_id}' not found.")

        cursor.execute("UPDATE accounts SET loan_status = 'ON_HOLD' WHERE account_id = ?;", (account_id,))
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "account_id": account_id,
            "loan_status": "ON_HOLD",
            "message": f"Loan for account {account_id} has been placed ON_HOLD successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to place loan on hold: {str(e)}")

# --- 7. GET /api/alerts ---
@router.get("/alerts")
def get_fraud_alerts():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts;")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        alerts = []
        for acc in rows:
            acc_id = acc["account_id"]
            analysis = analyze_account_adaptive(acc_id)
            r_level = analysis.get("risk_level", "LOW")

            if r_level in ["MEDIUM", "HIGH", "CRITICAL"]:
                alerts.append({
                    "account_id": acc_id,
                    "customer_name": acc.get("customer_name", ""),
                    "risk_score": analysis["risk_score"],
                    "risk_level": analysis["risk_level"],
                    "pattern": analysis["pattern"],
                    "confidence": analysis["confidence"],
                    "reasons": analysis["reasons"],
                    "recommended_action": analysis["recommended_action"],
                    "loan_status": acc.get("loan_status", "NONE")
                })

        # Sort alerts descending by risk score
        alerts.sort(key=lambda x: x["risk_score"], reverse=True)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")
