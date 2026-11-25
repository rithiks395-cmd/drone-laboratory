import React from 'react';
import { useLab } from '../../context/LabContext';
import { Terminal, ShieldCheck, Activity, Database, Check } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeView, experiments } = useLab();

  const getStatusText = () => {
    if (activeView === 'dashboard') return 'System Dashboard - Overview of 10 Experiments';
    if (activeView === 'flight-simulator') return 'Live 3D UAV Flight Simulator - Quadcopter Physics Engine Active';
    if (activeView === 'lab-records') return 'University UAV Laboratory Records & Practical Output Review';
    const id = parseInt(activeView.replace('exp', ''), 10);
    const exp = experiments.find((e) => e.id === id);
    return exp ? `Simulating EXP ${exp.id}: ${exp.title}` : 'Simulation Active';
  };

  return (
    <footer className="h-8 bg-[#060911] border-t border-cyan-500/20 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>AUTOSAVE: ON (LOCAL STORAGE)</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SIMULATION VALIDATED</span>
        </div>
      </div>
    </footer>
  );
};
