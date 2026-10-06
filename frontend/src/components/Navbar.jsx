import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="navbar-top-row">
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z" fill="#0284c7" stroke="#0284c7" strokeWidth="1.5"/>
              <path d="M10 12L12 14L15 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">ProxyShield</span>
            <span className="brand-sub-tag">INDIA | SOC RISK</span>
          </div>
          <span className="soc-node-pill">SOC NODE: WEST-01 // LIVE</span>
        </div>

        <div className="navbar-center-search">
          <div className="nav-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search PAN, mobile, ID..." className="nav-search-input" />
            <span className="search-shortcut">⌘K</span>
          </div>
        </div>

        <div className="navbar-right-meta">
          <span className="threat-level-tag">@THREAT LEVEL: ELEVATED</span>
          <div className="user-profile-badge">
            <span className="user-avatar-dot"></span>
            <div className="user-info">
              <div className="user-name font-bold">Dr. A. Verma</div>
              <div className="user-role font-mono">Lead Risk Officer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-bottom-tabs">
        <nav className="navbar-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Risk Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'unified-risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('unified-risk')}
          >
            Unified Risk
          </button>
          <button 
            className={`nav-btn ${activeTab === 'digital-trust' ? 'active' : ''}`}
            onClick={() => setActiveTab('digital-trust')}
          >
            Digital Trust
          </button>
          <button 
            className={`nav-btn ${activeTab === 'financial-fraud' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial-fraud')}
          >
            Financial Fraud
          </button>
          <button 
            className={`nav-btn ${activeTab === 'fraud-network' ? 'active' : ''}`}
            onClick={() => setActiveTab('fraud-network')}
          >
            Fraud Network
          </button>
          <button 
            className={`nav-btn ${activeTab === 'identity-forensics' ? 'active' : ''}`}
            onClick={() => setActiveTab('identity-forensics')}
          >
            Identity Forensics
          </button>
        </nav>
      </div>
    </header>
  );
}


