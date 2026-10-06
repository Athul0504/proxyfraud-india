import React from 'react';
import FinancialFraudPanel from '../components/FinancialFraudPanel';

export default function FinancialFraudPage() {
  return (
    <div className="page-container">
      <div className="mb-3">
        <h2 className="font-mono text-xl font-bold uppercase text-main">💳 FINANCIAL FRAUD RISK MODULE</h2>
        <p className="font-mono text-subtle text-xs">
          Synthetic loan application risk engine, multi-applicant clustering, and transaction velocity monitoring.
        </p>
      </div>
      
      <FinancialFraudPanel />
    </div>
  );
}

