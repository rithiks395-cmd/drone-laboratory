import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Camera, 
  FileText, 
  Compass, 
  User, 
  Search,
  Sun,
  Moon,
  Menu,
  Maximize2,
  Minimize2,
  DownloadCloud,
  Smartphone,
  Wrench,
  Home,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  onReturnToIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ workspaceRef, onReturnToIntro }) => {
  const { currentUser, isAdmin, logout, setIsAuthModalOpen, setIsAdminPortalOpen } = useAuth();
  const {
    activeView,
    captureScreenshot,
    setIsRecordModalOpen,
    setSelectedReportExpId,
    openInspection,
    atmosphereTheme,
    toggleAtmosphereTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    setActiveView,
  } = useLab();

  const [isCapturing, setIsCapturing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
    <header className="h-16 border-b border-cyan-500/20 bg-[#070b16]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0 shadow-lg">
      {/* LEFT SECTION: Brand Logo & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
        </button>

        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center shadow-glow-cyan shrink-0">
          <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-[#070b16]"></div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wider text-slate-100 flex items-center gap-1">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent font-black">
                RITHIK'S DRONE LAB
              </span>
              <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                SIMULATOR
              </span>
            </h1>
          </div>
          <p className="hidden xl:block text-[10px] text-slate-400 font-mono tracking-tight">
            Aerospace Virtual Laboratory & 3D Flight Simulator
          </p>
        </div>
      </div>

      {/* CENTER SECTION: Primary Lab Action Tools (Optimized spacing so right side never overflows) */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-hidden">
        {/* Intro Page Return */}
        {onReturnToIntro && (
          <button
            onClick={onReturnToIntro}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0"
            title="Return to Rithik's Aero-Space Laboratory Welcome Intro Screen"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Intro Page</span>
          </button>
        )}

        {/* Assembly Lab Workbench (Highlighted prominent button) */}
        <button
          onClick={() => setActiveView('hardware-workbench')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shadow-md cursor-pointer shrink-0 ${
            activeView === 'hardware-workbench'
              ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50'
              : 'bg-gradient-to-r from-amber-600/30 to-amber-700/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/40 hover:text-white'
          }`}
          title="Open Virtual Hardware Assembly Workbench & 3D Components"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="font-bold tracking-wide">Assembly Lab</span>
        </button>

        {/* Phone Joystick Controller */}
        <button
          onClick={() => setActiveView('flight-simulator')}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 ${
            activeView === 'flight-simulator'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
              : 'bg-slate-800/90 text-cyan-400 border-cyan-500/30 hover:bg-slate-700'
          }`}
          title="Fly 3D drone using your phone as joystick controller"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Phone Joystick</span>
        </button>

        {/* Daytime / Nighttime Atmosphere Switch */}
        <button
          onClick={toggleAtmosphereTheme}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 ${
            isDay
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
              : 'bg-slate-800/90 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
          }`}
          title={isDay ? 'Switch to Night Aerospace HUD' : 'Switch to Daylight Airfield'}
        >
          {isDay ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          <span className="hidden xl:inline">{isDay ? 'Day' : 'Night'}</span>
        </button>

        {/* 3D Hardware Micro-Inspector */}
        <button
          onClick={() => openInspection('Brushless DC Motor')}
          className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shrink-0"
          title="Open Photorealistic 3D Component Micro-Inspector"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D View</span>
        </button>

        {/* Screenshot Capture Button */}
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-semibold shadow-glow-cyan border border-cyan-400/50 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          title="Capture simulation workspace output screenshot"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isCapturing ? '...' : 'Screenshot'}</span>
        </button>

        {/* Lab Record Generator Button */}
        <button
          onClick={handleOpenReport}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue border border-blue-400/50 transition-all active:scale-95 cursor-pointer shrink-0"
          title="Open Lab Record, Observations & PDF Generator"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Record</span>
        </button>

        {/* Fullscreen Icon Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Install PWA Icon Button */}
        <button
          onClick={handleInstallPWA}
          className="hidden sm:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0"
          title="Install Web App on Android/iPhone Home Screen"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT SECTION: USER ACCOUNT SYMBOL, USER DETAILS & LOGOUT (Unshrinkable, always prominently visible) */}
      <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-700/80">
        {/* Admin Portal Button if user has Master Admin role */}
        {isAdmin && (
          <button
            onClick={() => setIsAdminPortalOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/80 text-xs font-mono font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer shrink-0"
            title="Open Master Administrator Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Portal</span>
          </button>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2">
            {/* User Account Pill with Symbol & Details */}
            <div 
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm"
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              {/* Account Symbol Avatar */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              {/* User Account Details */}
              <div className="text-left font-mono">
                <div className="text-[11px] font-bold text-white max-w-[100px] sm:max-w-[130px] truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-cyan-300 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
                  <span className="uppercase font-semibold tracking-wider">
                    {currentUser.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                  </span>
                </div>
              </div>
            </div>

            {/* HIGH-VISIBILITY LOGOUT BUTTON WITH ICON AND TEXT */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 hover:border-rose-400 text-xs font-mono font-bold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer active:scale-95 shrink-0"
              title="Sign Out of Laboratory Account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline font-bold">Logout</span>
            </button>
          </div>
        ) : (
          /* Sign In / Account Button when logged out */
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-mono font-bold shadow-glow-cyan transition-all cursor-pointer active:scale-95 shrink-0"
            title="Log in or Register Student Account"
          >
            <User className="w-3.5 h-3.5 text-slate-950" />
            <span className="tracking-wide">Sign In / Account</span>
          </button>
        )}
      </div>
    </header>
  );
};
