import React from 'react';
import UnifiedRiskPanel from '../components/UnifiedRiskPanel';

export default function UnifiedRiskPage() {
  return (
    <div className="page-container">
      <div className="mb-3">
        <h2 className="font-mono text-xl font-bold uppercase text-main">🛡️ UNIFIED RISK ENGINE</h2>
        <p className="font-mono text-subtle text-xs">
          Explainable 3-module risk aggregation combining Financial Fraud (45%), Identity Forensics (25%), and Digital Trust (30%).
        </p>
      </div>

      <UnifiedRiskPanel />
    </div>
  );
}
