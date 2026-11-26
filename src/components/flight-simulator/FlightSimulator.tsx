import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Grid, Stars, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { QuadcopterModel } from '../3d-models/QuadcopterModel';
import { VirtualJoystick } from '../common/VirtualJoystick';
import { useLab } from '../../context/LabContext';
import { 
  DroneHostConnection, 
  ControllerPacket, 
  TelemetryPacket, 
  generatePairingCode,
  DEFAULT_ROOM_CODE 
} from '../../utils/remoteControllerLink';
import { MobilePairingModal } from '../mobile-controller/MobilePairingModal';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Battery, 
  PlaneTakeoff, 
  PlaneLanding,
  Eye,
  Camera,
  Sun,
  Moon,
  Compass,
  Smartphone,
  Radio,
  CheckCircle2,
  Gamepad2
} from 'lucide-react';

interface DroneFlightState {
  pos: [number, number, number];
  rot: [number, number, number];
  vel: [number, number, number];
  thrust: number;
}

type CameraViewMode = 'CHASE' | 'FPV' | 'ORBIT';

const DroneFlightEntity: React.FC<{
  droneState: DroneFlightState;
  spinning: boolean;
  onUpdate: (state: DroneFlightState) => void;
  isPaused: boolean;
  cameraMode: CameraViewMode;
}> = ({ droneState, spinning, onUpdate, isPaused, cameraMode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (isPaused) return;

    // Multirotor Flight Dynamics
    const gravity = -9.81 * 0.16;
    let [x, y, z] = droneState.pos;
    let [vx, vy, vz] = droneState.vel;
    let [pitch, yaw, roll] = droneState.rot;

    // Aerodynamic thrust vector
    const thrustAcc = droneState.thrust * 0.38;
    const ax = Math.sin(roll) * thrustAcc;
    const ay = Math.cos(pitch) * Math.cos(roll) * thrustAcc + gravity;
    const az = Math.sin(pitch) * thrustAcc;

    // Aerodynamic drag
    vx = (vx + ax * delta) * 0.94;
    vy = (vy + ay * delta) * 0.94;
    vz = (vz + az * delta) * 0.94;

    x += vx * delta * 5;
    y += vy * delta * 5;
    z += vz * delta * 5;

    // Ground collision
    if (y < 0.28) {
      y = 0.28;
      vy = 0;
      vx *= 0.6;
      vz *= 0.6;
    }

    // Auto-level attitude when no cyclic inputs
    pitch *= 0.92;
    roll *= 0.92;

    const nextState: DroneFlightState = {
      pos: [x, y, z],
      rot: [pitch, yaw, roll],
      vel: [vx, vy, vz],
      thrust: droneState.thrust,
    };

    onUpdate(nextState);

    // Camera follow modes
    const camera = state.camera;
    if (cameraMode === 'CHASE') {
      const targetCamPos = new THREE.Vector3(
        x + Math.sin(yaw) * 4.2,
        y + 2.4,
        z + Math.cos(yaw) * 4.2
      );
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(x, y + 0.4, z);
    } else if (cameraMode === 'FPV') {
      camera.position.set(x - Math.sin(yaw) * 0.3, y + 0.1, z - Math.cos(yaw) * 0.3);
      camera.rotation.set(pitch, yaw + Math.PI, roll);
    }
  });

  return (
    <group ref={groupRef} position={droneState.pos} rotation={droneState.rot}>
      <QuadcopterModel
        scale={0.9}
        spinning={spinning}
        throttle={droneState.thrust * 10}
        showWiring={false}
      />
    </group>
  );
};

export const FlightSimulator: React.FC = () => {
  const { atmosphereTheme, toggleAtmosphereTheme, graphicsQuality, isPhoneModalOpen, setIsPhoneModalOpen } = useLab();
  const isDay = atmosphereTheme === 'day';

  const [droneState, setDroneState] = useState<DroneFlightState>({
    pos: [0, 0.28, 0],
    rot: [0, 0, 0],
    vel: [0, 0, 0],
    thrust: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [flightTimeSeconds, setFlightTimeSeconds] = useState(0);
  const [batteryPct, setBatteryPct] = useState(100);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('CHASE');
  const [showTouchJoysticks, setShowTouchJoysticks] = useState(true);

  // Phone remote controller pairing state (default to '1001' for instant pairing)
  const [roomCode, setRoomCode] = useState(() => {
    return localStorage.getItem('uav_active_room_code') || DEFAULT_ROOM_CODE;
  });
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [rxPacketCount, setRxPacketCount] = useState(0);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const hostConnRef = useRef<DroneHostConnection | null>(null);

  // Auto-open modal when requested from Header button
  useEffect(() => {
    if (isPhoneModalOpen) {
      setIsPairingModalOpen(true);
    }
  }, [isPhoneModalOpen]);

  // Keyboard controls tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Initialize Host Connection for mobile remote joystick control
  useEffect(() => {
    const host = new DroneHostConnection(roomCode);
    hostConnRef.current = host;

    host.onStatusChange = (status) => {
      setIsPhoneConnected(status);
    };

    host.onRoomCodeUpdated = (newCode) => {
      setRoomCode(newCode);
    };

    host.onPacketReceived = (packet: ControllerPacket) => {
      setRxPacketCount((c) => (c + 1) % 10000);

      if (packet.takeoff) {
        setDroneState((p) => ({
          ...p,
          pos: [p.pos[0], Math.max(2.5, p.pos[1] + 1.5), p.pos[2]],
          vel: [0, 0.6, 0],
          thrust: 5.4,
        }));
      } else if (packet.land) {
        setDroneState((p) => ({
          ...p,
          thrust: 2.0,
        }));
      } else if (packet.reset) {
        setDroneState({
          pos: [0, 0.28, 0],
          rot: [0, 0, 0],
          vel: [0, 0, 0],
          thrust: 0,
        });
      } else if (packet.cameraToggle) {
        setCameraMode((prev) => (prev === 'CHASE' ? 'FPV' : prev === 'FPV' ? 'ORBIT' : 'CHASE'));
      } else {
        // Direct mobile joystick input stream
        setDroneState((prev) => {
          const nextThrust = Math.max(0, Math.min(10, packet.throttle));
          const nextYaw = prev.rot[1] - (packet.yaw || 0) * 0.08;
          const nextPitch = (packet.pitch || 0) * 0.38;
          const nextRoll = (packet.roll || 0) * 0.38;
          return {
            ...prev,
            rot: [nextPitch, nextYaw, nextRoll],
            thrust: nextThrust,
          };
        });
      }
    };

    return () => {
      host.destroy();
    };
  }, [roomCode]);

  // Telemetry broadcast back to phone (10Hz)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hostConnRef.current) return;
      const altitude = Math.max(0, Math.round((droneState.pos[1] - 0.28) * 10) / 10);
      const speed = Math.round(
        Math.sqrt(droneState.vel[0] ** 2 + droneState.vel[1] ** 2 + droneState.vel[2] ** 2) * 18
      );
      const pitchDeg = Math.round((-droneState.rot[0] * 180) / Math.PI);
      const rollDeg = Math.round((droneState.rot[2] * 180) / Math.PI);
      const headingDeg = Math.round((((droneState.rot[1] * 180) / Math.PI) % 360 + 360) % 360);

      const telemetry: TelemetryPacket = {
        altitude,
        speed,
        batteryPct,
        pitchDeg,
        rollDeg,
        headingDeg,
        flightTimeSeconds,
      };
      hostConnRef.current.sendTelemetry(telemetry);
    }, 100);

    return () => clearInterval(interval);
  }, [droneState, batteryPct, flightTimeSeconds]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Keyboard loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setDroneState((prev) => {
        let [x, y, z] = prev.pos;
        let [pitch, yaw, roll] = prev.rot;
        let thrust = prev.thrust;
        const kp = keysPressed.current;

        // Thrust
        if (kp[' '] || kp['Space']) {
          thrust = Math.min(10, thrust + 0.4);
        } else if (kp['Shift'] || kp['ShiftLeft'] || kp['ShiftRight']) {
          thrust = Math.max(0, thrust - 0.4);
        }

        // Pitch & Roll
        if (kp['w'] || kp['ArrowUp']) pitch = Math.max(-0.4, pitch - 0.08);
        if (kp['s'] || kp['ArrowDown']) pitch = Math.min(0.4, pitch + 0.08);
        if (kp['a']) roll = Math.max(-0.4, roll - 0.08);
        if (kp['d']) roll = Math.min(0.4, roll + 0.08);

        // Yaw
        if (kp['q'] || kp['ArrowLeft']) yaw += 0.06;
        if (kp['e'] || kp['ArrowRight']) yaw -= 0.06;

        return {
          ...prev,
          rot: [pitch, yaw, roll],
          thrust,
        };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Touch Virtual Joystick Handlers (on-screen fallback)
  const handleLeftJoystick = (pos: { x: number; y: number }) => {
    setDroneState((prev) => {
      const nextThrust = Math.max(0, Math.min(10, (pos.y + 1) * 4.5));
      const nextYaw = prev.rot[1] - pos.x * 0.08;
      return {
        ...prev,
        rot: [prev.rot[0], nextYaw, prev.rot[2]],
        thrust: nextThrust,
      };
    });
  };

  const handleRightJoystick = (pos: { x: number; y: number }) => {
    setDroneState((prev) => {
      const nextPitch = -pos.y * 0.38;
      const nextRoll = pos.x * 0.38;
      return {
        ...prev,
        rot: [nextPitch, prev.rot[1], nextRoll],
      };
    });
  };

  // Flight Timer & Battery
  useEffect(() => {
    if (isPaused || droneState.pos[1] <= 0.3) return;

    const timer = setInterval(() => {
      setFlightTimeSeconds((s) => s + 1);
      setBatteryPct((b) => Math.max(0, b - 0.15));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, droneState.pos]);

  const handleTakeoff = () => {
    setDroneState((p) => ({
      ...p,
      pos: [p.pos[0], 2.5, p.pos[2]],
      vel: [0, 0.5, 0],
      thrust: 5.2,
    }));
  };

  const handleLand = () => {
    setDroneState((p) => ({
      ...p,
      thrust: 2.2,
    }));
  };

  const handleReset = () => {
    setDroneState({
      pos: [0, 0.28, 0],
      rot: [0, 0, 0],
      vel: [0, 0, 0],
      thrust: 0,
    });
    setFlightTimeSeconds(0);
    setBatteryPct(100);
  };

  const cycleCameraMode = () => {
    if (cameraMode === 'CHASE') setCameraMode('FPV');
    else if (cameraMode === 'FPV') setCameraMode('ORBIT');
    else setCameraMode('CHASE');
  };

  // Telemetry metrics
  const altitude = Math.max(0, Math.round((droneState.pos[1] - 0.28) * 10) / 10);
  const speed = Math.round(
    Math.sqrt(droneState.vel[0] ** 2 + droneState.vel[1] ** 2 + droneState.vel[2] ** 2) * 18
  );
  const pitchDeg = Math.round((-droneState.rot[0] * 180) / Math.PI);
  const rollDeg = Math.round((droneState.rot[2] * 180) / Math.PI);
  const headingDeg = Math.round((((droneState.rot[1] * 180) / Math.PI) % 360 + 360) % 360);

  return (
    <div className="h-full flex flex-col gap-2 p-2 sm:p-4 text-slate-200 overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>3D Drone Flight Simulator</span>
              {isPhoneConnected ? (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PHONE CONNECTED
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  READY
                </span>
              )}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Control via your phone touchscreen while viewing on this screen!
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PHONE REMOTE CONTROLLER BUTTON */}
          <button
            onClick={() => setIsPairingModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-glow-cyan border ${
              isPhoneConnected
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400'
            }`}
            title="Scan QR Code to operate drone from your mobile phone"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isPhoneConnected ? 'Phone Joystick Active' : '📱 Operate from Phone'}</span>
          </button>

          <button
            onClick={handleTakeoff}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            <PlaneTakeoff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Takeoff</span>
          </button>

          <button
            onClick={handleLand}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            <PlaneLanding className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Land</span>
          </button>

          <button
            onClick={() => setShowTouchJoysticks(!showTouchJoysticks)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-mono transition-all ${
              showTouchJoysticks
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="Toggle On-Screen Virtual Joysticks (Desktop / Mobile)"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Joysticks</span>
          </button>

          <button
            onClick={cycleCameraMode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono"
            title="Toggle Camera View (Chase / FPV / Orbit)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{cameraMode}</span>
          </button>

          <button
            onClick={toggleAtmosphereTheme}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
            title="Toggle Day / Night Sky"
          >
            {isDay ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
            title="Emergency Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas with HUD */}
      <div
        style={{ touchAction: 'none' }}
        className={`relative flex-1 w-full rounded-2xl overflow-hidden border transition-colors duration-500 ${
          isDay
            ? 'border-sky-300/40 bg-gradient-to-b from-[#7dd3fc] to-[#e0f2fe]'
            : 'border-cyan-500/30 bg-gradient-to-b from-[#040814] to-[#010308]'
        }`}
      >
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: graphicsQuality === 'high' }}
          dpr={graphicsQuality === 'high' ? [1, 2] : [1, 1]}
        >
          <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={50} />

          {isDay ? (
            <>
              {/* DAYTIME AIRFIELD SKY */}
              <Sky
                distance={450000}
                sunPosition={[100, 45, 100]}
                inclination={0.49}
                azimuth={0.25}
                turbidity={6}
                rayleigh={1.2}
              />
              <ambientLight intensity={0.8} />
              <directionalLight position={[20, 40, 20]} intensity={1.6} color="#fffbeb" castShadow />
              <hemisphereLight args={['#bae6fd', '#365314', 0.6]} />

              {/* Airfield Green Turf Ground Plane */}
              <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[160, 160]} />
                <meshStandardMaterial color="#2d4a1d" roughness={0.9} />
              </mesh>

              {/* Long Airfield Runway Strip */}
              <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[16, 120]} />
                <meshStandardMaterial color="#1e293b" roughness={0.7} />
              </mesh>
              {/* White Centerline Dashes */}
              {[-50, -35, -20, -5, 10, 25, 40].map((z, i) => (
                <mesh key={i} position={[0, -0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.7, 7]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              ))}
            </>
          ) : (
            <>
              {/* NIGHT AEROSPACE HUD SKY */}
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 15]} intensity={1.2} />
              <pointLight position={[0, 5, 0]} intensity={0.8} color="#00f0ff" />
              <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />

              <Grid
                position={[0, 0, 0]}
                args={[60, 60]}
                cellSize={1}
                cellThickness={0.6}
                cellColor="#1e3a5f"
                sectionSize={5}
                sectionThickness={1.2}
                sectionColor="#00f0ff"
                fadeDistance={45}
                fadeStrength={1.5}
              />
            </>
          )}

          {/* Central Helipad */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.5, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.4, 32]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>

          {/* Flying Drone Entity */}
          <DroneFlightEntity
            droneState={droneState}
            spinning={droneState.thrust > 0 || droneState.pos[1] > 0.3}
            onUpdate={(st) => setDroneState(st)}
            isPaused={isPaused}
            cameraMode={cameraMode}
          />

          {cameraMode === 'ORBIT' && <OrbitControls enableDamping dampingFactor={0.05} />}
        </Canvas>

        {/* HUD Telemetry Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-2 bg-[#0f172a]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <span className="text-slate-400">ALT:</span>
            <span className="text-emerald-400 font-bold">{altitude}m</span>
            <span className="text-slate-400 ml-1">SPD:</span>
            <span className="text-cyan-300 font-bold">{speed}km/h</span>
            <span className="text-slate-400 ml-1">THRUST:</span>
            <span className="text-amber-400 font-bold">{droneState.thrust.toFixed(1)}</span>
          </div>

          {/* Live Mobile Controller Status */}
          {isPhoneConnected && (
            <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-xl shadow-glow-cyan text-[11px] font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>📱 PHONE PAIRED ({rxPacketCount} PKTS)</span>
            </div>
          )}

          <div className="flex items-center gap-3 bg-[#0f172a]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <div className="flex items-center gap-1 text-cyan-300">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.floor(flightTimeSeconds / 60)}:
                {(flightTimeSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Battery className="w-3.5 h-3.5" />
              <span>{Math.round(batteryPct)}%</span>
            </div>
          </div>
        </div>

        {/* Attitude Ladder HUD Card */}
        <div className="absolute top-14 left-3 bg-[#0f172a]/75 backdrop-blur-md border border-cyan-500/30 rounded-xl p-2.5 text-[10px] font-mono pointer-events-none hidden sm:flex flex-col gap-1">
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">PITCH:</span>
            <span className="text-white font-bold">{pitchDeg}°</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">ROLL:</span>
            <span className="text-white font-bold">{rollDeg}°</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">HEADING:</span>
            <span className="text-cyan-300 font-bold">{headingDeg}°</span>
          </div>
        </div>

        {/* Remote Pairing Prompt Callout when not connected */}
        {!isPhoneConnected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a]/95 backdrop-blur-md border border-cyan-400/50 rounded-2xl px-4 py-2 flex items-center gap-3 text-xs font-mono shadow-glow-cyan">
            <Smartphone className="w-5 h-5 text-cyan-400 animate-bounce" />
            <span className="text-slate-200">
              Want to fly from your phone? Click <strong className="text-cyan-300">"📱 Operate from Phone"</strong> above to scan QR code!
            </span>
          </div>
        )}

        {/* On-Screen Touch Joysticks (when on mobile or testing) */}
        {showTouchJoysticks && (
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-auto">
            <div className="bg-[#0a0f1d]/85 backdrop-blur-md p-2 rounded-3xl border border-cyan-500/40 shadow-glow-cyan">
              <VirtualJoystick
                label="THROTTLE / YAW"
                size={115}
                springReturnY={false}
                initialY={-0.8}
                onChange={handleLeftJoystick}
              />
            </div>
            <div className="bg-[#0a0f1d]/85 backdrop-blur-md p-2 rounded-3xl border border-cyan-500/40 shadow-glow-cyan">
              <VirtualJoystick
                label="PITCH / ROLL"
                size={115}
                springReturnY={true}
                onChange={handleRightJoystick}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pairing QR Code Modal */}
      <MobilePairingModal
        roomCode={roomCode}
        isOpen={isPairingModalOpen || isPhoneModalOpen}
        onClose={() => {
          setIsPairingModalOpen(false);
          setIsPhoneModalOpen(false);
        }}
        isPhoneConnected={isPhoneConnected}
      />
    </div>
  );
};
