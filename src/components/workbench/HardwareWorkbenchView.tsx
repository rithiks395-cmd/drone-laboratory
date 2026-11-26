import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, PerspectiveCamera } from '@react-three/drei';
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
  Power
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
  forExperiments: number[];
  installed: boolean;
}

export interface AssemblyStep {
  stepNo: number;
  title: string;
  actionType: 'pick' | 'mount' | 'wire' | 'execute';
  targetComponentId: string;
  targetComponentName: string;
  instruction: string;
  wireInfo?: string;
}

export interface ExperimentGuide {
  expNo: number;
  title: string;
  aim: string;
  primaryComponents: string[];
  steps: AssemblyStep[];
}

export const HardwareWorkbenchView: React.FC = () => {
  const { openInspection, setIsRecordModalOpen, setSelectedReportExpId, captureScreenshot, atmosphereTheme } = useLab();
  const workbenchRef = useRef<HTMLDivElement>(null);

  // Welcome Glowing Splash Screen state
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

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
  const [showOnlyExpComponents, setShowOnlyExpComponents] = useState<boolean>(false);

  // Explode view slider (0 to 1)
  const [explodeRatio, setExplodeRatio] = useState<number>(0);

  // Step progression for the selected experiment
  const [completedSteps, setCompletedSteps] = useState<Record<number, number[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []
  });

  // Live Experiment Test Controls
  const [testThrottle, setTestThrottle] = useState<number>(0);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeServoAngle, setActiveServoAngle] = useState<number>(45);

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
      forExperiments: [1, 9],
      installed: true,
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
    },
    {
      id: 'fc_kk215',
      name: 'KK 2.1.5 LCD Flight Controller Board',
      category: 'Avionics',
      model: 'KK2.1.5 Multi-Rotor Control Board with Graphic LCD & Atmel 644PA',
      specs: 'Sensors: InvenSense MPU6050 6-DOF Gyro/Accel, 8 Motor outputs, 5 Inputs',
      weightG: 22,
      qty: 1,
      forExperiments: [1, 9, 10],
      installed: true,
    },
    {
      id: 'rc_receiver',
      name: 'FS-iA6B 6-Channel 2.4GHz Receiver',
      category: 'Avionics',
      model: 'FlySky 2.4GHz AFHDS 2A PWM/SBUS Receiver with Dual Diversity Antenna',
      specs: 'Channels: 6 PWM / 14 i-BUS, RF Range: 500-1500m, Sensitivity: -105dBm',
      weightG: 14,
      qty: 1,
      forExperiments: [1, 6, 9],
      installed: true,
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
      installed: false,
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
    },
    {
      id: 'pdb_xt60',
      name: 'Integrated PDB & XT60 Power Harness',
      category: 'Wires & Linkages',
      model: 'High-Current Dual Copper Layer PDB Rail with 14AWG Silicone Wire',
      specs: 'Max Current: 100A, Plating: Gold immersion, Connector: Genuine XT60 Male',
      weightG: 28,
      qty: 1,
      forExperiments: [1, 9],
      installed: true,
    },
    {
      id: 'hardware_screws',
      name: 'M3 Hex Screws & Nylon Standoffs Kit',
      category: 'Mechanical',
      model: 'High-Tensile Grade 12.9 M3x8mm Screws & M3x12mm Hex Spacers',
      specs: 'Screws: 24x M3x8mm, Standoffs: 8x M3x15mm nylon, Lock-nuts: 16x',
      weightG: 45,
      qty: 1,
      forExperiments: [1, 9],
      installed: true,
    },
    {
      id: 'thrust_rig',
      name: 'Digital Load-Cell Thrust Stand Rig',
      category: 'Instrumentation',
      model: 'Dual-Rail Linear Thrust Stand with 5kg Digital Strain Gauge',
      specs: 'Range: 0 - 5000g ±1g, Optical Tachometer: 10 - 30000 RPM, Current Shunt: 30A',
      weightG: 650,
      qty: 1,
      forExperiments: [3],
      installed: false,
    },
    {
      id: 'tachometer_opt',
      name: 'Optical Laser Digital Tachometer',
      category: 'Instrumentation',
      model: 'Non-Contact Infrared Optical Tachometer with Reflective Marker Target',
      specs: 'Range: 2.5 - 99,999 RPM, Accuracy: ±0.05%, Sampling: 0.8s',
      weightG: 120,
      qty: 1,
      forExperiments: [3, 7],
      installed: false,
    },
    {
      id: 'ammeter_shunt',
      name: '30A Precision DC Current Shunt & Wattmeter',
      category: 'Instrumentation',
      model: 'Digital In-Line Power Analyzer with 16-Bit ADC Voltage/Current Sampling',
      specs: 'Range: 0-60V, 0-100A peak (50A continuous), Resolution: 0.01A / 0.01V',
      weightG: 85,
      qty: 1,
      forExperiments: [3, 5],
      installed: false,
    },
    {
      id: 'fixed_wing_airframe',
      name: 'Trainer Fixed-Wing EPO Airframe',
      category: 'Mechanical',
      model: 'High-Wing Aerodynamic Trainer Fuselage with Carbon Spar & Tailplane',
      specs: 'Wingspan: 1200mm, Chord: 180mm, Airfoil: Clark-Y, Aspect Ratio: 6.67',
      weightG: 380,
      qty: 1,
      forExperiments: [2, 8],
      installed: false,
    },
    {
      id: 'wing_spar_carbon',
      name: 'High-Modulus Carbon Fiber Wing Spar Tube',
      category: 'Mechanical',
      model: 'Pultruded Carbon Fiber Spar Tube 10mm OD x 8mm ID x 900mm',
      specs: 'Tensile Strength: 2400 MPa, Weight: 42g, Internal reinforced joints',
      weightG: 42,
      qty: 1,
      forExperiments: [2, 8],
      installed: false,
    },
    {
      id: 'servos_9g',
      name: 'SG90 9g Micro Servos & Linkages (x4)',
      category: 'Avionics',
      model: '9g Analog Micro Servos with Nylon Control Horns & Steel Pushrods',
      specs: 'Torque: 1.8 kg-cm @ 4.8V, Speed: 0.10s/60°, Operating Angle: 180°',
      weightG: 36,
      qty: 4,
      forExperiments: [2, 4],
      installed: false,
    },
    {
      id: 'servo_tester',
      name: 'Microprocessor 3-Channel Servo Tester',
      category: 'Instrumentation',
      model: 'Digital CCPM Servo Consistency Master with Manual/Neutral/Auto Modes',
      specs: 'Output PWM: 800 - 2200μs (1.5ms neutral), Input Voltage: 4.8 - 6.0V DC',
      weightG: 25,
      qty: 1,
      forExperiments: [4],
      installed: false,
    },
    {
      id: 'protractor_dial',
      name: '180° Precision Angular Deflection Protractor',
      category: 'Instrumentation',
      model: 'Laser-Etched Acrylic Control Surface & Servo Angle Measurement Dial',
      specs: 'Range: 0° - 180° (±90° dual sweep), Resolution: 0.5° with needle indicator',
      weightG: 40,
      qty: 1,
      forExperiments: [4],
      installed: false,
    },
    {
      id: 'pushrod_linkage',
      name: 'Piano Wire Pushrods & Brass Clevises',
      category: 'Wires & Linkages',
      model: '1.2mm Tempered Spring-Steel Pushrods with Threaded Brass Clevis Ends',
      specs: 'Diameter: 1.2mm, Length: 250mm, Clevis pin: 1.5mm stainless steel',
      weightG: 18,
      qty: 4,
      forExperiments: [2, 4],
      installed: false,
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
      installed: false,
    },
    {
      id: 'lipo_cell_checker',
      name: '1S-8S Digital LiPo Voltage Checker & Buzzer',
      category: 'Instrumentation',
      model: 'Digital Microprocessor Battery Monitor with Dual Piezo Alarms',
      specs: 'Voltage Precision: ±0.01V, Cell Detection: 1S-8S, Low Voltage Alarm: 2.7-3.8V',
      weightG: 16,
      qty: 1,
      forExperiments: [5],
      installed: false,
    },
    {
      id: 'bind_plug_loop',
      name: '2.4GHz Receiver Jumper Bind Plug Cable',
      category: 'Wires & Linkages',
      model: 'Shorting Loop Jumper Wire for Receiver BIND / CH3 Signal Pins',
      specs: 'Standard 3-pin 2.54mm pitch DuPont housing with signal-to-ground loop',
      weightG: 4,
      qty: 1,
      forExperiments: [6],
      installed: false,
    },
    {
      id: 'prop_balancer',
      name: 'Magnetic Levitation Propeller Balancer',
      category: 'Instrumentation',
      model: 'Frictionless Dual Rare-Earth Neodymium Magnetic Suspension Stand',
      specs: 'Sensitivity: <0.05g imbalance, Center Shaft: CNC hardened ground steel',
      weightG: 240,
      qty: 1,
      forExperiments: [7],
      installed: false,
    },
    {
      id: 'balance_tape',
      name: 'Precision Mylar Counter-Balancing Tape',
      category: 'Wires & Linkages',
      model: 'Aeronautical Thin-Film Balancing Tape & 600-Grit Sanding Pad',
      specs: 'Adhesive: High-shear acrylic, Density: 0.035g/cm², Sandpaper: 600 grit',
      weightG: 15,
      qty: 1,
      forExperiments: [7],
      installed: false,
    },
    {
      id: 'airfoil_naca',
      name: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
      category: 'Mechanical',
      model: 'CNC Precision Polyurethane Foam Aerodynamic Wing Model with Pressure Taps',
      specs: 'Span: 300mm, Chord: 150mm, Airfoil profiles: Clark-Y Cambered & NACA 0012',
      weightG: 140,
      qty: 1,
      forExperiments: [8],
      installed: false,
    },
    {
      id: 'pitot_tube',
      name: 'Pitot-Static Tube Differential Airspeed Probe',
      category: 'Instrumentation',
      model: 'Aircraft Grade Stainless Steel Dual-Port Dynamic & Static Pressure Tube',
      specs: 'Diameter: 4mm, Static port ring: 6 holes x 0.5mm, Total pressure orifice: 1.5mm',
      weightG: 32,
      qty: 1,
      forExperiments: [8],
      installed: false,
    },
    {
      id: 'manometer_water',
      name: 'Inclined U-Tube Water Differential Manometer',
      category: 'Instrumentation',
      model: 'Precision Borosilicate Glass Dual-Limb Fluid Pressure Gauge',
      specs: 'Fluid: Distilled H2O (ρ = 1000 kg/m³), Range: 0 - 250 mmH2O, Resolution: 1 mm',
      weightG: 310,
      qty: 1,
      forExperiments: [8],
      installed: false,
    },
    {
      id: 'mpu6050_sensor',
      name: 'InvenSense MPU6050 6-Axis Gyro & Accel Module',
      category: 'Avionics',
      model: 'Triple-Axis Angular Rate Sensor (Gyro) & Triple-Axis Accelerometer (I2C)',
      specs: 'Gyro: ±250 to ±2000°/s, Accel: ±2g to ±16g, 16-bit ADCs, Digital Motion Processor',
      weightG: 6,
      qty: 1,
      forExperiments: [10],
      installed: false,
    },
    {
      id: 'usb_programmer',
      name: 'USB AVR-ISP Programmer Dongle & Ribbon Cable',
      category: 'Wires & Linkages',
      model: 'USBasp In-Circuit Serial Programmer with 6-Pin to 10-Pin ISP Cable',
      specs: 'Target Voltage: 3.3V / 5.0V, Clock: 12MHz, Compatible with KK2.1.5 firmware',
      weightG: 24,
      qty: 1,
      forExperiments: [10],
      installed: false,
    },
  ]);

  // Master Guided Execution Protocols for Experiments 1 through 10
  const experimentGuides: Record<number, ExperimentGuide> = useMemo(() => ({
    1: {
      expNo: 1,
      title: 'UAV Component Identification & Structural Architecture',
      aim: 'Study, identify, and mount physical airframe, BLDC motor, ESC, flight controller, and power distribution subsystems.',
      primaryComponents: ['frame_f450', 'arms_f450', 'bldc_motors', 'esc_30a', 'fc_kk215', 'lipo_3s'],
      steps: [
        {
          stepNo: 1,
          title: 'Position Base Frame Plate',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'Pick the F450 Center PCB Frame from the parts tray and place it at the center of the ESD workbench.',
        },
        {
          stepNo: 2,
          title: 'Mount Quadcopter PA66 Arm Struts',
          actionType: 'mount',
          targetComponentId: 'arms_f450',
          targetComponentName: 'F450 High-Strength Arm Struts (x4)',
          instruction: 'Mount 4x PA66 composite arms (Red in front for heading, White in rear) onto the lower frame plate using M3 hex screws.',
        },
        {
          stepNo: 3,
          title: 'Install 4x A2212 BLDC Motors',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Fasten the 4 brushless outrunner motors to the arm tips with M3 mounting screws. Ensure CW and CCW shafts are in alternating diagonal pairs.',
        },
        {
          stepNo: 4,
          title: 'Wire ESC 3-Phase Bullet Leads to Motors',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Connect ESC 3-phase bullet connector leads (Phases A, B, C) to motor stator pins. Solder ESC DC power leads to PDB terminals (+/-).',
          wireInfo: 'Phase A -> Motor Lead 1, Phase B -> Motor Lead 2, Phase C -> Motor Lead 3. DC Red -> +12V, DC Black -> GND.',
        },
        {
          stepNo: 5,
          title: 'Mount KK2.1.5 Flight Controller & LiPo Battery',
          actionType: 'execute',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Secure KK2.1.5 board on anti-vibration standoffs facing forward. Strap 3S LiPo battery and verify overall structural balance.',
        },
      ],
    },
    2: {
      expNo: 2,
      title: 'Fixed-Wing Airframe & Aerodynamic Control Surface Assembly',
      aim: 'Assemble fixed-wing fuselage, carbon wing spar, install aileron/elevator/rudder servos, and set mechanical linkages.',
      primaryComponents: ['fixed_wing_airframe', 'wing_spar_carbon', 'servos_9g', 'pushrod_linkage'],
      steps: [
        {
          stepNo: 1,
          title: 'Place EPO Trainer Fuselage on Bench',
          actionType: 'pick',
          targetComponentId: 'fixed_wing_airframe',
          targetComponentName: 'Trainer Fixed-Wing EPO Airframe',
          instruction: 'Pick the EPO aerodynamic trainer fuselage and wing panels from the tray and place onto workbench cradles.',
        },
        {
          stepNo: 2,
          title: 'Insert Carbon Fiber Wing Spar Tube',
          actionType: 'mount',
          targetComponentId: 'wing_spar_carbon',
          targetComponentName: 'High-Modulus Carbon Fiber Wing Spar Tube',
          instruction: 'Slide the 10mm carbon spar through the central fuselage pass-through and lock left & right main wing panels onto the spar.',
        },
        {
          stepNo: 3,
          title: 'Install 4x SG90 Control Surface Servos',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Insert 9g micro servos into pre-cut pockets: 2x in wings for ailerons, 1x in empennage for elevator, 1x for rudder.',
        },
        {
          stepNo: 4,
          title: 'Connect Steel Pushrods to Nylon Control Horns',
          actionType: 'wire',
          targetComponentId: 'pushrod_linkage',
          targetComponentName: 'Piano Wire Pushrods & Brass Clevises',
          instruction: 'Fasten piano wire pushrods between servo arms and control surface horns. Adjust brass clevises for 0° neutral trim.',
          wireInfo: 'CH1 -> Aileron Servo, CH2 -> Elevator Servo, CH4 -> Rudder Servo (3-wire JR cables: Signal/VCC/GND).',
        },
        {
          stepNo: 5,
          title: 'Verify Control Surface Deflection Limits',
          actionType: 'execute',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Deflect control sticks to verify full ±20° throw on ailerons, ±25° on elevator, and ±30° on rudder without binding.',
        },
      ],
    },
    3: {
      expNo: 3,
      title: 'Brushless Motor Thrust & Electrical Efficiency Calibration',
      aim: 'Calibrate BLDC motor thrust output vs RPM, current draw, and power consumption using digital strain gauge load cell.',
      primaryComponents: ['thrust_rig', 'bldc_motors', 'props_1045', 'esc_30a', 'ammeter_shunt', 'tachometer_opt'],
      steps: [
        {
          stepNo: 1,
          title: 'Mount Digital Load-Cell Thrust Stand Rig',
          actionType: 'pick',
          targetComponentId: 'thrust_rig',
          targetComponentName: 'Digital Load-Cell Thrust Stand Rig',
          instruction: 'Place the 5kg digital strain gauge thrust rig on the ESD workbench and tare load cell reading to 0.00g.',
        },
        {
          stepNo: 2,
          title: 'Fasten A2212 Motor & 1045 Propeller to Rig',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt the A2212 BLDC motor onto the pivoting thrust arm. Mount the 1045 carbon propeller with 6mm bullet adapter nut.',
        },
        {
          stepNo: 3,
          title: 'Connect 30A ESC & In-Line DC Power Analyzer',
          actionType: 'wire',
          targetComponentId: 'ammeter_shunt',
          targetComponentName: '30A Precision DC Current Shunt & Wattmeter',
          instruction: 'Connect motor phases to ESC. Wire DC power analyzer in series between 3S LiPo XT60 and ESC input terminals.',
          wireInfo: 'LiPo XT60 (+) -> Shunt IN (+), Shunt OUT (+) -> ESC Red (+); Common GND (-).',
        },
        {
          stepNo: 4,
          title: 'Aim Optical Laser Tachometer at Motor Bell',
          actionType: 'mount',
          targetComponentId: 'tachometer_opt',
          targetComponentName: 'Optical Laser Digital Tachometer',
          instruction: 'Align non-contact optical tachometer laser beam perpendicularly onto the reflective tape attached to the motor bell.',
        },
        {
          stepNo: 5,
          title: 'Sweep Throttle PWM & Record Thrust Curve',
          actionType: 'execute',
          targetComponentId: 'thrust_rig',
          targetComponentName: 'Digital Load-Cell Thrust Stand Rig',
          instruction: 'Increase PWM throttle in 20% steps from 0% to 100%. Record Thrust (g), RPM, Voltage (V), Current (A), and calculate g/W efficiency.',
        },
      ],
    },
    4: {
      expNo: 4,
      title: 'Servo Motor Actuation & Angular Deflection Calibration',
      aim: 'Calibrate servo horn angular travel, PWM pulse width (1000μs to 2000μs), and verify mechanical linkage linearity.',
      primaryComponents: ['servos_9g', 'servo_tester', 'protractor_dial', 'pushrod_linkage'],
      steps: [
        {
          stepNo: 1,
          title: 'Position Precision Protractor Angle Dial',
          actionType: 'pick',
          targetComponentId: 'protractor_dial',
          targetComponentName: '180° Precision Angular Deflection Protractor',
          instruction: 'Position the laser-etched 180° protractor calibration dial firmly onto the workbench fixture.',
        },
        {
          stepNo: 2,
          title: 'Mount SG90 Micro Servo at Dial Center Pivot',
          actionType: 'mount',
          targetComponentId: 'servos_9g',
          targetComponentName: 'SG90 9g Micro Servos & Linkages (x4)',
          instruction: 'Align servo spline shaft concentric with the protractor 0° reference mark and tighten bracket clamps.',
        },
        {
          stepNo: 3,
          title: 'Wire Servo 3-Pin JR Plug to Digital Servo Tester',
          actionType: 'wire',
          targetComponentId: 'servo_tester',
          targetComponentName: 'Microprocessor 3-Channel Servo Tester',
          instruction: 'Plug servo 3-pin JR connector into OUT1 of the CCPM tester. Supply 5.0V DC regulated power from BEC.',
          wireInfo: 'Orange/White wire -> PWM Signal, Red wire -> +5V VCC, Brown/Black wire -> Ground GND.',
        },
        {
          stepNo: 4,
          title: 'Attach Indicator Needle & Sweep Angle from 0° to 180°',
          actionType: 'execute',
          targetComponentId: 'protractor_dial',
          targetComponentName: '180° Precision Angular Deflection Protractor',
          instruction: 'Rotate CCPM dial from 1000μs (0°) to 1500μs (90° neutral) to 2000μs (180°). Measure linearity error and deadband.',
        },
      ],
    },
    5: {
      expNo: 5,
      title: 'LiPo Battery Multi-Cell Voltage & Discharge Diagnostic',
      aim: 'Inspect individual cell internal resistance, balance multi-cell voltage (3.7V - 4.2V/cell), and assess C-rating discharge health.',
      primaryComponents: ['lipo_3s', 'lipo_charger_imax', 'lipo_cell_checker', 'ammeter_shunt'],
      steps: [
        {
          stepNo: 1,
          title: 'Place 3S 2200mAh LiPo in Fireproof Safety Bay',
          actionType: 'pick',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Inspect LiPo outer casing for puffing or cell punctures. Place safely in grounded ESD battery testing cradle.',
        },
        {
          stepNo: 2,
          title: 'Connect JST-XH 4-Pin Balance Lead to Cell Checker',
          actionType: 'wire',
          targetComponentId: 'lipo_cell_checker',
          targetComponentName: '1S-8S Digital LiPo Voltage Checker & Buzzer',
          instruction: 'Plug the 4-pin white JST-XH balance lead into the cell checker. Inspect individual cell voltages (C1, C2, C3).',
          wireInfo: 'Pin 1: GND (Black), Pin 2: Cell 1 (3.7V), Pin 3: Cell 2 (7.4V), Pin 4: Cell 3 (11.1V). Max delta < 0.02V.',
        },
        {
          stepNo: 3,
          title: 'Wire XT60 High-Current Lead to IMAX B6 Charger',
          actionType: 'wire',
          targetComponentId: 'lipo_charger_imax',
          targetComponentName: 'IMAX B6 Microprocessor Balance Charger',
          instruction: 'Connect XT60 main leads to 4mm banana ports of IMAX B6. Plug balance lead into the 3S balancing socket.',
          wireInfo: 'Red Banana -> XT60 (+), Black Banana -> XT60 (-). Balance board -> 3S JST-XH port.',
        },
        {
          stepNo: 4,
          title: 'Execute Microprocessor Balance Charge & Diagnostic',
          actionType: 'execute',
          targetComponentId: 'lipo_charger_imax',
          targetComponentName: 'IMAX B6 Microprocessor Balance Charger',
          instruction: 'Set program: "LiPo BALANCE CHG", Current: 2.2A (1C rate), Voltage: 11.1V (3S). Monitor CC/CV transition at 12.60V.',
        },
      ],
    },
    6: {
      expNo: 6,
      title: '2.4GHz RC Transmitter & Receiver Binding & Signal Routing',
      aim: 'Bind 2.4GHz AFHDS 2A frequency-hopping transmitter to receiver, calibrate 6 channel PWM mapping and failsafe state.',
      primaryComponents: ['rc_transmitter_tx', 'rc_receiver', 'bind_plug_loop'],
      steps: [
        {
          stepNo: 1,
          title: 'Position FS-iA6B Receiver on ESD Bench',
          actionType: 'pick',
          targetComponentId: 'rc_receiver',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'Place FS-iA6B 6-channel receiver on bench with dual diversity dipole antennas extended at 90° angles.',
        },
        {
          stepNo: 2,
          title: 'Insert Bind Jumper Loop into B/VCC Port',
          actionType: 'wire',
          targetComponentId: 'bind_plug_loop',
          targetComponentName: '2.4GHz Receiver Jumper Bind Plug Cable',
          instruction: 'Insert the black bind plug jumper into the B/VCC pins of the receiver to pull signal pin to ground for pairing mode.',
          wireInfo: 'Bind Plug shorts Pin 1 (Signal) to Pin 3 (GND) on B/VCC channel.',
        },
        {
          stepNo: 3,
          title: 'Supply 5V DC Power & Verify Fast LED Flash',
          actionType: 'wire',
          targetComponentId: 'rc_receiver',
          targetComponentName: 'FS-iA6B 6-Channel 2.4GHz Receiver',
          instruction: 'Connect 5V BEC power to CH1. Verify the receiver red LED blinks rapidly (3 Hz), indicating binding search active.',
          wireInfo: '5V BEC Red -> VCC (+), Black -> GND (-).',
        },
        {
          stepNo: 4,
          title: 'Power Transmitter Holding BIND Key to Lock Link',
          actionType: 'execute',
          targetComponentId: 'rc_transmitter_tx',
          targetComponentName: 'FS-i6 6-Channel 2.4GHz Transmitter',
          instruction: 'Hold the "BIND KEY" on the FS-i6 radio and power ON. Confirm LCD displays "RxBinding OK" and receiver LED goes solid RED.',
        },
      ],
    },
    7: {
      expNo: 7,
      title: 'Static & Dynamic Propeller Mass Balancing',
      aim: 'Detect and correct static and dynamic mass imbalances on 1045 propellers using frictionless magnetic levitation suspension.',
      primaryComponents: ['prop_balancer', 'props_1045', 'balance_tape', 'tachometer_opt'],
      steps: [
        {
          stepNo: 1,
          title: 'Set Up Magnetic Levitation Balancer Stand',
          actionType: 'pick',
          targetComponentId: 'prop_balancer',
          targetComponentName: 'Magnetic Levitation Propeller Balancer',
          instruction: 'Level the magnetic levitation balance stand on the workbench. Check zero-friction air gap between needle tip and rare-earth magnet.',
        },
        {
          stepNo: 2,
          title: 'Mount 1045 Propeller onto Centering Shaft',
          actionType: 'mount',
          targetComponentId: 'props_1045',
          targetComponentName: '1045 Carbon-Reinforced Propellers (x4)',
          instruction: 'Slide 1045 carbon propeller onto the precision tapered shaft. Secure with twin aluminum thumb cones without blade distortion.',
        },
        {
          stepNo: 3,
          title: 'Suspend Shaft in Magnetic Field & Identify Heavy Blade',
          actionType: 'execute',
          targetComponentId: 'prop_balancer',
          targetComponentName: 'Magnetic Levitation Propeller Balancer',
          instruction: 'Release propeller horizontally. The heavier blade drops downward under gravity. Mark the lighter opposing blade with grease pencil.',
        },
        {
          stepNo: 4,
          title: 'Apply Mylar Balance Tape / Sand Light Blade to Equalize',
          actionType: 'wire',
          targetComponentId: 'balance_tape',
          targetComponentName: 'Precision Mylar Counter-Balancing Tape',
          instruction: 'Apply thin strips of counter-balancing Mylar tape to underside center of light blade until propeller rests perfectly horizontal at any angle.',
        },
      ],
    },
    8: {
      expNo: 8,
      title: 'Subsonic Airfoil Wind Tunnel Lift & Drag Measurement',
      aim: 'Measure pressure distributions, coefficient of lift (CL), coefficient of drag (CD) over symmetric and cambered airfoils in wind tunnel.',
      primaryComponents: ['airfoil_naca', 'pitot_tube', 'manometer_water', 'fixed_wing_airframe'],
      steps: [
        {
          stepNo: 1,
          title: 'Mount NACA 0012 Airfoil Model in Test Section',
          actionType: 'pick',
          targetComponentId: 'airfoil_naca',
          targetComponentName: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
          instruction: 'Mount the airfoil model on the wind tunnel balance pivot. Zero the digital angle of attack indicator to 0.0° incidence.',
        },
        {
          stepNo: 2,
          title: 'Install Pitot-Static Tube in Free-Stream Flow',
          actionType: 'mount',
          targetComponentId: 'pitot_tube',
          targetComponentName: 'Pitot-Static Tube Differential Airspeed Probe',
          instruction: 'Position the pitot-static tube 1 chord length upstream of the wing leading edge, perfectly parallel to tunnel centerline.',
        },
        {
          stepNo: 3,
          title: 'Connect Pressure Taps to Inclined U-Tube Manometer',
          actionType: 'wire',
          targetComponentId: 'manometer_water',
          targetComponentName: 'Inclined U-Tube Water Differential Manometer',
          instruction: 'Connect flexible silicone tubing from upper/lower airfoil surface taps to manometer multibank limbs.',
          wireInfo: 'Dynamic Port -> Limb 1 (+), Static Port -> Limb 2 (-). Surface Taps 1-12 -> Manometer Bank.',
        },
        {
          stepNo: 4,
          title: 'Start Wind Tunnel Fan & Record CL vs Angle of Attack',
          actionType: 'execute',
          targetComponentId: 'airfoil_naca',
          targetComponentName: 'Subsonic Wing Airfoil Section (NACA 0012 / Clark-Y)',
          instruction: 'Run tunnel at 15 m/s. Sweep angle of attack from -4° to +18°. Identify critical stall angle (α_stall) and maximum lift coefficient.',
        },
      ],
    },
    9: {
      expNo: 9,
      title: 'Complete Quadcopter-X Airframe & Power Harness Integration',
      aim: 'Fully integrate mechanical chassis, solder PDB power harness, install motors, ESCs, flight controller, and perform continuity checks.',
      primaryComponents: ['frame_f450', 'arms_f450', 'bldc_motors', 'esc_30a', 'pdb_xt60', 'fc_kk215', 'rc_receiver', 'lipo_3s'],
      steps: [
        {
          stepNo: 1,
          title: 'Assemble Dual Center Plates with Integrated PDB',
          actionType: 'pick',
          targetComponentId: 'frame_f450',
          targetComponentName: 'F450 Quad-X Carbon Frame Plates',
          instruction: 'Fasten the bottom PDB board to 4x PA66 arms with M3 screws. Solder the 14AWG silicone battery leads with XT60 male plug.',
        },
        {
          stepNo: 2,
          title: 'Solder 4x ESC Power Leads to PDB Rails',
          actionType: 'wire',
          targetComponentId: 'esc_30a',
          targetComponentName: 'SimonK 30A High-Speed ESCs (x4)',
          instruction: 'Solder 4x ESC power leads (+12V Red / GND Black) to corresponding arm corner solder pads. Shrink heatshrink over joints.',
          wireInfo: 'Corner 1 -> Front-Right (+/-), Corner 2 -> Rear-Left (+/-), Corner 3 -> Front-Left (+/-), Corner 4 -> Rear-Right (+/-).',
        },
        {
          stepNo: 3,
          title: 'Mount A2212 Motors & Route Bullet Connectors',
          actionType: 'mount',
          targetComponentId: 'bldc_motors',
          targetComponentName: 'A2212 1000KV Brushless DC Motors (x4)',
          instruction: 'Bolt motors to arm tips. Connect 3-phase bullet jacks. Swap any 2 phase wires if motor rotational direction requires reversal.',
        },
        {
          stepNo: 4,
          title: 'Wire Flight Controller M1-M4 Outputs & Receiver Inputs',
          actionType: 'wire',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Connect ESC servo signal plugs into KK2.1.5 M1-M4 headers. Connect FS-iA6B receiver channels into Aileron, Elevator, Throttle, Rudder inputs.',
          wireInfo: 'M1: Front-Left (CW), M2: Front-Right (CCW), M3: Rear-Right (CW), M4: Rear-Left (CCW).',
        },
        {
          stepNo: 5,
          title: 'Perform Grounded Continuity Check & Power Up Test',
          actionType: 'execute',
          targetComponentId: 'lipo_3s',
          targetComponentName: 'Turnigy 3S 2200mAh 25C LiPo Battery',
          instruction: 'Check 0 ohm resistance with multimeter between battery terminals to ensure no short-circuits. Plug in 3S LiPo and verify armed status.',
        },
      ],
    },
    10: {
      expNo: 10,
      title: 'Flight Controller Sensor Alignment & Gyroscope Calibration',
      aim: 'Calibrate InvenSense MPU6050 6-axis gyro/accelerometer, perform sensor zero-offset calibration, and tune PID stability loops.',
      primaryComponents: ['fc_kk215', 'mpu6050_sensor', 'usb_programmer', 'lipo_3s'],
      steps: [
        {
          stepNo: 1,
          title: 'Mount KK2.1.5 Board on Anti-Vibration Dampers',
          actionType: 'pick',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Seat the KK2.1.5 board squarely on 4x silicone anti-vibration damping bobbins with arrow pointed precisely toward drone nose.',
        },
        {
          stepNo: 2,
          title: 'Inspect InvenSense MPU6050 6-Axis IMU Sensor Alignment',
          actionType: 'mount',
          targetComponentId: 'mpu6050_sensor',
          targetComponentName: 'InvenSense MPU6050 6-Axis Gyro & Accel Module',
          instruction: 'Verify MPU6050 MEMS gyro chip orientation: X-axis forward (Pitch), Y-axis right (Roll), Z-axis upward (Yaw).',
        },
        {
          stepNo: 3,
          title: 'Connect USBasp Programmer Ribbon Cable for Telemetry',
          actionType: 'wire',
          targetComponentId: 'usb_programmer',
          targetComponentName: 'USB AVR-ISP Programmer Dongle & Ribbon Cable',
          instruction: 'Connect 6-pin ISP cable from USBasp programmer to Atmel 644PA programming header for live sensor data stream.',
          wireInfo: 'Pin 1: MISO, Pin 2: VCC (5V), Pin 3: SCK, Pin 4: MOSI, Pin 5: RESET, Pin 6: GND.',
        },
        {
          stepNo: 4,
          title: 'Level Workbench & Execute ACC & Gyro Zero Calibration',
          actionType: 'execute',
          targetComponentId: 'fc_kk215',
          targetComponentName: 'KK 2.1.5 LCD Flight Controller Board',
          instruction: 'Keep drone 100% stationary on level ESD bench. Select "Sensor Calibration" -> calibrate. Confirm: X:0.0°, Y:0.0°, Z:1.00g.',
        },
      ],
    },
  }), []);

  const activeGuide = experimentGuides[selectedExpNo] || experimentGuides[1];
  const activeExpSteps = activeGuide.steps;
  const currentCompletedSteps = completedSteps[selectedExpNo] || [];
  const isExpFullyAssembled = currentCompletedSteps.length === activeExpSteps.length;

  // Toggle installation of a component
  const toggleInstall = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, installed: !c.installed } : c))
    );
  };

  // Execute or complete a specific step
  const handleExecuteStep = (stepNo: number) => {
    setCompletedSteps((prev) => {
      const existing = prev[selectedExpNo] || [];
      if (existing.includes(stepNo)) return prev;
      return {
        ...prev,
        [selectedExpNo]: [...existing, stepNo].sort((a, b) => a - b),
      };
    });

    // Auto-install the target component in 3D scene
    const targetStep = activeExpSteps.find((s) => s.stepNo === stepNo);
    if (targetStep) {
      setComponents((prev) =>
        prev.map((c) => (c.id === targetStep.targetComponentId ? { ...c, installed: true } : c))
      );
    }
  };

  // Switch Experiment Number (1 to 10)
  const handleSelectExperiment = (expNo: number) => {
    setSelectedExpNo(expNo);
    setIsTestRunning(false);
    setTestThrottle(0);

    // Auto-mount key components for the selected experiment
    const guide = experimentGuides[expNo];
    if (guide) {
      setComponents((prev) =>
        prev.map((c) => ({
          ...c,
          installed: guide.primaryComponents.includes(c.id),
        }))
      );
    }
  };

  // Filtered components list based on Category, Search Query, and EXP filter
  const filteredComponents = components.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExp = !showOnlyExpComponents || c.forExperiments.includes(selectedExpNo);

    return matchesCategory && matchesSearch && matchesExp;
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

  return (
    <div ref={workbenchRef} className="h-full flex flex-col bg-[#060913] text-slate-100 overflow-hidden font-sans relative">
      
      {/* 1. BRIGHTER GLOWING ANIMATED WELCOME SPLASH SCREEN MODAL */}
      {showWelcomeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full rounded-3xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#050914] border-2 border-cyan-400 p-8 shadow-[0_0_80px_rgba(6,182,212,0.6)] text-center overflow-hidden">
            
            {/* Holographic animated scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.15)_50%,transparent_100%)] bg-[length:100%_40px] animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
            
            {/* Ambient Corner Glows */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/25 rounded-full blur-3xl pointer-events-none"></div>

            {/* Glowing Icon Header */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-amber-400 p-0.5 shadow-[0_0_35px_rgba(6,182,212,0.8)] mb-4 animate-bounce">
                <div className="w-full h-full rounded-2xl bg-[#080d1e] flex items-center justify-center">
                  <Wrench className="w-10 h-10 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                </div>
              </div>

              {/* Glowing Top Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/60 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span className="tracking-widest uppercase">VIRTUAL HARDWARE INTEGRATION SUITE</span>
              </div>

              {/* Brighter Glowing Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-white">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                  WELCOME TO AERO-SPACE LAB
                </span>
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-normal">
                Assemble physical aeronautical parts across all 10 university syllabus experiments, perform wiring connections, explode/assemble 3D models, and execute live telemetry tests on the ESD workbench.
              </p>

              {/* Status Indicators */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md my-6 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 flex flex-col items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-slate-400">ESD BENCH</span>
                  <span className="font-bold">GROUNDED</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 flex flex-col items-center gap-1 shadow-sm">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] text-slate-400">HARDWARE</span>
                  <span className="font-bold">10 MODULES</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 flex flex-col items-center gap-1 shadow-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-slate-400">BENCH POWER</span>
                  <span className="font-bold">12.6V READY</span>
                </div>
              </div>

              {/* Enter Workspace Glowing CTA Button */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>ENTER 3D WORKBENCH</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
              >
                Skip intro & start immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: Experiment 1 - 10 Selector & Lighting Mode */}
      <div className="bg-[#090e1f] border-b border-cyan-500/30 p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left: Workbench Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2">
              <span className="bg-gradient-to-r from-cyan-400 to-amber-300 bg-clip-text text-transparent">
                AERO-SPACE LAB WORKBENCH
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                EX 1-10
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Experiment Number Selector Buttons (Ex 1 to 10) */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full custom-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = selectedExpNo === num;
            const isCompleted = (completedSteps[num] || []).length === (experimentGuides[num]?.steps.length || 0);

            return (
              <button
                key={num}
                onClick={() => handleSelectExperiment(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
                title={`Select Experiment ${num}`}
              >
                {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                <span>EX {num}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Lighting Mode Switcher (DAY / NIGHT) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-cyan-500/30 text-xs font-mono">
            <button
              onClick={() => setBenchTimeMode('day')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                isDay
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Cleanroom Day Time"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DAY</span>
            </button>
            <button
              onClick={() => setBenchTimeMode('night')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                !isDay
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Cyber Night Time"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NIGHT</span>
            </button>
          </div>

          <button
            onClick={() => setShowWelcomeModal(true)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800"
            title="Re-open Welcome Screen"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* MAIN 3-COLUMN WORKSPACE: [COMPONENTS TRAY] | [3D ESD BENCH] | [GUIDED EXECUTION PANEL] */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. LEFT COLUMN: COMPONENTS SECTION WITH SEARCH BAR */}
        <div className="w-80 md:w-88 lg:w-96 bg-[#080d1c] border-r border-slate-800/80 flex flex-col shrink-0">
          
          {/* Search Bar & Header */}
          <div className="p-3 border-b border-slate-800 flex flex-col gap-2.5 bg-[#0a1024]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMPONENTS SECTION</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">
                {components.filter((c) => c.installed).length} / {components.length} Mounted
              </span>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search components (motor, esc, wire...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Toggle: All vs Selected EXP Only */}
            <div className="flex items-center justify-between text-[11px] font-mono pt-1">
              <button
                onClick={() => setShowOnlyExpComponents(!showOnlyExpComponents)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${
                  showOnlyExpComponents
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>Filter for EX {selectedExpNo}</span>
              </button>
              <span className="text-[10px] text-slate-500">
                {filteredComponents.length} parts found
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono pb-0.5 custom-scrollbar">
              {['All', 'Mechanical', 'Propulsion', 'Avionics', 'Power', 'Wires & Linkages', 'Instrumentation'].map((cat) => (
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

          {/* Scrollable Component Cards List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {filteredComponents.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                No components found matching "{searchQuery}".
              </div>
            ) : (
              filteredComponents.map((item) => {
                const isForCurrentExp = item.forExperiments.includes(selectedExpNo);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all text-xs font-mono flex flex-col gap-1.5 ${
                      item.installed
                        ? 'bg-[#0d1833] border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isForCurrentExp
                        ? 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.installed ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                          }`}
                        />
                        <span className="font-bold text-white text-[11px] truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono shrink-0 ml-1">
                        {item.weightG}g
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.model}</p>

                    <div className="text-[9px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 truncate">
                      {item.specs}
                    </div>

                    {/* Experiment Tags */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.forExperiments.map((e) => (
                          <span
                            key={e}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              e === selectedExpNo
                                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            EX {e}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleInstall(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-transform active:scale-95 flex items-center gap-1 ${
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
                            <Plus className="w-3 h-3" /> Place
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mass & Status Footer */}
          <div className="p-2.5 border-t border-slate-800 bg-[#070b16] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">BENCH TOTAL MASS:</span>
            <span className="text-cyan-300 font-bold">{totalInstalledWeight} grams</span>
          </div>
        </div>

        {/* 2. CENTER COLUMN: 3D ESD LABORATORY WORKBENCH (NIGHT / DAY) */}
        <div className="flex-1 flex flex-col relative bg-[#040711] overflow-hidden">
          
          <div className="flex-1 relative">
            <Canvas shadows className="w-full h-full">
              <PerspectiveCamera makeDefault position={[0, 4.5, 6]} fov={45} />
              <ambientLight intensity={isDay ? 1.2 : 0.6} />
              <directionalLight position={[10, 15, 10]} intensity={isDay ? 2.0 : 1.4} castShadow />
              <pointLight position={[0, 3, 0]} intensity={0.9} color={isDay ? '#ffffff' : '#00f0ff'} />

              {/* Night Mode Stars */}
              {!isDay && (
                <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />
              )}

              {/* Anti-Static ESD Laboratory Workbench Surface */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[14, 0.1, 9]} />
                <meshStandardMaterial
                  color={isDay ? '#475569' : '#0b1329'}
                  roughness={isDay ? 0.5 : 0.7}
                  metalness={isDay ? 0.3 : 0.4}
                />
              </mesh>

              {/* Fine Workbench Calibration Grid */}
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

              {/* 3D SCENE DISPATCHER FOR ALL 10 EXPERIMENTS */}
              {/* EX 1, 9: Full Quadcopter-X Assembly */}
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

              {/* EX 2: Fixed-Wing Airframe Assembly */}
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

              {/* EX 3: Motor Thrust Calibration Rig */}
              {selectedExpNo === 3 && (
                <group position={[0, 0, 0]}>
                  {/* Digital Thrust Stand Bed */}
                  <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[1.8, 0.5, 3.2]} />
                    <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.7} roughness={0.3} />
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

              {/* EX 4: Servo Motor Actuation & Protractor Dial */}
              {selectedExpNo === 4 && (
                <group position={[0, 0.1, 0]}>
                  <group position={[0, 0.3, 0]}>
                    <ServoMotorModel scale={1.8} angle={activeServoAngle} />
                  </group>
                  {/* Protractor Scale Arc */}
                  <mesh position={[0, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 1.6, 32, 1, 0, Math.PI]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.5} />
                  </mesh>
                </group>
              )}

              {/* EX 5: LiPo Multi-Cell Balance & Testing */}
              {selectedExpNo === 5 && (
                <group position={[0, 0.1, 0]}>
                  <group position={[-1.0, 0.2, 0]}>
                    <LiPoBatteryModel scale={1.3} cells={3} />
                  </group>
                  {/* IMAX B6 Charger */}
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

              {/* EX 6: RC Radio Binding & Signal Routing */}
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

              {/* EX 7: Magnetic Levitation Propeller Balancer */}
              {selectedExpNo === 7 && (
                <group position={[0, 0, 0]}>
                  <BalanceStandModel scale={1.2} />
                  <group position={[0, 1.45, 0]}>
                    <PropellerModel scale={1.3} spinning={false} rpm={0} blades={2} />
                  </group>
                </group>
              )}

              {/* EX 8: Subsonic Airfoil Wind Tunnel */}
              {selectedExpNo === 8 && (
                <group position={[0, 0.4, 0]}>
                  {/* Airfoil Section */}
                  <mesh rotation={[0, 0, 0.15]}>
                    <boxGeometry args={[0.2, 1.2, 3.0]} />
                    <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* Tunnel Rails */}
                  <mesh position={[0, -0.3, 0]}>
                    <boxGeometry args={[2.5, 0.1, 4.0]} />
                    <meshStandardMaterial color="#1e293b" wireframe />
                  </mesh>
                </group>
              )}

              {/* EX 10: KK2.1.5 Flight Controller Sensor Alignment */}
              {selectedExpNo === 10 && (
                <group position={[0, 0.2 + explodeRatio * 0.3, 0]}>
                  <KK215BoardModel scale={1.5} />
                </group>
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>

            {/* 3D Canvas HUD Controls: Explode Slider & Lighting Indicator */}
            <div className="absolute top-3 right-3 bg-[#0a1024]/90 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-3 text-xs font-mono shadow-md">
              <span className="text-slate-400">EXPLODE VIEW:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodeRatio}
                onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-cyan-400 cursor-pointer"
              />
              <span className="text-cyan-300 font-bold">{Math.round(explodeRatio * 100)}%</span>
            </div>

            {/* Bottom Guidance Info */}
            <div className="absolute bottom-3 left-3 bg-[#0a1024]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Rotate view with mouse/touch • Complete steps in right execution panel</span>
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: GUIDED STEP-BY-STEP EXECUTION PANEL (EX NO & HOW TO EXECUTE) */}
        <div className="w-84 md:w-96 lg:w-[420px] bg-[#080d1c] border-l border-slate-800/80 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Header: Selected Experiment No & Title */}
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

            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              {activeGuide.aim}
            </p>

            {/* Assembly Progress Bar */}
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((currentCompletedSteps.length / activeExpSteps.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Assembly Success Banner when 100% complete */}
          {isExpFullyAssembled && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-400/50 text-emerald-300 text-xs font-mono flex flex-col gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>EX {selectedExpNo} ASSEMBLY & WIRING 100% COMPLETE!</span>
              </div>
              <p className="text-[10px] text-emerald-300/90 leading-relaxed">
                All physical hardware parts and connections are properly seated. You can now execute live tests or generate your official laboratory record sheet.
              </p>
              <button
                onClick={() => {
                  setSelectedReportExpId(selectedExpNo);
                  setIsRecordModalOpen(true);
                }}
                className="mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Generate Official Lab Record Sheet</span>
              </button>
            </div>
          )}

          {/* STEP-BY-STEP EXECUTION PROTOCOL */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>STEP-BY-STEP ASSEMBLY & WIRING GUIDE</span>
            </h4>

            {activeExpSteps.map((step) => {
              const isStepDone = currentCompletedSteps.includes(step.stepNo);

              return (
                <div
                  key={step.stepNo}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex flex-col gap-2 ${
                    isStepDone
                      ? 'bg-[#0b172a] border-emerald-500/40 text-slate-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isStepDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                      }`}>
                        {isStepDone ? '✓' : step.stepNo}
                      </span>
                      <span>{step.title}</span>
                    </span>

                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                      step.actionType === 'pick'
                        ? 'bg-blue-500/20 text-blue-300'
                        : step.actionType === 'mount'
                        ? 'bg-amber-500/20 text-amber-300'
                        : step.actionType === 'wire'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {step.actionType}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {step.instruction}
                  </p>

                  {/* Wire Connection Details if present */}
                  {step.wireInfo && (
                    <div className="p-2 rounded-lg bg-slate-950/90 border border-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                      <div className="font-bold text-amber-300 mb-0.5">⚡ WIRING SPECIFICATION:</div>
                      {step.wireInfo}
                    </div>
                  )}

                  {/* Step Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      Part: {step.targetComponentName}
                    </span>

                    <button
                      onClick={() => handleExecuteStep(step.stepNo)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        isStepDone
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                      }`}
                    >
                      {isStepDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Step Completed</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-white" />
                          <span>Execute Step</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LIVE EXPERIMENT TELEMETRY TEST CONTROLS */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>BENCH LIVE TELEMETRY</span>
              </span>
              <button
                onClick={() => setIsTestRunning(!isTestRunning)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isTestRunning
                    ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{isTestRunning ? 'STOP' : 'START BENCH'}</span>
              </button>
            </div>

            {/* ESC / Motor PWM Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">PWM Throttle:</span>
                <span className="text-cyan-300 font-bold">{testThrottle}%</span>
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
            </div>

            {/* Servo Angle Slider for EX 2 & 4 */}
            {(selectedExpNo === 2 || selectedExpNo === 4) && (
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Servo Horn Angle:</span>
                  <span className="text-amber-300 font-bold">{activeServoAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={activeServoAngle}
                  onChange={(e) => setActiveServoAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            )}

            {/* Readout Telemetry Gauges */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500">THRUST GAUGED:</div>
                <div className="text-sm font-bold text-cyan-300">{testThrustG} g</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500">OPTICAL TACHOMETER:</div>
                <div className="text-sm font-bold text-emerald-400">{testRPM} RPM</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500">DC CURRENT:</div>
                <div className="text-sm font-bold text-amber-300">{testCurrentA} A</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500">BUS POWER:</div>
                <div className="text-sm font-bold text-purple-300">{testPowerW} W</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
