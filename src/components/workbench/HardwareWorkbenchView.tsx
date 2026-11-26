import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useLab } from '../../context/LabContext';
import { 
  Wrench, 
  Layers, 
  Cpu, 
  BatteryCharging, 
  Disc, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Info, 
  Gauge, 
  Activity, 
  Sliders, 
  Search,
  Eye,
  Camera
} from 'lucide-react';

// 3D Models
import { QuadcopterModel } from '../3d-models/QuadcopterModel';
import { FixedWingModel } from '../3d-models/FixedWingModel';
import { BLDCMotorModel } from '../3d-models/BLDCMotorModel';
import { ESCModel } from '../3d-models/ESCModel';
import { PropellerModel } from '../3d-models/PropellerModel';
import { LiPoBatteryModel } from '../3d-models/LiPoBatteryModel';
import { KK215BoardModel } from '../3d-models/KK215BoardModel';
import { BalanceStandModel } from '../3d-models/BalanceStandModel';
import { ServoMotorModel } from '../3d-models/ServoMotorModel';

type ExperimentMode = 
  | 'quadcopter_assembly' 
  | 'thrust_calibration' 
  | 'propeller_balancing' 
  | 'fixed_wing_assembly' 
  | 'lipo_maintenance' 
  | 'transmitter_binding';

interface ComponentItem {
  id: string;
  name: string;
  category: 'Mechanical' | 'Propulsion' | 'Avionics' | 'Power' | 'Instrumentation';
  model: string;
  specs: string;
  weightG: number;
  qty: number;
  forExperiments: number[];
  installed: boolean;
  requiredFor: ExperimentMode[];
}

export const HardwareWorkbenchView: React.FC = () => {
  const { openInspection, setIsRecordModalOpen, setSelectedReportExpId, captureScreenshot, atmosphereTheme } = useLab();
  const isDay = atmosphereTheme === 'day';
  const workbenchRef = useRef<HTMLDivElement>(null);

  // Selected Lab Mode
  const [activeMode, setActiveMode] = useState<ExperimentMode>('quadcopter_assembly');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [explodeRatio, setExplodeRatio] = useState(0);

  // Live Experiment Test Controls
  const [testThrottle, setTestThrottle] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[]; notes: string[] } | null>(null);

  // All Separate Laboratory Components
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 'frame_f450',
      name: 'F450 Quad-X Carbon Frame Plates',
      category: 'Mechanical',
      model: 'F450 Center Glass-Fiber PCB with Integrated Power Distribution',
      specs: 'Wheelbase: 450mm, Dual 1.5mm PCB plates, Integrated 40A PDB rails',
      weightG: 180,
      qty: 1,
      forExperiments: [1, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly'],
    },
    {
      id: 'arms_f450',
      name: 'F450 High-Strength Arm Struts (x4)',
      category: 'Mechanical',
      model: 'PA66 Composite Ultra-Rigid Arms (2 Red Front / 2 White Rear)',
      specs: 'Length: 215mm, Motor mount PCD: 16-19-25mm, Brass screw inserts',
      weightG: 210,
      qty: 4,
      forExperiments: [1, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly'],
    },
    {
      id: 'bldc_motors',
      name: 'A2212 1000KV Brushless DC Motors (x4)',
      category: 'Propulsion',
      model: 'A2212/13T 14-Pole Outrunner Motor (2 CW / 2 CCW Threaded Shafts)',
      specs: 'KV: 1000 RPM/V, Max Current: 12A/60s, Stator: 22x12mm, Shaft: 3.17mm',
      weightG: 190,
      qty: 4,
      forExperiments: [1, 3, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly', 'thrust_calibration'],
    },
    {
      id: 'esc_30a',
      name: 'SimonK 30A High-Speed ESCs (x4)',
      category: 'Propulsion',
      model: '30A Brushless ESC with 5V/2A Linear BEC & 3-Phase Bullet Jacks',
      specs: 'Continuous: 30A, Peak: 40A (10s), 2S-3S LiPo support, PWM 400Hz',
      weightG: 100,
      qty: 4,
      forExperiments: [1, 3, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly', 'thrust_calibration'],
    },
    {
      id: 'props_1045',
      name: '1045 Carbon-Reinforced Propellers (x4)',
      category: 'Propulsion',
      model: '10x4.5 inch 2-Blade Propeller Set (2 CW Pusher / 2 CCW Tractor)',
      specs: 'Diameter: 10 inch, Pitch: 4.5 inch, Center Hub: 6mm with adapter rings',
      weightG: 48,
      qty: 4,
      forExperiments: [1, 3, 7, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly', 'thrust_calibration', 'propeller_balancing'],
    },
    {
      id: 'fc_kk215',
      name: 'KK 2.1.5 LCD Flight Controller Board',
      category: 'Avionics',
      model: 'KK2.1.5 Multi-Rotor Control Board with Graphic LCD & Atmel 644PA',
      specs: 'Sensors: InvenSense MPU6050 6-DOF Gyro/Accel, 8 Motor outputs, 5 Inputs',
      weightG: 22,
      qty: 1,
      forExperiments: [9, 10],
      installed: true,
      requiredFor: ['quadcopter_assembly'],
    },
    {
      id: 'rc_receiver',
      name: 'FS-iA6B 6-Channel 2.4GHz Receiver',
      category: 'Avionics',
      model: 'FlySky 2.4GHz AFHDS 2A PWM/SBUS Receiver with Dual Diversity Antenna',
      specs: 'Channels: 6 PWM / 14 i-BUS, RF Range: 500-1500m, Sensitivity: -105dBm',
      weightG: 14,
      qty: 1,
      forExperiments: [6, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly', 'transmitter_binding'],
    },
    {
      id: 'lipo_3s',
      name: 'Turnigy 3S 2200mAh 25C LiPo Battery',
      category: 'Power',
      model: '3-Cell 11.1V Lithium-Polymer Pack with XT60 & JST-XH Balance Lead',
      specs: 'Voltage: 11.1V (12.6V Full), Capacity: 2200mAh, Discharge: 25C Continuous',
      weightG: 185,
      qty: 1,
      forExperiments: [1, 3, 5, 9],
      installed: true,
      requiredFor: ['quadcopter_assembly', 'thrust_calibration', 'lipo_maintenance'],
    },
    {
      id: 'thrust_rig',
      name: 'Digital Load-Cell Thrust Stand Rig',
      category: 'Instrumentation',
      model: 'Dual-Rail Linear Thrust Measurement Stand with 5kg Digital Strain Gauge',
      specs: 'Range: 0 - 5000g ±1g, Optical Tachometer: 10 - 30000 RPM, Current Shunt: 30A',
      weightG: 650,
      qty: 1,
      forExperiments: [3],
      installed: activeMode === 'thrust_calibration',
      requiredFor: ['thrust_calibration'],
    },
    {
      id: 'prop_balancer',
      name: 'Magnetic Levitation Propeller Balancer',
      category: 'Instrumentation',
      model: 'Frictionless Dual Rare-Earth Magnetic Suspension Stand with Tapered Shaft',
      specs: 'Sensitivity: <0.1g imbalance, Shaft: Hardened steel with centering cones',
      weightG: 240,
      qty: 1,
      forExperiments: [7],
      installed: activeMode === 'propeller_balancing',
      requiredFor: ['propeller_balancing'],
    },
    {
      id: 'fixed_wing_airframe',
      name: 'Trainer Fixed-Wing EPO Airframe',
      category: 'Mechanical',
      model: 'High-Wing Aerodynamic Trainer Fuselage with Carbon Spar & Tailplane',
      specs: 'Wingspan: 1200mm, Chord: 180mm, Airfoil: Clark-Y, Aspect Ratio: 6.67',
      weightG: 380,
      qty: 1,
      forExperiments: [2, 4, 8],
      installed: activeMode === 'fixed_wing_assembly',
      requiredFor: ['fixed_wing_assembly'],
    },
    {
      id: 'servos_9g',
      name: 'SG90 9g Micro Servos & Linkages (x4)',
      category: 'Avionics',
      model: '9g Analog Micro Servos with Nylon Control Horns & Steel Pushrod Clevises',
      specs: 'Torque: 1.8 kg-cm @ 4.8V, Speed: 0.10s/60°, Operating Angle: 180°',
      weightG: 36,
      qty: 4,
      forExperiments: [2, 4],
      installed: activeMode === 'fixed_wing_assembly',
      requiredFor: ['fixed_wing_assembly'],
    },
    {
      id: 'lipo_charger_imax',
      name: 'IMAX B6 Microprocessor Balance Charger',
      category: 'Instrumentation',
      model: 'Digital Multi-Chemistry 80W Charger with Individual Cell Balancer',
      specs: 'Charge Current: 0.1 - 6.0A, Cell Count: 1-6S LiPo, LCD Status Display',
      weightG: 280,
      qty: 1,
      forExperiments: [5],
      installed: activeMode === 'lipo_maintenance',
      requiredFor: ['lipo_maintenance'],
    },
    {
      id: 'rc_transmitter_tx',
      name: 'FS-i6 6-Channel 2.4GHz Transmitter',
      category: 'Avionics',
      model: 'Dual-Gimbal 6-Channel Mode 2 Digital Proportional Radio Controller',
      specs: 'Frequency: 2.408 - 2.475GHz, Bandwidth: 500KHz, Telemetry LCD display',
      weightG: 390,
      qty: 1,
      forExperiments: [6],
      installed: activeMode === 'transmitter_binding',
      requiredFor: ['transmitter_binding'],
    },
  ]);

  // Toggle installation of a component
  const toggleInstall = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, installed: !c.installed } : c))
    );
    setValidationResult(null);
  };

  // Switch Lab Practical Mode
  const handleModeChange = (mode: ExperimentMode) => {
    setActiveMode(mode);
    setIsTestRunning(false);
    setTestThrottle(0);
    setValidationResult(null);

    // Auto-setup recommended components for that experiment
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        installed: c.requiredFor.includes(mode),
      }))
    );
  };

  // Validate the assembled physical hardware
  const handleValidateAssembly = () => {
    const requiredItems = components.filter((c) => c.requiredFor.includes(activeMode));
    const missing = requiredItems.filter((c) => !c.installed);

    const errors: string[] = [];
    const notes: string[] = [];

    if (missing.length > 0) {
      missing.forEach((m) => {
        errors.push(`Missing Required Component: "${m.name}". Mount it from the parts tray.`);
      });
    }

    if (activeMode === 'quadcopter_assembly') {
      const hasMotors = components.find((c) => c.id === 'bldc_motors')?.installed;
      const hasEscs = components.find((c) => c.id === 'esc_30a')?.installed;
      const hasFC = components.find((c) => c.id === 'fc_kk215')?.installed;
      const hasBattery = components.find((c) => c.id === 'lipo_3s')?.installed;

      if (hasMotors && hasEscs) notes.push('3-Phase Motor wiring: ESC leads connected with bullet plugs.');
      if (hasFC) notes.push('KK2.1.5 Flight Controller aligned with forward arrow facing Motor 1 / 2 axis.');
      if (hasBattery) notes.push('LiPo Battery secured with velcro straps on center mass.');
    } else if (activeMode === 'thrust_calibration') {
      notes.push('Load-cell strain gauge calibrated to 0.0g tare before motor spin.');
      notes.push('Optical tachometer laser aligned with motor bell reflective marker.');
    } else if (activeMode === 'propeller_balancing') {
      notes.push('Frictionless magnetic suspension leveled on horizontal plane.');
    }

    const isValid = errors.length === 0;
    setValidationResult({ valid: isValid, errors, notes });
  };

  // Run the physical experiment simulation
  const handleRunExperiment = () => {
    handleValidateAssembly();
    setIsTestRunning(true);
    setTestThrottle(45);
  };

  // Filtered components list
  const filteredComponents = components.filter(
    (c) => activeCategory === 'All' || c.category === activeCategory
  );

  // Installed weight calculation
  const totalInstalledWeight = components
    .filter((c) => c.installed)
    .reduce((sum, c) => sum + c.weightG, 0);

  // Dynamic readings during physical test
  const testRPM = Math.round(testThrottle * 98);
  const testThrustG = Math.round((testThrottle / 100) ** 1.8 * 880);
  const testCurrentA = Math.round((testThrottle / 100) * 12.8 * 10) / 10;
  const testVoltageV = Math.round((11.8 - (testCurrentA / 15) * 0.8) * 10) / 10;
  const testPowerW = Math.round(testCurrentA * testVoltageV);

  return (
    <div ref={workbenchRef} className="h-full flex flex-col bg-[#070b16] text-slate-100 overflow-hidden font-sans">
      {/* Top Engineering Mode Bar */}
      <div className="bg-[#0b101f] border-b border-cyan-500/25 p-3 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>VIRTUAL HARDWARE WORKBENCH & ASSEMBLY LAB</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                10 LAB MODULES
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Assemble genuine UAV hardware parts and execute laboratory experiments in real-time 3D
            </p>
          </div>
        </div>

        {/* Lab Practical Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => handleModeChange('quadcopter_assembly')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'quadcopter_assembly'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Quadcopter-X (EXP 9 & 10)
          </button>
          <button
            onClick={() => handleModeChange('thrust_calibration')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'thrust_calibration'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Thrust Rig (EXP 3)
          </button>
          <button
            onClick={() => handleModeChange('propeller_balancing')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'propeller_balancing'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Prop Balancer (EXP 7)
          </button>
          <button
            onClick={() => handleModeChange('fixed_wing_assembly')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'fixed_wing_assembly'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Fixed-Wing (EXP 2 & 4)
          </button>
          <button
            onClick={() => handleModeChange('lipo_maintenance')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'lipo_maintenance'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            LiPo Test (EXP 5)
          </button>
          <button
            onClick={() => handleModeChange('transmitter_binding')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeMode === 'transmitter_binding'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            RC Radio (EXP 6)
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Hardware Components Tray (Storage Bin) */}
        <div className="w-80 md:w-96 bg-[#090e1c] border-r border-slate-800 flex flex-col shrink-0">
          {/* Header & Category Filters */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>LAB PARTS STORAGE TRAY</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {components.filter((c) => c.installed).length} / {components.length} Mounted
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono pb-1">
              {['All', 'Mechanical', 'Propulsion', 'Avionics', 'Power', 'Instrumentation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Components List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredComponents.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all text-xs font-mono flex flex-col gap-1.5 ${
                  item.installed
                    ? 'bg-[#0e172e] border-cyan-500/40 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.installed ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-white text-[11px] truncate max-w-[200px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                    {item.weightG}g
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-1">{item.model}</p>
                <div className="text-[9px] text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 truncate">
                  {item.specs}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => openInspection(item.name)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    title="Inspect 3D CAD micro-details"
                  >
                    <Search className="w-3 h-3" />
                    <span>Micro-Inspect</span>
                  </button>

                  <button
                    onClick={() => toggleInstall(item.id)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-transform active:scale-95 flex items-center gap-1 ${
                      item.installed
                        ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                    }`}
                  >
                    {item.installed ? (
                      <>
                        <Trash2 className="w-3 h-3" /> Remove
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Snap to Bench
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Installed Mass Summary */}
          <div className="p-3 border-t border-slate-800 bg-[#070b16] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">BENCH TOTAL WEIGHT:</span>
            <span className="text-cyan-300 font-bold text-sm">{totalInstalledWeight} grams</span>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive 3D Assembly Stage */}
        <div className="flex-1 flex flex-col relative bg-[#060911] overflow-hidden">
          {/* 3D Scene Canvas */}
          <div className="flex-1 relative">
            <Canvas shadows className="w-full h-full">
              <PerspectiveCamera makeDefault position={[0, 4.5, 6]} fov={45} />
              <ambientLight intensity={isDay ? 1.0 : 0.6} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
              <pointLight position={[0, 3, 0]} intensity={0.8} color="#00f0ff" />

              {!isDay && (
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />
              )}

              {/* Anti-Static ESD Laboratory Workbench Surface */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[14, 0.1, 9]} />
                <meshStandardMaterial color={isDay ? '#334155' : '#0f172a'} roughness={0.6} metalness={0.2} />
              </mesh>

              {/* Fine Workbench Grid */}
              <Grid
                position={[0, 0.01, 0]}
                args={[12, 8]}
                cellSize={0.5}
                cellThickness={0.8}
                cellColor="#1e3a5f"
                sectionSize={2}
                sectionThickness={1.4}
                sectionColor="#00f0ff"
                fadeDistance={25}
              />

              {/* ACTIVE 3D ASSEMBLED COMPONENT ENGINE */}
              {activeMode === 'quadcopter_assembly' && (
                <group position={[0, 0.1 + explodeRatio * 0.4, 0]}>
                  <QuadcopterModel
                    scale={1.2}
                    spinning={isTestRunning && testThrottle > 0}
                    throttle={testThrottle / 10}
                    explodedFactor={explodeRatio}
                    showWiring={true}
                  />
                </group>
              )}

              {activeMode === 'thrust_calibration' && (
                <group position={[0, 0, 0]}>
                  {/* Digital Thrust Stand Bed */}
                  <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[1.8, 0.5, 3.2]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
                  </mesh>
                  {/* Motor on Test Mount */}
                  <group position={[0, 0.65, -0.5]}>
                    <BLDCMotorModel
                      scale={1.2}
                      spinning={isTestRunning && testThrottle > 0}
                      rpm={testRPM}
                    />
                    <group position={[0, 0.45, 0]}>
                      <PropellerModel
                        scale={1.1}
                        spinning={isTestRunning && testThrottle > 0}
                        rpm={testRPM}
                        blades={2}
                      />
                    </group>
                  </group>
                  {/* ESC & LiPo on Bed */}
                  <group position={[-0.5, 0.55, 0.6]}>
                    <ESCModel scale={0.8} ampRating={30} />
                  </group>
                  <group position={[0.4, 0.55, 0.6]}>
                    <LiPoBatteryModel scale={0.75} cells={3} />
                  </group>
                </group>
              )}

              {activeMode === 'propeller_balancing' && (
                <group position={[0, 0, 0]}>
                  <BalanceStandModel scale={1.2} />
                  <group position={[0, 1.45, 0]}>
                    <PropellerModel scale={1.3} spinning={false} rpm={0} blades={2} />
                  </group>
                </group>
              )}

              {activeMode === 'fixed_wing_assembly' && (
                <group position={[0, 0.4 + explodeRatio * 0.5, 0]}>
                  <FixedWingModel
                    scale={0.9}
                    spinning={isTestRunning && testThrottle > 0}
                    throttle={testThrottle}
                    explodedFactor={explodeRatio}
                  />
                </group>
              )}

              {activeMode === 'lipo_maintenance' && (
                <group position={[0, 0.1, 0]}>
                  <group position={[-0.9, 0.2, 0]}>
                    <LiPoBatteryModel scale={1.2} cells={3} />
                  </group>
                  {/* IMAX B6 Charger */}
                  <group position={[0.9, 0.2, 0]}>
                    <mesh>
                      <boxGeometry args={[1.8, 0.4, 1.3]} />
                      <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.3} />
                    </mesh>
                    {/* LCD */}
                    <mesh position={[0, 0.21, -0.1]}>
                      <planeGeometry args={[1.2, 0.45]} />
                      <meshBasicMaterial color="#0284c7" />
                    </mesh>
                  </group>
                </group>
              )}

              {activeMode === 'transmitter_binding' && (
                <group position={[0, 0.2, 0]}>
                  <group position={[-1.2, 0.8, 0]} rotation={[0.4, 0, 0]}>
                    <mesh>
                      <boxGeometry args={[1.6, 2.0, 0.6]} />
                      <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
                    </mesh>
                  </group>
                  {/* Receiver */}
                  <group position={[1.2, 0.2, 0]}>
                    <mesh>
                      <boxGeometry args={[0.9, 0.3, 0.6]} />
                      <meshStandardMaterial color="#0f172a" />
                    </mesh>
                  </group>
                </group>
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>

            {/* Exploded / Assembled Slider Control */}
            <div className="absolute top-3 right-3 bg-[#0a0f1d]/90 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">EXPLODE VIEW:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodeRatio}
                onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
                className="w-28 accent-cyan-400 cursor-pointer"
              />
              <span className="text-cyan-300 font-bold">{Math.round(explodeRatio * 100)}%</span>
            </div>

            {/* Quick Workbench Instructions Badge */}
            <div className="absolute bottom-3 left-3 bg-[#0a0f1d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Rotate view with mouse/touch drag • Pick or snap parts in left tray</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Physical Lab Experiment Execution & Live Validation */}
        <div className="w-80 md:w-96 bg-[#090e1c] border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>PHYSICAL EXPERIMENT TESTING</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
              LIVE BENCH
            </span>
          </div>

          {/* Validation Feedback Box */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1.5 ${
                validationResult.valid
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>HARDWARE ASSEMBLY VALIDATED!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>ASSEMBLY INCOMPLETE ({validationResult.errors.length} ERRORS)</span>
                  </>
                )}
              </div>

              {validationResult.errors.map((err, idx) => (
                <div key={idx} className="text-[11px] text-rose-300 pl-4 list-disc">
                  • {err}
                </div>
              ))}

              {validationResult.notes.map((note, idx) => (
                <div key={idx} className="text-[10px] text-emerald-300 pl-4">
                  ✓ {note}
                </div>
              ))}
            </div>
          )}

          {/* Test Throttle & Live Execution Controls */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">ESC / MOTOR PWM THROTTLE:</span>
              <span className="text-cyan-300 font-bold text-sm">{testThrottle}%</span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={testThrottle}
              disabled={!isTestRunning}
              onChange={(e) => setTestThrottle(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
            />

            {/* Quick Step Throttle Buttons */}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              {[0, 25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  disabled={!isTestRunning}
                  onClick={() => setTestThrottle(val)}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Live Telemetry & Instruments Readout */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#0b1224] border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 block">ESTIMATED THRUST</span>
              <span className="text-base font-bold text-emerald-400">{testThrustG} g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1224] border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 block">MOTOR RPM</span>
              <span className="text-base font-bold text-cyan-300">{testRPM} RPM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1224] border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 block">CURRENT DRAW</span>
              <span className="text-base font-bold text-amber-300">{testCurrentA} A</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1224] border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 block">INPUT POWER</span>
              <span className="text-base font-bold text-indigo-300">{testPowerW} W</span>
            </div>
          </div>

          {/* Action Buttons: Validate, Run Experiment, Lab Record */}
          <div className="space-y-2 pt-2">
            {!isTestRunning ? (
              <button
                onClick={handleRunExperiment}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs shadow-glow-cyan transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>EXECUTE PHYSICAL EXPERIMENT</span>
              </button>
            ) : (
              <button
                onClick={() => setIsTestRunning(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold font-mono text-xs transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>STOP & RESET EXPERIMENT</span>
              </button>
            )}

            <button
              onClick={handleValidateAssembly}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Hardware Connections</span>
            </button>

            <button
              onClick={() => {
                setSelectedReportExpId(activeMode === 'thrust_calibration' ? 3 : activeMode === 'propeller_balancing' ? 7 : 9);
                setIsRecordModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white font-mono text-xs border border-blue-400/40 transition-colors shadow-glow-blue"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Lab Record Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
