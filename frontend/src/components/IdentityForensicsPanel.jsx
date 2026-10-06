import React, { useState, useEffect } from 'react';
import {
  getIdentityDocuments,
  getIdentityAnalysis,
  getIdentityAnalysisAll,
  getIdentityClusters
} from '../services/api';

export default function IdentityForensicsPanel() {
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('APP-1008');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIdentityData();
  }, []);

  const loadIdentityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysesData, clustersData] = await Promise.all([
        getIdentityAnalysisAll(),
        getIdentityClusters()
      ]);
      setAllAnalyses(analysesData);
      setClusters(clustersData);

      const found = analysesData.find(a => a.applicant_id === 'APP-1008') || analysesData[0];
      if (found) {
        setSelectedAppId(found.applicant_id);
        setSelectedAnalysis(found);
      }
    } catch (err) {
      setError(err.message || 'Failed to load synthetic identity forensics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicantChange = (appId) => {
    setSelectedAppId(appId);
    const found = allAnalyses.find(a => a.applicant_id === appId);
    setSelectedAnalysis(found || null);
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="spinner"></div>
        <p>Evaluating synthetic document & identity consistency forensic patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-error">
        <h3>⚠️ Identity Forensics Error</h3>
        <p>{error}</p>
        <button onClick={loadIdentityData} className="btn-retry">Retry Identity Analysis</button>
      </div>
    );
  }

  // Summary Metrics
  const totalDocs = allAnalyses.reduce((sum, a) => sum + (a.documents ? a.documents.length : 0), 0);
  const reusedDocsCount = allAnalyses.filter(a => a.detected_signals.some(s => s.signal_type === 'DOCUMENT_REUSE')).length;
  const nameMismatchCount = allAnalyses.filter(a => a.detected_signals.some(s => s.signal_type === 'NAME_MISMATCH')).length;

  return (
    <div className="identity-forensics-panel">
      {/* 1. METRICS HEADER */}
      <div className="network-summary-header">
        <div className="metric-card highlight-card">
          <div className="metric-icon">📑</div>
          <div className="metric-body">
            <span className="metric-title">Synthetic Documents</span>
            <span className="metric-value">{totalDocs} Records</span>
          </div>
        </div>

        <div className="metric-card danger-card">
          <div className="metric-icon">🔄</div>
          <div className="metric-body">
            <span className="metric-title">Document Reuse</span>
            <span className="metric-value">{reusedDocsCount} Applicants</span>
          </div>
        </div>

        <div className="metric-card warning-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-body">
            <span className="metric-title">Name Mismatches</span>
            <span className="metric-value">{nameMismatchCount} Applicants</span>
          </div>
        </div>

        <div className="metric-card critical-card">
          <div className="metric-icon">🔗</div>
          <div className="metric-body">
            <span className="metric-title">Identity Clusters</span>
            <span className="metric-value">{clusters.length} Discovered</span>
          </div>
        </div>
      </div>

      {/* APPLICANT SELECTOR BAR */}
      <div className="identity-selector-bar">
        <label htmlFor="app-select">Select Applicant for Forensics Inspection:</label>
        <select
          id="app-select"
          value={selectedAppId}
          onChange={(e) => handleApplicantChange(e.target.value)}
          className="applicant-select-dropdown"
        >
          {allAnalyses.map(a => (
            <option key={a.applicant_id} value={a.applicant_id}>
              {a.applicant_id} - {a.applicant_name} ({a.signal_count} Identity Signals)
            </option>
          ))}
        </select>
        <span className="demo-notice-tag">ℹ️ Synthetic Prototype Data Only — No Real Government APIs</span>
      </div>

      {/* MAIN CONTENT GRID */}
      {selectedAnalysis && (
        <div className="identity-main-grid">
          {/* LEFT: SUBMITTED DOCUMENTS & FORENSIC SIGNALS */}
          <div className="identity-column">
            {/* SUBMITTED DOCUMENTS CARD */}
            <div className="card-styled">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">📜 Submitted Identity Documents ({selectedAnalysis.documents.length})</h3>
                  <p className="panel-subtitle">Synthetic identity records submitted with loan application</p>
                </div>
                <span className="count-badge">{selectedAnalysis.applicant_id}</span>
              </div>

              <div className="documents-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doc Type</th>
                      <th>Synthetic Identifier</th>
                      <th>Name on Document</th>
                      <th>Date of Birth</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAnalysis.documents.map((doc) => {
                      const isFlagged = doc.document_status === 'FLAGGED';
                      return (
                        <tr key={doc.document_id} className={isFlagged ? 'row-flagged' : ''}>
                          <td>
                            <span className={`doc-type-tag ${doc.document_type.toLowerCase()}`}>
                              {doc.document_type}
                            </span>
                          </td>
                          <td className="font-mono font-bold">{doc.document_number}</td>
                          <td>{doc.name_on_document}</td>
                          <td className="font-mono">{doc.date_of_birth}</td>
                          <td>
                            <span className={`status-pill ${isFlagged ? 'flagged' : 'verified'}`}>
                              {isFlagged ? '⚠️ FLAGGED' : '✓ VERIFIED_SYNTHETIC'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DETECTED FORENSIC SIGNALS CARD */}
            <div className="card-styled">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">🚨 Forensic Signals ({selectedAnalysis.detected_signals.length})</h3>
                  <p className="panel-subtitle">Rule-based synthetic document reuse and identity mismatch alerts</p>
                </div>
                <span className={`count-badge ${selectedAnalysis.signal_count > 0 ? 'badge-danger' : 'badge-success'}`}>
                  {selectedAnalysis.signal_count > 0 ? `${selectedAnalysis.signal_count} ALERTS` : 'CLEAN IDENTITY'}
                </span>
              </div>

              {selectedAnalysis.detected_signals.length === 0 ? (
                <div className="clean-signal-banner">
                  <span>✅ No suspicious document reuse or identity mismatch signals detected for {selectedAnalysis.applicant_name}.</span>
                </div>
              ) : (
                <div className="signals-list">
                  {selectedAnalysis.detected_signals.map((sig, idx) => (
                    <div key={idx} className={`signal-card severity-${sig.severity.toLowerCase()}`}>
                      <div className="signal-icon-wrapper">
                        {sig.signal_type === 'DOCUMENT_REUSE' ? '📑' :
                          sig.signal_type === 'IDENTITY_REUSE' ? '👥' :
                          sig.signal_type === 'NAME_MISMATCH' ? '⚠️' : '🔍'}
                      </div>
                      <div className="signal-content">
                        <div className="signal-title-row">
                          <span className="signal-title">{sig.signal_type}</span>
                          <span className={`severity-tag severity-${sig.severity.toLowerCase()}`}>
                            {sig.severity} SEVERITY
                          </span>
                        </div>
                        <p className="signal-desc">{sig.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CONNECTED APPLICANTS & CLUSTERS */}
          <div className="identity-column">
            {/* RELATED APPLICANTS CARD */}
            <div className="card-styled">
              <h3 className="panel-title">👥 Connected Identity Applicants</h3>
              <p className="panel-subtitle">Applicants sharing documents or date of birth attributes</p>

              {selectedAnalysis.related_applicants.length === 0 ? (
                <p className="text-muted font-sm mt-3">No other applicants share identity documents with {selectedAnalysis.applicant_id}.</p>
              ) : (
                <div className="related-applicants-list mt-3">
                  {selectedAnalysis.related_applicants.map(relId => {
                    const relApp = allAnalyses.find(a => a.applicant_id === relId);
                    return (
                      <div
                        key={relId}
                        className="related-app-item danger"
                        onClick={() => handleApplicantChange(relId)}
                      >
                        <div className="rel-info">
                          <span className="rel-id">👤 {relId}</span>
                          <span className="rel-name">{relApp?.applicant_name || 'Applicant'}</span>
                        </div>
                        <button className="btn-select-app">Inspect →</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GLOBAL IDENTITY REUSE CLUSTERS */}
            <div className="card-styled">
              <h3 className="panel-title">🔗 Discovered Identity Clusters ({clusters.length})</h3>
              <p className="panel-subtitle">Connected groups identified from document reuse</p>

              <div className="identity-clusters-list mt-3">
                {clusters.map((cls) => (
                  <div key={cls.cluster_id} className="identity-cluster-card">
                    <div className="cls-header">
                      <span className="cls-name">{cls.cluster_name}</span>
                      <span className="cls-members">{cls.member_applicant_ids.length} Members</span>
                    </div>

                    <div className="cls-body">
                      <p><strong>Shared Docs:</strong> {cls.shared_documents.join(', ')}</p>
                      <p><strong>Shared DOB:</strong> {cls.shared_dobs.join(', ')}</p>
                    </div>

                    <div className="cls-member-chips">
                      {cls.member_applicant_ids.map(mId => (
                        <button
                          key={mId}
                          className={`chip-btn ${mId === selectedAppId ? 'active' : 'danger'}`}
                          onClick={() => handleApplicantChange(mId)}
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
        </div>
      )}
    </div>
  );
}
