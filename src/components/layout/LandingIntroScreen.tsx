import React, { useState } from 'react';
import { 
  Wrench, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingIntroScreenProps {
  onEnterLab: () => void;
  onOpenAdminLogin: () => void;
}

export const LandingIntroScreen: React.FC<LandingIntroScreenProps> = ({ onEnterLab, onOpenAdminLogin }) => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050e] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. Deep Aerospace Cyber Starfield & Glowing Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0c1f4d] via-[#050b1d] to-[#01040a] pointer-events-none"></div>

      {/* Holographic Glowing Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 85%)'
        }}
      />

      {/* Animated Glowing Laser Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.12)_50%,transparent_100%)] bg-[length:100%_80px] animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>

      {/* Floating Neon Cyber Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/25 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Rotating Aerospace HUD Crosshair Reticle in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[520px] sm:h-[520px] border border-cyan-500/20 rounded-full pointer-events-none animate-[spin_60s_linear_infinite]">
        <div className="absolute inset-4 border border-dashed border-cyan-400/25 rounded-full"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
      </div>

      {/* Main Central High-Tech Content Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs sm:text-sm font-mono font-bold border border-cyan-400/50 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="tracking-widest uppercase">OFFICIAL AEROSPACE ENGINEERING SIMULATOR</span>
        </div>

        {/* BRIGHTER GLOWING EXCELLENT ANIMATED TITLE */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          <span className="block text-cyan-400 font-mono text-base sm:text-xl md:text-2xl font-bold tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
            WELCOME TO
          </span>
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(6,182,212,0.9)] animate-pulse">
            RITHIK'S AERO - SPACE LABORATORY
          </span>
          <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl font-mono text-amber-400 font-black tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
            ( SIMULATOR )
          </span>
        </h1>

        {/* Aerospace Subtitle */}
        <p className="mt-6 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-normal drop-shadow">
          Autonomous UAV systems, aerodynamic wind tunnel testing, multi-user individualized accounts, 3D component drag-and-drop ESD assembly workbench, and 10 syllabus practical experiments.
        </p>

        {/* Current User Status if logged in */}
        {currentUser && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-400/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Currently Active: <strong>{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Master Admin' : currentUser.rollNumber})</span>
          </div>
        )}

        {/* Live Lab Systems Readiness Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-6 mb-8 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md flex flex-col items-center gap-1 shadow-md">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-slate-400">SYLLABUS</span>
            <span className="text-cyan-300 font-bold">10 EXPERIMENTS</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md flex flex-col items-center gap-1 shadow-md">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400">WORKBENCH</span>
            <span className="text-emerald-300 font-bold">ESD GROUNDED</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md flex flex-col items-center gap-1 shadow-md">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-slate-400">HARDWARE</span>
            <span className="text-amber-300 font-bold">3D DRAG & DROP</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md flex flex-col items-center gap-1 shadow-md">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-slate-400">MULTI-USER</span>
            <span className="text-purple-300 font-bold">ISOLATED DATA</span>
          </div>
        </div>

        {/* ACTION BUTTONS: ENTER LAB & ADMIN LOGIN */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* THE MAIN GLOWING "ENTER LAB" BUTTON */}
          <button
            onClick={onEnterLab}
            className="group relative flex items-center justify-center gap-4 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black text-base sm:text-xl tracking-wider shadow-[0_0_50px_rgba(6,182,212,0.9)] hover:shadow-[0_0_80px_rgba(245,158,11,1)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/60"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-amber-500 opacity-60 blur-lg group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
            <span className="relative z-10 font-black drop-shadow tracking-widest flex items-center gap-2">
              ENTER LAB
            </span>
            <ArrowRight className="relative z-10 w-6 h-6 text-slate-950 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          {/* ADMIN LOGIN SHORTCUT (CLEAN 'Admin Portal' ALONE AS REQUESTED) */}
          <button
            onClick={onOpenAdminLogin}
            className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-2 border-amber-500/50 font-bold font-mono text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:border-amber-400 active:scale-95"
            title="Institutional Master Administrator Login"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
