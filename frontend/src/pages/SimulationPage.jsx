import React, { useState, useEffect } from 'react';
import { getDashboardSummary, advanceSimulation } from '../services/api';
import { Sliders, FastForward, Activity, CheckCircle2 } from 'lucide-react';

export default function SimulationPage() {
  const [metrics, setMetrics] = useState({ current_simulation_day: 0 });
  const [advancing, setAdvancing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getDashboardSummary();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching simulation summary:', err);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('proxyshield-refresh', handleRefresh);
    return () => window.removeEventListener('proxyshield-refresh', handleRefresh);
  }, []);

  const handleAdvance = async () => {
    if (advancing || (metrics.current_simulation_day >= 120)) return;
    setAdvancing(true);
    try {
      await advanceSimulation('C126');
      await loadData();
      window.dispatchEvent(new CustomEvent('proxyshield-refresh'));
    } catch (err) {
      console.error('Error advancing simulation:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const currentDay = metrics.current_simulation_day || 0;

  const allLogs = [
    { dayNum: 0, text: 'Day 0: C126 Synthetic Account Created with baseline parameters.' },
    { dayNum: 30, text: 'Day 30: Normal account activity (+7 txns, credit score 680).' },
    { dayNum: 60, text: 'Day 60: Rapid credit score improvement (+75 pts, score 725).' },
    { dayNum: 90, text: 'Day 90: Large credit line requested (₹9,00,000, loan PENDING).' },
    { dayNum: 120, text: 'Day 120: Rapid withdrawal of ₹8,10,000 executed within 12 mins. Pattern A triggered.' }
  ];

  const visibleLogs = allLogs.filter(item => item.dayNum <= currentDay);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>CONTROLLED TIMELINE SIMULATOR</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 text-sky-400 border border-slate-800 font-mono text-xs font-bold">
              Day {currentDay} / 120
            </span>
          </div>
          <h2 className="text-2xl font-mono font-black text-slate-100 flex items-center gap-3">
            <span>SIMULATION TIMELINE: DAY {currentDay}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Simulates synthetic account behavior over 30-day deterministic intervals for risk testing</p>
        </div>

        <button
          onClick={handleAdvance}
          disabled={advancing || currentDay >= 120}
          className={`font-mono px-6 py-3 rounded-xl text-xs font-bold shadow-xl transition-all cursor-pointer flex items-center gap-2 border ${
            advancing || currentDay >= 120
              ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 active:scale-95'
          }`}
        >
          <FastForward className="w-4 h-4" />
          <span>{advancing ? 'ADVANCING...' : currentDay >= 120 ? 'DAY 120 REACHED' : 'ADVANCE 30 DAYS'}</span>
        </button>
      </div>

      <div className="soc-card border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">SIMULATION TELEMETRY LOG</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Progress: Day {currentDay} / 120</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs max-h-96 overflow-y-auto pr-1">
          {visibleLogs.map((entry, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/80 text-slate-200 flex items-center gap-3 hover:border-slate-700 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="leading-relaxed">{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
