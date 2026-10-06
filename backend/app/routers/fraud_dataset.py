from fastapi import APIRouter, HTTPException, status
from typing import List
from app.database import get_db_connection
from app.models import ApplicantResponse, TransactionResponse
from app.services.fraud_dataset_service import (
    get_all_applicants,
    get_applicant_by_id,
    get_all_transactions,
    get_transactions_by_applicant_id
)

router = APIRouter(prefix="/api/fraud", tags=["Fraud Dataset"])

@router.get("/applicants", response_model=List[ApplicantResponse])
def read_applicants():
    """
    Get all synthetic financial applicants.
    """
    conn = get_db_connection()
    try:
        applicants = get_all_applicants(conn)
        return applicants
    finally:
        conn.close()

@router.get("/applicants/{applicant_id}", response_model=ApplicantResponse)
def read_applicant(applicant_id: str):
    """
    Get specific applicant details by applicant_id.
    """
    conn = get_db_connection()
    try:
        applicant = get_applicant_by_id(conn, applicant_id)
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        return applicant
    finally:
        conn.close()

@router.get("/transactions", response_model=List[TransactionResponse])
def read_transactions():
    """
    Get all synthetic financial transactions.
    """
    conn = get_db_connection()
    try:
        transactions = get_all_transactions(conn)
        return transactions
    finally:
        conn.close()

@router.get("/applicants/{applicant_id}/transactions", response_model=List[TransactionResponse])
def read_applicant_transactions(applicant_id: str):
    """
    Get all transactions associated with a specific applicant_id.
    """
    conn = get_db_connection()
    try:
        # Verify applicant exists
        applicant = get_applicant_by_id(conn, applicant_id)
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        transactions = get_transactions_by_applicant_id(conn, applicant_id)
        return transactions
    finally:
        conn.close()

# --- Step 5B Financial Fraud Detection Rule Engine Endpoints ---

from app.models import ApplicantAnalysisModel, ClusterAnalysisModel
from app.services.fraud_rule_engine import (
    analyze_single_applicant,
    analyze_all_applicants,
    discover_fraud_clusters
)

@router.get("/analyze/{applicant_id}", response_model=ApplicantAnalysisModel)
def analyze_applicant_rule_engine(applicant_id: str):
    """
    Analyze one applicant using deterministic fraud detection rules.
    Returns detected signals, signal count, and related applicants without computing final 0-100 risk score.
    """
    conn = get_db_connection()
    try:
        result = analyze_single_applicant(conn, applicant_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        return result
    finally:
        conn.close()

@router.get("/analysis", response_model=List[ApplicantAnalysisModel])
def analyze_all_applicants_rule_engine():
    """
    Analyze all synthetic dataset applicants using deterministic fraud rules.
    """
    conn = get_db_connection()
    try:
        results = analyze_all_applicants(conn)
        return results
    finally:
        conn.close()

@router.get("/clusters", response_model=List[ClusterAnalysisModel])
def get_discovered_clusters():
    """
    Algorithmic discovery of coordinated fraud clusters based on shared infrastructure and rapid activity.
    """
    conn = get_db_connection()
    try:
        clusters = discover_fraud_clusters(conn)
        return clusters
    finally:
        conn.close()

# --- Step 5C Financial Fraud Applicant Risk Scoring Engine Endpoints ---

from app.models import ApplicantRiskResponse, ClusterRiskResponse
from app.services.fraud_scoring_engine import (
    calculate_applicant_risk,
    calculate_all_applicants_risk,
    calculate_cluster_risk
)

@router.get("/risk", response_model=List[ApplicantRiskResponse])
def get_all_applicants_risk_scores():
    """
    Returns explainable risk score (0-100), breakdown, risk level, and recommendation for all synthetic dataset applicants.
    """
    conn = get_db_connection()
    try:
        results = calculate_all_applicants_risk(conn)
        return results
    finally:
        conn.close()

@router.get("/risk/clusters", response_model=List[ClusterRiskResponse])
def get_clusters_risk_scores():
    """
    Returns risk scores, risk levels, and recommendations for discovered fraud clusters.
    """
    conn = get_db_connection()
    try:
        results = calculate_cluster_risk(conn)
        return results
    finally:
        conn.close()

@router.get("/risk/{applicant_id}", response_model=ApplicantRiskResponse)
def get_applicant_risk_score(applicant_id: str):
    """
    Returns complete explainable risk score analysis for a single applicant.
    """
    conn = get_db_connection()
    try:
        result = calculate_applicant_risk(conn, applicant_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        return result
    finally:
        conn.close()

# --- Step 5D Fraud Network & Syndicate Analysis Endpoints ---

from app.models import FraudNetworkResponse
from app.services.fraud_network_service import build_fraud_network_graph

@router.get("/network", response_model=FraudNetworkResponse)
def get_fraud_network_graph():
    """
    Returns graph visualization nodes, edges, clusters, and summary metrics for the financial fraud network.
    """
    conn = get_db_connection()
    try:
        network_data = build_fraud_network_graph(conn)
        return network_data
    finally:
        conn.close()

# --- Step 6 Synthetic Document & Identity Forensics Endpoints ---

from app.models import (
    IdentityDocumentModel,
    ApplicantIdentityAnalysisModel,
    IdentityClusterModel
)
from app.services.identity_forensics_service import (
    get_all_documents,
    get_documents_by_applicant,
    analyze_applicant_identity,
    analyze_all_applicants_identity,
    discover_identity_clusters
)

@router.get("/documents", response_model=List[IdentityDocumentModel])
def read_identity_documents():
    """
    Get all synthetic identity document records.
    """
    conn = get_db_connection()
    try:
        docs = get_all_documents(conn)
        return docs
    finally:
        conn.close()

@router.get("/documents/{applicant_id}", response_model=List[IdentityDocumentModel])
def read_applicant_identity_documents(applicant_id: str):
    """
    Get synthetic identity documents associated with a specific applicant.
    """
    conn = get_db_connection()
    try:
        # Verify applicant exists
        applicant = get_applicant_by_id(conn, applicant_id)
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        docs = get_documents_by_applicant(conn, applicant_id)
        return docs
    finally:
        conn.close()

@router.get("/identity-analysis", response_model=List[ApplicantIdentityAnalysisModel])
def analyze_all_identities():
    """
    Run synthetic document & identity forensic analysis for all applicants.
    """
    conn = get_db_connection()
    try:
        results = analyze_all_applicants_identity(conn)
        return results
    finally:
        conn.close()

@router.get("/identity-clusters", response_model=List[IdentityClusterModel])
def get_identity_clusters():
    """
    Returns groups of applicants linked through reused synthetic identity & document information.
    """
    conn = get_db_connection()
    try:
        clusters = discover_identity_clusters(conn)
        return clusters
    finally:
        conn.close()

@router.get("/identity-analysis/{applicant_id}", response_model=ApplicantIdentityAnalysisModel)
def analyze_single_identity(applicant_id: str):
    """
    Run synthetic document & identity forensic analysis for a single applicant.
    """
    conn = get_db_connection()
    try:
        result = analyze_applicant_identity(conn, applicant_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applicant with ID '{applicant_id}' not found."
            )
        return result
    finally:
        conn.close()




