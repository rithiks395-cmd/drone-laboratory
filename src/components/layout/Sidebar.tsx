import React from 'react';
import { useLab } from '../../context/LabContext';
import { ActiveView } from '../../types/experiments';
import { 
  LayoutDashboard, 
  Weight, 
  Plane, 
  Gauge, 
  Sliders, 
  BatteryCharging, 
  Radio, 
  Disc, 
  Crosshair, 
  Boxes, 
  Cpu, 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  X,
  Search,
  Wrench
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, experiments, mobileMenuOpen, setMobileMenuOpen, openInspection } = useLab();

  const getExperimentIcon = (id: number) => {
    switch (id) {
      case 1: return Weight;
      case 2: return Plane;
      case 3: return Gauge;
      case 4: return Sliders;
      case 5: return BatteryCharging;
      case 6: return Radio;
      case 7: return Disc;
      case 8: return Crosshair;
      case 9: return Boxes;
      case 10: return Cpu;
      default: return Plane;
    }
  };

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false); // Close mobile drawer on selection
  };

  const navItem = (view: ActiveView, label: string, Icon: React.ComponentType<{ className?: string }>, badge?: string, isCompleted?: boolean) => {
    const isActive = activeView === view;
    const isWorkbench = view === 'hardware-workbench';

    return (
      <button
        onClick={() => handleSelectView(view)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
          isActive
            ? isWorkbench 
              ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-glow-amber font-bold'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan'
            : isWorkbench
              ? 'bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${
            isActive 
              ? isWorkbench ? 'text-amber-400' : 'text-cyan-400'
              : isWorkbench ? 'text-amber-400' : 'text-slate-400 group-hover:text-cyan-400'
          }`} />
          <span className="truncate">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
            isWorkbench 
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 font-bold'
              : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
          }`}>
            {badge}
          </span>
        )}
        {isCompleted && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-[#090d19]/95 border-r border-cyan-500/20 flex flex-col h-full lg:h-[calc(100vh-4rem)] select-none transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between lg:hidden">
          <span className="font-bold text-sm text-cyan-300 font-mono">UAV EXPERIMENT LAB</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Main Navigation */}
        <div className="p-3 border-b border-slate-800 space-y-1">
          {navItem('dashboard', 'Laboratory Dashboard', LayoutDashboard)}
          {navItem('hardware-workbench', 'Hardware Assembly Lab', Wrench, 'NEW 3D')}
          {navItem('flight-simulator', '3D Flight Simulator', Compass, 'LIVE 3D')}
          {navItem('lab-records', 'Lab Records & Observations', BookOpen)}

          {/* Quick Hardware Inspector Pill */}
          <button
            onClick={() => {
              openInspection('Brushless DC Motor');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-cyan-300 hover:bg-slate-800/60 border border-cyan-500/20 mt-1"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Hardware Inspector</span>
            </div>
            <span className="text-[9px] font-mono px-1 rounded bg-cyan-950 text-cyan-400">PBR</span>
          </button>
        </div>

        {/* Experiments List Header */}
        <div className="px-4 py-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-cyan-400/80 bg-slate-900/40 border-b border-slate-800">
          <span>SYLLABUS EXPERIMENTS (10)</span>
          <span className="text-slate-400">{experiments.filter((e) => e.completed).length}/10</span>
        </div>

        {/* Scrollable Experiments Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {experiments.map((exp) => {
            const viewKey = `exp${exp.id}` as ActiveView;
            const IconComponent = getExperimentIcon(exp.id);
            const isActive = activeView === viewKey;

            return (
              <button
                key={exp.id}
                onClick={() => handleSelectView(viewKey)}
                className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 border border-cyan-500/50 shadow-glow-cyan text-cyan-200'
                    : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">
                      EXP 0{exp.id}
                    </span>
                    {exp.completed ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-slate-500">
                        <Clock className="w-2.5 h-2.5" /> PENDING
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium leading-snug truncate mt-0.5 text-slate-200">
                    {exp.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {exp.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>UAV SIM ENGINE</span>
          <span className="text-cyan-400">TOUCH READY</span>
        </div>
      </aside>
    </>
  );
};
