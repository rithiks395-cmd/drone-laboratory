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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d172e] via-[#091122] to-[#060a16] border border-cyan-500/30 p-6 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ACADEMIC UAV ENGINEERING SUITE</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            UAV Virtual Laboratory & 3D Flight Simulator
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to the comprehensive unmanned aerial vehicle engineering laboratory. Perform all 10 syllabus experiments through interactive 3D simulations, real-time aerodynamic calculations, component assembly, and generate printable laboratory records for practical exams.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => setActiveView('hardware-workbench')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Hardware Assembly Lab</span>
            </button>
            <button
              onClick={() => setActiveView('exp1')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Experiment 1</span>
            </button>
            <button
              onClick={() => setActiveView('flight-simulator')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Open 3D Flight Simulator</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
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
