import React, { useState, useEffect } from 'react';
import {
  getFraudRiskAll,
  getFraudClusters,
  getFraudApplicantRiskScore,
  getApplicantTransactions
} from '../services/api';

export default function FinancialFraudPanel() {
  const [allRiskData, setAllRiskData] = useState([]);
  const [clustersData, setClustersData] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('APP-1008');
  const [selectedRiskDetail, setSelectedRiskDetail] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [riskList, clusterList] = await Promise.all([
        getFraudRiskAll(),
        getFraudClusters()
      ]);
      setAllRiskData(riskList);
      setClustersData(clusterList);

      const defaultApp = riskList.find(a => a.applicant_id === 'APP-1008') || riskList[0];
      if (defaultApp) {
        handleSelectApplicant(defaultApp.applicant_id);
      }
    } catch (err) {
      console.error('Error loading financial fraud data:', err);
      setError(err.message || 'Failed to load financial fraud intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplicant = async (appId) => {
    setSelectedAppId(appId);
    setLoadingDetail(true);
    try {
      const [riskDetail, txns] = await Promise.all([
        getFraudApplicantRiskScore(appId),
        getApplicantTransactions(appId)
      ]);
      setSelectedRiskDetail(riskDetail);
      setSelectedTransactions(txns);
    } catch (err) {
      console.error(`Error loading details for ${appId}:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-loading card-styled text-center p-5">
        <div className="spinner mb-2"></div>
        <p className="font-mono text-muted">Running financial fraud risk scoring engine & loading applicant profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-error card-styled text-center p-4">
        <h3 className="text-danger font-mono">⚠️ Financial Fraud Module Error</h3>
        <p className="text-muted mt-1">{error}</p>
        <button onClick={loadInitialData} className="btn-case-action btn-primary-outline mt-3">
          Retry Analysis
        </button>
      </div>
    );
  }

  // Summary Metrics Calculation
  const totalApplicants = allRiskData.length;
  const criticalCount = allRiskData.filter(a => a.risk_level === 'CRITICAL').length;
  const highCount = allRiskData.filter(a => a.risk_level === 'HIGH').length;
  const mediumCount = allRiskData.filter(a => a.risk_level === 'MEDIUM').length;
  const lowCount = allRiskData.filter(a => a.risk_level === 'LOW').length;

  // Filtered Applicants List for Table
  const filteredApplicants = allRiskData.filter(app => {
    const matchesSearch = 
      app.applicant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant_name && app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.signals.some(s => s.signal_type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = riskFilter === 'ALL' || app.risk_level === riskFilter;

    return matchesSearch && matchesFilter;
  });

  const getRecommendationBadgeClass = (rec) => {
    switch (rec) {
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

  const getRiskLevelBadgeClass = (level) => {
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

  return (
    <div className="financial-fraud-container">
      {/* 1. OVERVIEW METRICS ROW */}
      <div className="overview-cards-grid">
        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">TOTAL APPLICANTS ANALYZED</span>
            <span className="card-icon">👥</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono">{totalApplicants}</div>
            <span className="card-badge badge-info">100% COVERAGE</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-muted">Synthetic Loan Dataset</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">CRITICAL RISK PROFILES</span>
            <span className="card-icon">🚨</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-danger">{criticalCount}</div>
            <span className="card-badge badge-danger">IMMEDIATE BLOCK</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-danger">Score &gt;= 80/100</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">HIGH RISK PROFILES</span>
            <span className="card-icon">⚠️</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-warning">{highCount}</div>
            <span className="card-badge badge-warning">MANUAL REVIEW</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-warning">Score 60 - 79/100</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">FRAUD SYNDICATE CLUSTERS</span>
            <span className="card-icon">🕸️</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono text-primary">{clustersData.length}</div>
            <span className="card-badge badge-info">DISCOVERED</span>
          </div>
          <div className="card-footer">
            <span className="card-trend text-subtle">Shared Device/IP/Bank</span>
          </div>
        </div>
      </div>

      {/* RISK DISTRIBUTION BAR */}
      <div className="card-styled mb-3 font-mono">
        <div className="flex justify-between items-center">
          <span className="font-bold text-subtle">RISK LEVEL DISTRIBUTION:</span>
          <div className="flex gap-2">
            <span className="badge-pill badge-danger font-bold">CRITICAL: {criticalCount}</span>
            <span className="badge-pill badge-danger font-bold">HIGH: {highCount}</span>
            <span className="badge-pill badge-warning font-bold">MEDIUM: {mediumCount}</span>
            <span className="badge-pill badge-success font-bold">LOW: {lowCount}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: APPLICANT TABLE (LEFT) & INVESTIGATION INSPECTOR (RIGHT) */}
      <div className="dashboard-main-grid">
        {/* LEFT COLUMN: APPLICANT RISK TABLE */}
        <div className="grid-column-left">
          <div className="applicant-table-panel card-styled">
            <div className="table-header-bar flex justify-between items-center mb-3">
              <div>
                <h3 className="panel-title font-mono uppercase">APPLICANT FRAUD RISK LEDGER</h3>
                <p className="panel-subtitle">Real-time risk scores computed by rule & scoring engine</p>
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
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
                    placeholder="Filter ID, Name, Signal..."
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
                    <th>SCORE</th>
                    <th>LEVEL</th>
                    <th>MAJOR SIGNALS</th>
                    <th>RECOMMENDATION</th>
                    <th>ACTION</th>
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
                          <span className={`score-pill ${getRiskLevelBadgeClass(app.risk_level)}`}>
                            {app.risk_score} / 100
                          </span>
                        </td>

                        <td>
                          <span className={`badge-pill ${getRiskLevelBadgeClass(app.risk_level)} font-bold`}>
                            {app.risk_level}
                          </span>
                        </td>

                        <td>
                          <div className="flex flex-wrap gap-1">
                            {app.signals.slice(0, 2).map((sig, idx) => (
                              <span key={idx} className="signal-chip danger-chip text-xs">
                                {sig.signal_type}
                              </span>
                            ))}
                            {app.signals.length > 2 && (
                              <span className="text-subtle text-xs">+{app.signals.length - 2} more</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className={`badge-pill ${getRecommendationBadgeClass(app.recommendation)} font-bold`}>
                            {app.recommendation}
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

        {/* RIGHT COLUMN: APPLICANT INVESTIGATION INSPECTOR */}
        <div className="grid-column-right">
          {loadingDetail ? (
            <div className="card-styled text-center p-4">
              <div className="spinner mb-2"></div>
              <p className="font-mono text-muted">Fetching detailed fraud breakdown for {selectedAppId}...</p>
            </div>
          ) : selectedRiskDetail ? (
            <div className="card-styled applicant-investigation-panel">
              {/* INSPECTOR HEADER */}
              <div className="panel-header border-b pb-2">
                <div>
                  <span className="badge-pill badge-info font-mono">SELECTED APPLICANT</span>
                  <h3 className="panel-title font-mono text-lg font-bold mt-1">
                    {selectedRiskDetail.applicant_id} — {selectedRiskDetail.applicant_name || 'Applicant'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="score-value font-mono text-2xl font-bold text-danger">
                    {selectedRiskDetail.risk_score} / 100
                  </div>
                  <span className={`badge-pill ${getRiskLevelBadgeClass(selectedRiskDetail.risk_level)} font-mono font-bold mt-1`}>
                    {selectedRiskDetail.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* RECOMMENDATION BANNER */}
              <div className={`recommendation-banner mt-3 p-3 rounded font-mono ${getRecommendationBadgeClass(selectedRiskDetail.recommendation)}`}>
                <div className="font-bold text-md">
                  RECOMMENDATION: <strong>{selectedRiskDetail.recommendation}</strong>
                </div>
                <div className="text-xs mt-1">
                  Model Engine: <code>{selectedRiskDetail.model_name}</code> • Score: <strong>{selectedRiskDetail.risk_score} / 100</strong>
                </div>
              </div>

              {/* DETECTED FRAUD SIGNALS LIST */}
              <div className="signals-section mt-4">
                <h4 className="font-mono text-subtle font-bold uppercase mb-2">
                  🚨 DETECTED FRAUD SIGNALS ({selectedRiskDetail.signals.length})
                </h4>

                {selectedRiskDetail.signals.length === 0 ? (
                  <div className="p-3 bg-success-glow border border-success rounded font-mono text-success text-sm">
                    ✅ No suspicious fraud signals detected for {selectedRiskDetail.applicant_id}.
                  </div>
                ) : (
                  <div className="signals-stack flex flex-col gap-2">
                    {selectedRiskDetail.signals.map((sig, idx) => (
                      <div key={idx} className={`telemetry-block border-${sig.severity === 'HIGH' ? 'danger' : 'warning'}-left`}>
                        <div className="block-head flex justify-between font-mono">
                          <span className="font-bold text-main">{sig.signal_type}</span>
                          <span className="badge-pill badge-danger font-bold">+{sig.weight} PTS</span>
                        </div>
                        <p className="block-desc font-mono mt-1">{sig.description}</p>

                        {sig.evidence && Object.keys(sig.evidence).length > 0 && (
                          <div className="evidence-box font-mono text-xs mt-2 p-2 bg-slate-100 rounded border">
                            <span className="text-subtle font-bold">EVIDENCE DATA:</span>
                            <pre className="text-muted mt-1" style={{ whiteSpace: 'pre-wrap', fontSize: '0.68rem' }}>
                              {JSON.stringify(sig.evidence, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CONNECTED FRAUD SYNDICATE MEMBERS */}
              {selectedRiskDetail.related_applicants && selectedRiskDetail.related_applicants.length > 0 && (
                <div className="related-applicants-section mt-4 border-t pt-3">
                  <h4 className="font-mono text-subtle font-bold uppercase mb-2">
                    👥 LINKED SYNDICATE MEMBERS ({selectedRiskDetail.related_applicants.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRiskDetail.related_applicants.map((relId) => (
                      <button
                        key={relId}
                        className="btn-triage btn-danger-sm font-mono"
                        onClick={() => handleSelectApplicant(relId)}
                      >
                        👤 {relId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TRANSACTIONS & VELOCITY HISTORY */}
              <div className="transactions-section mt-4 border-t pt-3">
                <h4 className="font-mono text-subtle font-bold uppercase mb-2">
                  💳 APPLICANT TRANSACTIONS ({selectedTransactions.length})
                </h4>

                {selectedTransactions.length === 0 ? (
                  <p className="font-mono text-subtle text-xs">No transaction history recorded for {selectedAppId}.</p>
                ) : (
                  <div className="table-responsive-wrapper">
                    <table className="applicant-table dense-stitch-table">
                      <thead>
                        <tr className="font-mono text-xs">
                          <th>TYPE</th>
                          <th>AMOUNT</th>
                          <th>MERCHANT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransactions.map((tx) => (
                          <tr key={tx.transaction_id} className="font-mono text-xs">
                            <td>
                              <span className="code-tag">{tx.transaction_type}</span>
                            </td>
                            <td className="font-bold text-main">₹{tx.amount.toLocaleString()}</td>
                            <td className="text-muted">{tx.merchant}</td>
                            <td>
                              <span className={`badge-pill ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 5. FRAUD SYNDICATE CLUSTERS SECTION */}
      <div className="clusters-section card-styled mt-4">
        <div className="panel-header border-b pb-2">
          <div>
            <h3 className="panel-title font-mono uppercase">🕸️ DISCOVERED FRAUD SYNDICATE CLUSTERS ({clustersData.length})</h3>
            <p className="panel-subtitle">Algorithmic graph discovery of shared infrastructure and rapid application clusters</p>
          </div>
          <span className="badge-pill badge-danger font-mono font-bold">GRAPH DISCOVERY</span>
        </div>

        <div className="clusters-grid mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {clustersData.map((cls) => (
            <div key={cls.cluster_id} className="telemetry-block border-danger-left">
              <div className="block-head flex justify-between font-mono">
                <strong className="text-main font-bold">{cls.cluster_name}</strong>
                <span className="badge-pill badge-danger font-bold">{cls.member_applicant_ids.length} MEMBERS</span>
              </div>

              <p className="block-desc font-mono mt-1 text-xs">{cls.description}</p>

              <div className="shared-attrs font-mono text-xs mt-2 p-2 bg-slate-100 rounded border">
                <div><strong className="text-subtle">Shared Devices:</strong> {cls.shared_attributes.device_ids?.join(', ') || 'None'}</div>
                <div><strong className="text-subtle">Shared IPs:</strong> {cls.shared_attributes.ip_addresses?.join(', ') || 'None'}</div>
                <div><strong className="text-subtle">Shared Banks:</strong> {cls.shared_attributes.bank_account_ids?.join(', ') || 'None'}</div>
              </div>

              <div className="member-chips flex flex-wrap gap-1 mt-2">
                {cls.member_applicant_ids.map((mId) => (
                  <button
                    key={mId}
                    className={`btn-triage ${mId === selectedAppId ? 'btn-danger-sm' : 'btn-primary-sm'} font-mono`}
                    onClick={() => handleSelectApplicant(mId)}
                  >
                    👤 {mId}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
