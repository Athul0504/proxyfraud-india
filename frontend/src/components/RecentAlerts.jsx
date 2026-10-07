import React, { useState, useEffect } from 'react';
import { getFraudAlerts } from '../services/api';
import { ShieldAlert, AlertTriangle, ChevronRight, Lock, Activity } from 'lucide-react';

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getFraudAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const handleRefresh = () => loadAlerts();
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, []);

  const handleSelectAccount = (accId) => {
    window.dispatchEvent(new CustomEvent('proxyshield-select-account', { detail: { account_id: accId } }));
  };

  return (
    <div className="soc-card p-4 shadow-xl border border-slate-800 flex flex-col h-full">
      <div className="border-b border-slate-800/80 pb-3 flex justify-between items-center mb-3">
        <div>
          <h3 className="font-mono uppercase font-bold text-xs text-slate-100 tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>BEHAVIORAL FRAUD ALERTS LOG</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Live engine feed</span>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse flex items-center gap-1">
          <Activity className="w-3 h-3 text-rose-400" />
          <span>ALERTS ({alerts.length})</span>
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[480px]">
        {loading ? (
          <div className="text-center text-slate-500 font-mono text-xs py-8">
            Fetching realtime behavioral fraud alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-slate-500 font-mono text-xs py-8">
            No active high-risk alerts detected.
          </div>
        ) : (
          alerts.map((item) => {
            const isCritical = item.risk_level === 'CRITICAL';
            const isHigh = item.risk_level === 'HIGH';

            return (
              <div
                key={item.account_id}
                onClick={() => handleSelectAccount(item.account_id)}
                className={`p-3 rounded-lg bg-slate-950/90 border transition-all cursor-pointer group hover:border-sky-500/50 ${
                  isCritical ? 'border-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.1)]' : 'border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-400 text-xs group-hover:underline">
                      {item.account_id}
                    </span>
                    <span className="text-xs font-sans text-slate-200 font-medium">
                      {item.customer_name}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isCritical ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80' :
                    isHigh ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80' :
                    'bg-yellow-950/90 text-yellow-300 border border-yellow-800/80'
                  }`}>
                    {item.risk_level} ({item.risk_score})
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-amber-400 mb-1.5 truncate">
                  {item.pattern}
                </div>

                {Array.isArray(item.reasons) && item.reasons.length > 0 && (
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="truncate">{item.reasons[0]}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-900 text-[10px] font-mono">
                  <span className="text-sky-400">Confidence: {item.confidence}%</span>
                  <span className={`flex items-center gap-1 font-bold ${
                    item.loan_status === 'ON_HOLD' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {item.loan_status === 'ON_HOLD' && <Lock className="w-3 h-3" />}
                    <span>Loan: {item.loan_status}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
