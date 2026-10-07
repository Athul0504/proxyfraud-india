import React, { useState, useEffect } from 'react';
import { getAccounts } from '../services/api';
import { Search, ShieldAlert, ChevronRight, Lock } from 'lucide-react';

export default function ApplicantRiskTable({ onSelectAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts({ risk_level: selectedRiskFilter });
      setAccounts(data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    const handleRefresh = () => loadAccounts();
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, [selectedRiskFilter]);

  const filteredAccounts = accounts.filter(acc => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (acc.account_id && acc.account_id.toLowerCase().includes(term)) ||
      (acc.customer_name && acc.customer_name.toLowerCase().includes(term)) ||
      (acc.pattern && acc.pattern.toLowerCase().includes(term))
    );
  });

  const formatCurrency = (val) => `₹${Number(val ?? 0).toLocaleString('en-IN')}`;
  const formatScoreChange = (val) => {
    const num = Number(val ?? 0);
    return num >= 0 ? `+${num}` : `${num}`;
  };

  return (
    <div className="soc-card p-4 shadow-xl space-y-4 border border-slate-800">
      {/* FILTER & HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">ACCOUNTS DIRECTORY & RISK MATRIX</h3>
            <span className="text-[10px] text-slate-400 font-mono">{filteredAccounts.length} portfolio accounts listed</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter Account ID, Name, Pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-md pl-8 pr-2.5 py-1 text-xs font-mono text-slate-200 outline-none focus:border-sky-500 w-full md:w-64"
            />
          </div>

          {/* RISK LEVEL FILTER BUTTONS */}
          <div className="flex bg-slate-900 p-0.5 rounded-md border border-slate-800 font-mono text-xs">
            {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRiskFilter(lvl)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  selectedRiskFilter === lvl
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACCOUNTS DATA TABLE */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase bg-slate-900/90 tracking-wider">
                <th className="p-3 whitespace-nowrap">Account ID</th>
                <th className="p-3 whitespace-nowrap">Customer Name</th>
                <th className="p-3 whitespace-nowrap text-center">Account Age</th>
                <th className="p-3 whitespace-nowrap text-center">Credit Score</th>
                <th className="p-3 whitespace-nowrap text-center">Credit Score Change</th>
                <th className="p-3 whitespace-nowrap text-center">Transaction Count</th>
                <th className="p-3 whitespace-nowrap text-right">Average Transaction Amount</th>
                <th className="p-3 whitespace-nowrap text-right">Loan Amount</th>
                <th className="p-3 whitespace-nowrap text-right">Withdrawal Amount</th>
                <th className="p-3 whitespace-nowrap text-center">Withdrawal Delay</th>
                <th className="p-3 whitespace-nowrap text-center">Device Count</th>
                <th className="p-3 whitespace-nowrap text-center">IP Count</th>
                <th className="p-3 whitespace-nowrap text-center">Synthetic Fraud Label</th>
                <th className="p-3 whitespace-nowrap text-center">Risk Level</th>
                <th className="p-3 whitespace-nowrap text-center">Risk Score</th>
                <th className="p-3 whitespace-nowrap">Detected Pattern</th>
                <th className="p-3 whitespace-nowrap">Loan Status</th>
                <th className="p-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="18" className="p-8 text-center text-slate-500 font-mono">
                    Loading account directory from ProxyShield backend...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="18" className="p-8 text-center text-slate-500 font-mono">
                    No accounts found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const rLevel = acc.risk_level || 'LOW';
                  const syntheticLabel = acc.synthetic_fraud_label !== undefined
                    ? String(acc.synthetic_fraud_label)
                    : (acc.synthetic_label !== undefined ? String(acc.synthetic_label) : '0');

                  return (
                    <tr
                      key={acc.account_id}
                      onClick={() => onSelectAccount(acc.account_id)}
                      className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Account ID */}
                      <td className="p-3 font-bold text-sky-400 group-hover:underline whitespace-nowrap">
                        {acc.account_id}
                      </td>
                      {/* 2. Customer Name */}
                      <td className="p-3 font-sans font-medium text-slate-200 whitespace-nowrap">
                        {acc.customer_name || 'N/A'}
                      </td>
                      {/* 3. Account Age */}
                      <td className="p-3 text-center text-slate-300 whitespace-nowrap">
                        {acc.account_age_days ?? 0} days
                      </td>
                      {/* 4. Credit Score */}
                      <td className="p-3 text-center font-bold text-emerald-400 whitespace-nowrap">
                        {acc.credit_score ?? 650}
                      </td>
                      {/* 5. Credit Score Change */}
                      <td className="p-3 text-center font-bold text-slate-200 whitespace-nowrap">
                        {formatScoreChange(acc.credit_score_change)}
                      </td>
                      {/* 6. Transaction Count */}
                      <td className="p-3 text-center text-slate-300 whitespace-nowrap">
                        {acc.transaction_count ?? 0}
                      </td>
                      {/* 7. Average Transaction Amount */}
                      <td className="p-3 text-right text-slate-200 whitespace-nowrap">
                        {formatCurrency(acc.average_transaction_amount)}
                      </td>
                      {/* 8. Loan Amount */}
                      <td className="p-3 text-right font-bold text-amber-300 whitespace-nowrap">
                        {formatCurrency(acc.loan_amount)}
                      </td>
                      {/* 9. Withdrawal Amount */}
                      <td className="p-3 text-right font-bold text-rose-300 whitespace-nowrap">
                        {formatCurrency(acc.withdrawal_amount)}
                      </td>
                      {/* 10. Withdrawal Delay */}
                      <td className="p-3 text-center text-slate-300 whitespace-nowrap">
                        {acc.withdrawal_delay_minutes ?? 0} mins
                      </td>
                      {/* 11. Device Count */}
                      <td className="p-3 text-center text-slate-300 whitespace-nowrap">
                        {acc.device_count ?? 1}
                      </td>
                      {/* 12. IP Count */}
                      <td className="p-3 text-center text-slate-300 whitespace-nowrap">
                        {acc.ip_count ?? 1}
                      </td>
                      {/* 13. Synthetic Fraud Label */}
                      <td className="p-3 text-center font-bold text-sky-400 whitespace-nowrap">
                        {syntheticLabel}
                      </td>
                      {/* 14. Risk Level */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rLevel === 'CRITICAL' ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80' :
                          rLevel === 'HIGH' ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80' :
                          rLevel === 'MEDIUM' ? 'bg-yellow-950/90 text-yellow-300 border border-yellow-800/80' :
                          'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80'
                        }`}>
                          {rLevel}
                        </span>
                      </td>
                      {/* 15. Risk Score */}
                      <td className="p-3 text-center font-bold text-slate-100 whitespace-nowrap">
                        {acc.risk_score ?? 0}
                      </td>
                      {/* 16. Detected Pattern */}
                      <td className="p-3 text-[11px] text-slate-300 whitespace-nowrap">
                        {acc.pattern || 'NORMAL_BEHAVIOR'}
                      </td>
                      {/* 17. Loan Status */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max ${
                          acc.loan_status === 'ON_HOLD' ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80' :
                          acc.loan_status === 'PENDING' ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {acc.loan_status === 'ON_HOLD' && <Lock className="w-2.5 h-2.5" />}
                          <span>{acc.loan_status || 'NONE'}</span>
                        </span>
                      </td>
                      {/* 18. Action */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAccount(acc.account_id);
                          }}
                          className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-[10px] font-bold shadow flex items-center gap-1 ml-auto cursor-pointer transition-all"
                        >
                          <span>DETAILS</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
