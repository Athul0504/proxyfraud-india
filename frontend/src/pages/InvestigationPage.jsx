import React from 'react';
import MainRiskPanel from '../components/MainRiskPanel';

export default function InvestigationPage({ selectedAccountId = 'C126' }) {
  return (
    <div className="p-6 space-y-6">
      <MainRiskPanel accountId={selectedAccountId} />
    </div>
  );
}
