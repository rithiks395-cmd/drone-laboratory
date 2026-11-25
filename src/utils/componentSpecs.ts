export interface ComponentSpec {
  id: string;
  name: string;
  category: 'Propulsion' | 'Avionics & Sensing' | 'Power' | 'Airframe & Mechanical';
  purpose: string;
  workingPrinciple: string;
  specs: {
    weightGrams: number;
    dimensionsMm: string;
    operatingVoltage: string;
    maxCurrentOrPower: string;
    material: string;
    interfaceProtocol: string;
  };
  wiringPins: string[];
}

export const COMPONENT_SPECS: Record<string, ComponentSpec> = {
  'Brushless DC Motor': {
    id: 'bldc-motor',
    name: 'Brushless DC Motor (2212 920KV Outrunner)',
    category: 'Propulsion',
    purpose: 'Converts three-phase electrical power from the ESC into high-torque rotational mechanical kinetic energy to drive the aerodynamic propeller.',
    workingPrinciple: 'Operates on Lorentz force and electromagnetic induction. Three sets of stator electromagnets are energized in sequence by the ESC, creating a rotating magnetic field that drags the 14 permanent neodymium magnets on the outer rotor bell.',
    specs: {
      weightGrams: 62,
      dimensionsMm: 'Ø 27.7 mm × 26 mm (Shaft: Ø 3.17 mm)',
      operatingVoltage: '7.4 V – 14.8 V (2S – 4S LiPo)',
      maxCurrentOrPower: '18 A Continuous / 240 W Max',
      material: 'CNC 6061-T6 Aluminum Bell, N52 NdFeB Magnets, 0.2mm Japanese Silicon Steel Laminations',
      interfaceProtocol: 'Three-Phase Trapezoidal / FOC AC Sinusoidal PWM',
    },
    wiringPins: [
      'Phase U (Blue Silicone 18AWG) -> ESC Motor Pad A',
      'Phase V (Red Silicone 18AWG) -> ESC Motor Pad B',
      'Phase W (Black Silicone 18AWG) -> ESC Motor Pad C (Swap any two to invert rotation direction)',
    ],
  },

  'Electronic Speed Controller (ESC)': {
    id: 'esc',
    name: 'Electronic Speed Controller (35A BLHeli_32 / DShot1200)',
    category: 'Propulsion',
    purpose: 'Acts as the electronic commutator for the BLDC motor, switching high battery DC current through 6 MOSFETs into 3-phase alternating current timed precisely to rotor position.',
    workingPrinciple: 'Utilizes a 32-bit ARM Cortex microprocessor running BLHeli_32 firmware. Six N-Channel power MOSFETs arranged in a 3-phase bridge invert DC to AC using Back-EMF zero-crossing detection or magnetic sensor commutation.',
    specs: {
      weightGrams: 14,
      dimensionsMm: '31 mm × 15 mm × 5.5 mm',
      operatingVoltage: '11.1 V – 25.2 V (3S – 6S LiPo)',
      maxCurrentOrPower: '35 A Continuous / 45 A Burst (10s)',
      material: '4-Layer 2oz Copper FR4 PCB, Aluminum Extruded Heatsink, Toshiba Low-RDS(on) FETs',
      interfaceProtocol: 'DShot1200, DShot600, ProShot, Multishot, PWM (50-400Hz)',
    },
    wiringPins: [
      'VCC (+) Heavy Red 14AWG -> PDB Battery Terminal Positive (+)',
      'GND (-) Heavy Black 14AWG -> PDB Battery Terminal Negative (-)',
      'Motor Phase A, B, C -> 3x Bullet Wires to Motor Stator Windings',
      'PWM/DShot Signal (White) -> Flight Controller Motor Output Ch 1-4',
      'Signal GND (Black) -> Flight Controller Ground Reference',
    ],
  },

  'Carbon-Fibre Propeller': {
    id: 'propeller',
    name: 'Carbon-Fibre High-Efficiency Propeller (1045 CF)',
    category: 'Propulsion',
    purpose: 'Converts rotational torque into aerodynamic thrust and mass flow acceleration according to Newton\'s third law and Bernoulli\'s equation.',
    workingPrinciple: 'Each blade cross-section is a cambered aerodynamic airfoil (Clark-Y profile). When rotated through air, lower pressure is generated on the curved upper surface relative to the flat lower surface, producing net aerodynamic lift perpendicular to rotation plane.',
    specs: {
      weightGrams: 14.2,
      dimensionsMm: '10 inch (254 mm) Diameter × 4.5 inch (114 mm) Pitch',
      operatingVoltage: 'Mechanical (Rated up to 14,000 RPM)',
      maxCurrentOrPower: 'Up to 1250 g Static Thrust per prop at full throttle',
      material: '100% 3K Carbon Fiber Twill Composite + Solid Core Epoxy Matrix',
      interfaceProtocol: 'Direct Motor Hub Clamping (5mm/6mm Shaft Adapter Bushing)',
    },
    wiringPins: [
      'Central M6 Bullet Flange Clamped with M6 Self-Locking Nut',
      'Matched in CW and CCW Pairs for Net Reactive Torque Cancellation',
    ],
  },

  'LiPo Battery': {
    id: 'lipo-battery',
    name: 'Lithium-Polymer Battery Pack (4S 3300mAh 75C)',
    category: 'Power',
    purpose: 'Stores high-density electrochemical energy and discharges high instantaneous current demanded by the 4 brushless motors during flight maneuvers.',
    workingPrinciple: 'Intercalation and de-intercalation of Lithium ions ($Li^+$) between Lithium Cobalt Oxide ($LiCoO_2$) cathode and graphite anode through a polymer gel electrolyte. Delivers nominal 3.7V/cell with ultra-low internal resistance (< 15 mΩ).',
    specs: {
      weightGrams: 385,
      dimensionsMm: '138 mm × 44 mm × 34 mm',
      operatingVoltage: '14.8 V Nominal (16.8 V Peak Full Charge / 13.2 V Critical Cutoff)',
      maxCurrentOrPower: '75C Continuous (247.5 A) / 150C Peak Burst (495 A)',
      material: 'Aluminum Laminated Pouch Cells with Copper & Nickel Current Collector Tabs',
      interfaceProtocol: 'AMASS XT60 High-Current Discharge + JST-XH 5-Pin Balance Tap',
    },
    wiringPins: [
      'XT60 Gold Bullet Pin 1 (+) -> PDB Main Battery Inflow',
      'XT60 Gold Bullet Pin 2 (-) -> PDB Main Ground Return',
      'JST-XH Pin 1 (Black) -> Ground Baseline (0V)',
      'JST-XH Pin 2 (Blue) -> Cell 1 Tap (3.7V)',
      'JST-XH Pin 3 (Yellow) -> Cell 2 Tap (7.4V)',
      'JST-XH Pin 4 (White) -> Cell 3 Tap (11.1V)',
      'JST-XH Pin 5 (Red) -> Cell 4 Tap (14.8V Total Pack Potential)',
    ],
  },

  'Flight Controller': {
    id: 'flight-controller',
    name: '32-Bit Autopilot Flight Controller (STM32F405 + MPU6000)',
    category: 'Avionics & Sensing',
    purpose: 'Acts as the central nervous system of the UAV, executing 8 kHz PID closed-loop stabilization algorithms to compute real-time motor mixer outputs.',
    workingPrinciple: 'The 6-axis InvenSense MPU6000 MEMS inertial measurement unit samples angular rates (deg/s) and linear accelerations ($m/s^2$) at 1 kHz. The 168MHz ARM Cortex-M4 microcontroller filters sensor noise using a complementary/Mahony filter, computes error against pilot RC commands, and updates 4x ESC DShot signals.',
    specs: {
      weightGrams: 8.5,
      dimensionsMm: '36 mm × 36 mm (30.5 mm M3 Mounting Hole Grid)',
      operatingVoltage: '5.0 V DC (Regulated BEC input)',
      maxCurrentOrPower: '250 mA Current Consumption',
      material: '6-Layer 1oz Copper Immersion Gold (ENIG) FR4 Circuit Board',
      interfaceProtocol: 'UART, I2C, SPI, DShot1200, S.Bus, iBus, CRSF Telemetry',
    },
    wiringPins: [
      'VBAT / 5V -> 5V 2A Regulated BEC Rail',
      'GND -> System Common Ground Plane',
      'M1, M2, M3, M4 -> ESC Signal Inputs 1 through 4',
      'RX UART (S.Bus/iBus) -> RC Receiver Serial Stream',
      'I2C SCL & SDA -> External GPS Magnetometer Compass',
      'USB Type-C -> PC Ground Station Interface (Betaflight / Mission Planner)',
    ],
  },

  'GPS Module': {
    id: 'gps-module',
    name: 'Ublox NEO-M8N GPS & Compass Navigation Mast',
    category: 'Avionics & Sensing',
    purpose: 'Provides global geographical coordinates (latitude, longitude, altitude) and magnetic heading for autonomous loiter, waypoint navigation, and Return-to-Launch (RTL).',
    workingPrinciple: 'Processes 1.575 GHz L1 radio frequency signals transmitted from atomic-clock-synchronized GPS, GLONASS, and Galileo satellite constellations. Triangulates position using Time-of-Arrival (ToA) pseudoranges with < 2.5m accuracy.',
    specs: {
      weightGrams: 28,
      dimensionsMm: 'Ø 54 mm Dome × 14 mm (Mounted on 120 mm Folding Carbon Mast)',
      operatingVoltage: '3.3 V – 5.0 V DC',
      maxCurrentOrPower: '45 mA Tracking Current',
      material: 'High-Dielectric 25x25mm Ceramic Patch Antenna + CNC Alloy Shell',
      interfaceProtocol: 'NMEA / UBX Protocol over UART Serial (38400 baud) + I2C Compass',
    },
    wiringPins: [
      'VCC (Red) -> +5V Regulated Supply',
      'GND (Black) -> Ground Rail',
      'TX (White) -> Flight Controller UART RX Port',
      'RX (Green) -> Flight Controller UART TX Port',
      'SCL (Yellow) -> Compass I2C Clock Line',
      'SDA (Orange) -> Compass I2C Data Line',
    ],
  },

  'Servo Motor': {
    id: 'servo-motor',
    name: '9g Metal Gear Digital Micro Servo (MG90S)',
    category: 'Airframe & Mechanical',
    purpose: 'Actuates aerodynamic control surfaces (ailerons, elevator, rudder) on fixed-wing UAVs or rotates camera gimbal axes.',
    workingPrinciple: 'A small coreless DC motor drives a high-ratio brass/aluminum reduction gear train. An internal potentiometer senses the output shaft angle and compares it to incoming 50Hz PWM pulse widths (1000µs = -45°, 1500µs = 0°, 2000µs = +45°), driving the H-bridge until error is zero.',
    specs: {
      weightGrams: 13.4,
      dimensionsMm: '22.8 mm × 12.2 mm × 28.5 mm',
      operatingVoltage: '4.8 V – 6.0 V DC',
      maxCurrentOrPower: 'Stall Torque: 2.2 kg·cm @ 6.0V; Operating Current: 250 mA',
      material: 'Copper/Aluminum Precision Machine Cut Gear Train, Polycarbonate Case',
      interfaceProtocol: 'Standard Analog/Digital 50 Hz PWM (1000 µs – 2000 µs)',
    },
    wiringPins: [
      'Signal (Orange / White) -> FC Servo Output CH 1-4 or RX PWM Channel',
      'Power VCC (Red) -> 5.0V / 6.0V BEC Rail',
      'Ground GND (Brown / Black) -> System Ground Rail',
    ],
  },

  'Carbon-Fibre Drone Frame': {
    id: 'frame',
    name: 'Quadcopter Carbon-Fibre Modular Frame (F450)',
    category: 'Airframe & Mechanical',
    purpose: 'Provides rigid structural airframe platform maintaining exact motor thrust alignment, housing avionics, and absorbing landing impact forces.',
    workingPrinciple: 'Constructed from aerospace grade 3K 200g/m² twill weave carbon fiber cured under high pressure and temperature. Delivers extremely high stiffness-to-weight ratio with near-zero flex under full motor thrust loads.',
    specs: {
      weightGrams: 280,
      dimensionsMm: '450 mm Motor-to-Motor Diagonal Wheelbase',
      operatingVoltage: 'Passive Structural Airframe',
      maxCurrentOrPower: 'Rated for up to 3.5 kg Maximum All-Up Takeoff Weight',
      material: '1.5mm Upper Plate, 2.0mm Lower PDB Plate, 16mm Carbon Tube Arms, Titanium Screws',
      interfaceProtocol: 'Universal 30.5x30.5mm & 20x20mm Flight Stack Mounting Grid',
    },
    wiringPins: [
      'Internal Integrated Power Distribution Board (PDB) Copper Rails',
      'Positive High-Current Bus Rated for 120A Continuous',
      'Chassis Isolated from Active Electrical Potentials to Prevent RF Noise',
    ],
  },

  'Landing Gear': {
    id: 'landing-gear',
    name: 'High-Clearance Carbon & Aluminum Landing Skids',
    category: 'Airframe & Mechanical',
    purpose: 'Protects the underslung LiPo battery and 4K FPV gimbal payload from ground debris, rocks, and hard touchdown vertical accelerations.',
    workingPrinciple: 'Curved aluminum cantilever struts flex elastically upon touchdown to absorb kinetic descent velocity energy ($E_k = \frac{1}{2} m v^2$), preventing structural shock from cracking carbon frame plates.',
    specs: {
      weightGrams: 48,
      dimensionsMm: 'Height: 140 mm Clearance; Skid Tube Length: 280 mm',
      operatingVoltage: 'Mechanical',
      maxCurrentOrPower: 'Elastic Impact Absorption up to 2.5 m/s Touchdown Velocity',
      material: '6061-T6 Aircraft Aluminum Brackets + Hollow Carbon Skid Pipes + Silicone End Bumpers',
      interfaceProtocol: 'M3 Titanium Machine Screws Bolted to Lower Center Plate',
    },
    wiringPins: [
      'Purely Mechanical Shock Isolation Structure',
    ],
  },

  'Power Distribution Board': {
    id: 'pdb',
    name: 'Power Distribution Board with Dual 5V/12V BEC',
    category: 'Power',
    purpose: 'Routes high discharge current from the battery to 4 ESCs and steps down voltage to 5V and 12V for avionics, cameras, and FPV transmitters.',
    workingPrinciple: 'Features 4-ounce heavy copper ground and power pours capable of continuous 120A throughput without voltage sag. Dual buck switching regulators step 14.8V down to 5.0V with 92% electrical efficiency.',
    specs: {
      weightGrams: 11,
      dimensionsMm: '36 mm × 36 mm (30.5 mm Mounting)',
      operatingVoltage: '7.4 V – 25.2 V (2S – 6S Input)',
      maxCurrentOrPower: '120 A Continuous Total; 5V 2A BEC; 12V 1.5A BEC',
      material: '4-Layer 4oz Copper Heavy FR4 Solder Mask with Hall Effect Current Sensor',
      interfaceProtocol: 'High-Current Solder Tabs + Analog Current Sensor Out (0-3.3V)',
    },
    wiringPins: [
      'Main Battery Inflow XT60 Pads (+ and -)',
      '4x Pairs of ESC Power Outflow Pads (+ and -)',
      '5V Regulated Clean Bus -> Flight Controller & GPS',
      '12V Regulated Clean Bus -> FPV Camera & Video Transmitter',
      'CURR Shunt Output -> Flight Controller Current ADC Sensor Pin',
    ],
  },
};
