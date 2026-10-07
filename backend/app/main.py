from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import digital_trust, financial_fraud, fraud_dataset, unified_risk, proxybank_router

app = FastAPI(
    title="ProxyShield India API",
    description="Financial Fraud Risk Intelligence Platform API",
    version="0.1.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include module routers
app.include_router(digital_trust.router)
app.include_router(financial_fraud.router)
app.include_router(fraud_dataset.router)
app.include_router(unified_risk.router)
app.include_router(proxybank_router.router)


@app.on_event("startup")
def startup_event():
    # Initialize SQLite tables on app startup
    init_db()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "ProxyShield India API",
        "version": "0.1.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
