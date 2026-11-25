import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { Terminal, ShieldCheck, Database, Wifi, WifiOff, Copyright } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeView, experiments } = useLab();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusText = () => {
    if (activeView === 'dashboard') return 'System Dashboard - Overview of 10 Experiments';
    if (activeView === 'flight-simulator') return 'Live 3D UAV Flight Simulator - Quadcopter Physics Engine Active';
    if (activeView === 'lab-records') return 'University UAV Laboratory Records & Practical Output Review';
    const id = parseInt(activeView.replace('exp', ''), 10);
    const exp = experiments.find((e) => e.id === id);
    return exp ? `Simulating EXP ${exp.id}: ${exp.title}` : 'Simulation Active';
  };

  return (
    <footer className="h-8 bg-[#060911] border-t border-cyan-500/20 px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20 overflow-x-auto whitespace-nowrap gap-3">
      {/* Left: Simulation Activity */}
      <div className="flex items-center gap-2 text-cyan-400 shrink-0">
        <Terminal className="w-3.5 h-3.5" />
        <span className="font-semibold uppercase tracking-wider hidden sm:inline">{getStatusText()}</span>
        <span className="font-semibold uppercase tracking-wider sm:hidden">UAV LAB ACTIVE</span>
      </div>

      {/* Center: Official Copyright Notice */}
      <div className="flex items-center gap-1.5 text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 shrink-0">
        <Copyright className="w-3 h-3 text-cyan-400" />
        <span>2026 UAV VIRTUAL LAB • ALL RIGHTS RESERVED</span>
      </div>

      {/* Right: Offline / Online Status & Autosave */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${
          isOnline 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' 
            : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
        }`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'PWA OFFLINE READY' : 'OFFLINE MODE ACTIVE'}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>AUTOSAVE: LOCAL STORAGE</span>
        </div>
      </div>
    </footer>
  );
};
