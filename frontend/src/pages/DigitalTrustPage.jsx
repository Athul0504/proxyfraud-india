import React from 'react';
import DigitalTrustPanel from '../components/DigitalTrustPanel';

export default function DigitalTrustPage() {
  return (
    <div className="page-container">
      <h2>🌐 Digital Trust Intelligence Module</h2>
      <p className="subtitle">Detect phishing URLs, typosquatting domains, and fraudulent web infrastructure.</p>
      
      <DigitalTrustPanel />
    </div>
  );
}
