from fastapi import APIRouter
from app.models import ApplicationFraudRequest, FraudAnalysisResponse
from app.services.financial_fraud_service import analyze_fraud_service

router = APIRouter(prefix="/api/financial-fraud", tags=["Financial Fraud"])

@router.post("/analyze", response_model=FraudAnalysisResponse)
def analyze_fraud(payload: ApplicationFraudRequest):
    """
    Endpoint to receive loan/transaction data and return fraud risk response structure.
    """
    result = analyze_fraud_service(payload.dict())
    return result
