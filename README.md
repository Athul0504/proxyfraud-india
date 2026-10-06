# ProxyShield India 🛡️

**Financial Fraud Risk Intelligence Platform** (36-Hour Hackathon Prototype)

ProxyShield India detects suspicious digital and financial fraud signals before a lender releases money.

---

## 📁 Project Architecture Overview

```text
ProxyShield-India/
├── backend/                  # Python + FastAPI backend REST server
│   ├── app/                  # Application code
│   │   ├── main.py           # FastAPI entrypoint & CORS config
│   │   ├── database.py       # SQLite database connection & initial schema setup
│   │   ├── models.py         # Pydantic data schemas & response contracts
│   │   ├── routers/          # REST API endpoints
│   │   │   ├── digital_trust.py    # Endpoints for Digital Trust module
│   │   │   └── financial_fraud.py  # Endpoints for Financial Fraud module
│   │   └── services/         # Service layer (business & risk detection logic)
│   │       ├── digital_trust_service.py
│   │       └── financial_fraud_service.py
│   └── requirements.txt      # Python dependencies (fastapi, uvicorn, pydantic)
│
├── frontend/                 # React + Vite frontend web client
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, header, etc.)
│   │   │   └── Navbar.jsx
│   │   ├── pages/            # View components matching platform sections
│   │   │   ├── DigitalTrustPage.jsx
│   │   │   ├── FinancialFraudPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── services/         # Frontend API integration service
│   │   │   └── api.js
│   │   ├── App.jsx           # Top-level React application state & tab router
│   │   ├── App.css           # App layout styles
│   │   ├── index.css         # Global design tokens & reset
│   │   └── main.jsx          # React app entry point
│   ├── package.json          # Node dependencies & Vite scripts
│   └── vite.config.js        # Vite build configuration
└── README.md
```

---

## 🚀 How to Run the Application

### 1. Running the Backend (Python + FastAPI)

1. Navigate into the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. The backend API will be available at:
   - **API Root**: http://localhost:8000
   - **Swagger Docs**: http://localhost:8000/docs
   - **Health Endpoint**: http://localhost:8000/api/health

---

### 2. Running the Frontend (React + Vite)

1. Open a new terminal tab/window and navigate into the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).
