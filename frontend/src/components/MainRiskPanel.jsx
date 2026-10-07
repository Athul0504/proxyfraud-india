import React, { useState, useEffect } from 'react';
import { getAccountDetail, placeLoanOnHold } from '../services/api';
import {
  ShieldAlert,
  Lock,
  CheckCircle,
  Activity,
  CheckCircle2,
  Hash,
  Database,
  User
} from 'lucide-react';

export default function MainRiskPanel({ accountId = 'C126' }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadAccount = async (id) => {
    try {
      setLoading(true);
      const data = await getAccountDetail(id);
      setAccount(data);
    } catch (err) {
      console.error(`Error loading account ${id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount(accountId);
    const handleRefresh = () => loadAccount(accountId);
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, [accountId]);

  const handlePlaceOnHold = async () => {
    if (!account) return;
    setHolding(true);
    try {
      await placeLoanOnHold(account.account_id);
      setNotification({ type: 'success', message: `Loan disbursal for ${account.account_id} placed ON HOLD!` });
      loadAccount(account.account_id);
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to place loan on hold.' });
    } finally {
      setHolding(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="soc-card p-8 text-center text-slate-400 font-mono text-xs shadow-xl flex items-center justify-center gap-2">
        <Activity className="w-4 h-4 text-sky-400 animate-spin" />
        <span>Loading deep case investigation data for account {accountId}...</span>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="soc-card p-6 text-center text-rose-400 font-mono text-xs">
        Account details unavailable. Please select an account from the directory.
      </div>
    );
  }

  const riskScore = account.risk_score ?? 0;
  const rLevel = account.risk_level || 'LOW';
  const isCritical = rLevel === 'CRITICAL';
  const isHigh = rLevel === 'HIGH';
  const isMedium = rLevel === 'MEDIUM';

  const strokeDashoffset = 339.29 - (339.29 * Math.min(Math.max(riskScore, 0), 100)) / 100;

  const formatCurrency = (val) => `₹${Number(val ?? 0).toLocaleString('en-IN')}`;
  const formatScoreChange = (val) => {
    const num = Number(val ?? 0);
    return num >= 0 ? `+${num}` : `${num}`;
  };

  const syntheticFraudLabel = account.synthetic_fraud_label !== undefined
    ? String(account.synthetic_fraud_label)
    : (account.synthetic_label !== undefined ? String(account.synthetic_label) : '0');

  return (
    <div className="soc-card p-5 shadow-2xl relative overflow-hidden space-y-6 border border-slate-800">
      {/* BACKGROUND ACCENT GLOW */}
      {isCritical && (
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
      )}

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-mono border flex items-center justify-between shadow-lg ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600/80'
            : 'bg-rose-950/90 text-rose-200 border-rose-600/80'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* CASE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              INVESTIGATION CASE DETAILS
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Simulation Timeline: Day {account.simulation_day ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-mono text-sky-400">{account.account_id}</h2>
            <span className="text-slate-600 font-bold">/</span>
            <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">{account.customer_name || 'N/A'}</h2>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
              isCritical ? 'bg-rose-950/90 text-rose-300 border border-rose-700/80 animate-pulse' :
              isHigh ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80' :
              isMedium ? 'bg-yellow-950/90 text-yellow-300 border border-yellow-700/80' :
              'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80'
            }`}>
              {rLevel} // RISK SCORE {riskScore}
            </span>
          </div>
        </div>

        {/* INTERCEPT ACTION BUTTON */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlaceOnHold}
            disabled={holding || account.loan_status === 'ON_HOLD'}
            className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
              account.loan_status === 'ON_HOLD'
                ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-500/50 hover:shadow-rose-900/40 active:scale-95'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{holding ? 'INTERCEPTING...' : account.loan_status === 'ON_HOLD' ? 'LOAN DISBURSAL ON HOLD' : 'PLACE LOAN ON HOLD'}</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* SECTION 1: ACCOUNT DATA                              */}
      {/* -------------------------------------------------- */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Hash className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            ACCOUNT DATA
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* 1. Account ID */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Account ID
            </span>
            <span className="font-mono font-bold text-sky-400 text-sm block">
              {account.account_id}
            </span>
          </div>

          {/* Customer Name */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-sky-400" />
              Customer Name
            </span>
            <span className="font-sans font-bold text-slate-100 text-sm block">
              {account.customer_name || 'N/A'}
            </span>
          </div>

          {/* 2. Account Age */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Account Age
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {account.account_age_days ?? 0} days
            </span>
          </div>

          {/* 3. Credit Score */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Credit Score
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm block">
              {account.credit_score ?? 650}
            </span>
          </div>

          {/* 4. Credit Score Change */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Credit Score Change
            </span>
            <span className={`font-mono font-bold text-sm block ${
              (account.credit_score_change ?? 0) > 0 ? 'text-emerald-400' :
              (account.credit_score_change ?? 0) < 0 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {formatScoreChange(account.credit_score_change)}
            </span>
          </div>

          {/* 5. Transaction Count */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Transaction Count
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {account.transaction_count ?? 0}
            </span>
          </div>

          {/* 6. Average Transaction Amount */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Average Transaction Amount
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {formatCurrency(account.average_transaction_amount)}
            </span>
          </div>

          {/* 7. Loan Amount */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Loan Amount
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm block">
              {formatCurrency(account.loan_amount)}
            </span>
          </div>

          {/* 8. Withdrawal Amount */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Withdrawal Amount
            </span>
            <span className="font-mono font-bold text-rose-300 text-sm block">
              {formatCurrency(account.withdrawal_amount)}
            </span>
          </div>

          {/* 9. Withdrawal Delay */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Withdrawal Delay
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {account.withdrawal_delay_minutes ?? 0} minutes
            </span>
          </div>

          {/* 10. Device Count */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Device Count
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {account.device_count ?? 1}
            </span>
          </div>

          {/* 11. IP Count */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              IP Count
            </span>
            <span className="font-mono font-bold text-slate-100 text-sm block">
              {account.ip_count ?? 1}
            </span>
          </div>

          {/* 12. Synthetic Fraud Label */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              Synthetic Fraud Label
            </span>
            <span className={`font-mono font-bold text-sm block ${
              syntheticFraudLabel === '1' || syntheticFraudLabel === 'true' || syntheticFraudLabel === 'FRAUD'
                ? 'text-rose-400'
                : 'text-sky-400'
            }`}>
              {syntheticFraudLabel}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* SECTION 2: FRAUD ANALYSIS                            */}
      {/* -------------------------------------------------- */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            FRAUD ANALYSIS
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT: FRAUD METRICS DETAILS */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Risk Level</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isCritical ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                  isHigh ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                  isMedium ? 'bg-yellow-950 text-yellow-300 border border-yellow-700' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  {rLevel}
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Confidence</span>
                <span className="text-sky-400 font-bold text-sm">
                  {account.confidence ?? 0}%
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Detected Pattern</span>
              <span className="text-amber-300 font-bold text-xs block">
                {account.pattern || 'NORMAL_BEHAVIOR'}
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Recommended Action</span>
              <span className="text-rose-400 font-bold text-xs block">
                {account.recommended_action || 'CONTINUE_MONITORING'}
              </span>
            </div>
          </div>

          {/* RIGHT: CIRCULAR GAUGE METER */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-2">
              RISK SCORE
            </span>
            <div className="relative w-32 h-32 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" stroke="#1e293b" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke={isCritical ? '#f43f5e' : isHigh ? '#f59e0b' : isMedium ? '#eab308' : '#10b981'}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="339.29"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-100">{riskScore}</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* REASONS / SIGNALS */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 block mb-2 font-bold uppercase tracking-wider">
            Reasons ({Array.isArray(account.reasons) ? account.reasons.length : 0}):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
            {Array.isArray(account.reasons) && account.reasons.length > 0 ? (
              account.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 font-mono text-xs p-2">No anomaly signals detected. Account operating normally.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
