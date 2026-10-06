from fastapi import APIRouter, HTTPException, status
from app.models import URLScanRequest, URLScanResponse
from app.services.digital_trust_service import analyze_url_service

router = APIRouter(prefix="/api/digital-trust", tags=["Digital Trust"])

@router.post("/analyze", response_model=URLScanResponse)
def analyze_url(payload: URLScanRequest):
    """
    Endpoint to receive a URL and return transparent rule-based risk assessment.
    """
    try:
        result = analyze_url_service(payload.url)
        return result
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during URL trust analysis."
        )

@router.post("/scan-url", response_model=URLScanResponse)
def scan_url(payload: URLScanRequest):
    """
    Alias endpoint for backward compatibility.
    """
    return analyze_url(payload)
