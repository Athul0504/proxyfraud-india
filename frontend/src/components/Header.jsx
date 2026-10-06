import React from 'react';

export default function Header() {
  return (
    <div className="dashboard-top-header">
      <div className="header-brand-info">
        <div className="brand-title-group">
          <div className="brand-logo-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z" fill="url(#shield-gradient)" stroke="#3b82f6" strokeWidth="1.5"/>
              <path d="M12 6L17 9.5V12.5C17 15.8 14.88 19.1 12 20.2C9.12 19.1 7 15.8 7 12.5V9.5L12 6Z" fill="#0b0f19" opacity="0.6"/>
              <path d="M10 12L12 14L15 10" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="shield-gradient" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1e3a8a" />
                  <stop offset="1" stopColor="#0f172a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">ProxyShield India</h1>
            <p className="brand-subtitle">Financial Fraud Risk Intelligence Platform</p>
          </div>
        </div>
      </div>

      <div className="header-meta-actions">
        <div className="status-indicator">
          <span className="status-ping">
            <span className="ping-dot"></span>
            <span className="ping-wave"></span>
          </span>
          <span className="status-label">System Online</span>
        </div>
        <span className="demo-tag">Frontend Demo Data</span>
      </div>
    </div>
  );
}
