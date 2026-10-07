import React, { useState, useEffect } from 'react';
import { getAccounts, placeLoanOnHold } from '../services/api';
import { CreditCard, Lock, CheckCircle, ChevronRight, ShieldAlert } from 'lucide-react';

export default function LoanMonitoringPage({ onSelectAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      const loanAccs = data.filter(a => (a.loan_amount || 0) > 0);
      setAccounts(loanAccs);
    } catch (err) {
      console.error('Error fetching loan accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
    const handleRefresh = () => loadLoans();
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, []);

  const handleHold = async (accId) => {
    try {
      await placeLoanOnHold(accId);
      setNotification({ type: 'success', message: `Loan disbursal for ${accId} placed ON HOLD!` });
      loadLoans();
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Action failed.' });
    } setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-mono border flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600' : 'bg-rose-950/90 text-rose-200 border-rose-600'
        }`}>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">LOAN DISBURSAL INTERCEPT MONITORING</h2>
            <p className="text-xs text-slate-400">Review pending credit line requests and freeze high-risk disbursals</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-800 font-mono text-xs font-bold shadow">
          {accounts.length} ACTIVE LOAN APPLICATIONS
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase bg-slate-900/90 tracking-wider">
                <th className="p-3">Account ID</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Loan Amount</th>
                <th className="p-3">Withdrawal</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Detected Pattern</th>
                <th className="p-3">Loan Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-500 font-mono">Loading loan monitoring data...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-500 font-mono">No active loan applications found.</td></tr>
              ) : accounts.map((acc) => (
                <tr key={acc.account_id} className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3 font-bold text-sky-400">{acc.account_id}</td>
                  <td className="p-3 font-sans font-medium text-slate-200">{acc.customer_name}</td>
                  <td className="p-3 font-bold text-amber-300">₹{acc.loan_amount ? acc.loan_amount.toLocaleString() : 0}</td>
                  <td className="p-3 text-rose-300 font-bold">₹{acc.withdrawal_amount ? acc.withdrawal_amount.toLocaleString() : 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      acc.risk_level === 'CRITICAL' ? 'bg-rose-950/90 text-rose-300 border border-rose-800' :
                      acc.risk_level === 'HIGH' ? 'bg-amber-950/90 text-amber-300 border border-amber-800' :
                      'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                    }`}>
                      {acc.risk_level} ({acc.risk_score})
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px]">{acc.pattern}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max ${
                      acc.loan_status === 'ON_HOLD' ? 'bg-rose-950/90 text-rose-300 border border-rose-800' : 'bg-amber-950/90 text-amber-300 border border-amber-800'
                    }`}>
                      {acc.loan_status === 'ON_HOLD' && <Lock className="w-2.5 h-2.5" />}
                      <span>{acc.loan_status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleHold(acc.account_id)}
                      disabled={acc.loan_status === 'ON_HOLD'}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        acc.loan_status === 'ON_HOLD'
                          ? 'bg-rose-950/90 text-rose-400 border border-rose-800/80 cursor-not-allowed'
                          : 'bg-rose-700 hover:bg-rose-600 text-white shadow'
                      }`}
                    >
                      {acc.loan_status === 'ON_HOLD' ? 'ON HOLD' : 'PLACE ON HOLD'}
                    </button>
                    <button
                      onClick={() => onSelectAccount(acc.account_id)}
                      className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md text-[10px] font-bold cursor-pointer"
                    >
                      INVESTIGATE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
