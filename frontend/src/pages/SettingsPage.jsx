import React from 'react';
import { Sliders, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-3">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">PROXYSHIELD SOC ENGINE CONFIGURATION</h2>
          <p className="text-xs text-slate-400">Adaptive Behavioral Engine Parameters, Thresholds & System Diagnostics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="soc-card p-5 space-y-3 font-mono text-xs border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 uppercase">RISK SCORE THRESHOLDS</h3>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400">LOW RISK (SAFE):</span>
            <span className="text-emerald-400 font-bold">0 - 39</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400">MEDIUM RISK (SUSPICIOUS):</span>
            <span className="text-yellow-400 font-bold">40 - 69</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400">HIGH RISK (ELEVATED):</span>
            <span className="text-amber-400 font-bold">70 - 84</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400">CRITICAL RISK (IMMEDIATE ACTION):</span>
            <span className="text-rose-400 font-bold">85 - 100</span>
          </div>
        </div>

        <div className="soc-card p-5 space-y-3 font-mono text-xs border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 uppercase">PATTERN CLASSIFICATION RULES</h3>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold">PATTERN A:</div>
            <div className="text-amber-400 font-bold text-[11px]">NEW_ACCOUNT_CREDIT_BUILD_LOAN_SPIKE</div>
            <div className="text-[10px] text-slate-500 font-sans">New account + Credit building + Large loan + Rapid withdrawal delay</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold">PATTERN B:</div>
            <div className="text-amber-400 font-bold text-[11px]">DEVICE_CHANGE_TRANSACTION_SPIKE</div>
            <div className="text-[10px] text-slate-500 font-sans">Device count shift + Unusual transaction velocity</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">ADAPTIVE ENGINE STATUS:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              ONLINE & ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
