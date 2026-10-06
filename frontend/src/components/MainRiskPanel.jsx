import React from 'react';

export default function MainRiskPanel() {
  // SVG circular meter calculation
  // Radius = 60, Circumference = 2 * PI * 60 = ~377
  const strokeDashoffset = 377 - (377 * 78) / 100;

  return (
    <div className="main-risk-panel card-styled">
      {/* CASE HEADER BAR */}
      <div className="case-investigation-header">
        <div className="case-header-left">
          <span className="case-tag-pill badge-danger font-mono">FLAGGED FRAUD // TIER-1</span>
          <div className="case-title-row">
            <h2 className="case-id font-mono">APP-88204</h2>
            <span className="case-divider">/</span>
            <h2 className="case-name">Rajesh V. Sharma</h2>
            <span className="case-pan-badge font-mono">PAN: BLVPK8290K</span>
          </div>
          <p className="case-loan-desc">
            Loan Disbursal Intercept: <strong>₹3,50,000</strong> Instant Personal Credit Line via <em>FinPulse NBFC</em>
          </p>
        </div>

        <div className="case-action-buttons">
          <button className="btn-case-action btn-danger-solid">
            🚫 FREEZE & REJECT
          </button>
          <button className="btn-case-action btn-primary-outline">
            🔄 FORCE 100% vKYC
          </button>
        </div>
      </div>

      {/* THREE DEMOGRAPHICS & INTEGRITY CARDS */}
      <div className="case-metrics-row mt-3">
        <div className="metric-sub-card">
          <span className="sub-card-label font-mono">AGE & DEMOGRAPHICS</span>
          <div className="sub-card-value font-bold">29 Yrs / Male</div>
          <div className="sub-card-footer text-muted font-mono">CIBIL: <span className="text-danger">762 (Manipulated)</span></div>
        </div>

        <div className="metric-sub-card">
          <span className="sub-card-label font-mono">REPORTED SALARY</span>
          <div className="sub-card-value font-bold">₹85,000 / mo</div>
          <div className="sub-card-footer text-muted font-mono">ITR Verified: <span className="text-danger">₹28,000 / mo</span></div>
        </div>

        <div className="metric-sub-card">
          <span className="sub-card-label font-mono">EMPLOYER INTEGRITY MATCH</span>
          <span className="badge-pill badge-danger float-right">SHELL ENTITY</span>
          <div className="sub-card-value font-bold">Apex Global Logistics Pvt Ltd</div>
          <div className="sub-card-footer text-danger font-mono">CIN unregistered • GST zero-filer for 4 quarters • Linked to 16 active loans</div>
        </div>
      </div>

      {/* GAUGE & OVERALL SCORE ROW */}
      <div className="risk-score-container mt-3">
        <div className="radial-gauge-wrapper">
          <svg className="radial-gauge" width="140" height="140" viewBox="0 0 140 140">
            <circle
              className="gauge-bg"
              cx="70"
              cy="70"
              r="60"
              strokeWidth="12"
            />
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
            <span className="score-value">78</span>
            <span className="score-max">/ 100</span>
          </div>
        </div>

        <div className="risk-info-details">
          <div className="risk-level-badge-row">
            <span className="level-label font-mono">RISK ASSESSMENT SCORE:</span>
            <span className="risk-badge badge-high-glow">HIGH RISK (78/100)</span>
          </div>

          <p className="risk-explanation text-danger font-semibold">
            <span className="alert-bullet">⚠️</span>
            "Multiple linked risk signals detected across syndicate graph."
          </p>

          <div className="risk-factors-summary">
            <div className="factor-item">
              <span className="factor-dot danger"></span>
              <span>Shared Device Fingerprint across 4 accounts</span>
            </div>
            <div className="factor-item">
              <span className="factor-dot warning"></span>
              <span>High IP velocity from subnet (49.37.12.x)</span>
            </div>
            <div className="factor-item">
              <span className="factor-dot warning"></span>
              <span>Unusual application time pattern (3:42 AM)</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETERMINISTIC FRAUD SIGNALS 3-COLUMN LEDGER */}
      <div className="signals-ledger-section mt-4">
        <div className="ledger-header-row">
          <span className="ledger-title font-mono">● DETERMINISTIC FRAUD SIGNALS & VELOCITY LEDGER</span>
          <span className="heuristic-tag font-mono">HEURISTIC CONFIDENCE: <strong className="text-danger">98.4%</strong></span>
        </div>

        <div className="signals-grid-3col">
          <div className="ledger-card">
            <div className="card-head">
              <span className="head-title font-mono text-danger">LOAN STACKING</span>
              <span className="head-icon">↗</span>
            </div>
            <div className="card-topic font-bold">Rapid Outflow Velocity</div>
            <p className="card-desc font-mono">4 distinct loan submissions processed across 3 NBFC partner rails within 38 minutes.</p>
            <div className="card-foot font-mono">AGGREGATE DEMAND <strong className="text-danger">₹12,80,000</strong></div>
          </div>

          <div className="ledger-card">
            <div className="card-head">
              <span className="head-title font-mono text-danger">UPI MULE TRAIL</span>
              <span className="head-icon">↗</span>
            </div>
            <div className="card-topic font-bold">Micro-Credit Smurfing</div>
            <p className="card-desc font-mono">14 micro-transfers (₹900 - ₹1,400) received from disparate VPAs, followed by immediate lump-sum drainage to crypto ramp.</p>
            <div className="card-foot font-mono">DESTINATION <code className="code-tag">gate.io/hk-dep</code></div>
          </div>

          <div className="ledger-card">
            <div className="card-head">
              <span className="head-title font-mono text-danger">GEO DIVERGENCE</span>
              <span className="head-icon">↗</span>
            </div>
            <div className="card-topic font-bold">IP vs Hardware Discrepancy</div>
            <p className="card-desc font-mono">GPS hardware reports lat/long Mumbai (Dadar T.T. Circle) while network transit IP terminates via St. Petersburg egress route.</p>
            <div className="card-foot font-mono">GEO DISPARITY <strong className="text-danger">4,912 km</strong></div>
          </div>
        </div>
      </div>

      {/* 30-DAY CASH-FLOW DEFLECTION CHART */}
      <div className="deflection-chart-section mt-4">
        <div className="chart-header-row font-mono">
          <span>30-DAY CASH-FLOW DEFLECTION MODEL</span>
          <span className="flow-formula text-primary">FLOW: INGRESS (₹1.4L) → IMMEDIATE CRYPTO DUMP (₹1.8L)</span>
        </div>
        <div className="deflection-sparkline-box">
          <div className="sparkline-alert font-mono">▲ SHARP TRANSIT COOLDOWN: 118m RESIDENCE TIME</div>
          <svg className="sparkline-svg" viewBox="0 0 500 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M0,70 Q100,68 180,60 T300,55 Q360,10 400,15 T500,75 L500,80 L0,80 Z" fill="url(#sparkline-grad)" />
            <path d="M0,70 Q100,68 180,60 T300,55 Q360,10 400,15 T500,75" fill="none" stroke="#dc2626" strokeWidth="2.5" />
            <circle cx="400" cy="15" r="4" fill="#dc2626" />
          </svg>
        </div>
      </div>
    </div>
  );
}

