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
  ShieldCheck,
  FileDown
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
    isPhoneModalOpen,
    setIsPhoneModalOpen,
    isOfflineExamMode,
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
    <header className="h-16 border-b border-cyan-500/20 bg-[#070b16]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0 shadow-lg select-none">
      {/* LEFT SECTION: Brand Logo & Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
                AERO - SPACE LAB
              </span>
              <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                SIMULATOR
              </span>
            </h1>
          </div>
          <p className="hidden 2xl:block text-[10px] text-slate-400 font-mono tracking-tight">
            Aerospace Virtual Laboratory & 3D Flight Simulator
          </p>
        </div>
      </div>

      {/* CENTER SECTION: Cleanly Spaced Primary Navigation and Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* IN OFFLINE EXAM MODE: ONLY ESSENTIAL WORKBENCH CONTROLS */}
        {!isOfflineExamMode && onReturnToIntro && (
          <button
            onClick={onReturnToIntro}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0"
            title="Return to Welcome Intro Screen"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Intro Page</span>
          </button>
        )}

        {/* Assembly Lab Workbench (Only visible in online mode since offline is exclusively workbench) */}
        {!isOfflineExamMode && (
          <button
            onClick={() => setActiveView('hardware-workbench')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shadow-md cursor-pointer shrink-0 ${
              activeView === 'hardware-workbench'
                ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50'
                : 'bg-gradient-to-r from-amber-600/30 to-amber-700/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/40 hover:text-white'
            }`}
            title="Open Virtual Hardware Assembly Workbench & 3D Components"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="font-bold tracking-wide">Assembly Lab</span>
          </button>
        )}

        {/* Phone Joystick Controller (Online only) */}
        {!isOfflineExamMode && (
          <button
            onClick={() => {
              setActiveView('flight-simulator');
              setIsPhoneModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 cursor-pointer shadow-md active:scale-95 ${
              activeView === 'flight-simulator'
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-800/90 text-cyan-400 border-cyan-500/40 hover:bg-slate-700 hover:border-cyan-300'
            }`}
            title="Fly 3D drone using your phone as joystick controller"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold">Phone Joystick</span>
          </button>
        )}

        {/* Daytime / Nighttime Atmosphere Switch */}
        <button
          onClick={toggleAtmosphereTheme}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 ${
            isDay
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
              : 'bg-slate-800/90 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
          }`}
          title={isDay ? 'Switch to Night Aerospace HUD' : 'Switch to Daylight Airfield'}
        >
          {isDay ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          <span className="hidden xl:inline">{isDay ? 'Day' : 'Night'}</span>
        </button>

        {/* 3D Hardware Micro-Inspector (Online only) */}
        {!isOfflineExamMode && (
          <button
            onClick={() => openInspection('Brushless DC Motor')}
            className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shrink-0"
            title="Open Photorealistic 3D Component Micro-Inspector"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D View</span>
          </button>
        )}

        {/* Screenshot Capture Button (Online only) */}
        {!isOfflineExamMode && (
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold shadow-glow-cyan border border-cyan-400/60 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="Capture simulation workspace output screenshot"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">{isCapturing ? '...' : 'Screenshot'}</span>
          </button>
        )}

        {/* Lab Record Generator Button: STRICTLY HIDDEN IN OFFLINE EXAM MODE */}
        {!isOfflineExamMode && (
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue border border-blue-400/60 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Open Lab Record, Observations & PDF Generator"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Record</span>
          </button>
        )}

        {/* Whole Project Word Documentation (.docx) Download Button (Online only) */}
        {!isOfflineExamMode && (
          <a
            href="/Aero_Space_Simulator_Project_Documentation.docx"
            download="Aero_Space_Simulator_Project_Documentation.docx"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/60 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Download Whole Project Documentation in Word (.docx) Format"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0 text-emerald-100" />
            <span className="hidden lg:inline">Word Doc</span>
          </a>
        )}

        {/* Fullscreen Icon Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Install PWA Icon Button (Online only) */}
        {!isOfflineExamMode && (
          <button
            onClick={handleInstallPWA}
            className="hidden md:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0"
            title="Install Web App on Android/iPhone Home Screen"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* RIGHT SECTION: USER ACCOUNT SYMBOL, USER DETAILS & LOGOUT (Firmly unshrinkable, clean spacing) */}
      <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-slate-700/80">
        {/* Admin Portal Button if user has Master Admin role */}
        {isAdmin && (
          <button
            onClick={() => setIsAdminPortalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/80 text-xs font-mono font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer shrink-0"
            title="Open Master Administrator Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Admin Portal</span>
          </button>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2 shrink-0">
            {/* User Account Pill with Symbol & Details */}
            <div 
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm shrink-0"
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)] shrink-0">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              <div className="text-left font-mono">
                <div className="text-[11px] font-bold text-white max-w-[90px] sm:max-w-[120px] truncate leading-tight">
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
              <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
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
            <span className="tracking-wide">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
