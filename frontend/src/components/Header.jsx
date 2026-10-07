import React, { useState } from 'react';
import { advanceSimulation, createAccount } from '../services/api';

export default function Header() {
  const [advancing, setAdvancing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state for synthetic account creation
  const [formData, setFormData] = useState({
    customer_name: '',
    date_of_birth: '1995-05-15',
    mobile: '+919876543210',
    email: 'new.customer@example.com',
    address: 'Mumbai, India',
    occupation: 'Salaried',
    account_type: 'SAVINGS',
    initial_deposit: 25000
  });

  const handleAdvanceSimulation = async () => {
    setAdvancing(true);
    try {
      const res = await advanceSimulation('C126');
      setNotification({
        type: 'success',
        message: `Simulation Advanced: C126 is now at Day ${res.new_simulation_day} (${res.last_event})`
      });
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'ProxyShield backend is unavailable.'
      });
    } finally {
      setAdvancing(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) return;
    setCreating(true);
    try {
      const newAcc = await createAccount(formData);
      setNotification({
        type: 'success',
        message: `Synthetic Account Created: ${newAcc.account_id} for ${newAcc.customer_name}`
      });
      setShowCreateModal(false);
      setFormData({ ...formData, customer_name: '' });
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create synthetic account.'
      });
    } finally {
      setCreating(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="dashboard-top-header">
      <div className="header-brand-info">
        <h1 className="brand-title">ProxyShield India // Behavioral Fraud Risk Overview</h1>
        <p className="brand-subtitle">Real-time synthetic identity, loan bust-out, and adaptive pattern intelligence</p>
      </div>

      <div className="header-meta-actions flex items-center gap-3">
        {notification && (
          <div className={`notification-toast ${notification.type === 'success' ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500' : 'bg-rose-900/80 text-rose-200 border-rose-500'} px-3 py-1.5 rounded border text-xs font-mono animate-fade-in`}>
            {notification.message}
          </div>
        )}

        <button
          onClick={handleAdvanceSimulation}
          disabled={advancing}
          className="btn-header-action bg-amber-600 hover:bg-amber-500 text-white font-mono px-3 py-1.5 rounded font-bold text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {advancing ? 'ADVANCING...' : '⚡ +30 DAYS SIMULATION'}
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-header-action bg-sky-700 hover:bg-sky-600 text-white font-mono px-3 py-1.5 rounded font-bold text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
        >
          + NEW ACCOUNT
        </button>
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 text-slate-100 shadow-2xl font-sans">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold font-mono text-sky-400">CREATE SYNTHETIC ACCOUNT</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 font-mono text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">CUSTOMER NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Verma"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">DATE OF BIRTH</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">MOBILE</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">INITIAL DEPOSIT (₹)</label>
                  <input
                    type="number"
                    value={formData.initial_deposit}
                    onChange={(e) => setFormData({ ...formData, initial_deposit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">OCCUPATION</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">ACCOUNT TYPE</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="SAVINGS">SAVINGS</option>
                    <option value="CURRENT">CURRENT</option>
                    <option value="SALARY">SALARY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">ADDRESS</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold"
                >
                  {creating ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
