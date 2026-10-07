import React, { useState, useEffect } from 'react';
import { getFraudAlerts, placeLoanOnHold } from '../services/api';
import { ShieldAlert, Lock, AlertTriangle, CheckCircle, ChevronRight, Activity } from 'lucide-react';

export default function AlertsPage({ onSelectAccount }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getFraudAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
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

  const handleHold = async (accId) => {
    try {
      await placeLoanOnHold(accId);
      setNotification({ type: 'success', message: `Loan disbursal for account ${accId} placed ON HOLD!` });
      loadAlerts();
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Action failed.' });
    } setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-mono border flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600' : 'bg-rose-950/90 text-rose-200 border-rose-600'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">REALTIME FRAUD ALERTS CENTER</h2>
            <p className="text-xs text-slate-400">High-confidence behavioral anomaly alerts detected by ProxyShield Adaptive Engine</p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-rose-950/90 text-rose-300 border border-rose-800 font-mono text-xs font-bold animate-pulse flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <span>{alerts.length} ACTIVE ALERTS</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500 font-mono text-xs">
            Loading behavioral fraud alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 font-mono text-xs">
            No active high-risk alerts detected. All accounts operating within normal baseline parameters.
          </div>
        ) : (
          alerts.map((item) => (
            <div key={item.account_id} className="soc-card p-5 shadow-xl space-y-4 flex flex-col justify-between border border-slate-800 hover:border-slate-700 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-mono font-bold text-sky-400">{item.account_id}</h3>
                    <span className="text-xs font-sans text-slate-200 font-semibold">{item.customer_name}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                    item.risk_level === 'CRITICAL' ? 'bg-rose-950/90 text-rose-300 border border-rose-800' :
                    item.risk_level === 'HIGH' ? 'bg-amber-950/90 text-amber-300 border border-amber-800' :
                    'bg-yellow-950/90 text-yellow-300 border border-yellow-800'
                  }`}>
                    {item.risk_level} ({item.risk_score})
                  </span>
                </div>

                <div className="text-xs font-mono text-amber-400 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80 mb-3">
                  {item.pattern} (Conf: {item.confidence}%)
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">DETECTION REASONS:</span>
                  {Array.isArray(item.reasons) && item.reasons.map((reason, idx) => (
                    <div key={idx} className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                  item.loan_status === 'ON_HOLD' ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {item.loan_status === 'ON_HOLD' && <Lock className="w-3.5 h-3.5 text-rose-400" />}
                  <span>Loan: {item.loan_status}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHold(item.account_id)}
                    disabled={item.loan_status === 'ON_HOLD'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      item.loan_status === 'ON_HOLD'
                        ? 'bg-rose-950/90 text-rose-400 border border-rose-800/80 cursor-not-allowed'
                        : 'bg-rose-700 hover:bg-rose-600 text-white shadow'
                    }`}
                  >
                    {item.loan_status === 'ON_HOLD' ? 'ON HOLD' : 'PLACE ON HOLD'}
                  </button>

                  <button
                    onClick={() => onSelectAccount(item.account_id)}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-mono font-bold shadow flex items-center gap-1 cursor-pointer"
                  >
                    <span>CASE DETAILS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
