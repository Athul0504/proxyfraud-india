import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DigitalTrustPage from './pages/DigitalTrustPage';
import FinancialFraudPage from './pages/FinancialFraudPage';
import FraudNetworkPage from './pages/FraudNetworkPage';
import IdentityForensicsPage from './pages/IdentityForensicsPage';
import UnifiedRiskPage from './pages/UnifiedRiskPage';
import DashboardPage from './pages/DashboardPage';
import { checkBackendHealth } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        if (data.status === 'healthy' || data.status === 'online') {
          setBackendStatus('Connected 🟢');
        } else {
          setBackendStatus('Disconnected 🔴');
        }
      })
      .catch(() => setBackendStatus('Disconnected 🔴'));
  }, []);

  return (
    <div className="app-shell-container">
      {/* LEFT SOC TELEMETRY SIDEBAR */}
      <aside className="telemetry-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-header-title">SOC TELEMETRY // L1</div>
          
          <div className="sidebar-metric-box">
            <div className="metric-label-row">
              <span>ACTIVE QUERIES</span>
              <span className="mono-val">4,832/s</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-fill cyan" style={{ width: '74%' }}></div></div>
          </div>

          <div className="sidebar-metric-box mt-2">
            <div className="metric-label-row">
              <span>UPI RAIL ANOMALY</span>
              <span className="mono-val text-danger">+14.2%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-fill danger" style={{ width: '88%' }}></div></div>
          </div>

          <div className="sidebar-section-title mt-4">OPERATIONS</div>
          <nav className="sidebar-nav-list">
            <button className="sidebar-nav-btn active">
              <span className="icon">⚙️</span> Live Feeds
            </button>
            <button className="sidebar-nav-btn">
              <span className="icon">⚖️</span> Enforcement Rules
            </button>
            <button className="sidebar-nav-btn">
              <span className="icon">📋</span> Audit Logs
            </button>
            <button className="sidebar-nav-btn">
              <span className="icon">🌐</span> API Gateways
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-status-box">
            <div className="status-title">LATENCY ENGINE</div>
            <div className="status-sub mono-val">19ms (MUM-B1)</div>
            <div className="status-ver mono-val">v6.19-STABLE</div>
          </div>
        </div>
      </aside>

      {/* MAIN RIGHT CONTENT AREA */}
      <div className="app-main-layout">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="backend-banner">
          <span>Backend API Status: <strong>{backendStatus}</strong></span>
          <span className="api-url-hint">(FastAPI running on http://localhost:8000)</span>
          <span className="regulatory-tag">REGULATORY COMPLIANCE: RBI/AML-2026-V2</span>
        </div>

        <main className="main-content">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'unified-risk' && <UnifiedRiskPage />}
          {activeTab === 'digital-trust' && <DigitalTrustPage />}
          {activeTab === 'financial-fraud' && <FinancialFraudPage />}
          {activeTab === 'fraud-network' && <FraudNetworkPage />}
          {activeTab === 'identity-forensics' && <IdentityForensicsPage />}
        </main>

        <footer className="footer">
          <p>ProxyShield India &copy; Executive Fraud Risk Intelligence & Cyber Defense Dashboard</p>
        </footer>
      </div>
    </div>
  );
}


