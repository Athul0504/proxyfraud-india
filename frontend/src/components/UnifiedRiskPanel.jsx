import React, { useState, useEffect } from 'react';
import { getUnifiedRiskAll, getUnifiedRiskApplicant } from '../services/api';

export default function UnifiedRiskPanel() {
  const [allUnifiedData, setAllUnifiedData] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('APP-1008');
  const [selectedUnifiedDetail, setSelectedUnifiedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state for the ledger
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getUnifiedRiskAll();
      setAllUnifiedData(list);

      const defaultApp = list.find(a => a.applicant_id === 'APP-1008') || list[0];
      if (defaultApp) {
        handleSelectApplicant(defaultApp.applicant_id);
      }
    } catch (err) {
      console.error('Error loading unified risk data:', err);
      setError(err.message || 'Failed to load unified risk engine analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplicant = async (appId) => {
    setSelectedAppId(appId);
    setLoadingDetail(true);
    try {
      const detail = await getUnifiedRiskApplicant(appId);
      setSelectedUnifiedDetail(detail);
    } catch (err) {
      console.error(`Error loading unified detail for ${appId}:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-loading card-styled text-center p-5">
        <div className="spinner mb-2"></div>
        <p className="font-mono text-muted">Running explainable Unified Risk Engine aggregation & normalization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-error card-styled text-center p-4">
        <h3 className="text-danger font-mono">⚠️ Unified Risk Engine Error</h3>
        <p className="text-muted mt-1">{error}</p>
        <button onClick={loadInitialData} className="btn-case-action btn-primary-outline mt-3">
          Retry Aggregation
        </button>
      </div>
    );
  }

  const totalApplicants = allUnifiedData.length;
  const criticalCount = allUnifiedData.filter(a => a.risk_level === 'CRITICAL').length;
  const highCount = allUnifiedData.filter(a => a.risk_level === 'HIGH').length;
  const mediumCount = allUnifiedData.filter(a => a.risk_level === 'MEDIUM').length;
  const lowCount = allUnifiedData.filter(a => a.risk_level === 'LOW').length;

  const filteredApplicants = allUnifiedData.filter(app => {
    const matchesSearch =
      app.applicant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant_name && app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.recommended_action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = levelFilter === 'ALL' || app.risk_level === levelFilter;
    return matchesSearch && matchesFilter;
  });

  const getBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'badge-danger';
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
      default:
        return 'badge-success';
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'BLOCK_OR_ESCALATE':
        return 'badge-danger';
      case 'MANUAL_REVIEW':
        return 'badge-warning';
      case 'MONITOR':
        return 'badge-info';
      case 'ALLOW':
      default:
        return 'badge-success';
    }
  };

  // SVG Gauge offset calculation for Unified Score
  const gaugeScore = selectedUnifiedDetail ? selectedUnifiedDetail.unified_score : 0;
  const strokeDashoffset = 377 - (377 * gaugeScore) / 100;

  return (
    <div className="unified-risk-container">
      {/* 1. TOP METRICS ROW */}
      <div className="overview-cards-grid">
        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">UNIFIED ENGINE EVALUATION</span>
            <span className="card-icon">⚡</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono">{totalApplicants}</div>
            <span className="card-badge badge-info">3-MODULE AGGREGATION</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-subtle">Normalized 0-100 Score</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">FINANCIAL FRAUD WEIGHT</span>
            <span className="card-icon">💳</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-primary">45%</div>
            <span className="card-badge badge-info font-mono">WEIGHT: 0.45</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-muted">Rule & Scoring Engine</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">IDENTITY FORENSICS WEIGHT</span>
            <span className="card-icon">📜</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-primary">25%</div>
            <span className="card-badge badge-info font-mono">WEIGHT: 0.25</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-muted">Document Reuse & DOB</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">DIGITAL TRUST WEIGHT</span>
            <span className="card-icon">🌐</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-primary">30%</div>
            <span className="card-badge badge-info font-mono">WEIGHT: 0.30</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-muted">Phishing & Typosquatting</span>
          </div>
        </div>
      </div>

      {/* APPLICANT INSPECTION SELECTOR BAR */}
      <div className="card-styled mb-3 font-mono">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-subtle">SELECT APPLICANT FOR UNIFIED INSPECTION:</span>
            <select
              value={selectedAppId}
              onChange={(e) => handleSelectApplicant(e.target.value)}
              className="filter-select font-mono bold-select"
            >
              {allUnifiedData.map((app) => (
                <option key={app.applicant_id} value={app.applicant_id}>
                  {app.applicant_id} - {app.applicant_name} ({app.risk_level} - {app.unified_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <span className="badge-pill badge-danger font-bold">CRITICAL: {criticalCount}</span>
            <span className="badge-pill badge-danger font-bold">HIGH: {highCount}</span>
            <span className="badge-pill badge-warning font-bold">MEDIUM: {mediumCount}</span>
            <span className="badge-pill badge-success font-bold">LOW: {lowCount}</span>
          </div>
        </div>
      </div>

      {/* 2. SELECTED APPLICANT UNIFIED RISK BREAKDOWN (MAIN INSPECTOR PANEL) */}
      {loadingDetail ? (
        <div className="card-styled text-center p-4">
          <div className="spinner mb-2"></div>
          <p className="font-mono text-muted">Evaluating unified risk formula for {selectedAppId}...</p>
        </div>
      ) : selectedUnifiedDetail ? (
        <div className="card-styled mb-4">
          {/* HEADER */}
          <div className="panel-header border-b pb-2">
            <div>
              <span className="badge-pill badge-danger font-mono font-bold">UNIFIED RISK ENGINE ANALYSIS</span>
              <h2 className="panel-title font-mono text-xl font-bold mt-1">
                {selectedUnifiedDetail.applicant_id} — {selectedUnifiedDetail.applicant_name}
              </h2>
            </div>
            <div className="text-right">
              <span className={`badge-pill ${getBadgeClass(selectedUnifiedDetail.risk_level)} font-mono font-bold text-sm`}>
                {selectedUnifiedDetail.risk_level} RISK ({selectedUnifiedDetail.unified_score}/100)
              </span>
            </div>
          </div>

          {/* ACTION BANNER */}
          <div className={`recommendation-banner mt-3 p-3 rounded font-mono ${getActionBadgeClass(selectedUnifiedDetail.recommended_action)}`}>
            <div className="font-bold text-md">
              RECOMMENDED ACTION: <strong>{selectedUnifiedDetail.recommended_action}</strong>
            </div>
            <div className="text-xs mt-1">
              Unified Formula: <code>round(Financial * 0.45 + Identity * 0.25 + Trust * 0.30)</code> = <strong>{selectedUnifiedDetail.unified_score} / 100</strong>
            </div>
          </div>

          {/* MAIN 2-COLUMN INSPECTION SECTION */}
          <div className="dashboard-main-grid mt-3">
            {/* LEFT: GAUGE & EXPLANATION */}
            <div className="grid-column-left">
              <div className="risk-score-container">
                <div className="radial-gauge-wrapper">
                  <svg className="radial-gauge" width="140" height="140" viewBox="0 0 140 140">
                    <circle className="gauge-bg" cx="70" cy="70" r="60" strokeWidth="12" />
                    <circle
                      className="gauge-progress danger"
                      cx="70"
                      cy="70"
                      r="60"
                      strokeWidth="12"
                      strokeDasharray="377"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="gauge-center-content">
                    <span className="score-value font-mono">{selectedUnifiedDetail.unified_score}</span>
                    <span className="score-max font-mono">/ 100</span>
                  </div>
                </div>

                <div className="risk-info-details">
                  <div className="risk-level-badge-row">
                    <span className="level-label font-mono">UNIFIED EVALUATION:</span>
                    <span className={`badge-pill ${getBadgeClass(selectedUnifiedDetail.risk_level)} font-bold`}>
                      {selectedUnifiedDetail.risk_level}
                    </span>
                  </div>

                  <p className="risk-explanation font-mono text-xs text-muted mt-2">
                    {selectedUnifiedDetail.explanation}
                  </p>
                </div>
              </div>

              {/* TOP CONTRIBUTING RISK FACTORS LIST */}
              <div className="telemetry-block border-danger-left mt-3">
                <div className="block-head font-mono font-bold text-subtle uppercase">
                  🚨 TOP CONTRIBUTING RISK FACTORS ({selectedUnifiedDetail.top_contributing_risk_factors.length})
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  {selectedUnifiedDetail.top_contributing_risk_factors.map((factor, idx) => (
                    <div key={idx} className="font-mono text-xs p-2 bg-slate-100 rounded border">
                      • {factor}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: 3 MODULE SOURCE CONTRIBUTIONS BREAKDOWN */}
            <div className="grid-column-right">
              <div className="telemetry-block border-primary-left">
                <div className="block-head font-mono font-bold text-subtle uppercase mb-2">
                  📊 MODULE CONTRIBUTION BREAKDOWN
                </div>

                {/* 1. FINANCIAL FRAUD (45%) */}
                <div className="module-contrib-box mb-3 p-2 bg-white border rounded">
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>💳 Financial Fraud (45% Weight)</span>
                    <span className="text-primary">{selectedUnifiedDetail.financial_fraud_score} / 100</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-fill cyan"
                      style={{ width: `${selectedUnifiedDetail.financial_fraud_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between font-mono text-xs text-subtle mt-1">
                    <span>Contribution to Unified:</span>
                    <strong className="text-main">+{selectedUnifiedDetail.financial_fraud_contribution} pts</strong>
                  </div>
                </div>

                {/* 2. IDENTITY FORENSICS (25%) */}
                <div className="module-contrib-box mb-3 p-2 bg-white border rounded">
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>📜 Identity Forensics (25% Weight)</span>
                    <span className="text-primary">{selectedUnifiedDetail.identity_forensics_score} / 100</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-fill cyan"
                      style={{ width: `${selectedUnifiedDetail.identity_forensics_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between font-mono text-xs text-subtle mt-1">
                    <span>Contribution to Unified:</span>
                    <strong className="text-main">+{selectedUnifiedDetail.identity_forensics_contribution} pts</strong>
                  </div>
                </div>

                {/* 3. DIGITAL TRUST (30%) */}
                <div className="module-contrib-box p-2 bg-white border rounded">
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>🌐 Digital Trust (30% Weight)</span>
                    <span className="text-primary">{selectedUnifiedDetail.digital_trust_score} / 100</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-fill cyan"
                      style={{ width: `${selectedUnifiedDetail.digital_trust_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between font-mono text-xs text-subtle mt-1">
                    <span>Contribution to Unified:</span>
                    <strong className="text-main">+{selectedUnifiedDetail.digital_trust_contribution} pts</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. UNIFIED RISK LEDGER TABLE */}
      <div className="applicant-table-panel card-styled mt-4">
        <div className="table-header-bar flex justify-between items-center mb-3">
          <div>
            <h3 className="panel-title font-mono uppercase">UNIFIED RISK LEDGER TABLE</h3>
            <p className="panel-subtitle">Comprehensive multi-module risk scores and recommendations for all synthetic dataset applicants</p>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="filter-select font-mono"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search Applicant ID, Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input font-mono"
              />
            </div>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="applicant-table dense-stitch-table">
            <thead>
              <tr className="font-mono">
                <th>APPLICANT</th>
                <th>FINANCIAL (45%)</th>
                <th>IDENTITY (25%)</th>
                <th>TRUST (30%)</th>
                <th>UNIFIED SCORE</th>
                <th>LEVEL</th>
                <th>ACTION</th>
                <th>INSPECT</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app) => {
                const isSelected = app.applicant_id === selectedAppId;
                return (
                  <tr
                    key={app.applicant_id}
                    className={`table-row font-mono ${isSelected ? 'table-row-selected' : ''}`}
                    onClick={() => handleSelectApplicant(app.applicant_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="cell-applicant">
                      <strong className="code-tag text-primary">{app.applicant_id}</strong>
                      <div className="applicant-name font-bold text-main">{app.applicant_name || 'Applicant'}</div>
                    </td>

                    <td>
                      <span className="font-bold">{app.financial_fraud_score}</span>
                      <span className="text-subtle text-xs"> (+{app.financial_fraud_contribution} pts)</span>
                    </td>

                    <td>
                      <span className="font-bold">{app.identity_forensics_score}</span>
                      <span className="text-subtle text-xs"> (+{app.identity_forensics_contribution} pts)</span>
                    </td>

                    <td>
                      <span className="font-bold">{app.digital_trust_score}</span>
                      <span className="text-subtle text-xs"> (+{app.digital_trust_contribution} pts)</span>
                    </td>

                    <td>
                      <span className={`score-pill ${getBadgeClass(app.risk_level)} font-bold`}>
                        {app.unified_score} / 100
                      </span>
                    </td>

                    <td>
                      <span className={`badge-pill ${getBadgeClass(app.risk_level)} font-bold`}>
                        {app.risk_level}
                      </span>
                    </td>

                    <td>
                      <span className={`badge-pill ${getActionBadgeClass(app.recommended_action)} font-bold`}>
                        {app.recommended_action}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`btn-triage ${isSelected ? 'btn-danger-sm' : 'btn-primary-sm'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectApplicant(app.applicant_id);
                        }}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
