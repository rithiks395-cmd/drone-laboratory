# UAV VIRTUAL LAB – Advanced 3D Drone Engineering Simulator

**Drone Engineering, Assembly, Testing & Flight Simulation Platform**

A complete, professional aerospace engineering virtual laboratory web application developed for university and college UAV engineering curricula. The platform allows students to conduct all 10 standard syllabus experiments through interactive 3D simulations, real-time mathematical calculations, virtual component assembly, and automated lab record generation—without requiring physical drone hardware.

---

## ☀️ Daytime Airfield & Night Aerospace Atmosphere Modes

- **Daytime Airfield Sky**: Realistic daylight sky dome, physical sun elevation, warm sunlight shading, grass airfield ground turf, and paved asphalt runway strip with centerline markings.
- **Night Aerospace HUD Mode**: Deep navy graphite background with cyan laser grids, starfield, and glowing telemetry instrumentation.
- **One-Click Atmosphere Switcher**: Switch between Day and Night anytime using the Sun/Moon icon on the top navigation bar.

---

## 📱 Mobile-First 3D Simulation & Touch Controls

- **Fully Responsive**: Optimized for Android smartphones, iPhones, iPad/Android tablets, Windows laptops, and large desktop screens.
- **Multi-Touch Gestures**:
  - One-finger drag to rotate 3D UAVs.
  - Two-finger pinch to zoom in/out.
  - Two-finger drag to pan across the workspace.
  - Tap component to highlight and open the 3D Micro-Inspector.
  - `touch-action: none` prevents unwanted browser page pull-down and scroll interference during 3D interactions.
- **Touchscreen Dual Joysticks**:
  - **Left Virtual Joystick**: Throttle (climb/descent) and Yaw rotation.
  - **Right Virtual Joystick**: Cyclic pitch (forward/back) and roll (banking).
  - Integrated into Experiment 4 (RC Control & Trimming) and the 3D Flight Simulator.
- **Collapsible Mobile Drawer**: Slide-over navigation menu for mobile devices, automatically closing upon selecting an experiment to keep the 3D viewport maximized.
- **Installable Progressive Web App (PWA)**:
  - Web App Manifest (`manifest.json`)
  - Service Worker (`sw.js`) with offline caching
  - Add-to-Home-Screen prompt for standalone fullscreen app experience on Android and iOS.

---

## 🔬 All 10 Interactive Syllabus Experiments

1. **EXP 01: Payload and Weight Estimation of UAV**
   - Interactive weight matrix: frame, 4x motors, 4x ESCs, 4x props, LiPo battery, avionics, gimbal, and mission payload.
   - Calculates Empty Weight ($W_e$), Maximum Takeoff Weight (MTOW), Payload Ratio, and Thrust-to-Weight Ratio ($TWR \ge 2.0$).
   - Dynamic Recharts donut weight breakdown and bar chart comparisons.

2. **EXP 02: Fixed-Wing UAV Frame & Avionics Assembly**
   - 3D airframe assembly: Fuselage, wings, horizontal stabilizer, vertical fin, motor, propeller, ESC, servos, and battery.
   - 0% to 100% interactive exploded view slider, component connection info, and assembly completion report.

3. **EXP 03: Motor Thrust Calibration with ESCs & Propellers**
   - Virtual dynamometer load cell bench with rotating motor bell and speed blur.
   - Variable motor KV (2205 to 4114), ESC ratings (20A to 60A), prop diameter (5"–15"), pitch, and LiPo voltages (2S–6S).
   - Real-time Momentum Theory calculation: loaded RPM, static thrust ($g$ and $N$), power ($W$), current ($A$), and efficiency ($g/W$).
   - Dynamic Thrust vs. Throttle and Current vs. Throttle performance curves with ESC over-current warning.

4. **EXP 04: UAV Control Testing and Trimming Procedure**
   - Virtual Mode 2 RC Transmitter with interactive touchscreen dual joysticks responding to touch, mouse drag, and keyboard (`W/A/S/D` and `Arrow Keys`).
   - Kinematic 3D deflection of ailerons ($\pm 20^\circ$), elevator ($\pm 25^\circ$), and rudder surfaces.
   - Digital sub-trim offsets and 50Hz PWM pulse monitor (1000 µs – 2000 µs).

5. **EXP 05: LiPo Battery Testing, Balancing & Maintenance**
   - Multi-cell configurations (2S, 3S, 4S, 6S) with individual cell voltage monitoring down to $\pm 1\text{ mV}$.
   - Simulated CC/CV balance charging with active shunting bleed resistors.
   - Flight load discharge simulation, internal resistance (IR) in $m\Omega$, and thermal/low-voltage alarms.

6. **EXP 06: RC Transmitter Calibration & Frequency Binding**
   - Step-by-step interactive wizard:
     1. Factory System Reset
     2. 4-Axis Stick Gimbal Potentiometer Calibration (circular sweep)
     3. Channel Endpoint Alignment (1000 µs – 1500 µs – 2000 µs)
     4. 2.4GHz AFHDS-2A / FHSS Frequency Binding with LED handshake simulation.

7. **EXP 07: Propeller Balancing Procedure**
   - 3D magnetic suspension balancer stand with precision ground arbor and spirit level.
   - 2-blade and 3-blade propellers with simulated static mass imbalance (heavy blade tilts downward under gravity).
   - Apply virtual balancing tape/clips to achieve horizontal equilibrium.
   - High-speed spin vibration test with live accelerometer waveform and RMS vibration reduction.

8. **EXP 08: Fixed-Wing UAV Centre of Gravity (CG) Calculation & Balancing**
   - Longitudinal moment balance from datum (Nose $X = 0\text{ mm}$): $X_{CG} = \frac{\sum W_i \cdot X_i}{\sum W_i}$.
   - Mean Aerodynamic Chord (MAC) calculation for tapered wings.
   - Slidable battery position shifts 3D CG marker dynamically into the safe $25\% - 30\%$ MAC pitch stability window.

9. **EXP 09: Quadcopter-X Base and Avionics Assembly**
   - 3K Carbon-fibre F450 X-frame with 4 arms, PDB, 4 brushless motors, 4 ESCs, propellers, flight controller, and elevated GPS mast.
   - Counter-rotational motor layout verification (M1: Rear-Right CCW, M2: Front-Right CW, M3: Rear-Left CW, M4: Front-Left CCW).
   - Continuous exploded view inspection and pre-flight airworthiness checklist.

10. **EXP 10: KK 2.1.5 Flight Controller Programming & Calibration**
    - Detailed 3D model of the KK 2.1.5 board with on-board monochrome graphic LCD and 4 tactile pushbuttons (`BACK`, `DOWN`, `UP`, `ENTER`).
    - Menu-driven simulation: Sensor Test, 6-Axis Accelerometer Zero Calibration, ESC Throttle Pass-Through Calibration, PI Gain Tuning, and Receiver Input Monitoring.

---

## 🎮 3D Flight Simulator

- **Multi-Camera Modes**:
  - `CHASE`: Smooth third-person chase camera following behind drone.
  - `FPV`: First-person view from drone nose camera.
  - `ORBIT`: 360° free orbit camera.
- **Controls**: Touchscreen virtual joysticks (on Android/iPhone/iPad) + Keyboard (`W/S`, `A/D`, `Q/E`, `Space`, `Shift`) + Mouse.
- **HUD Instruments**: Artificial horizon, pitch ladder, compass heading, barometric altitude, airspeed, flight timer, and battery SoC.

---

## 💻 Running Locally

1. Open PowerShell or Command Prompt:
   ```powershell
   cd C:\Users\ELCOT\Documents\drone-laboratory
   ```
2. Start the local development server:
   ```powershell
   npm run dev
   ```
3. Open in your browser (laptop or phone on the same Wi-Fi):
   ```
   http://localhost:5173
   ```
