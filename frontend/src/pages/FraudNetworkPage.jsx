import React from 'react';
import FraudNetworkPanel from '../components/FraudNetworkPanel';

export default function FraudNetworkPage() {
  return (
    <div className="page-container">
      <h2>🕸️ Fraud Network & Syndicate Analysis</h2>
      <p className="subtitle">
        Visual relationship mapping between applicants, shared devices, shared IP addresses, and synthetic bank accounts.
      </p>

      <FraudNetworkPanel />
    </div>
  );
}
