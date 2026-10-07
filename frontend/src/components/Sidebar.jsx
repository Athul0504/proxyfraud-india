import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CreditCard,
  Sliders,
  FileSearch,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'alerts', label: 'Fraud Alerts', icon: ShieldAlert },
    { id: 'loans', label: 'Loan Monitoring', icon: CreditCard },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'investigation', label: 'Investigation', icon: FileSearch },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 text-slate-200 font-sans z-30 select-none shadow-2xl">
      <div>
        {/* BRANDING HEADER */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-950/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-mono font-black text-base text-slate-100 tracking-wider">ProxyShield</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 block tracking-widest font-bold uppercase">BANK ADMIN SOC</span>
          </div>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-950/90 to-slate-900 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.12)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* CORE ENGINE STATUS FOOTER */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            CORE ENGINE ONLINE
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">FastAPI Backend REST API v0.1.0</div>
      </div>
    </aside>
  );
}
