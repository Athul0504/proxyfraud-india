import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderNav from './components/HeaderNav';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AlertsPage from './pages/AlertsPage';
import LoanMonitoringPage from './pages/LoanMonitoringPage';
import SimulationPage from './pages/SimulationPage';
import InvestigationPage from './pages/InvestigationPage';
import SettingsPage from './pages/SettingsPage';
import { advanceSimulation, getDashboardSummary } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState('C126');
  const [simDay, setSimDay] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const fetchSimDay = async () => {
    try {
      const data = await getDashboardSummary();
      if (data && data.current_simulation_day !== undefined) {
        setSimDay(data.current_simulation_day);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  };

  useEffect(() => {
    fetchSimDay();
    const handleSelectAccount = (e) => {
      if (e.detail && e.detail.account_id) {
        setSelectedAccountId(e.detail.account_id);
        setActiveTab('investigation');
      }
    };
    const handleRefresh = () => fetchSimDay();

    window.addEventListener('proxyshield-select-account', handleSelectAccount);
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => {
      window.removeEventListener('proxyshield-select-account', handleSelectAccount);
      window.removeEventListener('proxyshield-refresh', handleRefresh);
    };
  }, []);

  const handleSelectAccount = (accId) => {
    setSelectedAccountId(accId);
    setActiveTab('investigation');
  };

  const handleAdvanceSimulation = async () => {
    if (advancing || simDay >= 120) return;
    setAdvancing(true);
    try {
      await advanceSimulation('C126');
      await fetchSimDay();
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      console.error('Error advancing simulation:', err);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP HEADER NAV */}
        <HeaderNav
          activeTab={activeTab}
          simDay={simDay}
          advancing={advancing}
          onAdvanceSimulation={handleAdvanceSimulation}
          onCreateAccountClick={() => setActiveTab('accounts')}
          onSearch={(query) => {
            if (query && activeTab !== 'accounts') {
              setActiveTab('accounts');
            }
          }}
        />

        {/* VIEW CONTAINER */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && <DashboardPage onSelectAccount={handleSelectAccount} />}
          {activeTab === 'accounts' && <AccountsPage onSelectAccount={handleSelectAccount} />}
          {activeTab === 'alerts' && <AlertsPage onSelectAccount={handleSelectAccount} />}
          {activeTab === 'loans' && <LoanMonitoringPage onSelectAccount={handleSelectAccount} />}
          {activeTab === 'simulation' && <SimulationPage />}
          {activeTab === 'investigation' && <InvestigationPage selectedAccountId={selectedAccountId} />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
