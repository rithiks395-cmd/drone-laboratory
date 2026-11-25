import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { QuadcopterModel } from '../3d-models/QuadcopterModel';
import { Save, Wrench, Eye, RotateCw, RotateCcw, Search } from 'lucide-react';

interface QuadPart {
  id: string;
  name: string;
  role: string;
  installed: boolean;
  motorIndex?: number;
  rotationDir?: 'CW' | 'CCW';
  wiringNote: string;
}

export const Exp9QuadcopterAssembly: React.FC = () => {
  const { saveLabRecord, openInspection } = useLab();

  const [parts, setParts] = useState<QuadPart[]>([
    { id: 'frame', name: 'Carbon-Fibre Drone Frame', role: 'Airframe', installed: true, wiringNote: 'Upper and lower plates clamped with titanium M3 hardware' },
    { id: 'm1', name: 'Motor 1 (Rear Right)', role: 'Propulsion', installed: true, motorIndex: 1, rotationDir: 'CCW', wiringNote: 'Connected to ESC 1, CCW rotation, silver locknut' },
    { id: 'm2', name: 'Motor 2 (Front Right)', role: 'Propulsion', installed: true, motorIndex: 2, rotationDir: 'CW', wiringNote: 'Connected to ESC 2, CW rotation, black locknut' },
    { id: 'm3', name: 'Motor 3 (Rear Left)', role: 'Propulsion', installed: true, motorIndex: 3, rotationDir: 'CW', wiringNote: 'Connected to ESC 3, CW rotation, black locknut' },
    { id: 'm4', name: 'Motor 4 (Front Left)', role: 'Propulsion', installed: true, motorIndex: 4, rotationDir: 'CCW', wiringNote: 'Connected to ESC 4, CCW rotation, silver locknut' },
    { id: 'escs', name: 'Electronic Speed Controller (ESC)', role: 'Motor Drivers', installed: true, wiringNote: 'Mounted under arms, phase bullets soldered, signal to FC CH1-4' },
    { id: 'props', name: 'Carbon-Fibre Propeller', role: 'Aerodynamics', installed: true, wiringNote: '2x CW props on M2/M3; 2x CCW props on M1/M4' },
    { id: 'fc', name: 'Flight Controller', role: 'Avionics', installed: true, wiringNote: 'Mounted on anti-vibration rubber bobbins with arrow facing forward' },
    { id: 'gps', name: 'GPS Module', role: 'Navigation', installed: true, wiringNote: 'Elevated 12cm above battery to reject electromagnetic interference' },
    { id: 'battery', name: 'LiPo Battery', role: 'Power', installed: true, wiringNote: 'Central belly strap with high-amp XT60 power connector' },
    { id: 'gear', name: 'Landing Gear', role: 'Landing', installed: true, wiringNote: 'Secured to lower frame plates with shock dampeners' },
    { id: 'pdb', name: 'Power Distribution Board', role: 'Power Bus', installed: true, wiringNote: 'Heavy 4oz copper ground/power bus distributing up to 120A' },
  ]);

  const [explodedFactor, setExplodedFactor] = useState(0.25);
  const [selectedPart, setSelectedPart] = useState<QuadPart>(parts[0]);
  const [spinTest, setSpinTest] = useState(false);
  const [showWiring, setShowWiring] = useState(true);

  const installedCount = parts.filter((p) => p.installed).length;
  const isComplete = installedCount === parts.length && explodedFactor < 0.1;

  const handleAssembleAll = () => {
    setParts((prev) => prev.map((p) => ({ ...p, installed: true })));
    setExplodedFactor(0);
  };

  const handleExplodeAll = () => {
    setExplodedFactor(0.9);
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 9,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        airframeConfiguration: 'Quadcopter-X (450mm Wheelbase)',
        totalAssembledParts: `${installedCount} / ${parts.length}`,
        motor1RearRight: 'CCW Rotation (Silver Nut)',
        motor2FrontRight: 'CW Rotation (Black Nut)',
        motor3RearLeft: 'CW Rotation (Black Nut)',
        motor4FrontLeft: 'CCW Rotation (Silver Nut)',
        flightControllerOrientation: '0° Yaw (Forward Arrow Aligned)',
        gpsCompassSeparation: '12 cm Elevated Mast (EMI Shielded)',
      },
      calculations: {
        reactiveTorqueCancellation: '100% (2 CW + 2 CCW Counter-Rotational)',
        escPowerBusRating: '4x 30A (120A Continuous PDB)',
        airworthinessStatus: isComplete ? 'Flight Ready Certified' : 'Inspection Required',
      },
      resultSummary: 'Quadcopter-X base frame and avionics assembled in 3D. Motor spin directions, ESC wiring channels, and flight controller forward axis were verified.',
    });
    alert('Quadcopter Assembly Report saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 09
          </span>
          <h2 className="text-lg font-bold text-white">Quadcopter-X Base & Avionics Assembly</h2>
          <p className="text-xs text-slate-400">
            Integrate 3K carbon frame, 4 brushless motors with CW/CCW indicators, ESC bus, and GPS mast in photorealistic 3D.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAssembleAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-glow-blue"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Assemble All</span>
          </button>
          <button
            onClick={handleExplodeAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Exploded View</span>
          </button>
          <button
            onClick={handleSaveToRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-cyan"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Lab Record</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left 3D Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="h-[440px] w-full relative">
            <Scene3D cameraPosition={[2.8, 2.2, 2.8]}>
              <QuadcopterModel
                scale={1.2}
                explodedFactor={explodedFactor}
                spinning={spinTest}
                throttle={spinTest ? 45 : 0}
                showWiring={showWiring}
                showMotorLabels={true}
                highlightedComponent={selectedPart.name}
                onSelectComponent={(name) => {
                  const found = parts.find((p) => p.name.includes(name) || name.includes(p.name));
                  if (found) setSelectedPart(found);
                  openInspection(name);
                }}
              />
            </Scene3D>

            {/* Exploded Slider Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 flex items-center gap-4 text-xs">
              <span className="font-mono text-cyan-300 font-bold shrink-0">
                EXPLODED VIEW: {Math.round(explodedFactor * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <button
                onClick={() => setShowWiring(!showWiring)}
                className={`px-2.5 py-1 rounded text-xs font-mono ${
                  showWiring ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showWiring ? 'WIRING ON' : 'WIRING OFF'}
              </button>
              <button
                onClick={() => setSpinTest(!spinTest)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  spinTest ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spinTest ? 'MOTORS ACTIVE' : 'TEST MOTOR ROTATION'}
              </button>
            </div>
          </div>

          {/* Motor Spin Direction Map */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-2 flex items-center justify-between">
              <span>QUAD-X MOTOR ROTATION MATRIX (COUNTER-TORQUE CANCELLATION)</span>
              <span className="text-emerald-400">YAW STABLE</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">M4: FRONT-LEFT</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> CCW (SILVER)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">M2: FRONT-RIGHT</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> CW (BLACK)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">M3: REAR-LEFT</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> CW (BLACK)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">M1: REAR-RIGHT</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> CCW (SILVER)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Component Manifest (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs font-mono">
            <span>AIRWORTHINESS CHECKLIST</span>
            <span className="text-cyan-400 font-bold">
              {installedCount} / {parts.length} Mounted
            </span>
          </div>

          <div className="flex-1 p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar">
            {parts.map((part) => {
              const isSelected = selectedPart.id === part.id;
              return (
                <div
                  key={part.id}
                  onClick={() => {
                    setSelectedPart(part);
                    openInspection(part.name);
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-200 shadow-glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold truncate">{part.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 flex items-center gap-1">
                      <Search className="w-2.5 h-2.5" /> {part.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug">
                    {part.wiringNote}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
