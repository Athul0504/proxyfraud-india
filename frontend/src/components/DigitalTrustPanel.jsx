import React, { useState } from 'react';
import { analyzeUrl } from '../services/api';
import QRScannerPanel from './QRScannerPanel';

export default function DigitalTrustPanel() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const testUrls = [
    { label: 'Google', url: 'https://www.google.com' },
    { label: 'Microsoft', url: 'https://www.microsoft.com' },
    { label: 'HTTP Domain', url: 'http://example.com' },
    { label: 'Typosquatting Demo', url: 'https://g00gle-secure-login.com' },
    { label: 'SBI Spoof Demo', url: 'https://sbi-secure-login-example.com' }
  ];

  const handleAnalyze = async (urlToScan) => {
    const targetUrl = urlToScan || urlInput;
    if (!targetUrl || !targetUrl.trim()) {
      setError('Please enter a valid URL to analyze.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await analyzeUrl(targetUrl);
      setScanResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Unable to analyze URL. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAnalyze();
  };

  const handlePresetClick = (presetUrl) => {
    setUrlInput(presetUrl);
    handleAnalyze(presetUrl);
  };

  const getScoreBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'badge-critical';
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
    <div className="digital-trust-container">
      {/* 1. URL Analyzer Section */}
      <div className="digital-trust-panel card-styled">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Digital Trust URL Analyzer</h3>
            <p className="panel-subtitle">Transparent rule-based inspection for phishing, typosquatting, and domain risk</p>
          </div>
          <span className="demo-chip">Rule-Based Engine</span>
        </div>

        <div className="trust-scan-controls">
          {/* Quick Test Presets */}
          <div className="preset-test-urls">
            <span className="preset-label">Quick Test URLs:</span>
            <div className="preset-buttons">
              {testUrls.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePresetClick(preset.url)}
                  disabled={loading}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input Form */}
          <form className="url-scan-form" onSubmit={handleSubmit}>
            <label className="input-label" htmlFor="trust-url-input">Target URL Inspection</label>
            <div className="url-input-group">
              <div className="input-icon-prefix">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              </div>
              <input
                id="trust-url-input"
                type="text"
                className="trust-input"
                placeholder="e.g. https://g00gle-secure-login.com"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
              />
              <button type="submit" className="btn-analyze" disabled={loading || !urlInput.trim()}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> Analyzing...
                  </span>
                ) : (
                  'Analyze URL'
                )}
              </button>
            </div>
          </form>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">{error}</span>
            </div>
          )}

          {/* Scan Result Area */}
          {!scanResult && !error && (
            <div className="scan-result-area placeholder">
              <div className="result-status-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="result-content">
                <h4 className="result-headline">No scan performed</h4>
                <p className="result-subtext">Enter a URL above or click a Quick Test URL, then click Analyze URL to run the trust scanner.</p>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="scan-result-card">
              {/* Top Score Banner */}
              <div className="result-score-header">
                <div className="score-main-block">
                  <div className={`score-badge-circle ${getScoreBadgeClass(scanResult.risk_level)}`}>
                    <span className="score-num">{scanResult.risk_score}</span>
                    <span className="score-denom">/100</span>
                  </div>
                  <div>
                    <div className="risk-level-tag-row">
                      <span className="tag-title">Risk Assessment:</span>
                      <span className={`badge-pill ${getScoreBadgeClass(scanResult.risk_level)}`}>
                        {scanResult.risk_level} RISK
                      </span>
                    </div>
                    <div className="url-meta-details">
                      <div>Domain: <code>{scanResult.domain}</code></div>
                      <div className="normalized-hint">Normalized: <code>{scanResult.normalized_url}</code></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Summary */}
              <div className="explanation-box">
                <div className="explanation-title">📌 Risk Assessment Summary</div>
                <p className="explanation-text">{scanResult.explanation}</p>
              </div>

              {/* Risk Signals */}
              {scanResult.detected_risk_signals && scanResult.detected_risk_signals.length > 0 && (
                <div className="signals-group danger-group">
                  <h5 className="signals-group-title">
                    <span className="icon">🚨</span> Detected Risk Signals ({scanResult.detected_risk_signals.length})
                  </h5>
                  <ul className="signals-bullet-list">
                    {scanResult.detected_risk_signals.map((sig, i) => (
                      <li key={i} className="risk-signal-bullet">{sig}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive Signals */}
              {scanResult.positive_signals && scanResult.positive_signals.length > 0 && (
                <div className="signals-group positive-group">
                  <h5 className="signals-group-title">
                    <span className="icon">🛡️</span> Positive Trust Signals ({scanResult.positive_signals.length})
                  </h5>
                  <ul className="signals-bullet-list">
                    {scanResult.positive_signals.map((sig, i) => (
                      <li key={i} className="positive-signal-bullet">{sig}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. QR Code Security Scanner Section */}
      <QRScannerPanel />
    </div>
  );
}
