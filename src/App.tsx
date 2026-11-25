import React, { useRef, useState, useEffect } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { LabReportModal } from './components/layout/LabReportModal';
import { ScreenshotModal } from './components/common/ScreenshotModal';
import { ComponentInspectionModal } from './components/common/ComponentInspectionModal';
import { MobileControllerView } from './components/mobile-controller/MobileControllerView';
import { DEFAULT_ROOM_CODE } from './utils/remoteControllerLink';
import { Smartphone, Gamepad2, ArrowRight } from 'lucide-react';

// Experiment Views
import { Dashboard } from './components/experiments/Dashboard';
import { Exp1WeightPayload } from './components/experiments/Exp1WeightPayload';
import { Exp2FixedWingAssembly } from './components/experiments/Exp2FixedWingAssembly';
import { Exp3ThrustCalibration } from './components/experiments/Exp3ThrustCalibration';
import { Exp4ControlSurfaces } from './components/experiments/Exp4ControlSurfaces';
import { Exp5LiPoBattery } from './components/experiments/Exp5LiPoBattery';
import { Exp6TransmitterCalibration } from './components/experiments/Exp6TransmitterCalibration';
import { Exp7PropellerBalancing } from './components/experiments/Exp7PropellerBalancing';
import { Exp8CenterOfGravity } from './components/experiments/Exp8CenterOfGravity';
import { Exp9QuadcopterAssembly } from './components/experiments/Exp9QuadcopterAssembly';
import { Exp10KK215Programming } from './components/experiments/Exp10KK215Programming';
import { FlightSimulator } from './components/flight-simulator/FlightSimulator';
import { LabRecordsView } from './components/experiments/LabRecordsView';

const MainSimulationRouter: React.FC = () => {
  const { activeView } = useLab();

  switch (activeView) {
    case 'dashboard':
      return <Dashboard />;
    case 'exp1':
      return <Exp1WeightPayload />;
    case 'exp2':
      return <Exp2FixedWingAssembly />;
    case 'exp3':
      return <Exp3ThrustCalibration />;
    case 'exp4':
      return <Exp4ControlSurfaces />;
    case 'exp5':
      return <Exp5LiPoBattery />;
    case 'exp6':
      return <Exp6TransmitterCalibration />;
    case 'exp7':
      return <Exp7PropellerBalancing />;
    case 'exp8':
      return <Exp8CenterOfGravity />;
    case 'exp9':
      return <Exp9QuadcopterAssembly />;
    case 'exp10':
      return <Exp10KK215Programming />;
    case 'flight-simulator':
      return <FlightSimulator />;
    case 'lab-records':
      return <LabRecordsView />;
    default:
      return <Dashboard />;
  }
};

const LabApp: React.FC = () => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { inspectedComponent, closeInspection, openInspection } = useLab();

  // Check if opened as dedicated mobile controller (via QR scan or ?mode=controller)
  const [isMobileControllerMode, setIsMobileControllerMode] = useState(false);
  const [controllerRoomCode, setControllerRoomCode] = useState(DEFAULT_ROOM_CODE);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Check user agent / screen width
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobileDevice(isMobile);

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'controller') {
      setIsMobileControllerMode(true);
      setControllerRoomCode(params.get('room') || DEFAULT_ROOM_CODE);
    }
  }, []);

  // If phone opened the controller link, render full-screen handheld remote controller!
  if (isMobileControllerMode) {
    return (
      <MobileControllerView
        roomCode={controllerRoomCode}
        onExit={() => {
          setIsMobileControllerMode(false);
          // Clean URL without reloading
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#060911] text-slate-100 font-sans">
      {/* MOBILE DEVICE PROMINENT JOYSTICK CALLOUT BANNER (Visible on phones) */}
      {isMobileDevice && (
        <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 p-2.5 px-3 border-b-2 border-cyan-400 flex items-center justify-between z-50 shadow-2xl">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-300 animate-bounce" />
            <div className="text-left">
              <div className="text-xs font-bold font-mono text-white">MOBILE DETECTED</div>
              <div className="text-[10px] text-cyan-200 font-mono">Use phone as Flight Joystick</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileControllerMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-glow-cyan active:scale-95 transition-all"
          >
            <span>LAUNCH CONTROLLER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Engineering Nav Header */}
      <Header workspaceRef={workspaceRef} />

      {/* Main Center Area: Sidebar + Active Simulation Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main
          ref={workspaceRef}
          className="flex-1 h-full overflow-hidden relative bg-[#070b16]"
        >
          <MainSimulationRouter />
        </main>
      </div>

      {/* Persistent Floating Joystick Button on Mobile screens */}
      {isMobileDevice && !isMobileControllerMode && (
        <button
          onClick={() => setIsMobileControllerMode(true)}
          className="fixed bottom-12 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-glow-cyan border-2 border-white active:scale-95 transition-all"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>OPEN JOYSTICK</span>
        </button>
      )}

      {/* Bottom Telemetry Status Bar */}
      <StatusBar />

      {/* Lab Report & Screenshot Modals */}
      <LabReportModal />
      <ScreenshotModal />

      {/* Photorealistic 3D Component Micro-Inspector Modal */}
      <ComponentInspectionModal
        componentName={inspectedComponent}
        onClose={closeInspection}
        onSelectComponent={openInspection}
      />
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <LabApp />
    </LabProvider>
  );
}
