import React from 'react';
import Header from '../components/Header';
import OverviewCards from '../components/OverviewCards';
import MainRiskPanel from '../components/MainRiskPanel';
import RiskSignals from '../components/RiskSignals';
import DigitalTrustPanel from '../components/DigitalTrustPanel';
import ApplicantRiskTable from '../components/ApplicantRiskTable';
import RecentAlerts from '../components/RecentAlerts';

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      {/* 1. TOP HEADER */}
      <Header />

      {/* 2. OVERVIEW CARDS */}
      <OverviewCards />

      {/* MAIN LAYOUT GRID */}
      <div className="dashboard-main-grid">
        {/* LEFT COLUMN: Main Risk Panel, Risk Signals, Applicant Risk Table */}
        <div className="grid-column-left">
          {/* 3. MAIN RISK PANEL */}
          <MainRiskPanel />

          {/* 4. RISK SIGNALS */}
          <RiskSignals />

          {/* 6. APPLICANT RISK TABLE */}
          <ApplicantRiskTable />
        </div>

        {/* RIGHT COLUMN: Digital Trust Panel & Recent Alerts */}
        <div className="grid-column-right">
          {/* 5. DIGITAL TRUST PANEL */}
          <DigitalTrustPanel />

          {/* 7. RECENT ALERTS */}
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
}
