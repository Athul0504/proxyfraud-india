// API service layer to communicate with FastAPI backend

const API_BASE_URL = "http://localhost:8000/api";

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error("Error connecting to backend health endpoint:", error);
    return { status: "offline", error: error.message };
  }
}

export async function analyzeUrl(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/digital-trust/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "URL analysis failed.");
    }
    return data;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    throw error;
  }
}

export async function scanUrl(url) {
  return analyzeUrl(url);
}

export async function analyzeFinancialFraud(applicationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/financial-fraud/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error analyzing financial fraud:", error);
    throw error;
  }
}

// --- Step 5B Financial Fraud Detection Rule Engine API Helpers ---

export async function getFraudApplicantAnalysis(applicantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/analyze/${applicantId}`);
    if (!response.ok) {
      throw new Error(`Failed to analyze applicant ${applicantId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error analyzing fraud applicant ${applicantId}:`, error);
    throw error;
  }
}

export async function getFraudAnalysisAll() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/analysis`);
    if (!response.ok) {
      throw new Error("Failed to fetch fraud analysis for all applicants");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching all fraud analyses:", error);
    throw error;
  }
}

export async function getFraudClusters() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/clusters`);
    if (!response.ok) {
      throw new Error("Failed to fetch discovered fraud clusters");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching fraud clusters:", error);
    throw error;
  }
}

// --- Step 5C Financial Fraud Risk Scoring Engine API Helpers ---

export async function getFraudApplicantRiskScore(applicantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/risk/${applicantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch risk score for applicant ${applicantId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching risk score for applicant ${applicantId}:`, error);
    throw error;
  }
}

export async function getFraudRiskAll() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/risk`);
    if (!response.ok) {
      throw new Error("Failed to fetch risk scores for all applicants");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching risk scores for all applicants:", error);
    throw error;
  }
}

export async function getFraudApplicants() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/applicants`);
    if (!response.ok) {
      throw new Error("Failed to fetch synthetic applicants");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching synthetic applicants:", error);
    throw error;
  }
}

export async function getApplicantTransactions(applicantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/applicants/${applicantId}/transactions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions for applicant ${applicantId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching transactions for applicant ${applicantId}:`, error);
    return [];
  }
}

export async function getFraudClusterRisk() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/risk/clusters`);
    if (!response.ok) {
      throw new Error("Failed to fetch cluster risk scores");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching cluster risk scores:", error);
    throw error;
  }
}

// --- Step 5D Fraud Network & Syndicate Visualization API Helper ---

export async function getFraudNetwork() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/network`);
    if (!response.ok) {
      throw new Error("Failed to fetch fraud network data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching fraud network data:", error);
    throw error;
  }
}

// --- Step 6 Synthetic Document & Identity Forensics API Helpers ---

export async function getIdentityDocuments(applicantId = null) {
  try {
    const url = applicantId
      ? `${API_BASE_URL}/fraud/documents/${applicantId}`
      : `${API_BASE_URL}/fraud/documents`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch identity documents");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching identity documents:", error);
    throw error;
  }
}

export async function getIdentityAnalysis(applicantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/identity-analysis/${applicantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch identity analysis for applicant ${applicantId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching identity analysis for ${applicantId}:`, error);
    throw error;
  }
}

export async function getIdentityAnalysisAll() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/identity-analysis`);
    if (!response.ok) {
      throw new Error("Failed to fetch identity analysis for all applicants");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching all identity analyses:", error);
    throw error;
  }
}

export async function getIdentityClusters() {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/identity-clusters`);
    if (!response.ok) {
      throw new Error("Failed to fetch identity clusters");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching identity clusters:", error);
    throw error;
  }
}

// --- Step 7 Unified Risk Engine API Helpers ---

export async function getUnifiedRiskAll() {
  try {
    const response = await fetch(`${API_BASE_URL}/unified-risk`);
    if (!response.ok) {
      throw new Error("Failed to fetch all unified risk scores");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching unified risk scores for all applicants:", error);
    throw error;
  }
}

export async function getUnifiedRiskApplicant(applicantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/unified-risk/${applicantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch unified risk score for applicant ${applicantId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching unified risk score for ${applicantId}:`, error);
    throw error;
  }
}





