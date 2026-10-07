import React from 'react';
import OverviewCards from '../components/OverviewCards';
import MainRiskPanel from '../components/MainRiskPanel';
import RecentAlerts from '../components/RecentAlerts';
import ApplicantRiskTable from '../components/ApplicantRiskTable';

export default function DashboardPage({ onSelectAccount }) {
  return (
    <div className="p-6 space-y-6">
      {/* 1. OVERVIEW METRIC CARDS */}
      <OverviewCards />

      {/* 2. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT/CENTER: MAIN RISK CASE INVESTIGATION (C126 CASE VIEW) */}
        <div className="lg:col-span-2 space-y-6">
          <MainRiskPanel accountId="C126" />
        </div>

        {/* RIGHT: REALTIME BEHAVIORAL ALERTS LOG */}
        <div className="lg:col-span-1">
          <RecentAlerts />
        </div>
      </div>

      {/* 3. ACCOUNTS DIRECTORY MATRIX TABLE */}
      <div className="pt-2">
        <ApplicantRiskTable onSelectAccount={onSelectAccount} />
      </div>
    </div>
  );
}
