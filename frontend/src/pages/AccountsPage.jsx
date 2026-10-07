import React from 'react';
import ApplicantRiskTable from '../components/ApplicantRiskTable';

export default function AccountsPage({ onSelectAccount }) {
  return (
    <div className="p-6 space-y-6">
      <ApplicantRiskTable onSelectAccount={onSelectAccount} />
    </div>
  );
}
