import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Lock,
  UserCheck,
  Compass,
  Rocket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingIntroScreenProps {
  onEnterLab: () => void;
  onOpenAdminLogin: () => void;
}

export const LandingIntroScreen: React.FC<LandingIntroScreenProps> = ({ onEnterLab, onOpenAdminLogin }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050f] text-slate-100 overflow-y-auto sm:overflow-hidden font-sans select-none p-4">
      
      {/* 1. Deep Aerospace Cyber Nebula & Starfield */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b1f48] via-[#040a1b] to-[#010309] pointer-events-none"></div>

      {/* Holographic Glowing Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      {/* Pulsing Glowing Laser Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.15)_50%,transparent_100%)] bg-[length:100%_100px] animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>

      {/* Glowing Neon Cyber Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-amber-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none"></div>

      {/* ROTATING AEROSPACE HUD RADAR RETICLE WITH BEARING DEGREES */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[560px] sm:h-[560px] md:w-[680px] md:h-[680px] border border-cyan-500/20 rounded-full pointer-events-none animate-[spin_80s_linear_infinite]">
        {/* Outer Degree Ring */}
        <div className="absolute inset-3 border border-dashed border-cyan-400/30 rounded-full"></div>
        <div className="absolute inset-10 border border-cyan-500/15 rounded-full"></div>
        <div className="absolute inset-20 border border-dotted border-cyan-400/20 rounded-full"></div>

        {/* Cardinal Bearing Markers */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400 font-bold tracking-widest">
          000° N
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400 font-bold tracking-widest">
          180° S
        </div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-amber-400 font-bold tracking-widest">
          270° W
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-amber-400 font-bold tracking-widest">
          090° E
        </div>

        {/* Glowing Radar Target Points */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#06b6d4]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#06b6d4]"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"></div>
      </div>

      {/* High-Tech Reticle Sweeping Beam */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[540px] sm:h-[540px] rounded-full pointer-events-none animate-[spin_10s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(6, 182, 212, 0.15) 360deg)'
        }}
      />

      {/* MAIN CENTRAL HERO CONTENT CONTAINER */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto my-auto py-6">
        
        {/* Floating Aerospace Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs sm:text-sm font-mono font-bold border border-cyan-400/50 mb-5 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <Compass className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="tracking-widest uppercase">AEROSPACE ENGINEERING VIRTUAL PLATFORM</span>
        </div>

        {/* BRIGHT GLOWING TITLE WITH EXCELLENT ANIMATION */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          <span className="block text-cyan-400 font-mono text-base sm:text-xl md:text-2xl font-bold tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]">
            WELCOME TO
          </span>
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(6,182,212,1)] animate-pulse inline-block">
            AERO - SPACE SIMULATOR
          </span>
        </h1>

        {/* Aerospace Engineering Subtitle */}
        <p className="mt-5 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-normal drop-shadow">
          Autonomous UAV systems, aerodynamic wind tunnel testing, multi-user individualized accounts, 3D component ESD assembly workbench, and 10 syllabus practical experiments.
        </p>

        {/* CURRENT ACTIVE USER STATUS IF LOGGED IN */}
        {currentUser && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center gap-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-400">
              {currentUser.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span>
              Signed In: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Master Admin' : currentUser.email})
            </span>
            <button
              onClick={logout}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-bold cursor-pointer ml-1"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* LIVE READINESS TELEMETRY TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-6 mb-7 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/40 backdrop-blur-md flex flex-col items-center gap-1 shadow-md hover:border-cyan-400 transition-all">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-slate-400">SYLLABUS</span>
            <span className="text-cyan-300 font-bold">10 EXPERIMENTS</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/40 backdrop-blur-md flex flex-col items-center gap-1 shadow-md hover:border-emerald-400 transition-all">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400">WORKBENCH</span>
            <span className="text-emerald-300 font-bold">3D ASSEMBLY</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/40 backdrop-blur-md flex flex-col items-center gap-1 shadow-md hover:border-amber-400 transition-all">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-slate-400">SIMULATOR</span>
            <span className="text-amber-300 font-bold">PHYSICS ENGINE</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/40 backdrop-blur-md flex flex-col items-center gap-1 shadow-md hover:border-purple-400 transition-all">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-slate-400">MULTI-USER</span>
            <span className="text-purple-300 font-bold">SECURED DATA</span>
          </div>
        </div>

        {/* ACTION BUTTONS: ENTER LAB & ADMIN PORTAL */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* THE MAIN GLOWING "ENTER LAB" BUTTON */}
          <button
            onClick={onEnterLab}
            className="group relative flex items-center justify-center gap-4 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black text-base sm:text-xl tracking-wider shadow-[0_0_50px_rgba(6,182,212,0.9)] hover:shadow-[0_0_80px_rgba(245,158,11,1)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/70 w-full sm:w-auto"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-amber-500 opacity-60 blur-lg group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
            <Rocket className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-slate-950 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="relative z-10 font-black drop-shadow tracking-widest">
              ENTER LAB
            </span>
            <ArrowRight className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-slate-950 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          {/* ADMIN LOGIN BUTTON (Clean 'Admin Portal' Alone) */}
          <button
            onClick={onOpenAdminLogin}
            className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-2 border-amber-500/50 hover:border-amber-400 font-bold font-mono text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95 w-full sm:w-auto"
            title="Institutional Master Administrator Portal"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Bottom Helper Note for New Users */}
        {!currentUser && (
          <p className="mt-4 text-[11px] font-mono text-slate-400">
            Click <span className="text-cyan-300 font-semibold">ENTER LAB</span> to sign in or create your individualized student account.
          </p>
        )}
      </div>
    </div>
  );
};
