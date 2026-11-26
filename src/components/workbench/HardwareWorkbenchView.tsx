import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, PerspectiveCamera } from '@react-three/drei';
import { useLab } from '../../context/LabContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  Layers, 
  Cpu, 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  RotateCw, 
  ShieldCheck, 
  FileText, 
  Search,
  Camera,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Check,
  XCircle,
  Move,
  FolderPlus,
  Folder,
  Box,
  Cable,
  CheckCheck,
  PanelRightClose,
  PanelRightOpen,
  Crosshair,
  Trash2,
  Activity,
  Sliders,
  Compass,
  Zap,
  Gauge,
  Radio,
  Battery,
  Scale,
  Wind
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

export interface ComponentItem {
  id: string;
  name: string;
  category: 'Mechanical' | 'Propulsion' | 'Avionics' | 'Power' | 'Wires & Linkages' | 'Instrumentation';
  model: string;
  specs: string;
  weightG: number;
  qty: number;
  installed: boolean;
  visualType: 'frame' | 'arm' | 'motor' | 'esc' | 'prop' | 'fc' | 'rx' | 'tx' | 'battery' | 'pdb' | 'screws' | 'thrust_rig' | 'tacho' | 'ammeter' | 'airframe' | 'spar' | 'servo' | 'tester' | 'protractor' | 'pushrod' | 'charger' | 'checker' | 'bind_plug' | 'balancer' | 'tape' | 'airfoil' | 'pitot' | 'manometer' | 'imu' | 'programmer';
}

export interface AssemblyStep {
  stepNo: number;
  title: string;
  actionType: 'pick' | 'mount' | 'wire' | 'execute';
  targetComponentId: string;
  targetComponentName: string;
  instruction: string;
  connectionDiagram?: {
    from: string;
    to: string;
    pinout: string;
    wireColor: string;
    schematicText: string;
  };
}

export interface ExperimentGuide {
  expNo: number;
  title: string;
  aim: string;
  steps: AssemblyStep[];
}

export interface SavedProject {
  id: string;
  name: string;
  folderName: string;
  expNo: number;
  savedAt: string;
  completedSteps: number[];
  notes?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

const getProjectStorageKeyForUser = (userEmailOrId?: string) => {
  if (!userEmailOrId) return 'drone_lab_saved_projects_guest';
  const clean = userEmailOrId.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `drone_lab_saved_projects_user_${clean}`;
};

const STORAGE_KEY = 'drone_lab_saved_projects';

// High-fidelity Component Visual Icon/Badge
const ComponentVisualBadge: React.FC<{ visualType: string; isInstalled: boolean }> = ({ visualType, isInstalled }) => {
  const getBadgeStyle = () => {
    switch (visualType) {
      case 'motor':
        return { label: 'BLDC', color: 'from-amber-500 to-orange-600', icon: '⚙' };
      case 'esc':
        return { label: '30A ESC', color: 'from-blue-600 to-cyan-600', icon: '⚡' };
      case 'prop':
        return { label: '1045 PROP', color: 'from-slate-700 to-slate-900', icon: '✦' };
      case 'battery':
        return { label: '3S LiPo', color: 'from-emerald-600 to-teal-700', icon: '🔋' };
      case 'fc':
        return { label: 'KK2.1.5', color: 'from-purple-600 to-indigo-700', icon: '🎛' };
      case 'frame':
        return { label: 'F450 FRAME', color: 'from-cyan-700 to-blue-800', icon: '⬡' };
      case 'arm':
        return { label: 'PA66 ARM', color: 'from-rose-600 to-red-700', icon: '━' };
      case 'servo':
        return { label: 'SG90 SERVO', color: 'from-sky-500 to-blue-600', icon: '↻' };
      case 'rx':
      case 'tx':
        return { label: '2.4GHz RF', color: 'from-violet-600 to-purple-800', icon: '📡' };
      default:
        return { label: 'HARDWARE', color: 'from-slate-700 to-slate-800', icon: '🔧' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 transition-all select-none ${
      isInstalled
        ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] text-emerald-300'
        : `bg-gradient-to-br ${badge.color} border-white/20 text-white shadow-md`
    }`}>
      <span className="text-lg leading-none font-bold">{badge.icon}</span>
      <span className="text-[9px] font-mono font-black mt-0.5 tracking-tight uppercase">
        {badge.label}
      </span>
    </div>
  );
};

export const HardwareWorkbenchView: React.FC = () => {
  const { setSelectedReportExpId, setIsRecordModalOpen, captureScreenshot, atmosphereTheme, setActiveView } = useLab();
  const { currentUser } = useAuth();
  const workbenchRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);

  // Dedicated storage key strictly isolated per logged-in user account
  const userProjectKey = useMemo(() => {
    return getProjectStorageKeyForUser(currentUser?.email || currentUser?.id);
  }, [currentUser?.email, currentUser?.id]);

  // Big Screen Fullscreen Workbench
  const [isFullscreenWorkbench, setIsFullscreenWorkbench] = useState<boolean>(false);

  // Project State
  const [hasActiveProject, setHasActiveProject] = useState<boolean>(false);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('Quadcopter Prototype');
  const [folderName, setFolderName] = useState<string>('Flight Lab 2026');
  const [selectedExpNo, setSelectedExpNo] = useState<number>(1);

  // Saved Projects List from LocalStorage
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [showFolderBrowserModal, setShowFolderBrowserModal] = useState<boolean>(false);

  // Form states for New Project modal
  const [tempProjectName, setTempProjectName] = useState<string>('UAV Quadcopter Assembly');
  const [tempFolderName, setTempFolderName] = useState<string>('Semester Practical Labs');
  const [tempSelectedExp, setTempSelectedExp] = useState<number>(1);

  // Floating Right-Side Dock State: Tab can be 'components' or 'procedure'
  const [rightPanelTab, setRightPanelTab] = useState<'components' | 'procedure'>('components');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Lighting Mode: Night and Day time working space
  const [benchTimeMode, setBenchTimeMode] = useState<'day' | 'night'>(
    atmosphereTheme === 'day' ? 'day' : 'night'
  );
  const isDay = benchTimeMode === 'day';

  // Active Category Filter for Components
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Explode view slider (0 to 1)
  const [explodeRatio, setExplodeRatio] = useState<number>(0);

  // Drag-and-drop workspace hover state
  const [isDropHover, setIsDropHover] = useState<boolean>(false);

  // 3D Camera View Presets
  const [activeCameraView, setActiveCameraView] = useState<'iso' | 'top' | 'front' | 'side'>('iso');

  // Real-time Red / Green Assembly Feedback
  const [validationAlert, setValidationAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    componentName: string;
  } | null>(null);

  // Step progression for the selected experiment
  const [completedSteps, setCompletedSteps] = useState<Record<number, number[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []
  });

  // Undo / Redo History Stack
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Circuit Diagram Modal State
  const [activeSchematicModal, setActiveSchematicModal] = useState<{
    title: string;
    from: string;
    to: string;
    pinout: string;
    wireColor: string;
    schematicText: string;
  } | null>(null);

  // Live Experiment Test Controls & Monitor
  const [testThrottle, setTestThrottle] = useState<number>(70);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeServoAngle, setActiveServoAngle] = useState<number>(45);

  // Dedicated syllabus states for Experiments 1 to 10
  const [testPayloadG, setTestPayloadG] = useState<number>(250); // Exp 1: Mission Payload (0 - 800g)
  const [testAirspeedMs, setTestAirspeedMs] = useState<number>(16.5); // Exp 2: Fixed Wing Airspeed (10 - 30 m/s)
  const [testServoStick, setTestServoStick] = useState<number>(0); // Exp 4: Servo Stick (-45° to +45°)
  const [testSubTrim, setTestSubTrim] = useState<number>(0); // Exp 4: Digital Sub-trim (-20 to +20 µs)
  const [testLiPoSoC, setTestLiPoSoC] = useState<number>(88); // Exp 5: LiPo SoC (10% to 100%)
  const [testRFChannel, setTestRFChannel] = useState<number>(1); // Exp 6: RF Channel (1 to 6)
  const [isPropBalanced, setIsPropBalanced] = useState<boolean>(true); // Exp 7: Dynamic Balance Toggle
  const [testBatteryShiftMm, setTestBatteryShiftMm] = useState<number>(0); // Exp 8: Longitudinal CG shift (-40 to +40 mm)
  const [testQuadThrottle, setTestQuadThrottle] = useState<number>(42); // Exp 9: Multirotor Collective Throttle (0 to 100%)
  const [testPGain, setTestPGain] = useState<number>(55); // Exp 10: KK2.1.5 Roll/Pitch P-Gain (30 to 90)
  const [testIGain, setTestIGain] = useState<number>(30); // Exp 10: KK2.1.5 Roll/Pitch I-Gain (10 to 60)
  const [testSelfLevel, setTestSelfLevel] = useState<boolean>(true); // Exp 10: KK2.1.5 Self-Level Mode

  // Output Results Modal after correct execution
  const [showOutputModal, setShowOutputModal] = useState<boolean>(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);

  // Master Component Catalog for ALL 10 Experiments
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 'frame_f450',
      name: 'F450 Quad-X Carbon Frame Plates',
      category: 'Mechanical',
      model: 'F450 Center Glass-Fiber PCB with Integrated Power Distribution',
      specs: 'Wheelbase: 450mm, Dual 1.5mm PCB plates, Integrated 40A PDB rails',
      weightG: 180,
      qty: 1,
      installed: false,
      visualType: 'frame',
    },
    {
      id: 'arms_f450',
      name: 'F450 High-Strength Arm Struts (x4)',
      category: 'Mechanical',
      model: 'PA66 Composite Ultra-Rigid Arms (2 Red Front / 2 White Rear)',
      specs: 'Length: 215mm, Motor mount PCD: 16-19-25mm, Brass screw inserts',
      weightG: 210,
      qty: 4,
      installed: false,
      visualType: 'arm',
    },
    {
      id: 'bldc_motors',
      name: 'A2212 1000KV Brushless DC Motors (x4)',
      category: 'Propulsion',
      model: 'A2212/13T 14-Pole Outrunner Motor (2 CW / 2 CCW Threaded Shafts)',
      specs: 'KV: 1000 RPM/V, Max Current: 12A/60s, Stator: 22x12mm, Shaft: 3.17mm',
      weightG: 190,
      qty: 4,
      installed: false,
      visualType: 'motor',
    },
    {
      id: 'esc_30a',
      name: 'SimonK 30A High-Speed ESCs (x4)',
      category: 'Propulsion',
      model: '30A Brushless ESC with 5V/2A Linear BEC & 3-Phase Bullet Jacks',
      specs: 'Continuous: 30A, Peak: 40A (10s), 2S-3S LiPo support, PWM 400Hz',
      weightG: 100,
      qty: 4,
      installed: false,
      visualType: 'esc',
    },
    {
      id: 'props_1045',
      name: '1045 Carbon-Reinforced Propellers (x4)',
      category: 'Propulsion',
      model: '10x4.5 inch 2-Blade Propeller Set (2 CW Pusher / 2 CCW Tractor)',
      specs: 'Diameter: 10 inch, Pitch: 4.5 inch, Center bore: 6.0mm with adapters',
      weightG: 48,
      qty: 4,
      installed: false,
      visualType: 'prop',
    },
    {
      id: 'fc_kk215',
      name: 'KK2.1.5 Multi-Rotor Flight Controller',
      category: 'Avionics',
      model: 'KK2.1.5 LCD Flight Control Board with Atmel Mega644PA & 6-Axis Sensor',
      specs: 'Processor: ATmega644PA, Gyro/Accel: InvenSense MPU6050, Display: 128x64 LCD',
      weightG: 21,
      qty: 1,
      installed: false,
      visualType: 'fc',
    },
    {
      id: 'rc_receiver_ia6b',
      name: 'FS-iA6B 6-Channel 2.4GHz Receiver',
      category: 'Avionics',
      model: 'FlySky 2.4GHz AFHDS 2A PWM/SBUS Receiver with Dual Diversity Antenna',
      specs: 'Channels: 6 PWM / 14 i-BUS, RF Range: 500-1500m, Sensitivity: -105dBm',
      weightG: 14,
      qty: 1,
      installed: false,
      visualType: 'rx',
    },
    {
      id: 'rc_transmitter_tx',
      name: 'FS-i6 6-Channel 2.4GHz Transmitter',
      category: 'Avionics',
      model: 'Dual-Gimbal 6-Channel Mode 2 Digital Proportional Radio Controller',
      specs: 'Frequency: 2.408 - 2.475GHz, Bandwidth: 500KHz, Telemetry LCD display',
      weightG: 390,
      qty: 1,
      installed: false,
      visualType: 'tx',
    },
    {
      id: 'lipo_3s',
      name: 'Turnigy 3S 2200mAh 25C LiPo Battery',
      category: 'Power',
      model: '3-Cell 11.1V Lithium-Polymer Pack with XT60 & JST-XH Balance Lead',
      specs: 'Voltage: 11.1V (12.6V Full), Capacity: 2200mAh, Discharge: 25C Continuous',
      weightG: 185,
      qty: 1,
      installed: false,
      visualType: 'battery',
    },
    {
      id: 'pdb_xt60',
      name: 'Integrated PDB & XT60 Power Harness',
      category: 'Wires & Linkages',
      model: 'High-Current Dual Copper Layer PDB Rail with 14AWG Silicone Wire',
      specs: 'Max Current: 100A, Plating: Gold immersion, Connector: Genuine XT60 Male',
      weightG: 28,
      qty: 1,
      installed: false,
      visualType: 'pdb',
    },
    {
      id: 'hardware_screws',
      name: 'M3 Hex Screws & Nylon Standoffs Kit',
      category: 'Mechanical',
      model: 'High-Tensile Grade 12.9 M3x8mm Screws & M3x12mm Hex Spacers',
      specs: 'Screws: 24x M3x8mm, Standoffs: 8x M3x15mm nylon, Lock-nuts: 16x',
      weightG: 45,
      qty: 1,
      installed: false,
      visualType: 'screws',
    },
    {
      id: 'thrust_rig',
      name: 'Digital Load-Cell Thrust Stand Rig',
      category: 'Instrumentation',
      model: 'Dual-Rail Linear Thrust Stand with 5kg Digital Strain Gauge',
      specs: 'Range: 0 - 5000g ±1g, Optical Tachometer: 10 - 30000 RPM, Current Shunt: 30A',
      weightG: 650,
      qty: 1,
      installed: false,
      visualType: 'thrust_rig',
    },
    {
      id: 'tachometer_opt',
      name: 'Optical Laser Digital Tachometer',
      category: 'Instrumentation',
      model: 'Non-Contact Infrared Optical Tachometer with Reflective Marker Target',
      specs: 'Range: 2.5 - 99,999 RPM, Accuracy: ±0.05%, Sampling: 0.8s',
      weightG: 120,
      qty: 1,
      installed: false,
      visualType: 'tacho',
    },
    {
      id: 'ammeter_shunt',
      name: '30A Precision DC Current Shunt & Wattmeter',
      category: 'Instrumentation',
      model: 'Digital In-Line Power Analyzer with 16-Bit ADC Voltage/Current Sampling',
      specs: 'Range: 0-60V, 0-100A peak (50A continuous), Resolution: 0.01A / 0.01V',
      weightG: 85,
      qty: 1,
      installed: false,
      visualType: 'ammeter',
    },
    {
      id: 'fixed_wing_airframe',
      name: 'Trainer Fixed-Wing EPO Airframe',
      category: 'Mechanical',
      model: 'High-Wing Aerodynamic Trainer Fuselage with Carbon Spar & Tailplane',
      specs: 'Wingspan: 1200mm, Chord: 180mm, Airfoil: Clark-Y, Aspect Ratio: 6.67',
      weightG: 380,
      qty: 1,
      installed: false,
      visualType: 'airframe',
    },
    {
      id: 'wing_spar_carbon',
      name: 'High-Modulus Carbon Fiber Wing Spar Tube',
      category: 'Mechanical',
      model: 'Pultruded Carbon Fiber Spar Tube 10mm OD x 8mm ID x 900mm',
      specs: 'Tensile Strength: 2400 MPa, Weight: 42g, Internal reinforced joints',
      weightG: 42,
      qty: 1,
      installed: false,
      visualType: 'spar',
    },
    {
      id: 'servos_9g',
      name: 'SG90 9g Micro Servos & Linkages (x4)',
      category: 'Avionics',
      model: '9g Analog Micro Servos with Nylon Control Horns & Steel Pushrods',
      specs: 'Torque: 1.8 kg-cm @ 4.8V, Speed: 0.10s/60°, Operating Angle: 180°',
      weightG: 36,
      qty: 4,
      installed: false,
      visualType: 'servo',
    },
    {
      id: 'servo_tester',
      name: 'Microprocessor 3-Channel Servo Tester',
      category: 'Instrumentation',
      model: 'Digital CCPM Servo Consistency Master with Manual/Neutral/Auto Modes',
      specs: 'Output PWM: 800 - 2200μs (1.5ms neutral), Input Voltage: 4.8 - 6.0V DC',
      weightG: 25,
      qty: 1,
      installed: false,
      visualType: 'tester',
    },
    {
      id: 'protractor_dial',
      name: '180° Precision Angular Deflection Protractor',
      category: 'Instrumentation',
      model: 'Laser-Etched Acrylic Control Surface & Servo Angle Measurement Dial',
      specs: 'Range: 0° - 180° (±90° dual sweep), Resolution: 0.5° with needle indicator',
      weightG: 40,
      qty: 1,
      installed: false,
      visualType: 'protractor',
    },
    {
      id: 'pushrod_linkage',
      name: 'Piano Wire Pushrods & Brass Clevises',
      category: 'Wires & Linkages',
      model: '1.2mm Tempered Spring-Steel Pushrods with Threaded Brass Clevis Ends',
      specs: 'Diameter: 1.2mm, Length: 250mm, Clevis pin: 1.5mm stainless steel',
      weightG: 18,
      qty: 4,
      installed: false,
      visualType: 'pushrod',
    },
    {
      id: 'lipo_charger_b6',
      name: 'IMAX B6 80W Microprocessor Balance Charger',
      category: 'Power',
      model: 'Digital Smart Charger with Integrated Lithium Cell Balancer & LCD',
      specs: 'Charge Power: 80W (0.1 - 6.0A), LiPo/LiFe: 1-6 Cells, Input: 11-18V DC',
      weightG: 260,
      qty: 1,
      installed: false,
      visualType: 'charger',
    },
    {
      id: 'lipo_checker',
      name: 'Digital 1S-8S Battery Cell Voltage Checker & Buzzer',
      category: 'Instrumentation',
      model: 'Microcontroller Low-Voltage Alarm & Precision Cell Voltage Meter',
      specs: 'Voltage Precision: ±0.01V, Cell range: 0.5 - 4.5V per cell, Buzzer: 85dB',
      weightG: 11,
      qty: 1,
      installed: false,
      visualType: 'checker',
    },
    {
      id: 'bind_plug',
      name: 'FlySky 2.4GHz Receiver Bind Plug Jumper',
      category: 'Wires & Linkages',
      model: '2.54mm Dupont Jumper Wire Connector for Binding Transmitter to Receiver',
      specs: 'Pin pitch: 2.54mm, Gold plated contacts, High-flex insulation',
      weightG: 2,
      qty: 1,
      installed: false,
      visualType: 'bind_plug',
    },
    {
      id: 'magnetic_balancer',
      name: 'High-Precision Magnetic Suspension Propeller Balancer',
      category: 'Instrumentation',
      model: 'Dual Rare-Earth Neodymium Magnet Frictionless Balancing Stand',
      specs: 'Friction: ~0 μN, Shaft: Hardened carbon steel with tapered alignment cones',
      weightG: 160,
      qty: 1,
      installed: false,
      visualType: 'balancer',
    },
    {
      id: 'balancing_tape',
      name: 'Aeronautical Balancing Tape & 600-Grit Sandpaper',
      category: 'Mechanical',
      model: 'Aeronautical Thin-Film Balancing Tape & 600-Grit Sanding Pad',
      specs: 'Adhesive: High-shear acrylic, Density: 0.035g/cm², Sandpaper: 600 grit',
      weightG: 15,
      qty: 1,
      installed: false,
      visualType: 'tape',
    },
    {
      id: 'airfoil_naca',
      name: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
      category: 'Mechanical',
      model: 'CNC Precision Polyurethane Foam Aerodynamic Wing Model with Pressure Taps',
      specs: 'Span: 300mm, Chord: 150mm, Airfoil profiles: Clark-Y Cambered & NACA 0012',
      weightG: 140,
      qty: 1,
      installed: false,
      visualType: 'airfoil',
    },
    {
      id: 'pitot_tube',
      name: 'Pitot-Static Tube Differential Airspeed Probe',
      category: 'Instrumentation',
      model: 'Aircraft Grade Stainless Steel Dual-Port Dynamic & Static Pressure Tube',
      specs: 'Diameter: 4mm, Static port ring: 6 holes x 0.5mm, Total pressure orifice: 1.5mm',
      weightG: 32,
      qty: 1,
      installed: false,
      visualType: 'pitot',
    },
    {
      id: 'manometer_water',
      name: 'Inclined U-Tube Water Differential Manometer',
      category: 'Instrumentation',
      model: 'Precision Borosilicate Glass Dual-Limb Fluid Pressure Gauge',
      specs: 'Fluid: Distilled H2O (ρ = 1000 kg/m³), Range: 0 - 250 mmH2O, Resolution: 1 mm',
      weightG: 310,
      qty: 1,
      installed: false,
      visualType: 'manometer',
    },
    {
      id: 'mpu6050_sensor',
      name: 'InvenSense MPU6050 6-Axis Gyro & Accel Module',
      category: 'Avionics',
      model: 'Triple-Axis Angular Rate Sensor (Gyro) & Triple-Axis Accelerometer (I2C)',
      specs: 'Gyro: ±250 to ±2000°/s, Accel: ±2g to ±16g, 16-bit ADCs, Digital Motion Processor',
      weightG: 6,
      qty: 1,
      installed: false,
      visualType: 'imu',
    },
    {
      id: 'usb_programmer',
      name: 'USB AVR-ISP Programmer Dongle & Ribbon Cable',
      category: 'Wires & Linkages',
      model: 'USBasp In-Circuit Serial Programmer with 6-Pin to 10-Pin ISP Cable',
      specs: 'Target Voltage: 3.3V / 5.0V, Clock: 12MHz, Compatible with KK2.1.5 firmware',
      weightG: 24,
      qty: 1,
      installed: false,
      visualType: 'programmer',
    },
  ]);

  // Load saved projects whenever the active logged-in user changes (Strictly private per account)
  useEffect(() => {
    try {
      const data = localStorage.getItem(userProjectKey);
      if (data) {
        setSavedProjects(JSON.parse(data));
      } else {
        // Also check if any legacy projects belong specifically to this user
        const legacyData = localStorage.getItem('drone_lab_saved_projects');
        if (legacyData && currentUser?.email) {
          try {
            const parsed: SavedProject[] = JSON.parse(legacyData);
            const userOwned = parsed.filter(
              (p) => p.userEmail === currentUser.email || p.userId === currentUser.id
            );
            if (userOwned.length > 0) {
              setSavedProjects(userOwned);
              localStorage.setItem(userProjectKey, JSON.stringify(userOwned));
              return;
            }
          } catch (err) {}
        }
        setSavedProjects([]);
      }
    } catch (e) {
      console.error('Failed to load user-specific saved projects', e);
      setSavedProjects([]);
    }
  }, [userProjectKey, currentUser?.email, currentUser?.id]);

  // Reset active workbench session when user logs out or switches accounts so data is never shared
  useEffect(() => {
    setActiveProjectId('');
    setHasActiveProject(false);
    setCompletedSteps({});
    setComponents((prev) => prev.map((c) => ({ ...c, installed: false })));
  }, [currentUser?.email, currentUser?.id]);

  // Save projects to user-isolated localStorage
  const persistProjects = (projects: SavedProject[]) => {
    try {
      localStorage.setItem(userProjectKey, JSON.stringify(projects));
      setSavedProjects(projects);
    } catch (e) {
      console.error('Failed to save user-specific project', e);
    }
  };

  // Master Guided Execution Protocols for Experiments 1 through 10 (Strictly Aligned with Syllabus)
  const experimentGuides: Record<number, ExperimentGuide> = useMemo(() => ({
    1: {
      expNo: 1,
      title: 'Payload and Weight Estimation.',
      aim: 'To determine the empty airframe weight, structural fraction, useful mission payload capacity, All-Up Weight (AUW/MTOW), and required thrust-to-weight ratio (TWR) of a multirotor UAV through analytical and empirical component load breakdown.',
      steps: [
        {
          stepNo: 1,
          title: 'Select & Weigh F450 Carbon-Fiber Center Frame Plates',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'From the components tray on the right, locate and drag the "F450 Quad-X Carbon Frame Plates" onto the workbench center to establish the empty airframe tare mass (180g).',
        },
        {
          stepNo: 2,
          title: 'Mount PA66 Arm Struts (2 Red Front / 2 White Rear)',
          actionType: 'mount',
          targetComponentId: 'arms_f450',
          targetComponentName: 'F450 High-Strength Arm Struts (x4)',
          instruction: 'Pick the "F450 High-Strength Arm Struts (x4)" and drag them onto the frame outline to record the structural arm mass (210g).',
        },
        {
          stepNo: 3,
          title: 'Fasten 4x A2212 1000KV BLDC Motors',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Locate "A2212 1000KV Brushless DC Motors (x4)" and mount them onto the arm tips to calculate propulsion train mass (240g).',
        },
        {
          stepNo: 4,
          title: 'Route ESC 3-Phase Bullet Leads & Connect PDB',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Connect the 3-phase bullet connectors of the SimonK 30A ESCs to the BLDC motor wires and solder DC power leads (112g).',
          connectionDiagram: {
            from: '30A ESC 3-Phase Bullet Jacks (Blue/Yellow/Red)',
            to: 'BLDC Motor Stator Leads (U, V, W phases)',
            pinout: 'Phase A -> Lead 1, Phase B -> Lead 2, Phase C -> Lead 3 (Swap 2 leads to reverse motor direction)',
            wireColor: 'Red/Black to PDB (+/- 11.1V), 3x Blue/Yellow to Motor Stator',
            schematicText: '[PDB 11.1V Rail] ──► [ESC DC Input] ──► [30A FET Bridge] ──► [3x Bullet Jacks] ──► [BLDC Motor Stator]'
          }
        },
        {
          stepNo: 5,
          title: 'Mount KK2.1.5 Flight Controller & Avionics',
          actionType: 'mount',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK2.1.5 Multi-Rotor Flight Controller',
          instruction: 'Mount the KK2.1.5 board to the upper deck on rubber dampeners to log avionics subsystem mass (38g).',
        },
        {
          stepNo: 6,
          title: 'Secure Turnigy 3S 2200mAh LiPo Battery Pack',
          actionType: 'wire',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Mount the 3S LiPo battery under the belly tray with velcro strap and connect XT60 to determine battery mass fraction (185g).',
          connectionDiagram: {
            from: '3S LiPo Battery XT60 Female Plug (11.1V - 12.6V)',
            to: 'Frame PDB XT60 Male Harness',
            pinout: 'Flat side (+): Positive 11.1V (Red 14AWG), Pointed side (-): Ground (Black 14AWG)',
            wireColor: 'Heavy-Duty Red 14AWG (+) & Black 14AWG (-)',
            schematicText: '[LiPo 3S 2200mAh Pack] ──(XT60)──► [PDB Heavy Copper Rails] ──► [4x 30A ESC Power Inputs]'
          }
        },
        {
          stepNo: 7,
          title: 'Connect FS-iA6B 2.4GHz Telemetry Receiver',
          actionType: 'wire',
          targetComponentId: 'rc_receiver_ia6b',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'Connect 3-pin receiver signal harness to KK2.1.5 input header to account for RF link mass (16g).',
          connectionDiagram: {
            from: 'FS-iA6B Ch1-Ch4 3-Pin Headers (GND, VCC, Signal)',
            to: 'KK2.1.5 Input Header (Pins 1 to 4: Ail, Ele, Thr, Rud)',
            pinout: 'Pin 1: Signal (White), Pin 2: VCC +5V (Red), Pin 3: GND (Black)',
            wireColor: 'Dupont 3-Wire Ribbon: Signal (White/Orange), 5V (Red), GND (Brown/Black)',
            schematicText: '[FS-iA6B Receiver] ──(3-Pin PWM)──► [KK2.1.5 Inputs 1-4: Thr/Ail/Ele/Rud] ──► [Atmel ATMega644 MCU]'
          }
        },
        {
          stepNo: 8,
          title: 'Install 1045 Carbon Propellers & Calculate TWR',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Fasten 1045 CW/CCW props (52g). Sum all masses to find MTOW and verify Thrust-to-Weight Ratio exceeds 2.0:1 for safe payload lifting.',
        }
      ]
    },
    2: {
      expNo: 2,
      title: 'Fixed Wing UAV Frame and Avionics Components Assembling.',
      aim: 'To study the mechanical and electrical assembly sequence of a fixed-wing UAV, including airframe integration, wing spar structural assembly, control surface linkages, and avionics bus layout.',
      steps: [
        {
          stepNo: 1,
          title: 'Place Fixed-Wing EPO Trainer Fuselage',
          actionType: 'pick',
          targetComponentId: 'fixed_wing_airframe',
          targetComponentName: 'Trainer Fixed-Wing EPO Airframe',
          instruction: 'Drag the aerodynamic EPO trainer fuselage onto the assembly jig to establish reference alignment datums.',
        },
        {
          stepNo: 2,
          title: 'Insert Carbon-Fiber Wing Spar Tube',
          actionType: 'mount',
          targetComponentId: 'wing_spar_carbon',
          targetComponentName: 'High-Modulus Carbon Fiber Wing Spar Tube',
          instruction: 'Slide the 10mm OD pultruded carbon spar through the fuselage wing bay to carry the aerodynamic bending moments.',
        },
        {
          stepNo: 3,
          title: 'Install SG90 Micro Servos in Wing & Tail Pockets',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Insert 4x SG90 micro servos into wing pockets and empennage for Aileron, Elevator, and Rudder actuation.',
        },
        {
          stepNo: 4,
          title: 'Fit Piano-Wire Pushrods to Nylon Control Horns',
          actionType: 'wire',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Connect 1.2mm steel pushrods from servo horns to control surfaces with zero mechanical play.',
          connectionDiagram: {
            from: 'Servo Output Arm Spline',
            to: 'Aileron/Elevator Control Surface Nylon Horn',
            pinout: 'Linkage Ratio: 1:1 Deflection (Hole 3 on servo arm -> Outer hole on surface horn)',
            wireColor: '1.2mm High-Tensile Steel Wire with Threaded Clevis',
            schematicText: '[Servo Motor (0-180°)] ──► [Servo Arm] ──► [Piano Wire Pushrod] ──► [Control Surface Horn] ──► [Aileron Flap]'
          }
        },
        {
          stepNo: 5,
          title: 'Mount Tractor BLDC Motor & Propeller',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt the brushless motor to the firewall nose bulkhead with down/right thrust offset and tighten propeller.',
        }
      ]
    },
    3: {
      expNo: 3,
      title: 'Calibration and Estimation of Motor\'s Thrust with Various ESCs and Propellers',
      aim: 'To evaluate and calibrate brushless motor static thrust generation, optical RPM, current draw, and power efficiency across variable ESC throttle signals and propeller dimensions.',
      steps: [
        {
          stepNo: 1,
          title: 'Setup Linear Digital Thrust Stand Rig',
          actionType: 'pick',
          targetComponentId: 'thrust_rig',
          targetComponentName: 'Digital Load-Cell Thrust Stand Rig',
          instruction: 'Position the dual-rail digital thrust measurement stand on the ESD workbench and tare the strain gauge.',
        },
        {
          stepNo: 2,
          title: 'Bolt A2212 1000KV Motor onto Sliding Carriage',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Mount the brushless outrunner motor rigidly onto the thrust stand carriage facing the load cell.',
        },
        {
          stepNo: 3,
          title: 'Wire SimonK 30A ESC to Digital Wattmeter Shunt',
          actionType: 'wire',
          targetComponentId: 'ammeter_shunt',
          targetComponentName: '30A Precision DC Current Shunt & Wattmeter',
          instruction: 'Connect the 30A ESC DC leads through the in-line digital wattmeter shunt to log voltage, current, and wattage.',
          connectionDiagram: {
            from: '3S LiPo XT60 Output',
            to: 'In-Line 30A Current Shunt -> 30A ESC DC Terminals',
            pinout: 'Shunt In (+/-) -> Shunt Out (+/-) -> ESC (Red/Black) -> 3-Phase to Motor',
            wireColor: 'Heavy 14AWG Red (+) & Black (-) silicone leads',
            schematicText: '[3S LiPo 11.1V] ──► [In-Line 30A Wattmeter Shunt] ──► [SimonK 30A ESC] ──► [3-Phase] ──► [BLDC Motor]'
          }
        },
        {
          stepNo: 4,
          title: 'Align Optical Laser Tachometer with Propeller Hub',
          actionType: 'mount',
          targetComponentId: 'tachometer_opt',
          targetComponentName: 'Optical Laser Digital Tachometer',
          instruction: 'Align non-contact optical laser tachometer perpendicular to the propeller path to record optical RPM pulses.',
        },
        {
          stepNo: 5,
          title: 'Mount 1045 Carbon Propeller & Connect 3S LiPo',
          actionType: 'wire',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Secure the 1045 propeller with locknut and connect the 3S 2200mAh LiPo. Ready for thrust calibration sweep!',
        }
      ]
    },
    4: {
      expNo: 4,
      title: 'UAV Control Testing & Trimming Procedure using Transmitter and Servo.',
      aim: 'To verify primary control surface deflections (Ailerons, Elevator, Rudder) against transmitter stick PWM pulse widths and calibrate digital sub-trims to achieve zero aerodynamic offset.',
      steps: [
        {
          stepNo: 1,
          title: 'Place CCPM Microprocessor Servo Tester',
          actionType: 'pick',
          targetComponentId: 'servo_tester',
          targetComponentName: 'Microprocessor 3-Channel Servo Tester',
          instruction: 'Place the CCPM Servo Tester on the bench to supply adjustable 1000 - 2000μs PWM signals.',
        },
        {
          stepNo: 2,
          title: 'Connect SG90 9g Micro Servo to Tester Output Ch 1',
          actionType: 'wire',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Plug the 3-wire servo connector into Channel 1 of the servo tester.',
          connectionDiagram: {
            from: 'SG90 3-Pin Female Plug (Brown/Red/Orange)',
            to: 'Servo Tester Output Header Pin 1',
            pinout: 'Pin 1 (Orange): PWM Signal (1.0 - 2.0ms), Pin 2 (Red): +5V DC, Pin 3 (Brown): GND',
            wireColor: 'Orange (PWM), Red (+5V), Brown (GND)',
            schematicText: '[Servo Tester (1000-2000μs PWM)] ──(3-Pin Header)──► [SG90 Potentiometer Feedback Servo (0-180°)]'
          }
        },
        {
          stepNo: 3,
          title: 'Mount 180° Precision Angular Protractor Dial',
          actionType: 'mount',
          targetComponentId: 'protractor_dial',
          targetComponentName: '180° Precision Angular Deflection Protractor',
          instruction: 'Align the protractor dial with the servo output shaft centerline to measure angular displacement in degrees.',
        },
        {
          stepNo: 4,
          title: 'Attach Pointer Needle Linkage & Calibrate Neutral (1500μs)',
          actionType: 'mount',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Attach pointer needle to servo arm and verify 0° neutral alignment at exactly 1500μs pulse width.',
        }
      ]
    },
    5: {
      expNo: 5,
      title: 'Lithium Polymer Battery Testing, Balancing and Maintenance.',
      aim: 'To test Lithium-Polymer (LiPo) electrochemical pack health, measure individual cell terminal voltages and internal resistance (IR), demonstrate microprocessor balance charging, and maintain safe storage voltage.',
      steps: [
        {
          stepNo: 1,
          title: 'Place Turnigy 3S 2200mAh 25C LiPo Battery',
          actionType: 'pick',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Place the 3-cell 11.1V LiPo battery on the fireproof ESD workbench mat.',
        },
        {
          stepNo: 2,
          title: 'Connect 1S-8S Digital Cell Voltage Checker',
          actionType: 'wire',
          targetComponentId: 'lipo_checker',
          targetComponentName: 'Digital 1S-8S Battery Cell Voltage Checker & Buzzer',
          instruction: 'Plug JST-XH 4-pin balance connector into the cell checker to verify Cell 1, 2, and 3 voltage matching (ΔV < 15mV).',
          connectionDiagram: {
            from: 'LiPo JST-XH 4-Pin Balance Lead',
            to: '1S-8S Digital Checker Balance Port (Pin 1 to Pin 4)',
            pinout: 'Pin 1: Ground (Black), Pin 2: Cell 1 (3.7-4.2V), Pin 3: Cell 2 (7.4-8.4V), Pin 4: Cell 3 (11.1-12.6V)',
            wireColor: '1x Black (Common GND), 3x Colored individual cell taps',
            schematicText: '[Cell 1: 3.7V] + [Cell 2: 3.7V] + [Cell 3: 3.7V] ──(JST-XH Lead)──► [Microcontroller ADC Volt Checker]'
          }
        },
        {
          stepNo: 3,
          title: 'Connect IMAX B6 Smart Balance Charger via XT60 & JST-XH',
          actionType: 'wire',
          targetComponentId: 'lipo_charger_b6',
          targetComponentName: 'IMAX B6 80W Microprocessor Balance Charger',
          instruction: 'Connect XT60 main power banana leads and the JST-XH balance lead to the IMAX B6 charger for CC/CV balance charging and storage maintenance.',
        }
      ]
    },
    6: {
      expNo: 6,
      title: 'RC Transmitter Resetting, Calibration and Frequency Binding.',
      aim: 'To perform complete transmitter memory reset, calibrate analog stick potentiometer endpoints, execute the 2.4GHz FHSS frequency binding sequence with the receiver, and configure failsafe motor cutoff.',
      steps: [
        {
          stepNo: 1,
          title: 'Position FS-iA6B 6-Channel 2.4GHz Receiver',
          actionType: 'pick',
          targetComponentId: 'rc_receiver_ia6b',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'Place the FS-iA6B receiver on the workbench with dual diversity antennas at 90° orientation.',
        },
        {
          stepNo: 2,
          title: 'Insert Bind Plug into B/VCC Port',
          actionType: 'wire',
          targetComponentId: 'bind_plug',
          targetComponentName: 'FlySky 2.4GHz Receiver Bind Plug Jumper',
          instruction: 'Insert the bind plug jumper into the B/VCC port to ground the bind key line and enter binding mode.',
          connectionDiagram: {
            from: 'Bind Plug Jumper (2-Pin Bridge)',
            to: 'Receiver Port B/VCC (Pin 1 Signal & Pin 3 GND)',
            pinout: 'Shorts Signal pin to Ground pin to force AFHDS 2A pairing on power-up',
            wireColor: 'Black looped jumper wire',
            schematicText: '[Receiver Port B/VCC] ──(Shorts Signal to GND)──► [RF Chipset Enters AFHDS 2A Pair Mode (Fast LED Flash)]'
          }
        },
        {
          stepNo: 3,
          title: 'Power Receiver with 5V Regulated BEC',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Plug 5V BEC power from ESC into Channel 1 to power up the receiver in bind mode (fast flashing LED).',
        },
        {
          stepNo: 4,
          title: 'Power FS-i6 Transmitter while Holding BIND Key',
          actionType: 'execute',
          targetComponentId: 'rc_transmitter_tx',
          targetComponentName: 'FS-i6 6-Channel 2.4GHz Transmitter',
          instruction: 'Hold the BIND key and power ON the FS-i6 transmitter. Solid receiver LED confirms successful AFHDS 2A telemetry link!',
        }
      ]
    },
    7: {
      expNo: 7,
      title: 'Propeller Balancing Procedure.',
      aim: 'To balance two-blade and three-blade UAV propellers statically and dynamically using a magnetic levitation suspension balancer, mitigating airframe vibrations.',
      steps: [
        {
          stepNo: 1,
          title: 'Assemble Magnetic Suspension Balancer Stand',
          actionType: 'pick',
          targetComponentId: 'magnetic_balancer',
          targetComponentName: 'High-Precision Magnetic Suspension Propeller Balancer',
          instruction: 'Set up the frictionless magnetic balancer with rare-earth neodymium magnetic suspension cones.',
        },
        {
          stepNo: 2,
          title: 'Mount 1045 Propeller onto Centering Spindle',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Slide the 1045 propeller onto the tapered spindle, tighten thumbscrews, and float between the magnetic poles.',
        },
        {
          stepNo: 3,
          title: 'Observe Heavy Blade Dip & Apply Balancing Tape',
          actionType: 'mount',
          targetComponentId: 'balancing_tape',
          targetComponentName: 'Aeronautical Balancing Tape & 600-Grit Sandpaper',
          instruction: 'Note which blade drops due to gravity. Apply aeronautical tape to the underside of the lighter blade until the prop balances horizontally!',
        }
      ]
    },
    8: {
      expNo: 8,
      title: 'Fixed Wing UAV Centre of Gravity Calculation and Balancing.',
      aim: 'To calculate the longitudinal center of gravity (CG) of a fixed-wing UAV relative to the wing leading edge datum, correlate it with the Mean Aerodynamic Chord (MAC), and balance the aircraft by shifting component locations to achieve a stable static margin.',
      steps: [
        {
          stepNo: 1,
          title: 'Place Fixed-Wing Airframe on Longitudinal Balance Jig',
          actionType: 'pick',
          targetComponentId: 'fixed_wing_airframe',
          targetComponentName: 'Trainer Fixed-Wing EPO Airframe',
          instruction: 'Position the fixed-wing airframe on the longitudinal balance jig with the wing leading edge positioned at datum station X=0.',
        },
        {
          stepNo: 2,
          title: 'Insert Wing Spar Tube to Establish Mean Aerodynamic Chord',
          actionType: 'mount',
          targetComponentId: 'wing_spar_carbon',
          targetComponentName: 'High-Modulus Carbon Fiber Wing Spar Tube',
          instruction: 'Insert the carbon-fiber wing spar tube through the fuselage wing roots to locate the 25% MAC aerodynamic center line (MAC = 180mm).',
        },
        {
          stepNo: 3,
          title: 'Mount Brushless Motor on Firewall Nose Bulkhead',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Fasten the motor assembly to the forward firewall bulkhead (X = -85mm) to generate the necessary nose counterweight moment.',
        },
        {
          stepNo: 4,
          title: 'Slide 3S LiPo Battery along Longitudinal Rail to Balance CG',
          actionType: 'wire',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Position the 3S LiPo battery along the internal fuselage tray until the aircraft balances horizontally at X_CG = 68.4mm (30.5% MAC, Static Margin > 10%).',
        }
      ]
    },
    9: {
      expNo: 9,
      title: 'Drone Base and Avionic components assembling in Quadcopter Configuration.',
      aim: 'To execute the full mechanical assembly, electrical wiring, motor rotation verification, and flight controller integration for a standard Quadcopter-X multirotor.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount F450 Carbon-Fiber Center Frame Plates',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'Place the F450 main structural center plates with integrated power distribution onto the assembly table.',
        },
        {
          stepNo: 2,
          title: 'Bolt PA66 Quadcopter Arms (Red Forward / White Rear)',
          actionType: 'mount',
          targetComponentId: 'arms_f450',
          targetComponentName: 'F450 High-Strength Arm Struts (x4)',
          instruction: 'Bolt all 4 arms with red forward orientation to ensure high-visibility pilot heading tracking.',
        },
        {
          stepNo: 3,
          title: 'Mount 4x A2212 1000KV BLDC Motors on Arm Tips',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Fasten motors to arm ends: Motor 1 (Front Right CCW), Motor 2 (Rear Right CW), Motor 3 (Rear Left CCW), Motor 4 (Front Left CW).',
        },
        {
          stepNo: 4,
          title: 'Connect 4x 30A SimonK ESCs to Integrated PDB Rails',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Connect motor wires to ESC bullet jacks and power leads to PDB terminals with correct positive/negative polarity.',
          connectionDiagram: {
            from: 'PDB 11.1V Power Rails',
            to: '4x SimonK 30A ESCs',
            pinout: '4x Pair (+ / -) 11.1V -> ESC DC In; 4x 3-Wire PWM -> KK2.1.5 Motor Outputs M1-M4',
            wireColor: 'Red (+11.1V), Black (GND), 3-Wire Servo (PWM, +5V, GND)',
            schematicText: '[PDB Central Rail] ──► [4x ESCs] ──► [4x BLDC Motors (M1 CCW, M2 CW, M3 CCW, M4 CW)]'
          }
        },
        {
          stepNo: 5,
          title: 'Mount KK2.1.5 Flight Controller & Connect M1-M4 ESC Signals',
          actionType: 'wire',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK2.1.5 Multi-Rotor Flight Controller',
          instruction: 'Mount KK2.1.5 on rubber bobbins and plug ESC signal leads into Motor Outputs M1, M2, M3, and M4.',
        },
        {
          stepNo: 6,
          title: 'Plug In Turnigy 3S 2200mAh LiPo via XT60 Connector',
          actionType: 'wire',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Secure LiPo under the belly and connect the XT60 plug to energize all electronics.',
        },
        {
          stepNo: 7,
          title: 'Install 1045 Carbon Propellers & Verify Yaw Torque Equilibrium',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Thread on 1045 CW and CCW props. Pre-flight hardware assembly is 100% complete and flight ready!',
        }
      ]
    },
    10: {
      expNo: 10,
      title: 'Drone Flight Controller Programming and Calibration (KK 2.1.5).',
      aim: 'To configure, calibrate, and tune a KK 2.1.5 multi-rotor control board using its on-board graphic LCD display, menu navigation buttons, and sensor diagnostics.',
      steps: [
        {
          stepNo: 1,
          title: 'Place KK2.1.5 LCD Flight Control Board',
          actionType: 'pick',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK2.1.5 Multi-Rotor Flight Controller',
          instruction: 'Place the KK2.1.5 controller on the anti-static mat with access to buttons, LCD display, and ISP header.',
        },
        {
          stepNo: 2,
          title: 'Connect USBasp 6-Pin ISP Programmer Ribbon Cable',
          actionType: 'wire',
          targetComponentId: 'usb_programmer',
          targetComponentName: 'USB AVR-ISP Programmer Dongle & Ribbon Cable',
          instruction: 'Connect the 6-pin AVR-ISP header cable to the Atmel ATmega644PA programming port with Pin 1 alignment.',
          connectionDiagram: {
            from: 'USBasp 6-Pin Programmer Dongle (USB 5V)',
            to: 'KK2.1.5 AVR ISP Header (MOSI, MISO, SCK, RESET, VCC, GND)',
            pinout: 'Pin 1: MISO, Pin 2: VCC (+5V), Pin 3: SCK, Pin 4: MOSI, Pin 5: RESET, Pin 6: GND',
            wireColor: '6-Conductor Gray Ribbon Cable with Red Stripe on Pin 1',
            schematicText: '[PC USB Port] ──► [USBasp 12MHz AVR ISP] ──(6-Pin Ribbon)──► [KK2.1.5 Atmel ATmega644PA SPI Port]'
          }
        },
        {
          stepNo: 3,
          title: 'Verify MPU6050 6-Axis Motion Sensor Telemetry Bus',
          actionType: 'mount',
          targetComponentId: 'mpu6050_sensor',
          targetComponentName: 'InvenSense MPU6050 6-Axis Gyro & Accel Module',
          instruction: 'Inspect I2C bus signals (SCL, SDA) between MPU6050 and the ATmega644PA MCU to verify accelerometer level calibration.',
        }
      ]
    }
  }), []);

  const activeGuide = experimentGuides[selectedExpNo] || experimentGuides[1];
  const activeExpSteps = activeGuide.steps;
  const currentCompletedSteps = completedSteps[selectedExpNo] || [];

  // Determine the next step required in the procedure
  const nextExpectedStep = activeExpSteps.find((s) => !currentCompletedSteps.includes(s.stepNo));
  const isExpFullyAssembled = currentCompletedSteps.length === activeExpSteps.length;

  // Filter components by search and category
  const filteredComponents = useMemo(() => {
    return components.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [components, activeCategory, searchQuery]);

  // Total installed weight
  const totalInstalledWeight = useMemo(() => {
    return components.filter((c) => c.installed).reduce((acc, c) => acc + c.weightG, 0);
  }, [components]);

  // Handle Drag & Drop Component Validation (Green / Red feedback + Undo stack)
  const handleDropComponent = (droppedCompId: string) => {
    if (!hasActiveProject) return;

    if (isExpFullyAssembled) {
      setValidationAlert({
        type: 'success',
        title: 'ASSEMBLY COMPLETE',
        message: 'All components assembled! Click "RUN & EXECUTE EXPERIMENT" to test.',
        componentName: 'Ready',
      });
      return;
    }

    const component = components.find((c) => c.id === droppedCompId);
    if (!component) return;

    if (nextExpectedStep && nextExpectedStep.targetComponentId === droppedCompId) {
      // SUCCESS: Correct component dropped into place
      setComponents((prev) =>
        prev.map((c) => (c.id === droppedCompId ? { ...c, installed: true } : c))
      );

      const updatedCompleted = [...currentCompletedSteps, nextExpectedStep.stepNo];
      setCompletedSteps((prev) => ({
        ...prev,
        [selectedExpNo]: updatedCompleted,
      }));

      // Push to Undo stack, clear Redo stack
      setUndoStack((prev) => [...prev, droppedCompId]);
      setRedoStack([]);

      // Auto-save progress to saved projects
      if (activeProjectId) {
        const updated = savedProjects.map((p) =>
          p.id === activeProjectId ? { ...p, completedSteps: updatedCompleted } : p
        );
        persistProjects(updated);
      }

      const isNowFullyDone = updatedCompleted.length === activeExpSteps.length;

      setValidationAlert({
        type: 'success',
        title: 'COMPONENT ASSEMBLED',
        message: isNowFullyDone
          ? `✓ SUCCESS: "${component.name}" mounted! Assembly is 100% complete and ready to execute.`
          : `✓ SUCCESS: "${component.name}" placed in position! Proceed to Step ${nextExpectedStep.stepNo + 1}.`,
        componentName: component.name,
      });

      if (isNowFullyDone) {
        setRightPanelTab('procedure');
      }
    } else {
      // ERROR: Wrong component
      const expectedPart = nextExpectedStep?.targetComponentName || 'the next procedure component';
      setValidationAlert({
        type: 'error',
        title: 'WRONG COMPONENT SELECTED',
        message: `⚠ INCORRECT: Step ${nextExpectedStep?.stepNo || 1} requires "${expectedPart}". You chose "${component.name}". Follow procedure on the right!`,
        componentName: component.name,
      });
    }

    setTimeout(() => {
      setValidationAlert(null);
    }, 4500);
  };

  // Undo Last Placed Component
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastCompId = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    // Unmark component installed
    setComponents((prev) =>
      prev.map((c) => (c.id === lastCompId ? { ...c, installed: false } : c))
    );

    // Revert step
    const updatedCompleted = currentCompletedSteps.slice(0, -1);
    setCompletedSteps((prev) => ({
      ...prev,
      [selectedExpNo]: updatedCompleted,
    }));

    setUndoStack(newUndo);
    setRedoStack((prev) => [...prev, lastCompId]);

    setValidationAlert({
      type: 'success',
      title: 'ACTION UNDONE',
      message: 'Reverted last component placement.',
      componentName: 'Undo',
    });
  };

  // Redo Component Placement
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const compIdToRedo = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setComponents((prev) =>
      prev.map((c) => (c.id === compIdToRedo ? { ...c, installed: true } : c))
    );

    const step = activeExpSteps[currentCompletedSteps.length];
    if (step) {
      setCompletedSteps((prev) => ({
        ...prev,
        [selectedExpNo]: [...currentCompletedSteps, step.stepNo],
      }));
    }

    setRedoStack(newRedo);
    setUndoStack((prev) => [...prev, compIdToRedo]);
  };

  // Reset Workbench to Clean Empty State
  const handleResetWorkbench = () => {
    if (window.confirm('Reset this workbench? All mounted components will be returned to the tray.')) {
      setComponents((prev) => prev.map((c) => ({ ...c, installed: false })));
      setCompletedSteps((prev) => ({
        ...prev,
        [selectedExpNo]: [],
      }));
      setUndoStack([]);
      setRedoStack([]);
      setIsTestRunning(false);
      setTestThrottle(0);
      setValidationAlert({
        type: 'success',
        title: 'WORKBENCH RESET',
        message: 'The workspace is now clean and empty.',
        componentName: 'Reset',
      });
    }
  };

  // Create & Save Project Folder
  const handleCreateNewProject = () => {
    const newId = `proj_${Date.now()}`;
    const pName = tempProjectName.trim() || `Assembly Project - EX ${tempSelectedExp}`;
    const fName = tempFolderName.trim() || 'My Aerospace Projects';

    const newProject: SavedProject = {
      id: newId,
      name: pName,
      folderName: fName,
      expNo: tempSelectedExp,
      savedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      completedSteps: [],
      userId: currentUser?.id || 'guest',
      userEmail: currentUser?.email || 'guest@psg.aero',
      userName: currentUser?.name || 'Guest User',
    };

    const updated = [newProject, ...savedProjects];
    persistProjects(updated);

    setActiveProjectId(newId);
    setProjectName(pName);
    setFolderName(fName);
    setSelectedExpNo(tempSelectedExp);
    setCompletedSteps((prev) => ({
      ...prev,
      [tempSelectedExp]: [],
    }));
    setComponents((prev) => prev.map((c) => ({ ...c, installed: false })));
    setUndoStack([]);
    setRedoStack([]);
    setValidationAlert(null);
    setIsTestRunning(false);
    setTestThrottle(0);
    setExplodeRatio(0);
    setShowNewProjectModal(false);
    setHasActiveProject(true);
    setRightPanelTab('components');
  };

  // Open an Existing Saved Project from Folder
  const handleOpenSavedProject = (proj: SavedProject) => {
    setActiveProjectId(proj.id);
    setProjectName(proj.name);
    setFolderName(proj.folderName);
    setSelectedExpNo(proj.expNo);

    // Restore completed steps
    setCompletedSteps((prev) => ({
      ...prev,
      [proj.expNo]: proj.completedSteps || [],
    }));

    // Find target components belonging to completed steps and mark installed
    const guide = experimentGuides[proj.expNo];
    const completedIds = guide?.steps
      .filter((s) => (proj.completedSteps || []).includes(s.stepNo))
      .map((s) => s.targetComponentId) || [];

    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        installed: completedIds.includes(c.id),
      }))
    );

    setUndoStack([]);
    setRedoStack([]);
    setShowFolderBrowserModal(false);
    setHasActiveProject(true);
    setRightPanelTab('components');
  };

  // Delete a Saved Project
  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved project?')) {
      const updated = savedProjects.filter((p) => p.id !== projId);
      persistProjects(updated);
    }
  };

  // Switch 3D Camera View Presets
  const setCameraPreset = (view: 'iso' | 'top' | 'front' | 'side') => {
    setActiveCameraView(view);
    if (!orbitControlsRef.current) return;

    if (view === 'iso') {
      orbitControlsRef.current.object.position.set(4, 3.5, 5);
      orbitControlsRef.current.target.set(0, 0.2, 0);
    } else if (view === 'top') {
      orbitControlsRef.current.object.position.set(0, 7, 0.001);
      orbitControlsRef.current.target.set(0, 0, 0);
    } else if (view === 'front') {
      orbitControlsRef.current.object.position.set(0, 1.2, 5.5);
      orbitControlsRef.current.target.set(0, 0.4, 0);
    } else if (view === 'side') {
      orbitControlsRef.current.object.position.set(5.5, 1.2, 0);
      orbitControlsRef.current.target.set(0, 0.4, 0);
    }
    orbitControlsRef.current.update();
  };

  // Run and Execute Experiment
  const handleRunAndExecute = () => {
    setIsTestRunning(true);
    setTestThrottle(70);
    if (selectedExpNo === 1) setTestPayloadG(250);
    if (selectedExpNo === 2) setTestAirspeedMs(16.5);
    if (selectedExpNo === 3) setTestThrottle(70);
    if (selectedExpNo === 4) { setTestServoStick(0); setTestSubTrim(0); }
    if (selectedExpNo === 5) setTestLiPoSoC(88);
    if (selectedExpNo === 6) setTestRFChannel(1);
    if (selectedExpNo === 7) setIsPropBalanced(true);
    if (selectedExpNo === 8) setTestBatteryShiftMm(0);
    if (selectedExpNo === 9) setTestQuadThrottle(42);
    if (selectedExpNo === 10) { setTestPGain(55); setTestIGain(30); setTestSelfLevel(true); }
    setShowOutputModal(true);
  };

  // Dynamic Test Calculations & Syllabus Parameters
  // EXP 1: Payload and Weight Estimation
  const exp1EmptyWeight = 724;
  const exp1BatteryWeight = 185;
  const exp1PayloadWeight = testPayloadG;
  const exp1MTOW = exp1EmptyWeight + exp1BatteryWeight + exp1PayloadWeight;
  const exp1TotalThrust = 3360; // 4 x 840g
  const exp1TWR = (exp1TotalThrust / exp1MTOW).toFixed(2);
  const exp1PayloadFraction = ((exp1PayloadWeight / exp1MTOW) * 100).toFixed(1);
  const exp1HoverThrottle = ((exp1MTOW / exp1TotalThrust) * 100).toFixed(1);

  // EXP 2: Fixed Wing Assembly & Aerodynamics
  const exp2Airspeed = testAirspeedMs;
  const exp2WingArea = 0.216; // 1.2m span x 0.18m chord
  const exp2CL = 0.52;
  const exp2CD = 0.042;
  const exp2DynPressure = 0.5 * 1.225 * exp2Airspeed * exp2Airspeed;
  const exp2Lift = (exp2DynPressure * exp2WingArea * exp2CL).toFixed(2);
  const exp2Drag = (exp2DynPressure * exp2WingArea * exp2CD).toFixed(2);
  const exp2GlideRatio = (exp2CL / exp2CD).toFixed(2);

  // EXP 3: Motor & ESC Thrust Calibration
  const exp3Thrust = Math.round(testThrottle * 8.5);
  const exp3RPM = Math.round(testThrottle * 98);
  const exp3Voltage = (11.1 - testThrottle * 0.008).toFixed(2);
  const exp3Current = (testThrottle * 0.12).toFixed(2);
  const exp3Power = (parseFloat(exp3Voltage) * parseFloat(exp3Current)).toFixed(1);
  const exp3Efficiency = parseFloat(exp3Power) > 0 ? (exp3Thrust / parseFloat(exp3Power)).toFixed(2) : '0.00';

  // EXP 4: UAV Control & Trimming
  const exp4PulseWidth = 1500 + Math.round(testServoStick * 11.11) + testSubTrim;
  const exp4Deflection = (testServoStick + testSubTrim * 0.09).toFixed(1);
  const exp4Travel = ((testServoStick / 45) * 12.5).toFixed(1);

  // EXP 5: LiPo Battery Testing & Balancing
  const exp5NomCell = (3.30 + (testLiPoSoC / 100) * 0.90);
  const exp5Cell1 = (exp5NomCell + 0.003).toFixed(3);
  const exp5Cell2 = (exp5NomCell - 0.004).toFixed(3);
  const exp5Cell3 = (exp5NomCell + 0.001).toFixed(3);
  const exp5PackVoltage = (parseFloat(exp5Cell1) + parseFloat(exp5Cell2) + parseFloat(exp5Cell3)).toFixed(2);
  const exp5MaxDischarge = (3.3 * 25).toFixed(1);

  // EXP 7: Propeller Balancing
  const exp7Vrms = isPropBalanced ? '0.38' : '4.82';
  const exp7GForce = isPropBalanced ? '0.14' : '1.85';
  const exp7Imbalance = isPropBalanced ? '0.0' : '18.4';
  const exp7Runout = isPropBalanced ? '0.08' : '1.42';

  // EXP 8: Longitudinal Center of Gravity (CG)
  const exp8XCG = (68.4 + testBatteryShiftMm * 0.22).toFixed(1);
  const exp8CGMac = ((parseFloat(exp8XCG) / 180) * 100).toFixed(1);
  const exp8SM = (((91.2 - parseFloat(exp8XCG)) / 180) * 100).toFixed(1);

  // EXP 9: Quadcopter-X Assembly Equilibrium
  const exp9Thrust = Math.round(testQuadThrottle * 34.0);
  const exp9PWM = 1000 + Math.round(testQuadThrottle * 10);

  // General legacy telemetry aliases for backwards compatibility
  const testRPM = exp3RPM;
  const testThrustG = exp3Thrust;
  const testVoltageV = exp3Voltage;
  const testCurrentA = exp3Current;
  const testPowerW = exp3Power;
  const testEfficiencyGW = exp3Efficiency;

  // Screenshot capture for workspace/modal
  const handleCaptureWorkspace = async () => {
    setIsCapturingScreenshot(true);
    await captureScreenshot(workbenchRef.current, selectedExpNo);
    setIsCapturingScreenshot(false);
  };

  // =========================================================================
  // VIEW 1: CLEAN "WELCOME TO AERO-SPACE LABORATORY WORKSPACE" ANIMATED PAGE
  // =========================================================================
  if (!hasActiveProject) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-[#02050e] text-slate-100 overflow-hidden font-sans select-none p-6">
        
        {/* BACK ARROW BUTTON: Returns to Main Dashboard / Experiments Icons Page */}
        <button
          onClick={() => setActiveView('dashboard')}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold shadow-md transition-all active:scale-95 cursor-pointer hover:border-cyan-400 group"
          title="Return to Main Experiments Icons Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Background Cyber Starfield & Glowing Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0c1f4e] via-[#050b1d] to-[#01040a] pointer-events-none"></div>

        {/* Holographic Glowing Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)'
          }}
        />

        {/* Ambient Neon Cyber Glows */}
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-amber-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Rotating Aerospace Radar Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] border border-cyan-500/20 rounded-full pointer-events-none animate-[spin_80s_linear_infinite]">
          <div className="absolute inset-4 border border-dashed border-cyan-400/30 rounded-full"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#06b6d4]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#06b6d4]"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"></div>
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 pt-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs sm:text-sm font-mono font-bold border border-cyan-400/50 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <Compass className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="tracking-widest uppercase">PRECISION 3D AERONAUTICAL ASSEMBLY</span>
          </div>

          {/* WELCOME TO AERO-SPACE LABORATORY WORKSPACE */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            <span className="block text-cyan-400 font-mono text-base sm:text-xl font-bold tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              WELCOME TO
            </span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(6,182,212,0.9)] animate-pulse inline-block">
              AERO - SPACE LABORATORY WORKSPACE
            </span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-mono">
            Puzzle-style 3D component drag-and-drop assembly, blueprint positioning guides, circuit connection diagrams, and live experiment telemetry execution.
          </p>
        </div>

        {/* Center: Live 3D Rotating Aerospace Model in Single WebGL Canvas */}
        <div className="relative z-10 w-full max-w-xl h-56 sm:h-64 my-auto rounded-3xl border border-cyan-500/30 bg-slate-950/40 backdrop-blur-md overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)]">
          <Canvas camera={{ position: [0, 2.5, 4.5], fov: 45 }}>
            <ambientLight intensity={1.4} />
            <directionalLight position={[5, 10, 5]} intensity={2.2} />
            <pointLight position={[-3, 2, 2]} intensity={1.0} color="#00f0ff" />
            <group rotation={[0.2, 0, 0]}>
              <QuadcopterModel scale={0.95} spinning={true} throttle={4} showWiring={true} />
            </group>
            <OrbitControls autoRotate autoRotateSpeed={2.0} enableZoom={false} />
          </Canvas>
          <div className="absolute bottom-3 left-4 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive 3D Aerospace Model Preview</span>
          </div>
        </div>

        {/* BOTTOM OF SAME PAGE: SMALL SLEEK BUTTONS [ NEW PROJECT ] & [ SAVED FOLDERS ] */}
        <div className="relative z-10 pb-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black font-mono text-xs sm:text-sm tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/60"
          >
            <FolderPlus className="w-4 h-4 text-slate-950" />
            <span>NEW PROJECT</span>
          </button>

          {savedProjects.length > 0 && (
            <button
              onClick={() => setShowFolderBrowserModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500/40 hover:border-cyan-400 font-bold font-mono text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Folder className="w-4 h-4 text-cyan-400" />
              <span>SAVED FOLDERS ({savedProjects.length})</span>
            </button>
          )}
        </div>

        {/* MODAL 1: NEW PROJECT & SAVE AS SEPARATE FOLDER */}
        {showNewProjectModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative max-w-xl w-full rounded-2xl bg-gradient-to-br from-[#0c142c] via-[#080e22] to-[#040816] border-2 border-amber-400 p-6 shadow-[0_0_70px_rgba(245,158,11,0.6)] font-mono text-slate-100 overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-base font-black text-white">
                      CREATE NEW ASSEMBLY PROJECT
                    </h3>
                    <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                      <span>Account: {currentUser?.name || 'User'} ({currentUser?.email || 'Individual Account'})</span>
                      <span className="text-slate-400">• Private to your account</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* FOLDER NAME INPUT (SEPARATE FOLDER FOR EXPERIMENTS) */}
              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PROJECT FOLDER NAME:</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Lab 2026, Semester 6 Practicals, Drone Team Alpha..."
                  value={tempFolderName}
                  onChange={(e) => setTempFolderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-500 shadow-inner"
                />
              </div>

              {/* PROJECT NAME (SAVE AS) */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>PROJECT FILE NAME (SAVE AS):</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. F450 Quadcopter Model, Wing Test Setup..."
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 placeholder-slate-500 shadow-inner"
                />
              </div>

              {/* SELECT EXPERIMENT */}
              <label className="block text-xs font-bold text-slate-200 mb-2">
                SELECT EXPERIMENT NO (1 TO 10):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1 custom-scrollbar mb-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const guide = experimentGuides[num];
                  const isSelected = tempSelectedExp === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setTempSelectedExp(num)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/25 border-amber-400 text-white ring-1 ring-amber-400'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-cyan-400'}`}>
                          EX {num}
                        </span>
                      </div>
                      <div className="text-[9px] line-clamp-1 text-slate-400">
                        {guide?.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleCreateNewProject}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>INITIALIZE WORKSPACE & SAVE TO FOLDER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: MY SAVED FOLDERS & PROJECTS */}
        {showFolderBrowserModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative max-w-xl w-full rounded-2xl bg-gradient-to-br from-[#0c142c] via-[#080e22] to-[#040816] border-2 border-cyan-400 p-6 shadow-[0_0_70px_rgba(6,182,212,0.5)] font-mono text-slate-100 overflow-hidden">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-black text-white">
                      SAVED EXPERIMENT PROJECT FOLDERS
                    </h3>
                    <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                      <span>Account: {currentUser?.name || 'User'} ({currentUser?.email || 'Individual Account'})</span>
                      <span className="text-slate-400">• Private &amp; Secured</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFolderBrowserModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4">
                  <FolderPlus className="w-10 h-10 text-cyan-400/60 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-200">No project folders saved in your account yet</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Folders and projects you create are completely private and only accessible inside your account (<strong className="text-cyan-300">{currentUser?.email || 'Current Account'}</strong>).
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto p-1 custom-scrollbar mb-4">
                  {savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleOpenSavedProject(proj)}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Folder: <strong>{proj.folderName}</strong></span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">EX {proj.expNo}</span>
                            <span>•</span>
                            <span>{proj.savedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete saved project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-bold group-hover:bg-cyan-500">
                          Open
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowFolderBrowserModal(false);
                  setShowNewProjectModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer"
              >
                + Create Another Project Folder
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL-PAGE 3D WORKSPACE (PUZZLE OUTLINE & PROGRESSIVE 3D ASSEMBLY)
  // =========================================================================
  return (
    <div 
      ref={workbenchRef} 
      className={`h-full w-full flex flex-col bg-[#02050f] text-slate-100 overflow-hidden font-sans relative ${
        isFullscreenWorkbench ? 'fixed inset-0 z-50 w-screen h-screen' : ''
      }`}
    >
      {/* 1. TOP TOOLBAR */}
      <div className="bg-[#070c1e]/95 backdrop-blur-md border-b border-cyan-500/30 p-2 sm:px-3 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20 shadow-lg text-xs font-mono">
        
        {/* Left: Project Folder & New/Switch Project */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasActiveProject(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/60 font-bold transition-all cursor-pointer shrink-0"
            title="Return to Welcome Screen & Project Folders"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>PROJECTS</span>
          </button>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-cyan-400 font-bold truncate max-w-[100px] sm:max-w-[130px]">{folderName} /</span>
            <span className="text-amber-300 font-bold truncate max-w-[110px] sm:max-w-[150px]">{projectName}</span>
            <span className="text-cyan-300 font-bold">| EX {selectedExpNo}</span>
          </div>
        </div>

        {/* Center 1: 3D Camera Angle Presets */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1.5">VIEW ANGLE:</span>
          {(['iso', 'top', 'front', 'side'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCameraPreset(view)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                activeCameraView === view
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Center 2: UNDO, REDO & RESET WORKBENCH CONTROLS */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-cyan-500/30">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Undo Last Component Placement"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Redo Component Placement"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <button
            onClick={handleResetWorkbench}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-rose-300 hover:bg-rose-950/60 border-l border-slate-700 cursor-pointer"
            title="Clear Workbench to Empty State"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Explode View Slider */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-slate-400">EXPLODE:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={explodeRatio}
            onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
            className="w-16 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-300 font-bold">{Math.round(explodeRatio * 100)}%</span>
        </div>

        {/* Right Tools: Day/Night, Screenshot, Fullscreen & Toggle Right Dock */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setBenchTimeMode(isDay ? 'night' : 'day')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] cursor-pointer ${
              isDay ? 'bg-amber-400/20 text-amber-300 border-amber-400/50' : 'bg-slate-900 text-cyan-300 border-cyan-500/30'
            }`}
            title="Switch Day / Night Lighting"
          >
            {isDay ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isDay ? 'Day' : 'Night'}</span>
          </button>

          <button
            onClick={handleCaptureWorkspace}
            disabled={isCapturingScreenshot}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] cursor-pointer"
            title="Take High-Resolution Screenshot of Workspace"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Screenshot</span>
          </button>

          <button
            onClick={() => setIsFullscreenWorkbench(!isFullscreenWorkbench)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] cursor-pointer"
            title="Full Page Workspace Viewport"
          >
            {isFullscreenWorkbench ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
              isRightPanelOpen 
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan' 
                : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
            }`}
            title="Toggle Right Side Components & Procedure Dock"
          >
            {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span>{isRightPanelOpen ? 'Hide Dock' : 'Show Dock'}</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME RED / GREEN FLASH BANNER AT TOP OF WORKSPACE */}
      {validationAlert && (
        <div className={`absolute top-12 left-4 right-4 z-40 p-3 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono transition-all shadow-2xl animate-in slide-in-from-top-4 duration-300 backdrop-blur-md ${
          validationAlert.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.7)]'
            : 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-[0_0_35px_rgba(244,63,94,0.8)] animate-pulse'
        }`}>
          <div className="flex items-center gap-2.5">
            {validationAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-black tracking-wider mr-2 uppercase">
                {validationAlert.title}
              </span>
              <span className="text-[11px] opacity-90">{validationAlert.message}</span>
            </div>
          </div>
          <button
            onClick={() => setValidationAlert(null)}
            className="text-xs px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. FULL-PAGE 3D WORKSPACE (Holographic Blueprint Outline + Solid Placed Parts) */}
      <div 
        className="flex-1 relative w-full h-full overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropHover(true);
        }}
        onDragLeave={() => setIsDropHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDropHover(false);
          const compId = e.dataTransfer.getData('text/plain');
          if (compId) handleDropComponent(compId);
        }}
      >
        <Canvas shadows className="w-full h-full">
          <PerspectiveCamera makeDefault position={[4, 3.5, 5]} fov={45} />
          <ambientLight intensity={isDay ? 1.6 : 0.8} />
          <directionalLight position={[10, 15, 10]} intensity={isDay ? 2.5 : 1.6} castShadow />
          <directionalLight position={[-10, 10, -10]} intensity={isDay ? 1.2 : 0.8} color="#38bdf8" />
          <pointLight position={[0, 4, 0]} intensity={1.0} color={isDay ? '#ffffff' : '#00f0ff'} />

          {!isDay && (
            <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />
          )}

          {/* ESD Workbench Mat Surface */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[14, 0.1, 9]} />
            <meshStandardMaterial
              color={isDay ? '#475569' : '#0a1226'}
              roughness={isDay ? 0.5 : 0.7}
              metalness={isDay ? 0.3 : 0.4}
            />
          </mesh>

          {/* Precision Measurement Grid */}
          <Grid
            position={[0, 0.01, 0]}
            args={[12, 8]}
            cellSize={0.5}
            cellThickness={0.8}
            cellColor={isDay ? '#64748b' : '#1e3a5f'}
            sectionSize={2}
            sectionThickness={1.4}
            sectionColor={isDay ? '#0284c7' : '#00f0ff'}
            fadeDistance={25}
          />

          {/* 3D Coordinate Triad Axes */}
          <group position={[-5, 0.05, -3]}>
            <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>

          {/* PUZZLE ASSEMBLY SYSTEM: HOLOGRAPHIC BLUEPRINT OUTLINE + INDIVIDUAL SOLID 3D PARTS */}

          {/* EX 1 & 9: Quadcopter-X Puzzle Assembly */}
          {(selectedExpNo === 1 || selectedExpNo === 9) && (
            <group position={[0, 0.1 + explodeRatio * 0.4, 0]}>
              <QuadcopterModel
                scale={1.2}
                spinning={isTestRunning && testThrottle > 0}
                throttle={testThrottle / 10}
                explodedFactor={explodeRatio}
                showFrame={currentCompletedSteps.includes(1)}
                showArms={currentCompletedSteps.includes(2)}
                showMotors={currentCompletedSteps.includes(3)}
                showESCs={currentCompletedSteps.includes(4)}
                showFC={currentCompletedSteps.includes(5)}
                showBattery={currentCompletedSteps.includes(6)}
                showProps={currentCompletedSteps.includes(8)}
                showGhostBlueprint={true}
                activePuzzleStep={nextExpectedStep?.stepNo || 1}
              />
            </group>
          )}

          {/* EX 2 & EX 8: Fixed-Wing Assembly & CG Balancing */}
          {(selectedExpNo === 2 || selectedExpNo === 8) && (
            <group position={[0, 0.4 + explodeRatio * 0.5, 0]}>
              {currentCompletedSteps.length > 0 ? (
                <FixedWingModel
                  scale={0.9}
                  spinning={isTestRunning && testThrottle > 0}
                  throttle={testThrottle}
                  explodedFactor={explodeRatio}
                />
              ) : (
                <mesh>
                  <boxGeometry args={[0.3, 0.3, 3.2]} />
                  <meshStandardMaterial color="#00f0ff" wireframe emissive="#00f0ff" emissiveIntensity={0.6} />
                </mesh>
              )}
            </group>
          )}

          {/* EX 3: Thrust Stand Rig */}
          {selectedExpNo === 3 && (
            <group position={[0, 0, 0]}>
              {currentCompletedSteps.includes(1) ? (
                <mesh position={[0, 0.25, 0]}>
                  <boxGeometry args={[1.8, 0.5, 3.2]} />
                  <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.7} roughness={0.3} />
                </mesh>
              ) : (
                <mesh position={[0, 0.25, 0]}>
                  <boxGeometry args={[1.8, 0.5, 3.2]} />
                  <meshStandardMaterial color="#f59e0b" wireframe emissive="#f59e0b" emissiveIntensity={0.8} />
                </mesh>
              )}
              {currentCompletedSteps.includes(2) && (
                <group position={[0, 0.65, -0.5]}>
                  <BLDCMotorModel scale={1.2} spinning={isTestRunning && testThrottle > 0} rpm={testRPM} />
                  {currentCompletedSteps.includes(5) && (
                    <group position={[0, 0.45, 0]}>
                      <PropellerModel scale={1.1} spinning={isTestRunning && testThrottle > 0} rpm={testRPM} blades={2} />
                    </group>
                  )}
                </group>
              )}
              {currentCompletedSteps.includes(3) && (
                <group position={[-0.5, 0.55, 0.6]}>
                  <ESCModel scale={0.8} ampRating={30} />
                </group>
              )}
              {currentCompletedSteps.includes(4) && (
                <group position={[0.4, 0.55, 0.6]}>
                  <LiPoBatteryModel scale={0.75} cells={3} />
                </group>
              )}
            </group>
          )}

          {/* EX 4: Servo Protractor */}
          {selectedExpNo === 4 && (
            <group position={[0, 0.1, 0]}>
              {currentCompletedSteps.includes(2) && (
                <group position={[0, 0.3, 0]}>
                  <ServoMotorModel scale={1.8} angle={activeServoAngle} />
                </group>
              )}
              {currentCompletedSteps.includes(3) && (
                <mesh position={[0, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.2, 1.6, 32, 1, 0, Math.PI]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.5} />
                </mesh>
              )}
            </group>
          )}

          {/* EX 5: LiPo & IMAX B6 */}
          {selectedExpNo === 5 && (
            <group position={[0, 0.1, 0]}>
              {currentCompletedSteps.includes(1) && (
                <group position={[-1.0, 0.2, 0]}>
                  <LiPoBatteryModel scale={1.3} cells={3} />
                </group>
              )}
              {currentCompletedSteps.includes(3) && (
                <group position={[1.0, 0.2, 0]}>
                  <mesh>
                    <boxGeometry args={[1.8, 0.4, 1.3]} />
                    <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.3} />
                  </mesh>
                </group>
              )}
            </group>
          )}

          {/* EX 6: RC Transmitter & Receiver */}
          {selectedExpNo === 6 && (
            <group position={[0, 0.2, 0]}>
              {currentCompletedSteps.includes(4) && (
                <group position={[-1.2, 0.8, 0]} rotation={[0.4, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[1.6, 2.0, 0.6]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
                  </mesh>
                </group>
              )}
              {currentCompletedSteps.includes(1) && (
                <group position={[1.2, 0.2, 0]}>
                  <mesh>
                    <boxGeometry args={[0.9, 0.3, 0.6]} />
                    <meshStandardMaterial color="#0f172a" />
                  </mesh>
                </group>
              )}
            </group>
          )}

          {/* EX 7: Prop Balancer */}
          {selectedExpNo === 7 && (
            <group position={[0, 0, 0]}>
              {currentCompletedSteps.includes(1) && <BalanceStandModel scale={1.2} />}
              {currentCompletedSteps.includes(2) && (
                <group position={[0, 1.45, 0]}>
                  <PropellerModel scale={1.3} spinning={false} rpm={0} blades={2} />
                </group>
              )}
            </group>
          )}


          {/* EX 10: KK2.1.5 Board */}
          {selectedExpNo === 10 && (
            <group position={[0, 0.2 + explodeRatio * 0.3, 0]}>
              {currentCompletedSteps.includes(1) && <KK215BoardModel scale={1.5} />}
            </group>
          )}

          <OrbitControls ref={orbitControlsRef} enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* CAD WORKSPACE EMPTY STATE CALLOUT */}
        {currentCompletedSteps.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="p-4 rounded-2xl bg-[#091024]/90 border border-cyan-500/40 max-w-sm shadow-xl backdrop-blur-md">
              <Crosshair className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-white mb-1">
                PUZZLE BLUEPRINT READY
              </h3>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                Step 1: Drag <strong>"{nextExpectedStep?.targetComponentName}"</strong> from the components tray and drop it onto the glowing outline!
              </p>
            </div>
          </div>
        )}

        {/* Drag & Drop Hover Overlay */}
        {isDropHover && (
          <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-30 animate-pulse border-4 border-dashed border-cyan-400">
            <Move className="w-12 h-12 text-cyan-300 mb-2 animate-bounce" />
            <span className="text-base font-black text-cyan-200 font-mono tracking-widest uppercase">
              DROP PIECE HERE TO ASSEMBLE
            </span>
          </div>
        )}

        {/* 3. RIGHT-SIDE DOCKED PANEL: 3D COMPONENTS & PROCEDURE WITH CIRCUIT DIAGRAM */}
        {isRightPanelOpen && (
          <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 md:w-[420px] bg-[#070b18]/95 backdrop-blur-md rounded-2xl border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col z-30 overflow-hidden font-mono text-xs">
            
            {/* Dock Header Tabs: [ 📦 3D COMPONENTS ] vs [ 📋 PROCEDURE & CIRCUITS ] */}
            <div className="p-2 border-b border-cyan-500/30 bg-[#091126] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightPanelTab('components')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    rightPanelTab === 'components'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D COMPONENTS</span>
                </button>

                <button
                  onClick={() => setRightPanelTab('procedure')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    rightPanelTab === 'procedure'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PROCEDURE</span>
                </button>
              </div>

              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Collapse Dock"
              >
                ✕
              </button>
            </div>

            {/* TAB CONTENT A: 3D COMPONENTS SECTION (DRAG & DROP SOURCE) */}
            {rightPanelTab === 'components' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-[#050914] shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search components (motor, esc, frame...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-0.5 custom-scrollbar">
                    {['All', 'Mechanical', 'Propulsion', 'Avionics', 'Power', 'Wires & Linkages'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                          activeCategory === cat ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                  {filteredComponents.map((item) => (
                    <div
                      key={item.id}
                      draggable={!item.installed}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`p-2.5 rounded-xl border transition-all flex gap-3 cursor-grab active:cursor-grabbing select-none ${
                        item.installed
                          ? 'bg-emerald-950/30 border-emerald-500/40 opacity-75'
                          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-400/60'
                      }`}
                    >
                      <ComponentVisualBadge visualType={item.visualType} isInstalled={item.installed} />

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px] truncate">
                              {item.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono shrink-0 ml-1">
                              {item.weightG}g
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{item.model}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider">
                            {item.category}
                          </span>

                          {item.installed ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Placed
                            </span>
                          ) : (
                            <span className="text-[9px] text-cyan-400 font-bold flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                              <Move className="w-2.5 h-2.5" />
                              <span>Drag to Blueprint</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-800 bg-[#040814] flex items-center justify-between text-[11px] shrink-0">
                  <span className="text-slate-400">TOTAL HARDWARE LOAD:</span>
                  <span className="text-cyan-300 font-bold">{totalInstalledWeight}g</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: PROCEDURE & CIRCUIT CONNECTION DIAGRAMS (NO "PLACE PART" BUTTON AS REQUESTED) */}
            {rightPanelTab === 'procedure' && (
              <div className="flex-1 flex flex-col overflow-y-auto p-3 space-y-3 custom-scrollbar">
                
                {/* Experiment Aim & Step Progress */}
                <div className="border-b border-slate-800 pb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      EXPERIMENT {activeGuide.expNo}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      {currentCompletedSteps.length} / {activeExpSteps.length} Steps
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug">
                    {activeGuide.title}
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
                    <strong>AIM:</strong> {activeGuide.aim}
                  </p>

                  <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((currentCompletedSteps.length / activeExpSteps.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* RUN & EXECUTE EXPERIMENT BUTTON */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">ASSEMBLY STATUS:</span>
                    <span className={isExpFullyAssembled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {isExpFullyAssembled ? 'READY TO EXECUTE' : `STEP ${nextExpectedStep?.stepNo || 1} PENDING`}
                    </span>
                  </div>

                  <button
                    onClick={handleRunAndExecute}
                    disabled={!isExpFullyAssembled}
                    className={`w-full py-2.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isExpFullyAssembled
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>RUN & EXECUTE EXPERIMENT</span>
                  </button>
                </div>

                {/* STEP-BY-STEP PROCEDURE LIST (REMOVED PLACE PART BUTTON) */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>STEP-BY-STEP PROCEDURE (DRAG FROM 3D TRAY)</span>
                  </h4>

                  {activeExpSteps.map((step) => {
                    const isStepDone = currentCompletedSteps.includes(step.stepNo);
                    const isCurrent = step.stepNo === nextExpectedStep?.stepNo;

                    return (
                      <div
                        key={step.stepNo}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                          isStepDone
                            ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-300'
                            : isCurrent
                            ? 'bg-[#0b1733] border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isStepDone 
                                ? 'bg-emerald-500 text-slate-950' 
                                : isCurrent
                                ? 'bg-amber-400 text-slate-950 animate-bounce'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isStepDone ? '✓' : step.stepNo}
                            </span>
                            <span>{step.title}</span>
                          </span>

                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                              ACTIVE TARGET
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          {step.instruction}
                        </p>

                        {/* CONNECTION CIRCUIT DIAGRAM & PINOUT (IF ANY) */}
                        {step.connectionDiagram && (
                          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[9px] space-y-1">
                            <div className="font-bold text-amber-300 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Cable className="w-3 h-3 text-cyan-400" />
                                <span>CIRCUIT SCHEMATIC & WIRING:</span>
                              </span>
                              <button
                                onClick={() => setActiveSchematicModal({
                                  title: step.title,
                                  ...step.connectionDiagram!
                                })}
                                className="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                              >
                                View Diagram
                              </button>
                            </div>
                            <div className="text-cyan-300">
                              <strong>From:</strong> {step.connectionDiagram.from}
                            </div>
                            <div className="text-cyan-300">
                              <strong>To:</strong> {step.connectionDiagram.to}
                            </div>
                            <div className="text-slate-300 bg-slate-900 p-1 rounded border border-slate-800 font-mono text-[8px]">
                              {step.connectionDiagram.schematicText}
                            </div>
                            <div className="text-slate-400">
                              <strong>Pinout:</strong> {step.connectionDiagram.pinout}
                            </div>
                            <div className="text-slate-400">
                              <strong>Wires:</strong> {step.connectionDiagram.wireColor}
                            </div>
                          </div>
                        )}

                        {/* Target Component Identifier */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px]">
                          <span className="text-slate-400">
                            Required: <strong className="text-cyan-300">{step.targetComponentName}</strong>
                          </span>
                          {isStepDone ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mounted on Blueprint</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold">
                              Drag & Drop onto Blueprint
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. CIRCUIT DIAGRAM FULL SCHEMATIC MODAL */}
      {activeSchematicModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-xl w-full rounded-2xl bg-gradient-to-br from-[#0a1226] via-[#060b18] to-[#02050f] border-2 border-cyan-400 p-6 shadow-[0_0_50px_rgba(6,182,212,0.5)] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Cable className="w-5 h-5 text-cyan-400" />
                <span>CIRCUIT CONNECTION SCHEMATIC</span>
              </div>
              <button
                onClick={() => setActiveSchematicModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-amber-400 font-bold text-xs mb-1">
                  {activeSchematicModal.title}
                </div>
                <div className="text-cyan-300 text-[11px]">
                  <strong>Source:</strong> {activeSchematicModal.from}
                </div>
                <div className="text-cyan-300 text-[11px]">
                  <strong>Destination:</strong> {activeSchematicModal.to}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border-2 border-dashed border-cyan-500/50 text-cyan-200 text-center font-mono text-xs leading-relaxed shadow-inner">
                {activeSchematicModal.schematicText}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-300">
                  <strong>Pinout Configuration:</strong> {activeSchematicModal.pinout}
                </div>
                <div className="text-slate-300">
                  <strong>Wire Standard:</strong> {activeSchematicModal.wireColor}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FINAL OUTPUT MONITOR & OBSERVATION RECORD MODAL (When Experiment Executes) */}
      {showOutputModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#050914] border-2 border-cyan-400 p-5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.5)] font-sans text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4 font-mono shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold">
                      EX {selectedExpNo} EXECUTION TELEMETRY
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      SYSTEM ONLINE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {activeGuide.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowOutputModal(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono hover:border-slate-700 transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto pr-1 space-y-4 font-mono text-xs">

              {/* ========================================================================= */}
              {/* EXP 1: PAYLOAD AND WEIGHT ESTIMATION OF UAV */}
              {/* ========================================================================= */}
              {selectedExpNo === 1 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ALL-UP WEIGHT (AUW/MTOW)</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp1MTOW} g</div>
                      <div className="text-[10px] text-slate-400 mt-1">Empty: {exp1EmptyWeight}g + LiPo: {exp1BatteryWeight}g</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>THRUST-TO-WEIGHT RATIO</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">{exp1TWR} : 1</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ Safe Hover TWR &gt; 2.0</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>COMBINED 4x THRUST</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp1TotalThrust} g</div>
                      <div className="text-[10px] text-slate-400 mt-1">Hover Throttle: {exp1HoverThrottle}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>PAYLOAD FRACTION</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">{exp1PayloadFraction}%</div>
                      <div className="text-[10px] text-purple-400 mt-1">Max Allowable: &lt; 35% MTOW</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        MISSION PAYLOAD WEIGHT CONTROL:
                      </span>
                      <span className="text-cyan-300 font-black">{testPayloadG} grams</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={800}
                      step={10}
                      value={testPayloadG}
                      onChange={(e) => setTestPayloadG(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Observation &amp; Weight Matrix (Analytical Breakdown)</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Sub-Assembly Category</th>
                            <th className="py-1 px-2">Component Breakdown</th>
                            <th className="py-1 px-2 text-right">Mass (g)</th>
                            <th className="py-1 px-2 text-right">% of MTOW</th>
                            <th className="py-1 px-2 text-center">Engineering Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Airframe Structure</td>
                            <td className="py-1.5 px-2">F450 Glass-Fiber PCB Center Plates + 4x PA66 Arms</td>
                            <td className="py-1.5 px-2 text-right">390 g</td>
                            <td className="py-1.5 px-2 text-right">{((390 / exp1MTOW) * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Structural Safety Factor 2.5</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Propulsion Train</td>
                            <td className="py-1.5 px-2">4x A2212 920KV BLDC + 4x 30A ESCs + 4x 1045 Props</td>
                            <td className="py-1.5 px-2 text-right">352 g</td>
                            <td className="py-1.5 px-2 text-right">{((352 / exp1MTOW) * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Total Thrust: 3360 g</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Flight Avionics</td>
                            <td className="py-1.5 px-2">KK2.1.5 Flight Controller + FS-iA6B Rx + Power Wiring</td>
                            <td className="py-1.5 px-2 text-right">82 g</td>
                            <td className="py-1.5 px-2 text-right">{((82 / exp1MTOW) * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Low Mass Avionics Bus</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Energy Storage</td>
                            <td className="py-1.5 px-2">3S 3300mAh LiPo Battery Pack (11.1V Nominal)</td>
                            <td className="py-1.5 px-2 text-right">185 g</td>
                            <td className="py-1.5 px-2 text-right">{((185 / exp1MTOW) * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">14.8 Min Hover Time</td>
                          </tr>
                          <tr className="bg-cyan-950/20 font-bold">
                            <td className="py-1.5 px-2 text-amber-300">Mission Payload</td>
                            <td className="py-1.5 px-2">Sensors / 2-Axis Gimbal &amp; HD Camera Pod</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">{testPayloadG} g</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">{exp1PayloadFraction}%</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Within Airframe Envelope</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 2: FIXED WING UAV FRAME AND AVIONICS COMPONENTS ASSEMBLING */}
              {/* ========================================================================= */}
              {selectedExpNo === 2 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>GLIDE RATIO (L / D)</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp2GlideRatio} : 1</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ High Aero Efficiency</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DYNAMIC LIFT FORCE</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">{exp2Lift} N</div>
                      <div className="text-[10px] text-slate-400 mt-1">@ {testAirspeedMs} m/s Airspeed</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>TOTAL DRAG FORCE</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp2Drag} N</div>
                      <div className="text-[10px] text-slate-400 mt-1">Cd = 0.042 (Parasite + Induced)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-purple-400" />
                        <span>STALL SPEED (V_stall)</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">9.20 m/s</div>
                      <div className="text-[10px] text-purple-400 mt-1">Cruise: 16.5 m/s (59.4 km/h)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        AIRSPEED / WIND TUNNEL VELOCITY:
                      </span>
                      <span className="text-cyan-300 font-black">{testAirspeedMs} m/s ({(testAirspeedMs * 3.6).toFixed(1)} km/h)</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={30}
                      step={0.5}
                      value={testAirspeedMs}
                      onChange={(e) => setTestAirspeedMs(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Airframe Geometry &amp; Aerodynamic Parameters</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Design Parameter</th>
                            <th className="py-1 px-2">Specification / Formula</th>
                            <th className="py-1 px-2 text-right">Value</th>
                            <th className="py-1 px-2 text-center">Status / Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Airframe Wingspan (b)</td>
                            <td className="py-1.5 px-2">Direct span tip-to-tip</td>
                            <td className="py-1.5 px-2 text-right">1200 mm (1.20 m)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Carbon Spar Aligned</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Wing Area (S) &amp; Aspect Ratio</td>
                            <td className="py-1.5 px-2">S = b × c ; AR = b² / S</td>
                            <td className="py-1.5 px-2 text-right">0.216 m² / AR = 6.67</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Optimal Glide Geometry</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Airfoil Section</td>
                            <td className="py-1.5 px-2">Clark-Y Cambered High-Lift Airfoil</td>
                            <td className="py-1.5 px-2 text-right">CL_max: 1.28 | CL_cruise: 0.52</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Smooth Aerodynamic Skin</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Control Surface Linkages</td>
                            <td className="py-1.5 px-2">Ailerons (±15°), Elevator (±20°), Rudder (±25°)</td>
                            <td className="py-1.5 px-2 text-right">Zero Slop Rigging</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Servos Centered</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Avionics Thrust Line</td>
                            <td className="py-1.5 px-2">Firewall Down-Thrust: 2° Down / 1.5° Right</td>
                            <td className="py-1.5 px-2 text-right">1450g Static Thrust</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Counter-Torque Aligned</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 3: CALIBRATION AND ESTIMATION OF MOTOR'S THRUST */}
              {/* ========================================================================= */}
              {selectedExpNo === 3 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        <span>MEASURED LOAD CELL THRUST</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp3Thrust} g</div>
                      <div className="text-[10px] text-emerald-400 mt-1">±1g Precision Strain Gauge</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>OPTICAL TACHOMETER SPEED</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">{exp3RPM} RPM</div>
                      <div className="text-[10px] text-cyan-400 mt-1">Laser Reflector Synced</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>CURRENT &amp; BUS VOLTAGE</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp3Current} A</div>
                      <div className="text-[10px] text-slate-400 mt-1">@ {exp3Voltage} V DC Bus</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-purple-400" />
                        <span>MOTOR EFFICIENCY (g / W)</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">{exp3Efficiency} g/W</div>
                      <div className="text-[10px] text-purple-400 mt-1">Electrical Power: {exp3Power} W</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        ESC PWM THROTTLE SWEEP:
                      </span>
                      <span className="text-cyan-300 font-black">{testThrottle}% ({1000 + testThrottle * 10} µs)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={testThrottle}
                      onChange={(e) => setTestThrottle(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Dynamometer Calibration Curve &amp; Tabulation</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Throttle (%)</th>
                            <th className="py-1 px-2">PWM (µs)</th>
                            <th className="py-1 px-2 text-right">Optical RPM</th>
                            <th className="py-1 px-2 text-right">Thrust (g)</th>
                            <th className="py-1 px-2 text-right">Current (A)</th>
                            <th className="py-1 px-2 text-right">Power (W)</th>
                            <th className="py-1 px-2 text-right">Efficiency (g/W)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2">25% Low Idle</td>
                            <td className="py-1.5 px-2">1250 µs</td>
                            <td className="py-1.5 px-2 text-right">2450</td>
                            <td className="py-1.5 px-2 text-right">212 g</td>
                            <td className="py-1.5 px-2 text-right">3.00 A</td>
                            <td className="py-1.5 px-2 text-right">32.7 W</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">6.48</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2">50% Hover Ref</td>
                            <td className="py-1.5 px-2">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">4900</td>
                            <td className="py-1.5 px-2 text-right">425 g</td>
                            <td className="py-1.5 px-2 text-right">6.00 A</td>
                            <td className="py-1.5 px-2 text-right">64.2 W</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">6.62</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2">75% Climb Rate</td>
                            <td className="py-1.5 px-2">1750 µs</td>
                            <td className="py-1.5 px-2 text-right">7350</td>
                            <td className="py-1.5 px-2 text-right">638 g</td>
                            <td className="py-1.5 px-2 text-right">9.00 A</td>
                            <td className="py-1.5 px-2 text-right">94.5 W</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">6.75</td>
                          </tr>
                          <tr className="bg-cyan-950/20 font-bold">
                            <td className="py-1.5 px-2 text-cyan-300">{testThrottle}% Current</td>
                            <td className="py-1.5 px-2 text-cyan-300">{1000 + testThrottle * 10} µs</td>
                            <td className="py-1.5 px-2 text-right text-cyan-300">{exp3RPM}</td>
                            <td className="py-1.5 px-2 text-right text-cyan-300">{exp3Thrust} g</td>
                            <td className="py-1.5 px-2 text-right text-cyan-300">{exp3Current} A</td>
                            <td className="py-1.5 px-2 text-right text-cyan-300">{exp3Power} W</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">{exp3Efficiency}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 4: UAV CONTROL TESTING AND TRIMMING PROCEDURE */}
              {/* ========================================================================= */}
              {selectedExpNo === 4 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PWM SIGNAL PULSE WIDTH</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp4PulseWidth} µs</div>
                      <div className="text-[10px] text-slate-400 mt-1">Neutral Center: 1500 µs</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SURFACE DEFLECTION ANGLE</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">{exp4Deflection}°</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Pushrod Travel: {exp4Travel} mm</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>DIGITAL SUB-TRIM OFFSET</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">
                        {testSubTrim > 0 ? `+${testSubTrim}` : testSubTrim} µs
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">✓ Zero-Aero Trim Locked</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-purple-400" />
                        <span>ACTUATOR STALL TORQUE</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">1.80 kg·cm</div>
                      <div className="text-[10px] text-purple-400 mt-1">@ 5.02V BEC Bus (0.10s/60°)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">TRANSMITTER GIMBAL DEFLECTION:</span>
                        <span className="text-cyan-300 font-black">{testServoStick}°</span>
                      </div>
                      <input
                        type="range"
                        min={-45}
                        max={45}
                        step={1}
                        value={testServoStick}
                        onChange={(e) => setTestServoStick(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">DIGITAL SUB-TRIM ALIGNMENT:</span>
                        <span className="text-amber-300 font-black">{testSubTrim > 0 ? `+${testSubTrim}` : testSubTrim} µs</span>
                      </div>
                      <input
                        type="range"
                        min={-20}
                        max={20}
                        step={1}
                        value={testSubTrim}
                        onChange={(e) => setTestSubTrim(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Control Surface Trimming &amp; Signal Bus Schedule</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Control Surface</th>
                            <th className="py-1 px-2">Channel</th>
                            <th className="py-1 px-2 text-right">Neutral Pulse</th>
                            <th className="py-1 px-2 text-right">Trimming Offset</th>
                            <th className="py-1 px-2 text-right">Angular Throw</th>
                            <th className="py-1 px-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Ailerons (Roll Axis)</td>
                            <td className="py-1.5 px-2">CH1</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">{testSubTrim > 0 ? `+${testSubTrim}` : testSubTrim} µs</td>
                            <td className="py-1.5 px-2 text-right">±15.0° (12.5mm travel)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Calibrated Neutral</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Elevator (Pitch Axis)</td>
                            <td className="py-1.5 px-2">CH2</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">0 µs</td>
                            <td className="py-1.5 px-2 text-right">±20.0° (15.0mm travel)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Centered</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Rudder (Yaw Axis)</td>
                            <td className="py-1.5 px-2">CH4</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">0 µs</td>
                            <td className="py-1.5 px-2 text-right">±25.0° (18.0mm travel)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Centered</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 5: LITHIUM POLYMER BATTERY TESTING, BALANCING AND MAINTENANCE */}
              {/* ========================================================================= */}
              {selectedExpNo === 5 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PACK TERMINAL VOLTAGE</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp5PackVoltage} V</div>
                      <div className="text-[10px] text-slate-400 mt-1">State of Charge: {testLiPoSoC}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CELL DELTA (ΔV) BALANCE</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">7.0 mV</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ Ultra-Balanced (&lt; 15mV)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>INTERNAL RESISTANCE (IR)</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">4.2 mΩ/cell</div>
                      <div className="text-[10px] text-slate-400 mt-1">Total Pack: 12.6 mΩ (Healthy)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span>MAX DISCHARGE RATING</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">{exp5MaxDischarge} A</div>
                      <div className="text-[10px] text-purple-400 mt-1">25C Rate on 3300mAh Pack</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        BATTERY STATE OF CHARGE (SoC):
                      </span>
                      <span className="text-cyan-300 font-black">{testLiPoSoC}% ({(exp5PackVoltage)}V Pack)</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={1}
                      value={testLiPoSoC}
                      onChange={(e) => setTestLiPoSoC(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Individual Cell Voltage &amp; Health Log</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Cell Location</th>
                            <th className="py-1 px-2 text-right">Cell Voltage (V)</th>
                            <th className="py-1 px-2 text-right">Internal Resistance (IR)</th>
                            <th className="py-1 px-2">Electrode State</th>
                            <th className="py-1 px-2 text-center">Condition</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Cell 1 (Cathode Side)</td>
                            <td className="py-1.5 px-2 text-right">{exp5Cell1} V</td>
                            <td className="py-1.5 px-2 text-right">4.1 mΩ</td>
                            <td className="py-1.5 px-2">LiCoO2 / High-Purity Graphite</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Balanced</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Cell 2 (Center Core)</td>
                            <td className="py-1.5 px-2 text-right">{exp5Cell2} V</td>
                            <td className="py-1.5 px-2 text-right">4.3 mΩ</td>
                            <td className="py-1.5 px-2">LiCoO2 / High-Purity Graphite</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Balanced</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Cell 3 (Anode Side)</td>
                            <td className="py-1.5 px-2 text-right">{exp5Cell3} V</td>
                            <td className="py-1.5 px-2 text-right">4.2 mΩ</td>
                            <td className="py-1.5 px-2">LiCoO2 / High-Purity Graphite</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Balanced</td>
                          </tr>
                          <tr className="bg-cyan-950/20">
                            <td className="py-1.5 px-2 text-amber-300">Storage Setpoint Target</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">3.850 V / cell</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">11.55 V Pack</td>
                            <td className="py-1.5 px-2" colSpan={2}>Optimal long-term storage preservation</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 6: RC TRANSMITTER RESETTING, CALIBRATION AND FREQUENCY BINDING */}
              {/* ========================================================================= */}
              {selectedExpNo === 6 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span>RF PROTOCOL BINDING</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">BOUND &amp; SYNC</div>
                      <div className="text-[10px] text-emerald-400 mt-1">AFHDS 2A 2.4GHz FHSS</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RSSI SIGNAL STRENGTH</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">-58 dBm</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Link: 98% (Packet Loss: 0%)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>GIMBAL ENDPOINTS</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">1000 - 2000 µs</div>
                      <div className="text-[10px] text-slate-400 mt-1">50Hz Refresh (20ms)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>FAILSAFE INTERLOCK</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">ARMED &amp; SAFE</div>
                      <div className="text-[10px] text-purple-400 mt-1">Throttle Cut &lt; 950 µs</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-slate-300 font-bold block text-xs">INSPECT TRANSMITTER CHANNEL TELEMETRY:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setTestRFChannel(ch)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            testRFChannel === ch
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] font-bold">CH {ch}</div>
                          <div className="text-[9px] mt-0.5">
                            {ch === 1 ? 'Roll' : ch === 2 ? 'Pitch' : ch === 3 ? 'Throttle' : ch === 4 ? 'Yaw' : ch === 5 ? 'Mode' : 'Arm'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus 6-Channel PWM Endpoint &amp; Failsafe Mapping</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Channel</th>
                            <th className="py-1 px-2">Function</th>
                            <th className="py-1 px-2 text-right">Min Pulse</th>
                            <th className="py-1 px-2 text-right">Center Neutral</th>
                            <th className="py-1 px-2 text-right">Max Pulse</th>
                            <th className="py-1 px-2 text-center">Failsafe Reaction</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr className={testRFChannel === 1 ? 'bg-cyan-950/30' : ''}>
                            <td className="py-1.5 px-2 text-cyan-300">CH1</td>
                            <td className="py-1.5 px-2">Aileron (Roll Axis)</td>
                            <td className="py-1.5 px-2 text-right">1000 µs</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">2000 µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Hold Neutral (1500 µs)</td>
                          </tr>
                          <tr className={testRFChannel === 2 ? 'bg-cyan-950/30' : ''}>
                            <td className="py-1.5 px-2 text-cyan-300">CH2</td>
                            <td className="py-1.5 px-2">Elevator (Pitch Axis)</td>
                            <td className="py-1.5 px-2 text-right">1000 µs</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">2000 µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Hold Neutral (1500 µs)</td>
                          </tr>
                          <tr className={testRFChannel === 3 ? 'bg-cyan-950/30' : ''}>
                            <td className="py-1.5 px-2 text-cyan-300">CH3</td>
                            <td className="py-1.5 px-2">Throttle (Collective)</td>
                            <td className="py-1.5 px-2 text-right">1000 µs</td>
                            <td className="py-1.5 px-2 text-right">1000 µs (Idle)</td>
                            <td className="py-1.5 px-2 text-right">2000 µs</td>
                            <td className="py-1.5 px-2 text-center text-rose-400 font-bold">CUT MOTOR (950 µs)</td>
                          </tr>
                          <tr className={testRFChannel === 4 ? 'bg-cyan-950/30' : ''}>
                            <td className="py-1.5 px-2 text-cyan-300">CH4</td>
                            <td className="py-1.5 px-2">Rudder (Yaw Axis)</td>
                            <td className="py-1.5 px-2 text-right">1000 µs</td>
                            <td className="py-1.5 px-2 text-right">1500 µs</td>
                            <td className="py-1.5 px-2 text-right">2000 µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Hold Neutral (1500 µs)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 7: PROPELLER BALANCING PROCEDURE */}
              {/* ========================================================================= */}
              {selectedExpNo === 7 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>VIBRATION AMPLITUDE (V_rms)</span>
                      </div>
                      <div className={`text-xl font-black mt-1 ${isPropBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {exp7Vrms} mm/s
                      </div>
                      <div className="text-[10px] mt-1 text-slate-400">
                        {isPropBalanced ? '✓ Smooth Aero Spec (< 0.5 mm/s)' : '⚠️ Excessive Vibration'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ACCELEROMETER G-FORCE</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp7GForce} G</div>
                      <div className="text-[10px] text-slate-400 mt-1">3-Axis Piezoelectric Sensor</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>STATIC IMBALANCE MASS</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp7Imbalance} mg</div>
                      <div className="text-[10px] text-slate-400 mt-1">Magnetic Levitation Balancer</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                        <span>DYNAMIC TRACKING RUNOUT</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">{exp7Runout} mm</div>
                      <div className="text-[10px] text-purple-400 mt-1">Blade Tip Plane Coincidence</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-300 font-bold block text-xs">DYNAMIC PROPELLER BALANCE CORRECTION:</span>
                      <span className="text-[11px] text-slate-400">Apply 3M micro-aerodynamic balance tape to lighter blade</span>
                    </div>
                    <button
                      onClick={() => setIsPropBalanced(!isPropBalanced)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isPropBalanced
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose'
                      }`}
                    >
                      <span>{isPropBalanced ? '✓ BALANCED (Aero Tape Applied)' : '⚠️ UNBALANCED (Raw Propeller)'}</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Harmonic Vibration Spectrum &amp; Attenuation Log</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Harmonic Order</th>
                            <th className="py-1 px-2">Frequency (Hz)</th>
                            <th className="py-1 px-2 text-right">Raw Unbalanced</th>
                            <th className="py-1 px-2 text-right">Tape Balanced</th>
                            <th className="py-1 px-2 text-center">Attenuation Efficiency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">1X RPM Fundamental</td>
                            <td className="py-1.5 px-2">160 Hz (9600 RPM)</td>
                            <td className="py-1.5 px-2 text-right text-rose-400">4.82 mm/s (42 dB)</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">0.38 mm/s (8 dB)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">-92.1% (34 dB Drop)</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">2X Blade Passage Frequency</td>
                            <td className="py-1.5 px-2">320 Hz (2-Blade)</td>
                            <td className="py-1.5 px-2 text-right text-rose-400">2.14 mm/s (26 dB)</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">0.18 mm/s (4 dB)</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">-91.6% (22 dB Drop)</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Flight Controller IMU Noise</td>
                            <td className="py-1.5 px-2">0 - 500 Hz Broadband</td>
                            <td className="py-1.5 px-2 text-right text-rose-400">1.85 G RMS</td>
                            <td className="py-1.5 px-2 text-right text-emerald-400">0.14 G RMS</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">✓ Sensor Gyro Stabilized</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 8: FIXED WING UAV CENTRE OF GRAVITY CALCULATION AND BALANCING */}
              {/* ========================================================================= */}
              {selectedExpNo === 8 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>LONGITUDINAL CG (X_CG)</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp8XCG} mm</div>
                      <div className="text-[10px] text-slate-400 mt-1">From Leading Edge (LE = 0)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CG AS % OF MAC</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">{exp8CGMac}% MAC</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Optimal Window: 28% - 33%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>STATIC MARGIN (SM)</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp8SM}%</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {parseFloat(exp8SM) >= 10 ? '✓ Highly Stable' : parseFloat(exp8SM) >= 5 ? '✓ Positive Stable' : '⚠️ Neutral'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-purple-400" />
                        <span>PITCH STABILITY DERIVATIVE</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">dCm/dα &lt; 0</div>
                      <div className="text-[10px] text-purple-400 mt-1">Self-Restoring Moment</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        BATTERY LONGITUDINAL POSITION ADJUSTMENT:
                      </span>
                      <span className="text-cyan-300 font-black">
                        {testBatteryShiftMm > 0 ? `+${testBatteryShiftMm}` : testBatteryShiftMm} mm along Fuselage Datum
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={1}
                      value={testBatteryShiftMm}
                      onChange={(e) => setTestBatteryShiftMm(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Moment Balance Matrix (Datum = Wing Leading Edge)</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Station / Component</th>
                            <th className="py-1 px-2 text-right">Mass (g)</th>
                            <th className="py-1 px-2 text-right">Moment Arm from LE (mm)</th>
                            <th className="py-1 px-2 text-right">Moment (N·mm)</th>
                            <th className="py-1 px-2 text-center">Stability Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Motor &amp; Firewall Assembly</td>
                            <td className="py-1.5 px-2 text-right">165 g</td>
                            <td className="py-1.5 px-2 text-right">-85.0 mm</td>
                            <td className="py-1.5 px-2 text-right">-13,760 N·mm</td>
                            <td className="py-1.5 px-2 text-center text-cyan-400">Nose Ballast</td>
                          </tr>
                          <tr className="bg-cyan-950/20 font-bold">
                            <td className="py-1.5 px-2 text-amber-300">Movable 4S LiPo Battery</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">245 g</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">{110 + testBatteryShiftMm} mm</td>
                            <td className="py-1.5 px-2 text-right text-amber-300">
                              {((245 * 9.81 / 1000) * (110 + testBatteryShiftMm)).toFixed(0)} N·mm
                            </td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Primary CG Adjuster</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Main Wings &amp; Carbon Spar</td>
                            <td className="py-1.5 px-2 text-right">380 g</td>
                            <td className="py-1.5 px-2 text-right">+65.0 mm</td>
                            <td className="py-1.5 px-2 text-right">+24,230 N·mm</td>
                            <td className="py-1.5 px-2 text-center text-cyan-400">Aerodynamic Center</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Tail Empennage &amp; Servos</td>
                            <td className="py-1.5 px-2 text-right">110 g</td>
                            <td className="py-1.5 px-2 text-right">+480.0 mm</td>
                            <td className="py-1.5 px-2 text-right">+51,800 N·mm</td>
                            <td className="py-1.5 px-2 text-center text-cyan-400">Pitch Restoring Arm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 9: DRONE BASE AND AVIONIC COMPONENTS ASSEMBLING (QUADCOPTER) */}
              {/* ========================================================================= */}
              {selectedExpNo === 9 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        <span>COMBINED 4-ROTOR THRUST</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">{exp9Thrust} g</div>
                      <div className="text-[10px] text-slate-400 mt-1">Hover Equilibrium: 1080 g</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>HOVER THROTTLE RATIO</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">42.5 %</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ 3.15:1 TWR Power Headroom</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>4-CH ESC PWM COMMAND</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">{exp9PWM} µs</div>
                      <div className="text-[10px] text-slate-400 mt-1">M1 - M4 Synchronized</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        <span>YAW TORQUE REACTION</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">0.00 N·m</div>
                      <div className="text-[10px] text-purple-400 mt-1">2x CW + 2x CCW Equilibrium</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        COLLECTIVE FLIGHT THROTTLE:
                      </span>
                      <span className="text-cyan-300 font-black">{testQuadThrottle}% (Hover Setpoint: 42%)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={testQuadThrottle}
                      onChange={(e) => setTestQuadThrottle(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus Quadcopter-X Motor Orientation &amp; Signal Schedule</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Motor Index</th>
                            <th className="py-1 px-2">Frame Arm</th>
                            <th className="py-1 px-2">Spin Direction</th>
                            <th className="py-1 px-2">Propeller Pitch</th>
                            <th className="py-1 px-2 text-right">PWM Signal</th>
                            <th className="py-1 px-2 text-center">Torque Vector</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300 font-bold">M1</td>
                            <td className="py-1.5 px-2">Front-Right (Red Arm)</td>
                            <td className="py-1.5 px-2 text-amber-300">CCW (Counter-Clockwise)</td>
                            <td className="py-1.5 px-2">1045R Reverse Pitch</td>
                            <td className="py-1.5 px-2 text-right">{exp9PWM} µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">+τ Yaw Torque</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300 font-bold">M2</td>
                            <td className="py-1.5 px-2">Rear-Left (White Arm)</td>
                            <td className="py-1.5 px-2 text-amber-300">CCW (Counter-Clockwise)</td>
                            <td className="py-1.5 px-2">1045R Reverse Pitch</td>
                            <td className="py-1.5 px-2 text-right">{exp9PWM} µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">+τ Yaw Torque</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300 font-bold">M3</td>
                            <td className="py-1.5 px-2">Front-Left (Red Arm)</td>
                            <td className="py-1.5 px-2 text-cyan-300">CW (Clockwise)</td>
                            <td className="py-1.5 px-2">1045 Standard Pitch</td>
                            <td className="py-1.5 px-2 text-right">{exp9PWM} µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">-τ Yaw Torque</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300 font-bold">M4</td>
                            <td className="py-1.5 px-2">Rear-Right (White Arm)</td>
                            <td className="py-1.5 px-2 text-cyan-300">CW (Clockwise)</td>
                            <td className="py-1.5 px-2">1045 Standard Pitch</td>
                            <td className="py-1.5 px-2 text-right">{exp9PWM} µs</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">-τ Yaw Torque</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* EXP 10: DRONE FLIGHT CONTROLLER PROGRAMMING AND CALIBRATION (KK 2.1.5) */}
              {/* ========================================================================= */}
              {selectedExpNo === 10 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>6-AXIS ACCELEROMETER CAL</span>
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">X:0 Y:0 Z:1.00G</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ Calibrated Level Horizon</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GYROSCOPE DRIFT RATE</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-1">&lt; 0.04 °/s</div>
                      <div className="text-[10px] text-cyan-400 mt-1">InvenSense MPU6050 @ 400Hz</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>ROLL/PITCH PI GAINS</span>
                      </div>
                      <div className="text-xl font-black text-amber-300 mt-1">P:{testPGain} | I:{testIGain}</div>
                      <div className="text-[10px] text-slate-400 mt-1">P-Limit: 100 | I-Limit: 20</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>SELF-LEVELING FILTER</span>
                      </div>
                      <div className="text-xl font-black text-purple-300 mt-1">
                        {testSelfLevel ? 'ACTIVE' : 'RATE MODE'}
                      </div>
                      <div className="text-[10px] text-purple-400 mt-1">Atmega644PA 8-Bit RISC MCU</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">ROLL/PITCH P-GAIN:</span>
                        <span className="text-cyan-300 font-black">{testPGain} (Default 55)</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={90}
                        step={1}
                        value={testPGain}
                        onChange={(e) => setTestPGain(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">ROLL/PITCH I-GAIN:</span>
                        <span className="text-amber-300 font-black">{testIGain} (Default 30)</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={60}
                        step={1}
                        value={testIGain}
                        onChange={(e) => setTestIGain(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-cyan-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Syllabus KK2.1.5 EEPROM Configuration &amp; Gain Settings</span>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1 px-2">Parameter Name</th>
                            <th className="py-1 px-2">EEPROM Register</th>
                            <th className="py-1 px-2 text-right">Programmed Value</th>
                            <th className="py-1 px-2 text-right">Standard Range</th>
                            <th className="py-1 px-2 text-center">Flight Dynamic Effect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Roll/Pitch P-Gain</td>
                            <td className="py-1.5 px-2">0x0014</td>
                            <td className="py-1.5 px-2 text-right font-bold text-cyan-300">{testPGain}</td>
                            <td className="py-1.5 px-2 text-right">40 - 75</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Rotational angular stiffness</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Roll/Pitch I-Gain</td>
                            <td className="py-1.5 px-2">0x0016</td>
                            <td className="py-1.5 px-2 text-right font-bold text-amber-300">{testIGain}</td>
                            <td className="py-1.5 px-2 text-right">20 - 45</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Wind gust drift rejection</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Yaw P-Gain / I-Gain</td>
                            <td className="py-1.5 px-2">0x0018</td>
                            <td className="py-1.5 px-2 text-right">P: 60 | I: 35</td>
                            <td className="py-1.5 px-2 text-right">P: 50-80 / I: 25-50</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Prevents heading slip</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 text-cyan-300">Accelerometer Zero-G</td>
                            <td className="py-1.5 px-2">0x0030</td>
                            <td className="py-1.5 px-2 text-right">X:+1 / Y:-1 / Z:+256</td>
                            <td className="py-1.5 px-2 text-right">±10 LSB Offset</td>
                            <td className="py-1.5 px-2 text-center text-emerald-400">Level attitude reference</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-cyan-500/20 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCaptureWorkspace}
                  disabled={isCapturingScreenshot}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-glow-cyan flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturingScreenshot ? 'Capturing...' : 'SCREENSHOT OUTPUT'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowOutputModal(false);
                    setSelectedReportExpId(selectedExpNo);
                    setIsRecordModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-glow-blue flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>GENERATE OFFICIAL LAB RECORD</span>
                </button>
              </div>

              <button
                onClick={() => setShowOutputModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer transition-colors"
              >
                Return to Workbench
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
