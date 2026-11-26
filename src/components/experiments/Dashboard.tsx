import React from 'react';
import { useLab } from '../../context/LabContext';
import { ActiveView } from '../../types/experiments';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Play, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Gauge, 
  Activity,
  Copyright,
  HardDrive,
  Wrench
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { experiments, setActiveView, setIsRecordModalOpen, setSelectedReportExpId } = useLab();

  const completed = experiments.filter((e) => e.completed).length;
  const pending = experiments.length - completed;
  const progressPct = Math.round((completed / experiments.length) * 100);

  const lastSimulatedExp = experiments.find((e) => e.lastSimulated) || experiments[0];

  return (
    <div className="h-full flex flex-col gap-5 p-6 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* High-Impact Aerospace Landing Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1128] via-[#091738] to-[#050c1e] border-2 border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        {/* Holographic animated scan lines & circuit glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/50 mb-3 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="tracking-widest">★ OFFICIAL AEROSPACE ENGINEERING SIMULATOR ★</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            <span className="block text-slate-300 text-lg sm:text-xl md:text-2xl font-mono tracking-wider mb-1 font-semibold text-cyan-400/90">
              AEROSPACE UAV VIRTUAL PLATFORM
            </span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              WELCOME TO RITHIK'S DRONE LABORATORY (SIMULATOR)
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl font-normal drop-shadow">
            Experience next-generation aeronautical flight mechanics, real 3D hardware assembly, wind tunnel aerodynamics, motor-propeller thrust telemetry, and flight controller calibration across all 10 university syllabus practical experiments.
          </p>

          <div className="flex flex-wrap gap-3.5 mt-6">
            <button
              onClick={() => setActiveView('hardware-workbench')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Wrench className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>Enter Hardware Assembly Lab</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-amber-300 rounded font-bold ml-1">
                3D ESD BENCH
              </span>
            </button>

            <button
              onClick={() => setActiveView('flight-simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/50 font-bold text-xs sm:text-sm shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Launch 3D Flight Simulator</span>
            </button>

            <button
              onClick={() => setActiveView('exp1')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>Start Experiment 1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>LAB SYLLABUS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white font-mono">10</span>
            <span className="text-xs text-slate-400 ml-1.5">Total Experiments</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">100% Curriculum Coverage</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{completed}</span>
            <span className="text-xs text-slate-400 ml-1.5">/ 10 Experiments</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PENDING</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{pending}</span>
            <span className="text-xs text-slate-400 ml-1.5">Experiments Left</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {completed === 10 ? 'All certified!' : 'Ready for simulation'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-blue-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>LAST ACTIVITY</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-sm font-bold text-white truncate">
              {lastSimulatedExp.shortTitle}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {lastSimulatedExp.lastSimulated || 'Not simulated yet'}
            </div>
          </div>
          <div className="text-[10px] text-blue-400 font-mono">Autosaved to Local Storage</div>
        </div>
      </div>

      {/* Grid of all 10 Experiments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <span>EXPERIMENT LABORATORY MODULES</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">10 Working Modules</span>
          </h3>
          <span className="text-xs text-slate-400">Click any experiment to enter workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setActiveView(`exp${exp.id}` as ActiveView)}
              className="p-4 rounded-xl bg-[#0b101d] hover:bg-[#0f1629] border border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      EXP 0{exp.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {exp.category}
                    </span>
                  </div>
                  {exp.completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {exp.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {exp.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-500">
                  {exp.componentsUsed.length} Components Simulated
                </span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Copyright & Offline Laboratory Certification Banner */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-[#070c18] via-[#091122] to-[#070c18] border border-cyan-500/25 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Copyright className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>© 2026 UAV VIRTUAL LAB</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ALL RIGHTS RESERVED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Department of Aeronautical & Aerospace Engineering • Autonomous Systems Laboratory Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% OFFLINE CAPABLE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYLLABUS CERTIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
