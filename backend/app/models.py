from pydantic import BaseModel
from typing import List, Optional

# --- Digital Trust Models ---
class URLScanRequest(BaseModel):
    url: str

class URLScanResponse(BaseModel):
    url: str
    normalized_url: str
    domain: str
    risk_score: int
    risk_level: str
    is_suspicious: bool
    detected_risk_signals: List[str]
    positive_signals: List[str]
    explanation: str

# --- Financial Fraud Models ---
class ApplicationFraudRequest(BaseModel):
    applicant_id: str
    applicant_name: str
    device_id: str
    ip_address: str
    requested_amount: float

class FraudAnalysisResponse(BaseModel):
    applicant_id: str
    risk_score: int
    risk_level: str
    detected_signals: List[str]
    is_approved: bool

# --- Step 5A Synthetic Fraud Dataset Models ---
class ApplicantResponse(BaseModel):
    applicant_id: str
    applicant_name: str
    application_id: str
    phone_number: str
    device_id: str
    ip_address: str
    bank_account_id: str
    loan_amount: float
    application_timestamp: str
    initial_status: str

class TransactionResponse(BaseModel):
    transaction_id: str
    applicant_id: str
    timestamp: str
    transaction_type: str
    amount: float
    merchant: str
    merchant_category: Optional[str] = None
    status: str

# --- Step 5B Financial Fraud Detection Rule Engine Models ---
class DetectedSignalModel(BaseModel):
    signal_type: str
    severity: str
    description: str
    applicant_ids: List[str]
    evidence: dict

class ApplicantAnalysisModel(BaseModel):
    applicant_id: str
    applicant_name: Optional[str] = None
    signal_count: int
    detected_signals: List[DetectedSignalModel]
    related_applicants: List[str]
    evidence: Optional[dict] = None

class ClusterAnalysisModel(BaseModel):
    cluster_id: str
    cluster_name: str
    member_applicant_ids: List[str]
    shared_attributes: dict
    detected_signals: List[str]
    description: str

# --- Step 5C Applicant Risk Scoring Engine Models ---
class WeightedSignalItem(BaseModel):
    signal_type: str
    weight: int
    severity: str
    description: str
    evidence: dict

class ApplicantRiskResponse(BaseModel):
    applicant_id: str
    applicant_name: Optional[str] = None
    risk_score: int
    raw_score: int
    risk_level: str
    recommendation: str
    model_name: str
    score_breakdown: dict
    signals: List[WeightedSignalItem]
    related_applicants: List[str]

class ClusterRiskResponse(BaseModel):
    cluster_id: str
    cluster_name: str
    member_applicant_ids: List[str]
    average_risk_score: float
    max_risk_score: int
    risk_level: str
    recommendation: str
    shared_attributes: dict
    description: str

# --- Step 5D Fraud Network & Syndicate Visualization Models ---
class GraphNodeModel(BaseModel):
    id: str
    type: str
    label: str
    name: Optional[str] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    recommendation: Optional[str] = None
    signal_count: Optional[int] = None
    applicant_count: Optional[int] = None
    is_shared: Optional[bool] = False
    connected_applicants: Optional[List[str]] = None

class GraphEdgeModel(BaseModel):
    source: str
    target: str
    relationship: str
    is_shared: Optional[bool] = False
    applicant_count: Optional[int] = 1

class FraudNetworkResponse(BaseModel):
    nodes: List[GraphNodeModel]
    edges: List[GraphEdgeModel]
    clusters: List[ClusterRiskResponse]
    summary: dict

# --- Step 6 Synthetic Document & Identity Forensics Models ---
class IdentityDocumentModel(BaseModel):
    document_id: str
    applicant_id: str
    document_type: str
    document_number: str
    name_on_document: str
    date_of_birth: str
    document_status: str
    created_at: Optional[str] = None

class IdentitySignalModel(BaseModel):
    signal_type: str
    severity: str
    description: str
    applicant_ids: List[str]
    evidence: dict

class ApplicantIdentityAnalysisModel(BaseModel):
    applicant_id: str
    applicant_name: Optional[str] = None
    signal_count: int
    detected_signals: List[IdentitySignalModel]
    related_applicants: List[str]
    documents: List[IdentityDocumentModel]

class IdentityClusterModel(BaseModel):
    cluster_id: str
    cluster_name: str
    member_applicant_ids: List[str]
    shared_documents: List[str]
    shared_dobs: List[str]
    detected_signals: List[str]
    description: str

# --- Step 7 Unified Risk Engine Models ---
class UnifiedRiskResponse(BaseModel):
    applicant_id: str
    applicant_name: Optional[str] = None
    financial_fraud_score: int
    identity_forensics_score: int
    digital_trust_score: int
    financial_fraud_contribution: float
    identity_forensics_contribution: float
    digital_trust_contribution: float
    unified_score: int
    risk_level: str
    recommended_action: str
    top_contributing_risk_factors: List[str]
    explanation: str






