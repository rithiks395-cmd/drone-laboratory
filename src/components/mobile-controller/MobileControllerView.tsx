import React, { useState, useEffect, useRef } from 'react';
import { 
  MobileControllerConnection, 
  ControllerPacket, 
  TelemetryPacket,
  DEFAULT_ROOM_CODE 
} from '../../utils/remoteControllerLink';
import { VirtualJoystick } from '../common/VirtualJoystick';
import { 
  Radio, 
  PlaneTakeoff, 
  PlaneLanding, 
  RotateCcw, 
  Camera, 
  Battery, 
  Clock, 
  Compass, 
  ChevronUp,
  ChevronDown,
  CheckCircle2, 
  Wifi,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface MobileControllerViewProps {
  roomCode?: string;
  onExit?: () => void;
}

export const MobileControllerView: React.FC<MobileControllerViewProps> = ({
  roomCode = DEFAULT_ROOM_CODE,
  onExit,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [packetCount, setPacketCount] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryPacket>({
    altitude: 0,
    speed: 0,
    batteryPct: 100,
    pitchDeg: 0,
    rollDeg: 0,
    headingDeg: 0,
    flightTimeSeconds: 0,
  });

  const connectionRef = useRef<MobileControllerConnection | null>(null);

  // Joystick values (-1 to +1)
  // Left stick starts at idle throttle (y = -0.6)
  const [leftStick, setLeftStick] = useState({ x: 0, y: -0.6 });
  const [rightStick, setRightStick] = useState({ x: 0, y: 0 });
  const [isAirborne, setIsAirborne] = useState(false);

  // Trigger haptic vibration on phone
  const vibrate = (ms = 30) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  };

  useEffect(() => {
    const conn = new MobileControllerConnection(roomCode);
    connectionRef.current = conn;

    conn.onStatusChange = (status) => {
      setIsConnected(status);
      if (status) vibrate(50);
    };

    conn.onTelemetryReceived = (data) => {
      setTelemetry(data);
      if (data.altitude > 0.5) {
        setIsAirborne(true);
      } else if (data.altitude <= 0.3) {
        setIsAirborne(false);
      }
    };

    return () => {
      conn.destroy();
    };
  }, [roomCode]);

  // High-frequency continuous packet stream (30Hz)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectionRef.current) return;

      // Throttle mapped from stick position:
      // y = -1.0 -> 0.0 thrust
      // y = -0.6 -> 1.8 thrust (idle ground)
      // y = 0.15 -> 5.2 thrust (stable hover)
      // y = +1.0 -> 9.2 thrust (rapid climb)
      const throttleVal = Math.max(0, Math.min(10, (leftStick.y + 1) * 4.6));

      const packet: ControllerPacket = {
        throttle: throttleVal,
        yaw: leftStick.x,
        pitch: -rightStick.y, // Push stick forward -> pitch down (forward flight)
        roll: rightStick.x,   // Push stick right -> bank right
        timestamp: Date.now(),
      };

      connectionRef.current.sendPacket(packet);
      setPacketCount((c) => (c + 1) % 1000);
    }, 33);

    return () => clearInterval(interval);
  }, [leftStick, rightStick]);

  // Command buttons (Takeoff, Land, Reset, Camera)
  const handleCommand = (action: 'takeoff' | 'land' | 'reset' | 'camera') => {
    vibrate(50);
    if (!connectionRef.current) return;

    if (action === 'takeoff') {
      setIsAirborne(true);
      // Automatically position throttle stick to stable hover level (5.2 thrust)
      setLeftStick({ x: 0, y: 0.15 });
    } else if (action === 'land') {
      setIsAirborne(false);
      // Bring throttle stick down to idle
      setLeftStick({ x: 0, y: -0.6 });
    } else if (action === 'reset') {
      setIsAirborne(false);
      setLeftStick({ x: 0, y: -0.6 });
      setRightStick({ x: 0, y: 0 });
    }

    const packet: ControllerPacket = {
      throttle: action === 'takeoff' ? 5.2 : action === 'land' ? 1.5 : 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      takeoff: action === 'takeoff',
      land: action === 'land',
      reset: action === 'reset',
      cameraToggle: action === 'camera',
      timestamp: Date.now(),
    };

    connectionRef.current.sendPacket(packet);
  };

  // Nudge throttle up/down
  const adjustThrottle = (delta: number) => {
    vibrate(20);
    setLeftStick((prev) => ({
      ...prev,
      y: Math.max(-1, Math.min(1, Math.round((prev.y + delta) * 100) / 100)),
    }));
  };

  const calculatedThrust = Math.round(Math.max(0, Math.min(10, (leftStick.y + 1) * 4.6)) * 10) / 10;

  return (
    <div
      style={{ touchAction: 'none' }}
      className="fixed inset-0 z-50 bg-[#060911] text-slate-100 flex flex-col justify-between p-2 sm:p-3 select-none overflow-hidden font-sans"
    >
      {/* Top Header & Connection Bar */}
      <header className="flex items-center justify-between border-b border-cyan-500/30 pb-2 bg-[#090e1c] px-3 py-1.5 rounded-xl shadow-lg">
        {/* Pairing Status */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <div>
            <div className="text-xs font-bold font-mono flex items-center gap-1.5">
              <span className={isConnected ? 'text-emerald-300' : 'text-amber-300'}>
                {isConnected ? 'ONLINE • READY TO FLY' : 'LINKING TO PC...'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PIN: {roomCode}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Streaming inputs to laptop screen ({packetCount})</span>
            </div>
          </div>
        </div>

        {/* Telemetry quick badge & Exit */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{Math.round(telemetry.batteryPct)}%</span>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700"
            >
              Lab
            </button>
          )}
        </div>
      </header>

      {/* Mirrored Telemetry HUD */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-1 text-center font-mono text-xs">
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-cyan-500/20">
          <span className="text-[9px] text-slate-400 block">ALTITUDE</span>
          <span className="text-sm sm:text-base font-bold text-emerald-400">{telemetry.altitude}m</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-cyan-500/20">
          <span className="text-[9px] text-slate-400 block">SPEED</span>
          <span className="text-sm sm:text-base font-bold text-cyan-300">{telemetry.speed}km/h</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-cyan-500/20">
          <span className="text-[9px] text-slate-400 block">THRUST</span>
          <span className="text-sm sm:text-base font-bold text-amber-300">{calculatedThrust} / 10</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-cyan-500/20">
          <span className="text-[9px] text-slate-400 block">ATTITUDE</span>
          <span className="text-xs sm:text-xs font-bold text-white">
            {telemetry.pitchDeg}° / {telemetry.rollDeg}°
          </span>
        </div>
      </div>

      {/* Flight Control Action Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
        {/* TAKEOFF BUTTON */}
        <button
          onClick={() => handleCommand('takeoff')}
          className="flex-1 max-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono shadow-glow-cyan active:scale-95 transition-all"
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>TAKEOFF</span>
        </button>

        {/* LAND BUTTON */}
        <button
          onClick={() => handleCommand('land')}
          className="flex-1 max-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono shadow-glow-blue active:scale-95 transition-all"
        >
          <PlaneLanding className="w-4 h-4" />
          <span>LAND</span>
        </button>

        {/* CAMERA TOGGLE */}
        <button
          onClick={() => handleCommand('camera')}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
          title="Toggle Chase / FPV / Orbit Camera"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">VIEW</span>
        </button>

        {/* EMERGENCY RESET */}
        <button
          onClick={() => handleCommand('reset')}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-mono border border-rose-700/60 active:scale-95 transition-all flex items-center gap-1"
          title="Emergency Stop & Reset"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>

      {/* Dual Touchscreen Gimbals for Pilot's Thumbs */}
      <div className="flex items-center justify-between px-1 sm:px-6 py-1 my-auto">
        {/* Left Stick: Throttle & Yaw */}
        <div className="flex flex-col items-center">
          <div className="bg-[#0b1224] p-2.5 sm:p-3 rounded-full border-2 border-cyan-500/50 shadow-glow-cyan">
            <VirtualJoystick
              label="THROTTLE / YAW"
              subLabel="LEFT"
              size={140}
              springReturnY={false}
              initialY={leftStick.y}
              value={leftStick}
              onChange={(pos) => setLeftStick(pos)}
            />
          </div>

          {/* Quick Throttle Step Buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => adjustThrottle(0.15)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-95 text-[10px] font-mono flex items-center"
              title="Throttle Up"
            >
              <ChevronUp className="w-3.5 h-3.5" /> +THR
            </button>
            <button
              onClick={() => setLeftStick({ x: 0, y: 0.15 })}
              className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 active:scale-95 text-[10px] font-mono font-bold"
              title="Set Stable Hover Throttle"
            >
              HOVER
            </button>
            <button
              onClick={() => adjustThrottle(-0.15)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 text-[10px] font-mono flex items-center"
              title="Throttle Down"
            >
              <ChevronDown className="w-3.5 h-3.5" /> -THR
            </button>
          </div>
        </div>

        {/* Center Pilot Guide */}
        <div className="hidden sm:flex flex-col items-center text-center text-[10px] font-mono text-slate-400 max-w-[130px] px-1">
          <Compass className="w-6 h-6 text-cyan-400 mb-1 animate-spin-slow" />
          <span className="font-bold text-cyan-300">WATCH LAPTOP</span>
          <span className="text-[9px] text-slate-500 mt-0.5">Drone responds live to thumb motion</span>
        </div>

        {/* Right Stick: Pitch & Roll (Cyclic Attitude) */}
        <div className="flex flex-col items-center">
          <div className="bg-[#0b1224] p-2.5 sm:p-3 rounded-full border-2 border-cyan-500/50 shadow-glow-cyan">
            <VirtualJoystick
              label="PITCH / ROLL"
              subLabel="RIGHT"
              size={140}
              springReturnY={true}
              onChange={(pos) => setRightStick(pos)}
            />
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400">
            <span>CYCLIC GIMBAL</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Ribbon */}
      <footer className="text-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between px-3">
        <span className="flex items-center gap-1 text-cyan-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Local Wi-Fi Relay Active</span>
        </span>
        <span className="text-slate-400">Hold phone horizontally</span>
      </footer>
    </div>
  );
};
