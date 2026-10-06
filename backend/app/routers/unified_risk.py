from fastapi import APIRouter, HTTPException, status
from typing import List
from app.database import get_db_connection
from app.models import UnifiedRiskResponse
from app.services.unified_risk_service import (
    calculate_unified_risk_for_applicant,
    calculate_unified_risk_all
)

router = APIRouter(prefix="/api/unified-risk", tags=["Unified Risk Engine"])

@router.get("", response_model=List[UnifiedRiskResponse])
@router.get("/", response_model=List[UnifiedRiskResponse])
def get_all_unified_risk_scores():
    """
    Returns explainable Unified Risk Scores (0-100), module contributions,
    risk levels, and recommendations for all synthetic dataset applicants.
    """
    conn = get_db_connection()
    try:
        results = calculate_unified_risk_all(conn)
        return results
    finally:
        conn.close()

@router.get("/{applicant_id}", response_model=UnifiedRiskResponse)
def get_single_unified_risk_score(applicant_id: str):
    """
    Returns complete explainable Unified Risk Score analysis for a single applicant.
    Combines Financial Fraud (45%), Identity Forensics (25%), and Digital Trust (30%).
    """
    conn = get_db_connection()
    try:
        result = calculate_unified_risk_for_applicant(conn, applicant_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        return result
    finally:
        conn.close()
