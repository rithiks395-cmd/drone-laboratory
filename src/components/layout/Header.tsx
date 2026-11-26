import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { 
  Camera, 
  FileText, 
  RotateCcw, 
  Cpu, 
  Activity, 
  Compass, 
  User, 
  Award,
  Search,
  Sun,
  Moon,
  Menu,
  Maximize2,
  Minimize2,
  DownloadCloud,
  Smartphone,
  Wrench
} from 'lucide-react';

interface HeaderProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
}

export const Header: React.FC<HeaderProps> = ({ workspaceRef }) => {
  const {
    activeView,
    experiments,
    resetAllProgress,
    captureScreenshot,
    setIsRecordModalOpen,
    setSelectedReportExpId,
    studentName,
    setStudentName,
    rollNumber,
    setRollNumber,
    openInspection,
    atmosphereTheme,
    toggleAtmosphereTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    setActiveView,
  } = useLab();

  const [fps, setFps] = useState(60);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showStudentEdit, setShowStudentEdit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(loop);
    };
    const req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, []);

  // Track PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('To install this app on your Android or iPhone, tap your browser menu (⋮ or Share) and select "Add to Home screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const completedCount = experiments.filter((e) => e.completed).length;

  const handleCapture = async () => {
    setIsCapturing(true);
    let expId: number | undefined;
    if (activeView.startsWith('exp')) {
      expId = parseInt(activeView.replace('exp', ''), 10);
    }
    await captureScreenshot(workspaceRef.current, expId);
    setIsCapturing(false);
  };

  const handleOpenReport = () => {
    let expId = 1;
    if (activeView.startsWith('exp')) {
      expId = parseInt(activeView.replace('exp', ''), 10);
    }
    setSelectedReportExpId(expId);
    setIsRecordModalOpen(true);
  };

  const isDay = atmosphereTheme === 'day';

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-[#090d19]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
        </button>

        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-glow-cyan shrink-0">
          <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-[#090d19]"></div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-wider text-slate-100 flex items-center gap-1">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent font-black">
                RITHIK'S DRONE LAB
              </span>
              <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                SIMULATOR
              </span>
            </h1>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400 font-mono tracking-tight">
            Aerospace Engineering Virtual Laboratory & 3D Flight Simulator
          </p>
        </div>
      </div>

      {/* Middle Telemetry Badges */}
      <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f172a] border border-cyan-500/30">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">ENGINE:</span>
          <span className="text-emerald-400 font-semibold">{fps} FPS</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f172a] border border-cyan-500/30">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">ATMOSPHERE:</span>
          <span className="text-cyan-300 uppercase">{atmosphereTheme} AIRFIELD</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f172a] border border-cyan-500/30">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">COMPLETED:</span>
          <span className="text-amber-400 font-bold">{completedCount} / 10</span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Hardware Inspector, Capture, Report, Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* HARDWARE ASSEMBLY BENCH SHORTCUT */}
        <button
          onClick={() => setActiveView('hardware-workbench')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shadow-md ${
            activeView === 'hardware-workbench'
              ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-glow-amber ring-1 ring-amber-400/50'
              : 'bg-gradient-to-r from-amber-600/30 to-amber-700/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/40 hover:text-white'
          }`}
          title="Open Virtual Hardware Assembly Workbench & Physical Experiments"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="font-bold tracking-wide">Assembly Lab</span>
        </button>

        {/* PHONE RC TRANSMITTER SHORTCUT */}
        <button
          onClick={() => setActiveView('flight-simulator')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            activeView === 'flight-simulator'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
              : 'bg-slate-800 text-cyan-400 border-cyan-500/40 hover:bg-slate-700'
          }`}
          title="Fly 3D drone using your phone as joystick controller"
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Phone Joystick</span>
        </button>

        {/* DAYTIME / NIGHTTIME ATMOSPHERE SWITCH BUTTON */}
        <button
          onClick={toggleAtmosphereTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            isDay
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md'
              : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
          }`}
          title={isDay ? 'Switch to Night Aerospace HUD' : 'Switch to Daylight Airfield Atmosphere'}
        >
          {isDay ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          <span className="hidden sm:inline">{isDay ? 'Day Airfield' : 'Night HUD'}</span>
        </button>

        {/* 3D Hardware Inspector */}
        <button
          onClick={() => openInspection('Brushless DC Motor')}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          title="Open Photorealistic 3D Component Micro-Inspector"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">3D Inspector</span>
        </button>

        {/* PWA Install / Home Screen Shortcut */}
        <button
          onClick={handleInstallPWA}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          title="Install Web App on Android/iPhone Home Screen"
        >
          <DownloadCloud className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Output Screenshot Button */}
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-semibold shadow-glow-cyan border border-cyan-400/50 transition-all active:scale-95 disabled:opacity-50"
          title="Capture simulation workspace output screenshot"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isCapturing ? 'Capturing...' : 'Screenshot'}</span>
        </button>

        {/* Lab Record Generator Button */}
        <button
          onClick={handleOpenReport}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue border border-blue-400/50 transition-all active:scale-95"
          title="Open Lab Record, Observations & PDF Generator"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Record</span>
        </button>
      </div>
    </header>
  );
};
