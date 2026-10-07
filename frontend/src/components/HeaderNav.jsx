import React, { useState } from 'react';
import { Search, FastForward, UserPlus, ShieldAlert, Clock } from 'lucide-react';

export default function HeaderNav({ activeTab, simDay = 0, advancing = false, onAdvanceSimulation, onCreateAccountClick, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Bank Admin SOC Overview',
          sub: 'Real-time synthetic identity & behavioral risk monitoring center'
        };
      case 'accounts':
        return {
          title: 'Accounts Directory & Risk Matrix',
          sub: 'Inspect portfolio accounts, risk scores, and credit behaviors'
        };
      case 'alerts':
        return {
          title: 'Realtime Fraud Alerts Center',
          sub: 'High-confidence behavioral anomaly alerts requiring immediate intervention'
        };
      case 'loans':
        return {
          title: 'Loan Disbursal Intercept Center',
          sub: 'Review pending credit line requests and freeze high-risk disbursals'
        };
      case 'simulation':
        return {
          title: 'Controlled Timeline Simulator',
          sub: 'Advance account timeline in 30-day intervals to simulate synthetic behavior'
        };
      case 'investigation':
        return {
          title: 'Deep Behavioral Case Investigation',
          sub: 'Full case metrics, adaptive confidence score, and behavioral timeline'
        };
      case 'settings':
        return {
          title: 'ProxyShield Engine Configuration',
          sub: 'System risk thresholds, pattern classification rules, and policy controls'
        };
      default:
        return {
          title: 'ProxyShield Bank Admin SOC',
          sub: 'Enterprise Fraud Prevention System'
        };
    }
  };

  const info = getPageTitle();

  return (
    <header className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-100 backdrop-blur-md sticky top-0 z-20 shadow-md">
      <div>
        <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2 tracking-wide">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <span>{info.title}</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">{info.sub}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* SIMULATION PROGRESS INDICATOR */}
        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Timeline:</span>
          <span className="font-bold text-sky-400">Day {simDay} / 120</span>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative flex-1 md:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Account ID, Name, Pattern..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full md:w-48 bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
          />
        </div>

        {/* SIMULATION CONTROLLER BUTTON */}
        <button
          onClick={onAdvanceSimulation}
          disabled={advancing || simDay >= 120}
          className={`font-mono px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border ${
            advancing || simDay >= 120
              ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 active:scale-95'
          }`}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{advancing ? 'ADVANCING...' : simDay >= 120 ? 'DAY 120 REACHED' : 'ADVANCE 30 DAYS'}</span>
        </button>

        {/* CREATE ACCOUNT BUTTON */}
        <button
          onClick={onCreateAccountClick}
          className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-mono px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-sky-400/40 active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ CREATE ACCOUNT</span>
        </button>
      </div>
    </header>
  );
}
