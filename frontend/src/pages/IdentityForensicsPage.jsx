import React from 'react';
import IdentityForensicsPanel from '../components/IdentityForensicsPanel';

export default function IdentityForensicsPage() {
  return (
    <div className="page-container">
      <h2>📜 Synthetic Document & Identity Forensics</h2>
      <p className="subtitle">
        Detecting synthetic document reuse, date-of-birth duplication, and applicant identity mismatches across loan applications.
      </p>

      <IdentityForensicsPanel />
    </div>
  );
}
