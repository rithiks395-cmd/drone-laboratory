import React, { useState, useRef, useMemo } from 'react';
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
  Zap, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Search,
  Camera,
  Sun,
  Moon,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  Check,
  XCircle,
  Move,
  FolderPlus,
  Box,
  Cable,
  CheckCheck,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  Crosshair,
  Sliders
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

// 3D Miniature Model Thumbnail for Components Tray
const Component3DThumbnail: React.FC<{ visualType: string; isInstalled: boolean }> = ({ visualType, isInstalled }) => {
  return (
    <div className={`w-14 h-14 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 transition-all ${
      isInstalled 
        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
        : 'bg-slate-900 border-cyan-500/30'
    }`}>
      <Canvas className="w-full h-full" camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={2.0} />
        <group scale={0.7} rotation={[0.4, 0.6, 0]}>
          {visualType === 'frame' && (
            <mesh>
              <cylinderGeometry args={[1, 1, 0.1, 6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
          )}
          {visualType === 'arm' && (
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[2, 0.2, 0.3]} />
              <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.4} />
            </mesh>
          )}
          {visualType === 'motor' && (
            <group scale={0.6}>
              <BLDCMotorModel scale={0.9} spinning={false} rpm={0} />
            </group>
          )}
          {visualType === 'esc' && (
            <group scale={0.7}>
              <ESCModel scale={0.8} ampRating={30} />
            </group>
          )}
          {visualType === 'prop' && (
            <group scale={0.5}>
              <PropellerModel scale={0.8} spinning={false} rpm={0} blades={2} />
            </group>
          )}
          {visualType === 'battery' && (
            <group scale={0.6}>
              <LiPoBatteryModel scale={0.8} cells={3} />
            </group>
          )}
          {visualType === 'fc' && (
            <group scale={0.6}>
              <KK215BoardModel scale={0.9} />
            </group>
          )}
          {visualType === 'servo' && (
            <group scale={0.6}>
              <ServoMotorModel scale={0.9} angle={45} />
            </group>
          )}
          {visualType === 'thrust_rig' && (
            <mesh>
              <boxGeometry args={[1.6, 0.6, 1.2]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
            </mesh>
          )}
          {visualType === 'balancer' && (
            <group scale={0.4}>
              <BalanceStandModel scale={0.8} />
            </group>
          )}
          {!['frame', 'arm', 'motor', 'esc', 'prop', 'battery', 'fc', 'servo', 'thrust_rig', 'balancer'].includes(visualType) && (
            <mesh>
              <octahedronGeometry args={[0.9]} />
              <meshStandardMaterial color="#06b6d4" wireframe />
            </mesh>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export const HardwareWorkbenchView: React.FC = () => {
  const { setSelectedReportExpId, setIsRecordModalOpen, atmosphereTheme } = useLab();
  const workbenchRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);

  // Big Screen Fullscreen Workbench
  const [isFullscreenWorkbench, setIsFullscreenWorkbench] = useState<boolean>(false);

  // Project State: Initialized via the Welcome Screen
  const [hasActiveProject, setHasActiveProject] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('My UAV Assembly Project');
  const [tempProjectName, setTempProjectName] = useState<string>('UAV Quadcopter Prototype - 2026');
  const [selectedExpNo, setSelectedExpNo] = useState<number>(1);

  // Floating Right-Side Dock State: Tab can be 'components' or 'procedure'
  const [rightPanelTab, setRightPanelTab] = useState<'components' | 'procedure'>('procedure');
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

  // AutoCAD Camera View Presets
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

  // Circuit Diagram Modal State
  const [activeSchematicModal, setActiveSchematicModal] = useState<{
    title: string;
    from: string;
    to: string;
    pinout: string;
    wireColor: string;
    schematicText: string;
  } | null>(null);

  // Live Experiment Test Controls
  const [testThrottle, setTestThrottle] = useState<number>(0);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeServoAngle, setActiveServoAngle] = useState<number>(45);

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

  // Master Guided Execution Protocols for Experiments 1 through 10 with detailed Connection Diagrams
  const experimentGuides: Record<number, ExperimentGuide> = useMemo(() => ({
    1: {
      expNo: 1,
      title: 'UAV Component Identification & Structural Architecture',
      aim: 'Identify physical UAV airframe structures, propulsion motors, ESCs, flight controller, and power distribution subsystems.',
      steps: [
        {
          stepNo: 1,
          title: 'Select & Place F450 Carbon-Fiber Center Frame',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'From the components tray on the right, locate and drag the "F450 Quad-X Carbon Frame Plates" onto the center of the ESD workbench.',
        },
        {
          stepNo: 2,
          title: 'Mount PA66 Arm Struts (2 Red Front / 2 White Rear)',
          actionType: 'mount',
          targetComponentId: 'arms_f450',
          targetComponentName: 'F450 High-Strength Arm Struts (x4)',
          instruction: 'Pick the "F450 High-Strength Arm Struts (x4)" and mount them onto the lower PCB plate using M3 hex screws.',
        },
        {
          stepNo: 3,
          title: 'Fasten 4x A2212 1000KV BLDC Motors',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Locate "A2212 1000KV Brushless DC Motors (x4)" and bolt them to arm tips with CW and CCW threaded shafts positioned diagonally.',
        },
        {
          stepNo: 4,
          title: 'Route ESC 3-Phase Bullet Leads & Solder to PDB',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Connect the 3-phase bullet connectors of the SimonK 30A ESCs to the BLDC motor wires, then solder DC leads to the integrated PDB pads.',
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
          title: 'Mount KK2.1.5 Flight Controller on Vibration Dampers',
          actionType: 'mount',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK2.1.5 Multi-Rotor Flight Controller',
          instruction: 'Fasten the KK2.1.5 board to the upper center frame using anti-vibration rubber bobbins with the forward orientation arrow pointing forward.',
        },
        {
          stepNo: 6,
          title: 'Secure Turnigy 3S 2200mAh LiPo & Connect XT60',
          actionType: 'wire',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Mount the LiPo battery under the belly tray with velcro strap and plug the main XT60 connector into the PDB harness.',
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
          title: 'Connect FS-iA6B 2.4GHz Receiver Channels',
          actionType: 'wire',
          targetComponentId: 'rc_receiver_ia6b',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'Plug 3-pin servo leads from Receiver Channels 1-4 (Aileron, Elevator, Throttle, Rudder) to the input header of the KK2.1.5 board.',
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
          title: 'Install 1045 Propellers (CW & CCW Pair)',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Lock 1045 props onto motor shafts using nyloc prop nuts: Motor 1/3 (CCW pusher) & Motor 2/4 (CW tractor). Assembly complete!',
        }
      ]
    },
    2: {
      expNo: 2,
      title: 'Fixed-Wing Aircraft Structural Assembly & Control Linkages',
      aim: 'Assemble EPO trainer airframe, insert high-strength carbon wing spar, install aileron/elevator micro-servos and mechanical pushrods.',
      steps: [
        {
          stepNo: 1,
          title: 'Place Fixed-Wing EPO Trainer Fuselage',
          actionType: 'pick',
          targetComponentId: 'fixed_wing_airframe',
          targetComponentName: 'Trainer Fixed-Wing EPO Airframe',
          instruction: 'Drag the EPO Trainer Fuselage onto the ESD workbench.',
        },
        {
          stepNo: 2,
          title: 'Insert Carbon-Fiber Wing Spar Tube',
          actionType: 'mount',
          targetComponentId: 'wing_spar_carbon',
          targetComponentName: 'High-Modulus Carbon Fiber Wing Spar Tube',
          instruction: 'Slide the 10mm OD pultruded carbon spar through the fuselage wing bay to carry the bending moment of the wings.',
        },
        {
          stepNo: 3,
          title: 'Install SG90 Micro Servos in Wing & Tail Pockets',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Insert 4x SG90 servos into wing cutouts and vertical stabilizer for Aileron, Elevator, and Rudder control.',
        },
        {
          stepNo: 4,
          title: 'Fit Piano-Wire Pushrods to Nylon Control Horns',
          actionType: 'wire',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Connect 1.2mm steel pushrods from servo arms to aerodynamic surface horns with zero mechanical slop.',
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
          title: 'Mount Tractor BLDC Motor & 1045 Propeller',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt the A2212 motor to the nose firewall and tighten the 1045 propeller for propulsion thrust.',
        }
      ]
    },
    3: {
      expNo: 3,
      title: 'BLDC Motor & Propeller Thrust Calibration Bench',
      aim: 'Calibrate static thrust (grams), rotational speed (RPM), and electrical power efficiency (g/W) using digital strain-gauge rig.',
      steps: [
        {
          stepNo: 1,
          title: 'Setup Linear Digital Thrust Stand Rig',
          actionType: 'pick',
          targetComponentId: 'thrust_rig',
          targetComponentName: 'Digital Load-Cell Thrust Stand Rig',
          instruction: 'Position the 5kg dual-rail thrust measurement stand on the ESD workbench.',
        },
        {
          stepNo: 2,
          title: 'Bolt A2212 1000KV Motor onto Sliding Carriage',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Mount the brushless outrunner motor rigidly onto the thrust stand carriage facing forward.',
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
      title: 'Control Surface Deflection & Servo Angular Testing',
      aim: 'Measure control surface angular deflection (degrees) versus PWM pulse width (microseconds) using servo tester and acrylic protractor.',
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
          instruction: 'Align the protractor dial with the servo output shaft centerline to measure angular displacement.',
        },
        {
          stepNo: 4,
          title: 'Attach Pointer Needle Linkage & Calibrate Neutral (1500μs)',
          actionType: 'mount',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Attach pointer needle to servo arm and verify 90° center alignment at 1500μs neutral pulse.',
        }
      ]
    },
    5: {
      expNo: 5,
      title: 'LiPo Battery Chemistry, Discharge Rates & Smart Balancing',
      aim: 'Analyze per-cell voltage, IR internal resistance, and balance charging using IMAX B6 microprocessor charger.',
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
          instruction: 'Plug JST-XH 4-pin balance connector into the cell checker to verify Cell 1, 2, and 3 voltage matching.',
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
          instruction: 'Connect XT60 main power banana leads and the JST-XH balance lead to the IMAX B6 charger for CC/CV balance charging.',
        }
      ]
    },
    6: {
      expNo: 6,
      title: 'RC Transmitter & Receiver Calibration & Failsafe Binding',
      aim: 'Bind 2.4GHz FlySky FS-i6 transmitter to FS-iA6B receiver, calibrate gimbals, and configure throttle cut failsafe.',
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
      title: 'Propeller Static & Dynamic Balancing Protocol',
      aim: 'Identify blade mass imbalance and blade tracking errors using magnetic suspension balancer, applying balancing tape to eliminate vibration.',
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
      title: 'Subsonic Wind Tunnel Aerodynamic Lift & Drag Testing',
      aim: 'Measure pressure distribution along Clark-Y / NACA airfoil surface and calculate lift coefficient (CL) and drag coefficient (CD) at various AoA.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount NACA 0012 / Clark-Y Airfoil in Test Section',
          actionType: 'pick',
          targetComponentId: 'airfoil_naca',
          targetComponentName: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
          instruction: 'Mount the airfoil model between the optical glass walls of the wind tunnel test section on the angle-of-attack rotary mount.',
        },
        {
          stepNo: 2,
          title: 'Install Pitot-Static Tube in Free-Stream Flow',
          actionType: 'mount',
          targetComponentId: 'pitot_tube',
          targetComponentName: 'Pitot-Static Tube Differential Airspeed Probe',
          instruction: 'Align the pitot-static tube upstream of the airfoil to measure free-stream dynamic pressure (q = 1/2 * rho * V^2).',
        },
        {
          stepNo: 3,
          title: 'Connect Pressure Taps to Multi-Tube Water Manometer',
          actionType: 'wire',
          targetComponentId: 'manometer_water',
          targetComponentName: 'Inclined U-Tube Water Differential Manometer',
          instruction: 'Run flexible silicone tubing from upper and lower airfoil surface pressure orifices to the inclined water manometer board.',
          connectionDiagram: {
            from: 'Airfoil Surface Pressure Orifices (P1 to P12)',
            to: 'Inclined Water Manometer Tube Array (H2O rho = 1000 kg/m3)',
            pinout: 'Port 1-6: Upper Surface Suction Side, Port 7-12: Lower Surface Pressure Side',
            wireColor: 'Transparent 2mm Silicone Pressure Tubing',
            schematicText: '[Airfoil Upper Surface Taps] ──► [Manometer Limbs (mmH2O Deflection)] ──► [Delta-P = rho * g * delta-h] ──► [Cp Distribution]'
          }
        }
      ]
    },
    9: {
      expNo: 9,
      title: 'Complete Quadcopter Systems Integration & Pre-Flight Check',
      aim: 'Full hardware integration of F450 frame, BLDC motors, ESCs, KK2.1.5 board, 3S LiPo, and FS-iA6B receiver into a flight-ready UAV.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount F450 Carbon-Fiber Center Frame Plates',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'Place the F450 main structural frame onto the assembly table.',
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
          title: 'Install 1045 Carbon Propellers & Verify Pre-Arm Readiness',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Thread on 1045 CW and CCW props. Pre-flight hardware assembly is 100% complete and flight ready!',
        }
      ]
    },
    10: {
      expNo: 10,
      title: 'KK2.1.5 Flight Controller Sensor Calibration & Firmware Upload',
      aim: 'Calibrate on-board MPU6050 6-axis gyro/accelerometer, tune PID stabilization loops (P-gain, I-gain), and program motor mixer via USBasp.',
      steps: [
        {
          stepNo: 1,
          title: 'Place KK2.1.5 LCD Flight Control Board',
          actionType: 'pick',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK2.1.5 Multi-Rotor Flight Controller',
          instruction: 'Place the KK2.1.5 controller on the anti-static mat with access to buttons and ISP header.',
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

  // Handle Drag & Drop Component Validation (Green / Red feedback)
  const handleDropComponent = (droppedCompId: string) => {
    if (!hasActiveProject) {
      setValidationAlert({
        type: 'error',
        title: 'NO PROJECT ACTIVE',
        message: 'Please initialize an assembly project first before placing parts.',
        componentName: 'Workbench Locked',
      });
      return;
    }

    if (isExpFullyAssembled) {
      setValidationAlert({
        type: 'success',
        title: 'ASSEMBLY COMPLETE',
        message: 'All procedure components are installed! Click "RUN & EXECUTE EXPERIMENT" to test.',
        componentName: 'Ready for Test',
      });
      return;
    }

    const component = components.find((c) => c.id === droppedCompId);
    if (!component) return;

    if (nextExpectedStep && nextExpectedStep.targetComponentId === droppedCompId) {
      // CORRECT COMPONENT: Green Success Feedback
      setComponents((prev) =>
        prev.map((c) => (c.id === droppedCompId ? { ...c, installed: true } : c))
      );

      const updatedCompleted = [...currentCompletedSteps, nextExpectedStep.stepNo];
      setCompletedSteps((prev) => ({
        ...prev,
        [selectedExpNo]: updatedCompleted,
      }));

      const isNowFullyDone = updatedCompleted.length === activeExpSteps.length;

      setValidationAlert({
        type: 'success',
        title: 'AUTOCAD ASSEMBLY SNAPPED',
        message: isNowFullyDone
          ? `✓ SUCCESS: Final part "${component.name}" mounted! Assembly is 100% complete and ready to execute.`
          : `✓ SUCCESS: "${component.name}" snapped into CAD position! Proceed to Step ${nextExpectedStep.stepNo + 1}.`,
        componentName: component.name,
      });

      // If finished, switch tab to procedure so user sees Execute button
      if (isNowFullyDone) {
        setRightPanelTab('procedure');
      }
    } else {
      // WRONG COMPONENT: Red Error Feedback
      const expectedPart = nextExpectedStep?.targetComponentName || 'the next procedure component';
      setValidationAlert({
        type: 'error',
        title: 'WRONG COMPONENT SELECTED',
        message: `⚠ INCORRECT: Step ${nextExpectedStep?.stepNo || 1} requires "${expectedPart}". You selected "${component.name}". Follow procedure on the right!`,
        componentName: component.name,
      });
    }

    // Auto-dismiss alert after 4.5 seconds
    setTimeout(() => {
      setValidationAlert(null);
    }, 4500);
  };

  // Start / Create New Project Flow
  const handleStartNewProject = (expNum: number, customName?: string) => {
    setSelectedExpNo(expNum);
    setProjectName(customName?.trim() || tempProjectName.trim() || `UAV Assembly - EX ${expNum}`);
    setCompletedSteps((prev) => ({
      ...prev,
      [expNum]: [],
    }));
    setComponents((prev) => prev.map((c) => ({ ...c, installed: false })));
    setValidationAlert(null);
    setIsTestRunning(false);
    setTestThrottle(0);
    setExplodeRatio(0);
    setHasActiveProject(true);
    setRightPanelTab('procedure');
  };

  // Switch AutoCAD Camera View Presets
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
    setShowOutputModal(true);
  };

  // Dynamic Test Calculations
  const testRPM = Math.round(testThrottle * 98);
  const testThrustG = Math.round(testThrottle * 8.4);
  const testVoltageV = (11.1 - (testThrottle * 0.008)).toFixed(2);
  const testCurrentA = (testThrottle * 0.12).toFixed(2);
  const testPowerW = (parseFloat(testVoltageV) * parseFloat(testCurrentA)).toFixed(1);
  const testEfficiencyGW = parseFloat(testPowerW) > 0 ? (testThrustG / parseFloat(testPowerW)).toFixed(2) : '0.00';

  // =========================================================================
  // VIEW 1: WELCOME TO AERO-SPACE LAB SCREEN (When no project is open)
  // =========================================================================
  if (!hasActiveProject) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-[#030612] text-slate-100 overflow-y-auto font-sans select-none p-4 sm:p-8">
        
        {/* Background Cyber Starfield & Glowing Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0c1f4e] via-[#050b1d] to-[#01040a] pointer-events-none"></div>

        {/* Holographic Glowing Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)'
          }}
        />

        {/* Ambient Neon Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/25 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Top Header Badge */}
        <div className="relative z-10 pt-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs sm:text-sm font-mono font-bold border border-cyan-400/50 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <Wrench className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="tracking-widest uppercase">3D AUTOCAD HARDWARE INTEGRATION WORKBENCH</span>
          </div>

          {/* WELCOME TO AERO-SPACE LAB TITLE WITH BRIGHT GLOWING ANIMATION */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            <span className="block text-cyan-400 font-mono text-base sm:text-xl font-bold tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              WELCOME TO
            </span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(6,182,212,0.9)] animate-pulse">
              AERO - SPACE LAB
            </span>
            <span className="block mt-1 text-xl sm:text-2xl md:text-3xl font-mono text-amber-400 font-black tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
              ( 3D VIRTUAL ASSEMBLY BENCH )
            </span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl font-mono">
            Drag-and-drop 3D hardware components, circuit wiring schematics, and realistic AutoCAD-style object manipulation.
          </p>
        </div>

        {/* Center: Live 3D Interactive Rotating CAD Preview */}
        <div className="relative z-10 w-full max-w-xl h-44 sm:h-52 my-3 rounded-2xl border border-cyan-500/30 bg-slate-950/60 backdrop-blur-md overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.2)]">
          <Canvas camera={{ position: [0, 2.5, 4], fov: 45 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 8, 5]} intensity={2.0} />
            <group rotation={[0.2, 0, 0]}>
              <QuadcopterModel scale={0.9} spinning={true} throttle={4} showWiring={true} />
            </group>
            <OrbitControls autoRotate autoRotateSpeed={2.0} enableZoom={false} />
          </Canvas>
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>Interactive 3D CAD Preview</span>
          </div>
        </div>

        {/* BOTTOM: CREATE NEW PROJECT & SAVE AS (AS REQUESTED BY USER) */}
        <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-gradient-to-br from-[#0a1226]/95 via-[#060b18]/95 to-[#030610]/95 border-2 border-amber-400/80 p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.5)] font-mono mb-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/30 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-black text-white tracking-wider">
                CREATE NEW PROJECT & INITIALIZE WORKSPACE
              </h2>
            </div>
            <span className="text-[11px] text-amber-300">
              Select Ex No (1 to 10) & Choose Custom Project Name
            </span>
          </div>

          {/* PROJECT NAME (SAVE AS) INPUT */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <span>PROJECT NAME (SAVE AS):</span>
              <span className="text-amber-400 text-[10px] font-normal">*Customizable</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. F450 Quadcopter Integration, Fixed-Wing Assembly, Thrust Rig Calibration..."
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-cyan-500/40 text-amber-300 font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 placeholder-slate-500 shadow-inner"
            />
          </div>

          {/* EXPERIMENT SELECTOR GRID (EX 1 TO EX 10) */}
          <label className="block text-xs font-bold text-slate-200 mb-2">
            SELECT EXPERIMENT TO ASSEMBLE:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-44 sm:max-h-52 overflow-y-auto p-1 custom-scrollbar mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const guide = experimentGuides[num];
              const isSelected = selectedExpNo === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedExpNo(num)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-cyan-400/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-black ${isSelected ? 'text-amber-300' : 'text-cyan-400'}`}>
                      EX {num}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                      {guide?.steps.length} Steps
                    </span>
                  </div>
                  <div className="text-[10px] line-clamp-2 leading-tight">
                    {guide?.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* INITIALIZE WORKSPACE BUTTON */}
          <button
            onClick={() => handleStartNewProject(selectedExpNo, tempProjectName)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all cursor-pointer transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 border border-white/50"
          >
            <span>ENTER EMPTY CAD WORKSPACE (EX {selectedExpNo})</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL-PAGE CAD 3D WORKSPACE WITH DOCKED RIGHT PANELS
  // =========================================================================
  return (
    <div 
      ref={workbenchRef} 
      className={`h-full w-full flex flex-col bg-[#02050f] text-slate-100 overflow-hidden font-sans relative ${
        isFullscreenWorkbench ? 'fixed inset-0 z-50 w-screen h-screen' : ''
      }`}
    >
      {/* 1. TOP AutoCAD CAD TOOLBAR */}
      <div className="bg-[#070c1e]/95 backdrop-blur-md border-b border-cyan-500/30 p-2 sm:px-3 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20 shadow-lg text-xs font-mono">
        
        {/* Project Name & New Project Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasActiveProject(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/60 font-bold transition-all cursor-pointer shrink-0"
            title="Create or load a new assembly project"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW PROJECT</span>
          </button>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-amber-300 font-bold max-w-[140px] sm:max-w-[200px] truncate" title={projectName}>
              {projectName}
            </span>
            <span className="text-cyan-400 font-bold">| EX {selectedExpNo}</span>
          </div>
        </div>

        {/* AutoCAD 3D Camera Angle Presets */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1.5">VIEW:</span>
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

        {/* CAD Tools: Explode View Slider */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-slate-400">EXPLODE:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={explodeRatio}
            onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-300 font-bold">{Math.round(explodeRatio * 100)}%</span>
        </div>

        {/* Right Tools: Day/Night, Big Screen & Toggle Right Dock */}
        <div className="flex items-center gap-1.5">
          {/* Day / Night Toggle */}
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

          {/* Big Screen Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreenWorkbench(!isFullscreenWorkbench)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] cursor-pointer"
            title="Full Page Workspace Viewport"
          >
            {isFullscreenWorkbench ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreenWorkbench ? 'Exit Full' : 'Full Screen'}</span>
          </button>

          {/* Toggle Right Dock Button */}
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

      {/* 2. FULL-PAGE 3D CAD CANVAS (Covers entire screen, first completely empty!) */}
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
          <ambientLight intensity={isDay ? 1.4 : 0.6} />
          <directionalLight position={[10, 15, 10]} intensity={isDay ? 2.2 : 1.4} castShadow />
          <pointLight position={[0, 4, 0]} intensity={0.9} color={isDay ? '#ffffff' : '#00f0ff'} />

          {!isDay && (
            <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />
          )}

          {/* ESD Workbench Surface */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[14, 0.1, 9]} />
            <meshStandardMaterial
              color={isDay ? '#475569' : '#0a1226'}
              roughness={isDay ? 0.5 : 0.7}
              metalness={isDay ? 0.3 : 0.4}
            />
          </mesh>

          {/* AutoCAD CAD Grid with fine millimeter divisions */}
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

          {/* 3D Coordinate Triad Axes Indicator in CAD Space */}
          <group position={[-5, 0.05, -3]}>
            {/* X Axis - Red */}
            <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {/* Y Axis - Green */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            {/* Z Axis - Blue */}
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>

          {/* PROGRESSIVE MOUNTING: ONLY SHOW INSTALLED HARDWARE (Empty first!) */}
          {currentCompletedSteps.length > 0 && (
            <>
              {/* EX 1 & 9: Quadcopter-X Model Builds Up Progressively */}
              {(selectedExpNo === 1 || selectedExpNo === 9) && (
                <group position={[0, 0.1 + explodeRatio * 0.4, 0]}>
                  <QuadcopterModel
                    scale={1.2}
                    spinning={isTestRunning && testThrottle > 0}
                    throttle={testThrottle / 10}
                    explodedFactor={explodeRatio}
                    showWiring={currentCompletedSteps.includes(4)}
                  />
                </group>
              )}

              {/* EX 2: Fixed-Wing Model */}
              {selectedExpNo === 2 && (
                <group position={[0, 0.4 + explodeRatio * 0.5, 0]}>
                  <FixedWingModel
                    scale={0.9}
                    spinning={isTestRunning && testThrottle > 0}
                    throttle={testThrottle}
                    explodedFactor={explodeRatio}
                  />
                </group>
              )}

              {/* EX 3: Thrust Stand Rig */}
              {selectedExpNo === 3 && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[1.8, 0.5, 3.2]} />
                    <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.7} roughness={0.3} />
                  </mesh>
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
                  <group position={[0, 0.3, 0]}>
                    <ServoMotorModel scale={1.8} angle={activeServoAngle} />
                  </group>
                  <mesh position={[0, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 1.6, 32, 1, 0, Math.PI]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.5} />
                  </mesh>
                </group>
              )}

              {/* EX 5: LiPo & IMAX B6 */}
              {selectedExpNo === 5 && (
                <group position={[0, 0.1, 0]}>
                  <group position={[-1.0, 0.2, 0]}>
                    <LiPoBatteryModel scale={1.3} cells={3} />
                  </group>
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
                  <group position={[-1.2, 0.8, 0]} rotation={[0.4, 0, 0]}>
                    <mesh>
                      <boxGeometry args={[1.6, 2.0, 0.6]} />
                      <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
                    </mesh>
                  </group>
                  <group position={[1.2, 0.2, 0]}>
                    <mesh>
                      <boxGeometry args={[0.9, 0.3, 0.6]} />
                      <meshStandardMaterial color="#0f172a" />
                    </mesh>
                  </group>
                </group>
              )}

              {/* EX 7: Prop Balancer */}
              {selectedExpNo === 7 && (
                <group position={[0, 0, 0]}>
                  <BalanceStandModel scale={1.2} />
                  {currentCompletedSteps.includes(2) && (
                    <group position={[0, 1.45, 0]}>
                      <PropellerModel scale={1.3} spinning={false} rpm={0} blades={2} />
                    </group>
                  )}
                </group>
              )}

              {/* EX 8: Wind Tunnel Airfoil */}
              {selectedExpNo === 8 && (
                <group position={[0, 0.4, 0]}>
                  <mesh rotation={[0, 0, 0.15]}>
                    <boxGeometry args={[0.2, 1.2, 3.0]} />
                    <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>
              )}

              {/* EX 10: KK2.1.5 Board */}
              {selectedExpNo === 10 && (
                <group position={[0, 0.2 + explodeRatio * 0.3, 0]}>
                  <KK215BoardModel scale={1.5} />
                </group>
              )}
            </>
          )}

          <OrbitControls ref={orbitControlsRef} enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* CAD WORKSPACE EMPTY STATE CALLOUT */}
        {currentCompletedSteps.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="p-4 rounded-2xl bg-[#091024]/90 border border-cyan-500/40 max-w-sm shadow-xl backdrop-blur-md">
              <Crosshair className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-white mb-1">
                CAD WORKSPACE READY (EMPTY)
              </h3>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                Step 1: Pick <strong>"{nextExpectedStep?.targetComponentName}"</strong> from the right dock and place it here.
              </p>
            </div>
          </div>
        )}

        {/* Drag & Drop Hover Overlay */}
        {isDropHover && (
          <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-30 animate-pulse border-4 border-dashed border-cyan-400">
            <Move className="w-12 h-12 text-cyan-300 mb-2 animate-bounce" />
            <span className="text-base font-black text-cyan-200 font-mono tracking-widest uppercase">
              DROP COMPONENT HERE TO ASSEMBLE
            </span>
          </div>
        )}

        {/* 3. RIGHT-SIDE FLOATING / DOCKED PANEL: 3D COMPONENTS & PROCEDURE WITH CIRCUIT DIAGRAM */}
        {isRightPanelOpen && (
          <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 md:w-[420px] bg-[#070b18]/95 backdrop-blur-md rounded-2xl border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col z-30 overflow-hidden font-mono text-xs">
            
            {/* Dock Header Tabs: [ 📦 3D COMPONENTS ] vs [ 📋 PROCEDURE & CIRCUITS ] */}
            <div className="p-2 border-b border-cyan-500/30 bg-[#091126] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
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
              </div>

              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Collapse Dock"
              >
                ✕
              </button>
            </div>

            {/* TAB CONTENT A: 3D COMPONENTS SECTION (REALISTIC 3D MODELS OF OBJECTS) */}
            {rightPanelTab === 'components' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Category Filter */}
                <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-[#050914] shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 3D components (motor, esc, frame...)"
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

                {/* 3D Component Cards List */}
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
                      {/* Realistic 3D Miniature Model */}
                      <Component3DThumbnail visualType={item.visualType} isInstalled={item.installed} />

                      {/* Component Info */}
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
                            <button
                              onClick={() => handleDropComponent(item.id)}
                              className="px-2.5 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                              title="Click or drag to place onto workspace"
                            >
                              <Move className="w-2.5 h-2.5" />
                              <span>Place Part</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-800 bg-[#040814] flex items-center justify-between text-[11px] shrink-0">
                  <span className="text-slate-400">BENCH HARDWARE WEIGHT:</span>
                  <span className="text-cyan-300 font-bold">{totalInstalledWeight}g</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: PROCEDURE & CIRCUIT CONNECTION DIAGRAMS */}
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

                {/* STEP-BY-STEP PROCEDURE LIST WITH CIRCUIT DIAGRAMS */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>STEP-BY-STEP PROCEDURE</span>
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
                              NEXT &gt;&gt;&gt;
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

                        {/* Action CTA */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-slate-400 truncate max-w-[180px]">
                            Target: {step.targetComponentName}
                          </span>

                          <button
                            onClick={() => handleDropComponent(step.targetComponentId)}
                            disabled={isStepDone}
                            className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono transition-transform active:scale-95 flex items-center gap-1 cursor-pointer ${
                              isStepDone
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 cursor-default'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                            }`}
                          >
                            {isStepDone ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-emerald-400" />
                                <span>Mounted</span>
                              </>
                            ) : (
                              <>
                                <Move className="w-2.5 h-2.5" />
                                <span>Place Part</span>
                              </>
                            )}
                          </button>
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

              {/* Graphical Schematic Box */}
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

      {/* 5. FINAL OUTPUT & OBSERVATION RECORD MODAL (When Experiment Executes) */}
      {showOutputModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full rounded-2xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#050914] border-2 border-cyan-400 p-6 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.5)] font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    EX {selectedExpNo} LIVE EXPERIMENT RESULTS & OBSERVATION RECORD
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeGuide.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOutputModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                <div className="text-slate-400 text-[10px]">PEAK THRUST:</div>
                <div className="text-xl font-black text-cyan-300">{testThrustG} g</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Nominal Spec</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                <div className="text-slate-400 text-[10px]">ROTATIONAL SPEED:</div>
                <div className="text-xl font-black text-emerald-400">{testRPM} RPM</div>
                <div className="text-[10px] text-cyan-400 mt-1">Optical Laser Locked</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <div className="text-slate-400 text-[10px]">CURRENT DRAW:</div>
                <div className="text-xl font-black text-amber-300">{testCurrentA} A</div>
                <div className="text-[10px] text-slate-400 mt-1">@ {testVoltageV}V DC</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                <div className="text-slate-400 text-[10px]">POWER EFFICIENCY:</div>
                <div className="text-xl font-black text-purple-300">{testEfficiencyGW} g/W</div>
                <div className="text-[10px] text-purple-400 mt-1">Bus: {testPowerW} W</div>
              </div>
            </div>

            {/* Throttle Sweep Slider */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">PWM THROTTLE SWEEP:</span>
                <span className="text-cyan-300 font-bold">{testThrottle}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={testThrottle}
                onChange={(e) => setTestThrottle(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setShowOutputModal(false);
                  setSelectedReportExpId(selectedExpNo);
                  setIsRecordModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-glow-blue flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>GENERATE OFFICIAL LAB RECORD</span>
              </button>

              <button
                onClick={() => setShowOutputModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer"
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
