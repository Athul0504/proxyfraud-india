import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../services/api';
import { Users, ShieldCheck, AlertTriangle, ShieldAlert, Lock, Clock, AlertCircle } from 'lucide-react';

export default function OverviewCards() {
  const [metrics, setMetrics] = useState({
    total_accounts: 126,
    safe_accounts: 110,
    suspicious_accounts: 7,
    critical_accounts: 9,
    loans_on_hold: 0,
    current_simulation_day: 120
  });
  const [loading, setLoading] = useState(true);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardSummary();
      setMetrics(data);
      setBackendUnavailable(false);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setBackendUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, []);

  const cardsData = [
    {
      title: 'TOTAL ACCOUNTS',
      value: metrics.total_accounts,
      subtext: 'Monitored Portfolio',
      status: 'PORTFOLIO ACTIVE',
      badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
      icon: Users,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/30'
    },
    {
      title: 'SAFE ACCOUNTS',
      value: metrics.safe_accounts,
      subtext: 'Low Risk Score (<40)',
      status: 'VERIFIED LOW RISK',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'SUSPICIOUS ACCOUNTS',
      value: metrics.suspicious_accounts,
      subtext: 'Medium Risk (40-84)',
      status: 'MONITORING',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'CRITICAL ALERTS',
      value: metrics.critical_accounts,
      subtext: 'Pattern Match High',
      status: 'ACTION REQUIRED',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/30'
    },
    {
      title: 'LOANS ON HOLD',
      value: metrics.loans_on_hold,
      subtext: 'Intercepted Disbursals',
      status: metrics.loans_on_hold > 0 ? 'FROZEN' : 'ACTIVE',
      badgeClass: metrics.loans_on_hold > 0 ? 'bg-rose-950/80 text-rose-300 border-rose-800/80' : 'bg-slate-900 text-slate-400 border-slate-700',
      icon: Lock,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/30'
    },
    {
      title: 'SIMULATION DAY',
      value: `DAY ${metrics.current_simulation_day}`,
      subtext: 'Deterministic Timeline',
      status: 'RUNNING',
      badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
      icon: Clock,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30'
    }
  ];

  return (
    <div className="overview-cards-section">
      {backendUnavailable && (
        <div className="bg-rose-950/80 border border-rose-600/80 text-rose-200 px-4 py-2.5 rounded-lg font-mono text-xs mb-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>ProxyShield backend is unavailable. Operating in fallback view mode.</span>
          </div>
          <button onClick={loadData} className="underline hover:text-white font-bold ml-2 cursor-pointer">RETRY CONNECTION</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="soc-card-hover p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">{card.title}</span>
                <div className={`p-1 rounded-md border ${card.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                </div>
              </div>

              <div className="text-2xl font-black font-mono text-slate-100 my-1 tracking-tight">
                {loading ? (
                  <span className="text-slate-600 animate-pulse">...</span>
                ) : (
                  card.value
                )}
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-sans truncate">{card.subtext}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${card.badgeClass}`}>
                  {card.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
