import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, PerspectiveCamera } from '@react-three/drei';
import { useLab } from '../../context/LabContext';
import { useAuth } from '../../context/AuthContext';
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
  Camera,
  Sun,
  Moon,
  Sparkles,
  Radio,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  Check,
  Power,
  XCircle,
  Move,
  Download,
  Share2,
  FolderPlus,
  Box,
  Cable,
  CheckCheck
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

// Mini 3D Component Object Preview
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
          {/* Default generic 3D hardware wireframe */}
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
  const { openInspection, setIsRecordModalOpen, setSelectedReportExpId, captureScreenshot, atmosphereTheme } = useLab();
  const { currentUser } = useAuth();
  const workbenchRef = useRef<HTMLDivElement>(null);

  // Big Screen / Fullscreen Mode state
  const [isFullscreenWorkbench, setIsFullscreenWorkbench] = useState<boolean>(false);

  // New Project Flow: initially false (empty workbench until user creates new project!)
  const [hasActiveProject, setHasActiveProject] = useState<boolean>(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Lighting Mode: Night and Day time working space
  const [benchTimeMode, setBenchTimeMode] = useState<'day' | 'night'>(
    atmosphereTheme === 'day' ? 'day' : 'night'
  );
  const isDay = benchTimeMode === 'day';

  // Selected Experiment No (1 to 10)
  const [selectedExpNo, setSelectedExpNo] = useState<number>(1);

  // Active Category Filter for Components
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Explode view slider (0 to 1)
  const [explodeRatio, setExplodeRatio] = useState<number>(0);

  // Drag-and-drop workspace hover state
  const [isDropHover, setIsDropHover] = useState<boolean>(false);

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

  // Live Experiment Test Controls
  const [testThrottle, setTestThrottle] = useState<number>(0);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeServoAngle, setActiveServoAngle] = useState<number>(45);

  // Output Results Modal after correct execution
  const [showOutputModal, setShowOutputModal] = useState<boolean>(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);

  // Master Component Catalog for ALL 10 Experiments
  // Note: NO "forExperiments" badges shown in UI as requested by user! Components are neutral realistic hardware parts.
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
      specs: 'Diameter: 10 inch, Pitch: 4.5 inch, Center Hub: 6mm with adapter rings',
      weightG: 48,
      qty: 4,
      installed: false,
      visualType: 'prop',
    },
    {
      id: 'fc_kk215',
      name: 'KK 2.1.5 LCD Flight Controller Board',
      category: 'Avionics',
      model: 'KK2.1.5 Multi-Rotor Control Board with Graphic LCD & Atmel 644PA',
      specs: 'Sensors: InvenSense MPU6050 6-DOF Gyro/Accel, 8 Motor outputs, 5 Inputs',
      weightG: 22,
      qty: 1,
      installed: false,
      visualType: 'fc',
    },
    {
      id: 'rc_receiver',
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
      id: 'lipo_charger_imax',
      name: 'IMAX B6 Microprocessor Balance Charger',
      category: 'Instrumentation',
      model: 'Digital Multi-Chemistry 80W Charger with Individual Cell Balancer',
      specs: 'Charge Current: 0.1 - 6.0A, Cell Count: 1-6S LiPo, LCD Status Display',
      weightG: 280,
      qty: 1,
      installed: false,
      visualType: 'charger',
    },
    {
      id: 'lipo_cell_checker',
      name: '1S-8S Digital LiPo Voltage Checker & Buzzer',
      category: 'Instrumentation',
      model: 'Digital Microprocessor Battery Monitor with Dual Piezo Alarms',
      specs: 'Voltage Precision: ±0.01V, Cell Detection: 1S-8S, Low Voltage Alarm: 2.7-3.8V',
      weightG: 16,
      qty: 1,
      installed: false,
      visualType: 'checker',
    },
    {
      id: 'bind_plug_loop',
      name: '2.4GHz Receiver Jumper Bind Plug Cable',
      category: 'Wires & Linkages',
      model: 'Shorting Loop Jumper Wire for Receiver BIND / CH3 Signal Pins',
      specs: 'Standard 3-pin 2.54mm pitch DuPont housing with signal-to-ground loop',
      weightG: 4,
      qty: 1,
      installed: false,
      visualType: 'bind_plug',
    },
    {
      id: 'prop_balancer',
      name: 'Magnetic Levitation Propeller Balancer',
      category: 'Instrumentation',
      model: 'Frictionless Dual Rare-Earth Neodymium Magnetic Suspension Stand',
      specs: 'Sensitivity: <0.05g imbalance, Center Shaft: CNC hardened ground steel',
      weightG: 240,
      qty: 1,
      installed: false,
      visualType: 'balancer',
    },
    {
      id: 'balance_tape',
      name: 'Precision Mylar Counter-Balancing Tape',
      category: 'Wires & Linkages',
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
          instruction: 'From the components tray on the left, locate and drag the "F450 Quad-X Carbon Frame Plates" onto the center of the ESD workbench.',
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
          instruction: 'Mount 4x "SimonK 30A High-Speed ESCs" under arm beams. Connect 3-phase bullet jacks (A, B, C) to motor leads and solder DC inputs to PDB terminals (+/-).',
          connectionDiagram: {
            from: 'SimonK 30A ESC 3-Phase Jacks',
            to: 'A2212 BLDC Motor Stator Pins (A, B, C)',
            pinout: 'Phase A -> Lead 1, Phase B -> Lead 2, Phase C -> Lead 3 | DC Red -> +12V, Black -> GND',
            wireColor: 'Phase wires: Red/Black/Yellow bullet leads; DC power: 16AWG Red (+), Black (-)',
            schematicText: '[PDB +12V] -> [ESC VCC+] | [PDB GND] -> [ESC GND-] | [ESC Phase A-B-C] -> [Motor A-B-C]',
          },
        },
        {
          stepNo: 5,
          title: 'Mount KK2.1.5 Flight Controller Board',
          actionType: 'execute',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Position the "KK 2.1.5 LCD Flight Controller Board" on central nylon anti-vibration standoffs with forward heading arrow facing the front motor axis.',
        },
      ],
    },
    2: {
      expNo: 2,
      title: 'Fixed-Wing Airframe & Aerodynamic Control Surface Assembly',
      aim: 'Assemble fixed-wing fuselage, carbon wing spar, install aileron/elevator/rudder servos, and calibrate control surface linkages.',
      steps: [
        {
          stepNo: 1,
          title: 'Place EPO Trainer Fuselage on Bench',
          actionType: 'pick',
          targetComponentId: 'fixed_wing_airframe',
          targetComponentName: 'Trainer Fixed-Wing EPO Airframe',
          instruction: 'From the left components tray, drag the "Trainer Fixed-Wing EPO Airframe" onto the workbench test cradle.',
        },
        {
          stepNo: 2,
          title: 'Insert Carbon Fiber Wing Spar Tube',
          actionType: 'mount',
          targetComponentId: 'wing_spar_carbon',
          targetComponentName: 'High-Modulus Carbon Fiber Wing Spar Tube',
          instruction: 'Select "High-Modulus Carbon Fiber Wing Spar Tube" and slide through fuselage pass-through to structurally join left and right main wings.',
        },
        {
          stepNo: 3,
          title: 'Install 4x SG90 Micro Servos in Control Surface Pockets',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Drag "SG90 9g Micro Servos & Linkages (x4)" and install into pre-molded bays: 2x in wings (Ailerons), 1x in vertical fin (Rudder), 1x in horizontal tail (Elevator).',
        },
        {
          stepNo: 4,
          title: 'Connect Piano Wire Pushrods to Control Horns',
          actionType: 'wire',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Connect "Piano Wire Pushrods & Brass Clevises" between servo output arms and nylon surface horns. Thread clevises to establish 0° neutral deflection.',
          connectionDiagram: {
            from: 'SG90 Servo Spline Horns',
            to: 'Control Surface Nylon Horns (Ailerons, Elevator, Rudder)',
            pinout: 'CH1: Aileron Servos (Y-Harness) | CH2: Elevator Servo | CH4: Rudder Servo',
            wireColor: 'Signal: Orange, VCC (+5V): Red, Ground: Brown (3-wire JR format)',
            schematicText: '[Receiver CH1-CH4] -> [JR 3-Pin Extension Leads] -> [SG90 Servos] -> [Pushrod Linkages]',
          },
        },
      ],
    },
    3: {
      expNo: 3,
      title: 'Brushless Motor Thrust & Electrical Efficiency Calibration',
      aim: 'Calibrate BLDC motor static thrust output vs rotational RPM, current draw, and power consumption using digital strain gauge load cell.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount Digital Load-Cell Thrust Stand Rig',
          actionType: 'pick',
          targetComponentId: 'thrust_rig',
          targetComponentName: 'Digital Load-Cell Thrust Stand Rig',
          instruction: 'Locate "Digital Load-Cell Thrust Stand Rig" in the left components tray and drag it onto the ESD workbench. Tare strain gauge to 0.00g.',
        },
        {
          stepNo: 2,
          title: 'Fasten A2212 Motor & 1045 Carbon Propeller to Rig',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt the "A2212 1000KV Brushless DC Motor" onto the pivoting thrust plate and secure the 1045 propeller with CNC bullet nut.',
        },
        {
          stepNo: 3,
          title: 'Connect 30A ESC & In-Line DC Power Analyzer Shunt',
          actionType: 'wire',
          targetComponentId: 'ammeter_shunt',
          targetComponentName: '30A Precision DC Current Shunt & Wattmeter',
          instruction: 'Wire "30A Precision DC Current Shunt & Wattmeter" in series between LiPo XT60 and SimonK ESC DC input terminals.',
          connectionDiagram: {
            from: '3S LiPo XT60 Male Connector',
            to: '30A Current Shunt -> SimonK 30A ESC Input',
            pinout: 'LiPo (+) -> Shunt IN (+), Shunt OUT (+) -> ESC Red (+); Common Battery Ground (-)',
            wireColor: 'Positive: 14AWG Red Silicone, Negative: 14AWG Black Silicone',
            schematicText: '[LiPo 11.1V] ---> [Current Shunt (ADC Ammeter)] ---> [30A ESC] ---> [A2212 Motor Phases]',
          },
        },
        {
          stepNo: 4,
          title: 'Align Optical Laser Tachometer with Motor Bell Target',
          actionType: 'mount',
          targetComponentId: 'tachometer_opt',
          targetComponentName: 'Optical Laser Digital Tachometer',
          instruction: 'Position the "Optical Laser Digital Tachometer" directly facing the reflective sticker on the rotating motor outrunner bell.',
        },
      ],
    },
    4: {
      expNo: 4,
      title: 'Servo Motor Actuation & Angular Deflection Calibration',
      aim: 'Calibrate servo horn angular travel, PWM pulse width (1000μs to 2000μs), and verify mechanical linkage linearity.',
      steps: [
        {
          stepNo: 1,
          title: 'Position 180° Precision Angular Deflection Protractor',
          actionType: 'pick',
          targetComponentId: 'protractor_dial',
          targetComponentName: '180° Precision Angular Deflection Protractor',
          instruction: 'Drag "180° Precision Angular Deflection Protractor" from the left tray onto the workbench mounting fixture.',
        },
        {
          stepNo: 2,
          title: 'Mount SG90 Micro Servo at Dial Center Pivot',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Mount "SG90 9g Micro Servos & Linkages (x4)" concentric with the protractor 0.0° center pivot reference mark.',
        },
        {
          stepNo: 3,
          title: 'Wire Servo 3-Pin JR Plug to Digital CCPM Servo Tester',
          actionType: 'wire',
          targetComponentId: 'servo_tester',
          targetComponentName: 'Microprocessor 3-Channel Servo Tester',
          instruction: 'Connect "Microprocessor 3-Channel Servo Tester" to servo 3-pin JR connector and supply 5.0V regulated power.',
          connectionDiagram: {
            from: 'CCPM Servo Tester OUT1 Header',
            to: 'SG90 Micro Servo 3-Pin JR Connector',
            pinout: 'Pin 1: PWM Signal (1000-2000μs) | Pin 2: +5.0V VCC | Pin 3: Ground (GND)',
            wireColor: 'Signal: Orange wire, Power: Red wire, Ground: Brown wire',
            schematicText: '[Servo Tester Pulse Gen] -> [Orange: PWM] -> [Internal Servo H-Bridge & Potentiometer]',
          },
        },
      ],
    },
    5: {
      expNo: 5,
      title: 'LiPo Battery Multi-Cell Voltage & Discharge Diagnostic',
      aim: 'Inspect individual cell internal resistance, balance multi-cell voltage (3.7V - 4.2V/cell), and assess C-rating discharge health.',
      steps: [
        {
          stepNo: 1,
          title: 'Place Turnigy 3S 2200mAh LiPo in Safety Bay',
          actionType: 'pick',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Select "Turnigy 3S 2200mAh 25C LiPo Battery" and place securely into the fireproof ESD battery testing cradle.',
        },
        {
          stepNo: 2,
          title: 'Connect JST-XH Balance Lead to Digital Cell Checker',
          actionType: 'wire',
          targetComponentId: 'lipo_cell_checker',
          targetComponentName: '1S-8S Digital LiPo Voltage Checker & Buzzer',
          instruction: 'Connect "1S-8S Digital LiPo Voltage Checker & Buzzer" into 4-pin JST-XH balance lead. Record cell voltages (C1, C2, C3).',
          connectionDiagram: {
            from: 'LiPo JST-XH 4-Pin Female Balance Plug',
            to: 'Digital Cell Checker Multi-Pin Input Socket',
            pinout: 'Pin 1: Ground (Black) | Pin 2: Cell 1 (+3.7V) | Pin 3: Cell 2 (+7.4V) | Pin 4: Cell 3 (+11.1V)',
            wireColor: 'Black (GND), Blue (Cell 1), Yellow (Cell 2), Red (Cell 3)',
            schematicText: '[LiPo Cell 1: 3.70V] + [Cell 2: 3.70V] + [Cell 3: 3.70V] = [Pack Total: 11.10V Nominal]',
          },
        },
        {
          stepNo: 3,
          title: 'Connect XT60 Main Leads to IMAX B6 Balance Charger',
          actionType: 'wire',
          targetComponentId: 'lipo_charger_imax',
          targetComponentName: 'IMAX B6 Microprocessor Balance Charger',
          instruction: 'Connect "IMAX B6 Microprocessor Balance Charger" XT60 main leads and JST-XH balance port. Select LiPo Balance Charge at 2.2A.',
          connectionDiagram: {
            from: 'IMAX B6 4mm Banana Ports',
            to: 'Turnigy LiPo XT60 Male Main Connector',
            pinout: 'Red Banana (+) -> XT60 (+12V) | Black Banana (-) -> XT60 (GND)',
            wireColor: '12AWG Heavy Duty Silicone Red (+) & Black (-)',
            schematicText: '[IMAX B6 DC Charger] -> [Main XT60 High-Current Leads] & [3S JST-XH Balance Port]',
          },
        },
      ],
    },
    6: {
      expNo: 6,
      title: '2.4GHz RC Transmitter & Receiver Binding & Signal Routing',
      aim: 'Bind 2.4GHz AFHDS 2A frequency-hopping transmitter to receiver, calibrate 6 channel PWM mapping and failsafe state.',
      steps: [
        {
          stepNo: 1,
          title: 'Position FS-iA6B 6-Channel Receiver on Bench',
          actionType: 'pick',
          targetComponentId: 'rc_receiver',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'From the left tray, drag the "FS-iA6B 6-Channel 2.4GHz Receiver" onto the workbench with antennas extended at 90° angles.',
        },
        {
          stepNo: 2,
          title: 'Insert Bind Jumper Loop Cable into B/VCC Port',
          actionType: 'wire',
          targetComponentId: 'bind_plug_loop',
          targetComponentName: '2.4GHz Receiver Jumper Bind Plug Cable',
          instruction: 'Insert "2.4GHz Receiver Jumper Bind Plug Cable" into the B/VCC port pins to pull receiver signal line to ground for binding.',
          connectionDiagram: {
            from: 'Bind Jumper Loop Connector',
            to: 'FS-iA6B Receiver Channel B/VCC Header',
            pinout: 'Shorts Signal Pin (Top) to Ground Pin (Bottom) on B/VCC',
            wireColor: 'Black insulated loop jumper wire with 3-pin 2.54mm female housing',
            schematicText: '[B/VCC Signal Pin] <--- (Bind Loop Short) ---> [B/VCC GND Pin] -> Initiates 2.4GHz Pairing',
          },
        },
        {
          stepNo: 3,
          title: 'Power Transmitter Holding BIND Key to Lock Link',
          actionType: 'execute',
          targetComponentId: 'rc_transmitter_tx',
          targetComponentName: 'FS-i6 6-Channel 2.4GHz Transmitter',
          instruction: 'Drag "FS-i6 6-Channel 2.4GHz Transmitter" to bench. Power on transmitter while depressing BIND button until red LED turns solid.',
        },
      ],
    },
    7: {
      expNo: 7,
      title: 'Static & Dynamic Propeller Mass Balancing',
      aim: 'Detect and correct static and dynamic mass imbalances on 1045 propellers using frictionless magnetic levitation suspension.',
      steps: [
        {
          stepNo: 1,
          title: 'Set Up Magnetic Levitation Balancer Stand',
          actionType: 'pick',
          targetComponentId: 'prop_balancer',
          targetComponentName: 'Magnetic Levitation Propeller Balancer',
          instruction: 'Drag "Magnetic Levitation Propeller Balancer" onto workbench and level on horizontal plane with zero mechanical friction.',
        },
        {
          stepNo: 2,
          title: 'Mount 1045 Propeller onto Centering Shaft',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Mount "1045 Carbon-Reinforced Propellers (x4)" onto the hardened steel shaft with twin CNC aluminum centering cones.',
        },
        {
          stepNo: 3,
          title: 'Apply Mylar Counter-Balancing Tape to Light Blade',
          actionType: 'wire',
          targetComponentId: 'balance_tape',
          targetComponentName: 'Precision Mylar Counter-Balancing Tape',
          instruction: 'Apply thin strips of "Precision Mylar Counter-Balancing Tape" to the underside center of the light blade until propeller rests perfectly horizontal.',
          connectionDiagram: {
            from: 'Mylar Counter-Balancing Adhesive Strip',
            to: '1045 Propeller Light Blade Underside (40% Span)',
            pinout: 'Static balance: Center of Gravity aligned with rotation axis | Dynamic balance: Zero blade pitch flutter',
            wireColor: 'Transparent aeronautical mylar thin-film tape (0.035 g/cm²)',
            schematicText: '[Heavy Blade (drops down)] <=== (Counter-Weight Tape) ===> [Light Blade (equalized horizontal)]',
          },
        },
      ],
    },
    8: {
      expNo: 8,
      title: 'Subsonic Airfoil Wind Tunnel Lift & Drag Measurement',
      aim: 'Measure pressure distributions, coefficient of lift (CL), coefficient of drag (CD) over symmetric and cambered airfoils in wind tunnel.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount NACA 0012 Airfoil Model in Test Section',
          actionType: 'pick',
          targetComponentId: 'airfoil_naca',
          targetComponentName: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
          instruction: 'Drag "Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)" onto the wind tunnel balance pivot at 0.0° incidence.',
        },
        {
          stepNo: 2,
          title: 'Install Pitot-Static Tube in Free-Stream Flow',
          actionType: 'mount',
          targetComponentId: 'pitot_tube',
          targetComponentName: 'Pitot-Static Tube Differential Airspeed Probe',
          instruction: 'Mount "Pitot-Static Tube Differential Airspeed Probe" 1 chord length upstream of wing leading edge parallel to flow axis.',
        },
        {
          stepNo: 3,
          title: 'Connect Pressure Taps to Inclined U-Tube Manometer',
          actionType: 'wire',
          targetComponentId: 'manometer_water',
          targetComponentName: 'Inclined U-Tube Water Differential Manometer',
          instruction: 'Connect flexible tubing from "Inclined U-Tube Water Differential Manometer" to dynamic and static pressure ports on airfoil model.',
          connectionDiagram: {
            from: 'Pitot-Static Tube Dynamic & Static Ports',
            to: 'Inclined U-Tube Water Manometer Multi-Column Bank',
            pinout: 'Port 1 (Total Pressure Pt) -> Manometer Limb A | Port 2 (Static Pressure P0) -> Manometer Limb B',
            wireColor: 'Clear medical-grade flexible silicone pressure tubing (3mm ID)',
            schematicText: '[Dynamic Pressure q = Pt - P0 = 1/2 * ρ * V²] -> [Manometer Fluid Height Displacement Δh]',
          },
        },
      ],
    },
    9: {
      expNo: 9,
      title: 'Complete Quadcopter-X Airframe & Power Harness Integration',
      aim: 'Fully integrate mechanical chassis, solder PDB power harness, install motors, ESCs, flight controller, and perform continuity checks.',
      steps: [
        {
          stepNo: 1,
          title: 'Assemble F450 Dual Plates with Integrated PDB',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'Drag "F450 Quad-X Carbon Frame Plates" onto workbench and fasten with 4x PA66 arm struts.',
        },
        {
          stepNo: 2,
          title: 'Solder 14AWG XT60 Main Power Cable to PDB Rails',
          actionType: 'wire',
          targetComponentId: 'pdb_xt60',
          targetComponentName: 'Integrated PDB & XT60 Power Harness',
          instruction: 'Solder "Integrated PDB & XT60 Power Harness" (14AWG Red + / Black -) to central copper bus pads of bottom PCB plate.',
          connectionDiagram: {
            from: 'XT60 Male Main Battery Harness',
            to: 'F450 Integrated Power Distribution Board Central Bus',
            pinout: 'Positive Wire (Red 14AWG) -> PDB +12V Pad | Negative Wire (Black 14AWG) -> PDB GND Pad',
            wireColor: 'Heavy duty 14AWG heat-resistant silicone wire (+ Red, - Black)',
            schematicText: '[3S LiPo XT60] ---> [Central PDB Solder Bus (+/-)] ---> [4x Arm ESC Power Rails]',
          },
        },
        {
          stepNo: 3,
          title: 'Mount 4x A2212 Motors & Connect ESC 3-Phase Jacks',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt "A2212 1000KV Brushless DC Motors (x4)" to arm tips and connect SimonK ESC 3.5mm gold bullet plugs.',
        },
        {
          stepNo: 4,
          title: 'Route ESC Servo Signal Leads to KK2.1.5 M1-M4 Headers',
          actionType: 'wire',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Connect "KK 2.1.5 LCD Flight Controller Board" M1-M4 motor outputs (M1: Front-Left CW, M2: Front-Right CCW, M3: Rear-Right CW, M4: Rear-Left CCW).',
          connectionDiagram: {
            from: 'SimonK 30A ESC 1-4 Signal Servo Cables',
            to: 'KK2.1.5 Motor Output Headers M1, M2, M3, M4',
            pinout: 'M1: Front-Left | M2: Front-Right | M3: Rear-Right | M4: Rear-Left (Signal White, VCC Red, GND Black)',
            wireColor: 'Standard 3-pin JR servo ribbon cables',
            schematicText: '[KK2.1.5 Atmel 644PA MCU] -> [M1-M4 PWM 400Hz Timers] -> [4x SimonK 30A ESC Gate Drivers]',
          },
        },
      ],
    },
    10: {
      expNo: 10,
      title: 'Flight Controller Sensor Alignment & Gyroscope Calibration',
      aim: 'Calibrate InvenSense MPU6050 6-axis gyro/accelerometer, perform sensor zero-offset calibration, and tune PID stability loops.',
      steps: [
        {
          stepNo: 1,
          title: 'Mount KK2.1.5 Board on Anti-Vibration Dampers',
          actionType: 'pick',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Drag "KK 2.1.5 LCD Flight Controller Board" onto workbench anti-vibration silicone dampers with nose arrow facing forward.',
        },
        {
          stepNo: 2,
          title: 'Verify InvenSense MPU6050 6-Axis IMU Sensor Alignment',
          actionType: 'mount',
          targetComponentId: 'mpu6050_sensor',
          targetComponentName: 'InvenSense MPU6050 6-Axis Gyro & Accel Module',
          instruction: 'Mount "InvenSense MPU6050 6-Axis Gyro & Accel Module" verifying orientation: X-axis forward (Pitch), Y-axis right (Roll), Z-axis upward (Yaw).',
        },
        {
          stepNo: 3,
          title: 'Connect USB AVR-ISP Programmer Ribbon Cable for Telemetry',
          actionType: 'wire',
          targetComponentId: 'usb_programmer',
          targetComponentName: 'USB AVR-ISP Programmer Dongle & Ribbon Cable',
          instruction: 'Connect "USB AVR-ISP Programmer Dongle & Ribbon Cable" from USBasp dongle to KK2.1.5 6-pin ISP programming header.',
          connectionDiagram: {
            from: 'USBasp AVR-ISP 6-Pin Ribbon Cable',
            to: 'KK2.1.5 Board In-Circuit Serial Programming Header',
            pinout: 'Pin 1: MISO | Pin 2: VCC (+5V) | Pin 3: SCK | Pin 4: MOSI | Pin 5: RESET | Pin 6: GND',
            wireColor: 'Gray 6-conductor flat ribbon cable with keyed IDC 2.54mm connector',
            schematicText: '[USBasp PC Dongle] -> [SPI Bus (MOSI/MISO/SCK)] -> [Atmel 644PA Flash EEPROM & IMU Registers]',
          },
        },
      ],
    },
  }), []);

  const activeGuide = experimentGuides[selectedExpNo] || experimentGuides[1];
  const activeExpSteps = activeGuide.steps;
  const currentCompletedSteps = completedSteps[selectedExpNo] || [];
  const isExpFullyAssembled = currentCompletedSteps.length === activeExpSteps.length;
  const nextExpectedStep = activeExpSteps.find((s) => !currentCompletedSteps.includes(s.stepNo));

  // Start a New Assembly Project
  const handleStartNewProject = (expNo: number) => {
    setSelectedExpNo(expNo);
    setHasActiveProject(true);
    setShowNewProjectModal(false);
    setIsTestRunning(false);
    setTestThrottle(0);
    setValidationAlert(null);
    setShowOutputModal(false);

    // Reset components to unmounted for this new project
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        installed: false,
      }))
    );
  };

  // CORE DRAG-AND-DROP ASSEMBLY LOGIC WITH RED/GREEN FEEDBACK
  const handleDropComponent = (componentId: string) => {
    setIsDropHover(false);

    if (!hasActiveProject) {
      setValidationAlert({
        type: 'error',
        title: 'NO ACTIVE PROJECT!',
        message: 'Please click "CREATE NEW PROJECT" first and select an experiment before dropping components.',
        componentName: 'Workbench',
      });
      return;
    }

    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;

    if (!nextExpectedStep) {
      setValidationAlert({
        type: 'success',
        title: 'ASSEMBLY ALREADY 100% COMPLETE!',
        message: `All steps for Experiment ${selectedExpNo} are completed. Click "RUN & EXECUTE EXPERIMENT" to test!`,
        componentName: comp.name,
      });
      return;
    }

    // CHECK IF WRONG COMPONENT OR WRONG SEQUENCE
    if (nextExpectedStep.targetComponentId !== componentId) {
      setValidationAlert({
        type: 'error',
        title: 'WRONG COMPONENT / INCORRECT SEQUENCE!',
        message: `❌ Wrong component placed! "${comp.name}" does not match Step ${nextExpectedStep.stepNo} in the procedure. Please read the procedure on the right panel and place the correct component.`,
        componentName: comp.name,
      });
      return;
    }

    // CORRECT COMPONENT! FLASH BRIGHT GREEN
    setValidationAlert({
      type: 'success',
      title: 'CORRECT COMPONENT PLACED SUCCESSFULLY!',
      message: `✓ Correct component placed! Step ${nextExpectedStep.stepNo} completed: "${nextExpectedStep.title}". Moving to next step >>>`,
      componentName: comp.name,
    });

    // Mark step completed
    setCompletedSteps((prev) => ({
      ...prev,
      [selectedExpNo]: [...(prev[selectedExpNo] || []), nextExpectedStep.stepNo],
    }));

    // Mount in 3D scene
    setComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, installed: true } : c))
    );
  };

  // Run and execute the experiment simulation
  const handleRunAndExecute = () => {
    setIsTestRunning(true);
    setTestThrottle(60);
    setShowOutputModal(true);
  };

  // Take screenshot of the assembly / results
  const handleCaptureResult = async () => {
    setIsCapturingScreenshot(true);
    await captureScreenshot(workbenchRef.current, selectedExpNo);
    setIsCapturingScreenshot(false);
  };

  // Filtered components list based on Category and Search Query
  // Note: NO "forExperiments" filtering in components tray as requested! Neutral hardware library.
  const filteredComponents = components.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Calculate total weight of mounted parts
  const totalInstalledWeight = components
    .filter((c) => c.installed)
    .reduce((sum, c) => sum + c.weightG, 0);

  // Dynamic readings during physical test
  const testRPM = Math.round(testThrottle * 98);
  const testThrustG = Math.round((testThrottle / 100) ** 1.8 * 880);
  const testCurrentA = Math.round((testThrottle / 100) * 12.8 * 10) / 10;
  const testVoltageV = Math.round((11.8 - (testCurrentA / 15) * 0.8) * 10) / 10;
  const testPowerW = Math.round(testCurrentA * testVoltageV);
  const testEfficiencyGW = testPowerW > 0 ? (testThrustG / testPowerW).toFixed(2) : '0.00';

  return (
    <div 
      ref={workbenchRef} 
      className={`h-full flex flex-col bg-[#040713] text-slate-100 overflow-hidden font-sans relative ${
        isFullscreenWorkbench ? 'fixed inset-0 z-50 w-screen h-screen' : ''
      }`}
    >
      
      {/* TOP NAVIGATION BAR: NEW PROJECT, FULLSCREEN, DAY/NIGHT & SCREENSHOT */}
      <div className="bg-[#080d1f] border-b border-cyan-500/30 p-2.5 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-20 shadow-md">
        
        {/* Left: Project Creation CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs font-mono shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all active:scale-95 cursor-pointer"
            title="Create an empty workspace for a new laboratory experiment"
          >
            <FolderPlus className="w-4 h-4 text-slate-950" />
            <span>NEW PROJECT</span>
          </button>

          {hasActiveProject ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-cyan-300 font-bold">PROJECT: EX {selectedExpNo}</span>
              <span className="text-[10px] text-slate-400 hidden md:inline">({activeGuide.title})</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono hidden sm:inline">
              (Empty Workbench • Click "NEW PROJECT" to begin)
            </div>
          )}
        </div>

        {/* Center: Experiment Switcher (If Project Active) */}
        {hasActiveProject && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full custom-scrollbar">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleStartNewProject(num)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  selectedExpNo === num
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                EX {num}
              </button>
            ))}
          </div>
        )}

        {/* Right: Big Screen Fullscreen Toggle, Day/Night, Screenshot */}
        <div className="flex items-center gap-2">
          {/* Day / Night Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-cyan-500/30 text-xs font-mono">
            <button
              onClick={() => setBenchTimeMode('day')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                isDay ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DAY</span>
            </button>
            <button
              onClick={() => setBenchTimeMode('night')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                !isDay ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NIGHT</span>
            </button>
          </div>

          {/* BIG SCREEN / FULLSCREEN LAPTOP WORKSPACE TOGGLE */}
          <button
            onClick={() => setIsFullscreenWorkbench(!isFullscreenWorkbench)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              isFullscreenWorkbench
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
            title="Toggle Big Screen Fullscreen Workbench (Full laptop/computer screen)"
          >
            {isFullscreenWorkbench ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreenWorkbench ? 'Exit Big Screen' : 'Big Screen'}</span>
          </button>

          {/* Screenshot Button */}
          <button
            onClick={handleCaptureResult}
            disabled={isCapturingScreenshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
            title="Take High-Resolution Screenshot of Bench"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Screenshot</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME RED / GREEN FLASH BANNER */}
      {validationAlert && (
        <div className={`p-3 px-4 border-b flex items-center justify-between gap-3 text-xs font-mono transition-all z-30 animate-in slide-in-from-top duration-300 ${
          validationAlert.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
            : 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.7)] animate-pulse'
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

      {/* NEW PROJECT CREATION MODAL */}
      {showNewProjectModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full rounded-2xl bg-gradient-to-br from-[#0c142c] via-[#080e22] to-[#040816] border-2 border-amber-400 p-6 shadow-[0_0_60px_rgba(245,158,11,0.5)] font-mono text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">START NEW LABORATORY ASSEMBLY PROJECT</h3>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Select an experiment from the syllabus. This creates a clean, empty ESD workbench with the official procedure displayed on the right.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 custom-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const g = experimentGuides[num];
                return (
                  <button
                    key={num}
                    onClick={() => handleStartNewProject(num)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-400/60 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200 flex items-center justify-between">
                      <span>EXPERIMENT {num}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
                      {g?.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN 3-COLUMN WORKSPACE: [COMPONENTS TRAY] | [3D WORKBENCH] | [ONLY PROCEDURE & DIAGRAMS] */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. LEFT COLUMN: COMPONENTS TRAY (NO EXPERIMENT NUMBERS SHOWN AS REQUESTED) */}
        <div className="w-72 sm:w-80 md:w-88 bg-[#060a16] border-r border-slate-800/80 flex flex-col shrink-0">
          
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-800 flex flex-col gap-2.5 bg-[#080e22]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMPONENTS SECTION</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">
                {components.filter((c) => c.installed).length} Mounted
              </span>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search components (motor, esc, frame...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono pb-0.5 custom-scrollbar">
              {['All', 'Mechanical', 'Propulsion', 'Avionics', 'Power', 'Wires & Linkages', 'Instrumentation'].map((cat) => (
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

          {/* Draggable Components List (No Experiment numbers displayed on cards!) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {filteredComponents.map((item) => (
              <div
                key={item.id}
                draggable={!item.installed && hasActiveProject}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={`p-2.5 rounded-xl border transition-all text-xs font-mono flex gap-3 cursor-grab active:cursor-grabbing select-none ${
                  item.installed
                    ? 'bg-emerald-950/30 border-emerald-500/40 opacity-75'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-cyan-400/60'
                }`}
              >
                {/* 3D Model Miniature Thumbnail */}
                <Component3DThumbnail visualType={item.visualType} isInstalled={item.installed} />

                {/* Info & Drag CTA */}
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
                        className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                        title="Drag or click to place on workbench"
                      >
                        <Move className="w-2.5 h-2.5" />
                        <span>Place</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 border-t border-slate-800 bg-[#050812] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">BENCH LOAD:</span>
            <span className="text-cyan-300 font-bold">{totalInstalledWeight}g</span>
          </div>
        </div>

        {/* 2. CENTER COLUMN: 3D ESD BENCH (DRAG & DROP TARGET) */}
        <div 
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropHover(true);
          }}
          onDragLeave={() => setIsDropHover(false)}
          onDrop={(e) => {
            e.preventDefault();
            const compId = e.dataTransfer.getData('text/plain');
            handleDropComponent(compId);
          }}
          className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ${
            isDropHover 
              ? 'border-4 border-dashed border-cyan-400 bg-cyan-950/20 shadow-[0_0_50px_rgba(6,182,212,0.5)]'
              : validationAlert?.type === 'error'
              ? 'border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]'
              : validationAlert?.type === 'success'
              ? 'border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
              : 'border border-transparent'
          }`}
        >
          {/* Canvas */}
          <div className="flex-1 relative bg-[#030610]">
            <Canvas shadows className="w-full h-full">
              <PerspectiveCamera makeDefault position={[0, 4.5, 6]} fov={45} />
              <ambientLight intensity={isDay ? 1.3 : 0.6} />
              <directionalLight position={[10, 15, 10]} intensity={isDay ? 2.2 : 1.4} castShadow />
              <pointLight position={[0, 3, 0]} intensity={0.9} color={isDay ? '#ffffff' : '#00f0ff'} />

              {!isDay && (
                <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />
              )}

              {/* ESD Workbench Surface */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[14, 0.1, 9]} />
                <meshStandardMaterial
                  color={isDay ? '#475569' : '#0b1329'}
                  roughness={isDay ? 0.5 : 0.7}
                  metalness={isDay ? 0.3 : 0.4}
                />
              </mesh>

              {/* Fine Grid */}
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

              {/* Only render hardware when a project is active */}
              {hasActiveProject && (
                <>
                  {/* EX 1 & 9: Quadcopter-X */}
                  {(selectedExpNo === 1 || selectedExpNo === 9) && (
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

                  {/* EX 2: Fixed-Wing */}
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

                  {/* EX 3: Thrust Stand */}
                  {selectedExpNo === 3 && (
                    <group position={[0, 0, 0]}>
                      <mesh position={[0, 0.25, 0]}>
                        <boxGeometry args={[1.8, 0.5, 3.2]} />
                        <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.7} roughness={0.3} />
                      </mesh>
                      <group position={[0, 0.65, -0.5]}>
                        <BLDCMotorModel scale={1.2} spinning={isTestRunning && testThrottle > 0} rpm={testRPM} />
                        <group position={[0, 0.45, 0]}>
                          <PropellerModel scale={1.1} spinning={isTestRunning && testThrottle > 0} rpm={testRPM} blades={2} />
                        </group>
                      </group>
                      <group position={[-0.5, 0.55, 0.6]}>
                        <ESCModel scale={0.8} ampRating={30} />
                      </group>
                      <group position={[0.4, 0.55, 0.6]}>
                        <LiPoBatteryModel scale={0.75} cells={3} />
                      </group>
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
                      <group position={[1.0, 0.2, 0]}>
                        <mesh>
                          <boxGeometry args={[1.8, 0.4, 1.3]} />
                          <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.21, -0.1]}>
                          <planeGeometry args={[1.2, 0.45]} />
                          <meshBasicMaterial color="#0284c7" />
                        </mesh>
                      </group>
                    </group>
                  )}

                  {/* EX 6: RC Radio & Receiver */}
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
                      <group position={[0, 1.45, 0]}>
                        <PropellerModel scale={1.3} spinning={false} rpm={0} blades={2} />
                      </group>
                    </group>
                  )}

                  {/* EX 8: Wind Tunnel Airfoil */}
                  {selectedExpNo === 8 && (
                    <group position={[0, 0.4, 0]}>
                      <mesh rotation={[0, 0, 0.15]}>
                        <boxGeometry args={[0.2, 1.2, 3.0]} />
                        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
                      </mesh>
                      <mesh position={[0, -0.3, 0]}>
                        <boxGeometry args={[2.5, 0.1, 4.0]} />
                        <meshStandardMaterial color="#1e293b" wireframe />
                      </mesh>
                    </group>
                  )}

                  {/* EX 10: KK2.1.5 */}
                  {selectedExpNo === 10 && (
                    <group position={[0, 0.2 + explodeRatio * 0.3, 0]}>
                      <KK215BoardModel scale={1.5} />
                    </group>
                  )}
                </>
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>

            {/* Empty Workbench Callout when no project active */}
            {!hasActiveProject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40 backdrop-blur-xs">
                <div className="p-4 rounded-2xl bg-[#0b1328]/95 border-2 border-amber-400 max-w-md shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                  <Wrench className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-base font-bold font-mono text-white mb-2">
                    EMPTY LABORATORY WORKBENCH
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
                    Ready to assemble hardware! Click below to create a project, choose an experiment, and begin step-by-step physical assembly.
                  </p>
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mono text-xs shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4 text-slate-950" />
                    <span>CREATE NEW ASSEMBLY PROJECT</span>
                  </button>
                </div>
              </div>
            )}

            {/* Drag & Drop Prompt Overlay */}
            {isDropHover && (
              <div className="absolute inset-0 bg-cyan-500/25 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none z-30 animate-pulse">
                <Move className="w-12 h-12 text-cyan-300 mb-2 animate-bounce" />
                <span className="text-base font-black text-cyan-200 font-mono tracking-widest uppercase">
                  DROP COMPONENT HERE TO ASSEMBLE
                </span>
              </div>
            )}

            {/* Explode View Slider */}
            {hasActiveProject && (
              <div className="absolute top-3 right-3 bg-[#0a1024]/90 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-3 text-xs font-mono shadow-md">
                <span className="text-slate-400">EXPLODE:</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explodeRatio}
                  onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
                  className="w-24 sm:w-28 accent-cyan-400 cursor-pointer"
                />
                <span className="text-cyan-300 font-bold">{Math.round(explodeRatio * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. RIGHT COLUMN: ONLY PROCEDURE & CONNECTION DIAGRAMS (AS REQUESTED) */}
        <div className="w-84 md:w-96 lg:w-[420px] bg-[#060a16] border-l border-slate-800/80 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {hasActiveProject ? (
            <>
              {/* Procedure Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                    EXPERIMENT NO {activeGuide.expNo}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {currentCompletedSteps.length} / {activeExpSteps.length} Steps
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {activeGuide.title}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed font-mono">
                  <strong>AIM:</strong> {activeGuide.aim}
                </p>

                {/* Progress */}
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((currentCompletedSteps.length / activeExpSteps.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* RUN & EXECUTE BUTTON */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold">PROCEDURE STATUS:</span>
                  <span className={isExpFullyAssembled ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {isExpFullyAssembled ? 'ASSEMBLY COMPLETE' : `STEP ${nextExpectedStep?.stepNo || 1} PENDING`}
                  </span>
                </div>

                <button
                  onClick={handleRunAndExecute}
                  disabled={!isExpFullyAssembled}
                  className={`w-full py-3 rounded-xl font-mono font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isExpFullyAssembled
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN & EXECUTE EXPERIMENT</span>
                </button>
              </div>

              {/* ONLY PROCEDURE SECTION (Step by step with connection diagrams) */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>OFFICIAL LAB PROCEDURE</span>
                </h4>

                {activeExpSteps.map((step) => {
                  const isStepDone = currentCompletedSteps.includes(step.stepNo);
                  const isCurrent = step.stepNo === nextExpectedStep?.stepNo;

                  return (
                    <div
                      key={step.stepNo}
                      className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex flex-col gap-2.5 ${
                        isStepDone
                          ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-300'
                          : isCurrent
                          ? 'bg-[#0e1c3a] border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
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
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            NEXT STEP &gt;&gt;&gt;
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                        {step.instruction}
                      </p>

                      {/* CLEAR CONNECTION DIAGRAM & PINOUT SCHEMATIC (IF ANY) */}
                      {step.connectionDiagram && (
                        <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[10px] font-mono space-y-1.5 shadow-sm">
                          <div className="font-bold text-amber-300 flex items-center gap-1">
                            <Cable className="w-3.5 h-3.5" />
                            <span>CONNECTION SCHEMATIC & WIRING DIAGRAM:</span>
                          </div>
                          <div className="text-cyan-300">
                            <strong>From:</strong> {step.connectionDiagram.from}
                          </div>
                          <div className="text-cyan-300">
                            <strong>To:</strong> {step.connectionDiagram.to}
                          </div>
                          <div className="text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800 font-mono">
                            {step.connectionDiagram.schematicText}
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            <strong>Pinout:</strong> {step.connectionDiagram.pinout}
                          </div>
                          <div className="text-slate-400 text-[9px]">
                            <strong>Wiring:</strong> {step.connectionDiagram.wireColor}
                          </div>
                        </div>
                      )}

                      {/* Step Trigger Action */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 truncate max-w-[190px]">
                          Target: {step.targetComponentName}
                        </span>

                        <button
                          onClick={() => handleDropComponent(step.targetComponentId)}
                          disabled={isStepDone}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-transform active:scale-95 flex items-center gap-1 cursor-pointer ${
                            isStepDone
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 cursor-default'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                          }`}
                        >
                          {isStepDone ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Move className="w-3 h-3" />
                              <span>Place Part</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono text-xs">
              <FolderPlus className="w-8 h-8 text-amber-400 mb-2 opacity-60" />
              <p>No project selected.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click "NEW PROJECT" to choose an experiment and see its official procedure here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. FINAL OUTPUT & SCREENSHOT MODAL (When Experiment Executes) */}
      {showOutputModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative max-w-3xl w-full rounded-2xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#050914] border-2 border-cyan-400 p-6 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.5)] overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    EX {selectedExpNo} LIVE EXPERIMENT RESULTS & OBSERVATION RECORD
                  </h3>
                  <p className="text-xs text-slate-400">
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

            {/* Throttle Sweep */}
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

            {/* Official Observation Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden mb-5 text-xs font-mono">
              <div className="bg-slate-900/90 p-2 font-bold text-slate-300 border-b border-slate-800">
                OFFICIAL OBSERVATION TABLE (CALCULATED VALUES)
              </div>
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">S.No</th>
                    <th className="p-2">Throttle (%)</th>
                    <th className="p-2">Speed (RPM)</th>
                    <th className="p-2">Voltage (V)</th>
                    <th className="p-2">Current (A)</th>
                    <th className="p-2">Thrust (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-2">1</td>
                    <td className="p-2">20%</td>
                    <td className="p-2">1,960</td>
                    <td className="p-2">12.4</td>
                    <td className="p-2">2.5</td>
                    <td className="p-2">120</td>
                  </tr>
                  <tr>
                    <td className="p-2">2</td>
                    <td className="p-2">40%</td>
                    <td className="p-2">3,920</td>
                    <td className="p-2">12.1</td>
                    <td className="p-2">5.1</td>
                    <td className="p-2">310</td>
                  </tr>
                  <tr>
                    <td className="p-2">3</td>
                    <td className="p-2">60%</td>
                    <td className="p-2">5,880</td>
                    <td className="p-2">11.8</td>
                    <td className="p-2">7.6</td>
                    <td className="p-2">530</td>
                  </tr>
                  <tr className="bg-cyan-950/20 font-bold text-cyan-300">
                    <td className="p-2">4</td>
                    <td className="p-2">{testThrottle}%</td>
                    <td className="p-2">{testRPM}</td>
                    <td className="p-2">{testVoltageV}</td>
                    <td className="p-2">{testCurrentA}</td>
                    <td className="p-2">{testThrustG}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ACTION BUTTONS: SCREENSHOT & FULL LAB RECORD */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono">
              <button
                onClick={handleCaptureResult}
                disabled={isCapturingScreenshot}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>📷 TAKE SCREENSHOT OF OUTPUT</span>
              </button>

              <button
                onClick={() => {
                  setSelectedReportExpId(selectedExpNo);
                  setIsRecordModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>PRINT FULL LAB RECORD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
