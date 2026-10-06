import React, { useState } from 'react';

export default function ApplicantRiskTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const applicants = [
    {
      id: 'APP-88204',
      nbfc: 'FinPulse Capital',
      name: 'Rajesh V. Sharma',
      company: 'Apex Global Logistics (Shell)',
      statedSalary: '₹85,000 / mo',
      taxSalary: 'Tax: ₹28,000 (-75%)',
      velocity: '4 apps / 38 mins',
      outflow: 'Outflow: ₹12.8L',
      signals: ['SIM Swap <14h', 'Geo Mismatch'],
      device: 'Redmi Note 12',
      devMeta: 'Magisk + Tor Mode',
      score: 98,
      level: 'CRITICAL',
      levelBadge: 'badge-danger',
      status: 'Flagged'
    },
    {
      id: 'APP-9482',
      nbfc: 'PayFlex India',
      name: 'Rahul Sharma',
      company: 'Logistics Digital (Unverified)',
      statedSalary: '₹65,000 / mo',
      taxSalary: 'Tax: ₹18,000 (-72%)',
      velocity: '3 apps / 12 mins',
      outflow: 'Outflow: ₹8.4L',
      signals: ['Device Reuse', 'IP Velocity'],
      device: 'Redmi Note 12 (#DEV-8F4A)',
      devMeta: 'Subnet 49.37.12.84',
      score: 88,
      level: 'HIGH',
      levelBadge: 'badge-danger',
      status: 'Flagged'
    },
    {
      id: 'APP-9483',
      nbfc: 'KreditOne',
      name: 'Priya Patel',
      company: 'Infosys Ltd (Verified)',
      statedSalary: '₹1,20,000 / mo',
      taxSalary: 'Tax: ₹1,20,000 (0%)',
      velocity: '1 app / 24h',
      outflow: 'Normal',
      signals: ['Clean History'],
      device: 'iPhone 14 (#DEV-2B10)',
      devMeta: 'Clean Telemetry',
      score: 18,
      level: 'SAFE',
      levelBadge: 'badge-success',
      status: 'Approved'
    },
    {
      id: 'APP-9484',
      nbfc: 'FastLoan NBFC',
      name: 'Amit Verma',
      company: 'Verma Tech (Shell Candidate)',
      statedSalary: '₹95,000 / mo',
      taxSalary: 'Tax: ₹12,000 (-87%)',
      velocity: '5 apps / 45 mins',
      outflow: 'Outflow: ₹15.2L',
      signals: ['VPN Proxy', 'DOB Dup'],
      device: 'Redmi Note 12 (#DEV-8F4A)',
      devMeta: 'SwiftShader Driver',
      score: 94,
      level: 'CRITICAL',
      levelBadge: 'badge-danger',
      status: 'Under Review'
    },
    {
      id: 'APP-9485',
      nbfc: 'CapitalFirst',
      name: 'Vikram Singh',
      company: 'TCS Ltd (Verified)',
      statedSalary: '₹1,10,000 / mo',
      taxSalary: 'Tax: ₹1,10,000 (0%)',
      velocity: '1 app / 48h',
      outflow: 'Normal',
      signals: ['Verified KYC'],
      device: 'MacBook Pro (#DEV-C440)',
      devMeta: 'Clean Residential IP',
      score: 12,
      level: 'SAFE',
      levelBadge: 'badge-success',
      status: 'Verified'
    }
  ];

  const filteredApplicants = applicants.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.device.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="applicant-table-panel card-styled mt-4">
      {/* STITCH FILTER ENGINE BAR */}
      <div className="filter-engine-bar font-mono">
        <div className="filter-left flex items-center gap-2">
          <span className="filter-title font-bold text-subtle">FILTER ENGINE:</span>
          <select className="filter-select font-mono bold-select">
            <option>Critical (90 - 100)</option>
            <option>High Risk (70 - 89)</option>
            <option>Medium Risk (30 - 69)</option>
            <option>All Applicants</option>
          </select>
          <select className="filter-select font-mono">
            <option>All Threat Patterns</option>
            <option>Loan Stacking</option>
            <option>Mule Accounts</option>
            <option>Emulator Spoofing</option>
          </select>
          <select className="filter-select font-mono">
            <option>All NBFC Lending Partners</option>
            <option>FinPulse NBFC</option>
            <option>KreditOne</option>
          </select>
        </div>

        <div className="filter-right flex items-center gap-3">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search Ref, Name, IP, Device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-search-input font-mono"
            />
          </div>
          <span className="streaming-count font-mono text-subtle">STREAMING: 28 ENTITIES</span>
          <button className="btn-sync-ledger font-mono">🔄 SYNC LEDGER</button>
        </div>
      </div>

      {/* DENSE INVESTIGATION DATA TABLE */}
      <div className="table-responsive-wrapper mt-2">
        <table className="applicant-table dense-stitch-table">
          <thead>
            <tr className="font-mono">
              <th>CASE REF</th>
              <th>APPLICANT & ENTITY</th>
              <th>STATED VS TAX VERIFIED</th>
              <th>VELOCITY VECTORS</th>
              <th>FLAGGED SIGNALS</th>
              <th>DEVICE TELEMETRY</th>
              <th>RISK RATING</th>
              <th>TRIAGE DISPOSITION</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map((app) => (
              <tr key={app.id} className="table-row font-mono">
                <td className="cell-case-ref">
                  <strong className="code-tag font-bold text-primary">{app.id}</strong>
                  <div className="text-subtle font-normal text-xs mt-0.5">{app.nbfc}</div>
                </td>

                <td className="cell-applicant-entity">
                  <div className="applicant-name font-bold text-main">{app.name}</div>
                  <div className="entity-company text-danger font-normal text-xs">{app.company}</div>
                </td>

                <td className="cell-salary">
                  <div className="font-bold">{app.statedSalary}</div>
                  <div className="text-danger font-normal text-xs">{app.taxSalary}</div>
                </td>

                <td className="cell-velocity">
                  <div className="font-bold text-danger">{app.velocity}</div>
                  <div className="text-subtle font-normal text-xs">{app.outflow}</div>
                </td>

                <td className="cell-signals">
                  <div className="signals-pill-container flex flex-wrap gap-1">
                    {app.signals.map((sig, i) => (
                      <span key={i} className="signal-chip danger-chip font-mono text-xs">{sig}</span>
                    ))}
                  </div>
                </td>

                <td className="cell-device">
                  <div className="device-name font-bold">{app.device}</div>
                  <div className="device-meta text-danger text-xs">{app.devMeta}</div>
                </td>

                <td className="cell-rating">
                  <span className={`badge-pill ${app.levelBadge} font-mono font-bold`}>
                    {app.level} {app.score}
                  </span>
                </td>

                <td className="cell-triage">
                  <div className="triage-btn-group flex gap-1">
                    <button className="btn-triage btn-danger-sm font-mono">FLAG</button>
                    <button className="btn-triage btn-primary-sm font-mono">vKYC</button>
                    <button className="btn-triage btn-secondary-sm font-mono">REJECT</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

