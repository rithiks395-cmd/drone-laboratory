# UAV VIRTUAL LAB – 100% OFFLINE LABORATORY USAGE GUIDE

**Yes, the UAV Virtual Lab is 100% capable of working completely offline with zero internet access!**

This platform was specifically engineered for college laboratories, remote workstations, and academic environments that have restricted or no external internet connections.

---

## 🛠️ THREE WAYS TO RUN THE LAB OFFLINE

### METHOD 1: Progressive Web App (PWA) Offline Caching (Easiest for Laptops & Mobiles)

When anyone visits the site even once (online or via local hotspot):

1. **Install the App in Browser:**
   - In Google Chrome, Microsoft Edge, or Android Chrome, click the **"Install App"** icon in the address bar (or menu `⋮ > Add to Home screen / Install UAV Virtual Lab`).
2. **Offline Service Worker Caching:**
   - The built-in Service Worker automatically caches all 3D geometries, scripts, styles, textures, and calculators into the browser's persistent cache.
3. **Use with ZERO Internet:**
   - Turn off Wi-Fi or turn on Airplane Mode.
   - Open the app icon or navigate to the URL — **the entire 3D laboratory, all 10 experiments, calculators, and flight simulator run instantly from local cache!**
   - All student measurements, lab calculations, observation tables, and scores are automatically saved in local browser storage (`localStorage`).

---

### METHOD 2: Double-Click Windows Batch Launcher (`START_OFFLINE_LAB.bat`)

For college laboratory computers with Windows:

1. Copy the `drone-laboratory` folder to a USB Pendrive or the college lab computers.
2. Inside the folder, simply **double-click** the file:
   ```
   START_OFFLINE_LAB.bat
   ```
3. A clean local offline server starts automatically and opens your default browser (Chrome/Edge) to `http://localhost:4173`.
4. **No internet, no cloud login, and no external APIs are required.**

---

### METHOD 3: USB Drive Standalone Distribution (For Lab Administrators)

If college computers have no Node.js or internet at all:

1. Copy the compiled **`dist`** folder onto a USB pendrive.
2. In Windows, students can run any local static file server (such as Python's built-in `python -m http.server 8000` inside `dist/`), or install a lightweight local utility.
3. Every experiment (Fixed-wing, Quadcopter-X, BLDC thrust calibration, KK2.1.5 board programming, LiPo testing, Propeller balancing, CG calculations) executes client-side using WebGL/Three.js!

---

## 📋 WHY THIS LAB WORKS 100% OFFLINE

- **Procedural 3D Geometry:** All 3D drone components (motors, ESCs, frames, LiPo batteries, carbon propellers, wings) are generated mathematically inside the Three.js canvas — no large external 3D asset downloads required.
- **Embedded Aerodynamics Engine:** All physical equations (thrust coefficients, lift/drag ratios, center of gravity, battery discharge curves) execute in pure JavaScript.
- **Local Record Storage:** Student names, roll numbers, experiment completion timestamps, and observations persist across browser restarts in browser `localStorage`.
- **Offline Report & Screenshot Generation:** The built-in html2canvas generator captures lab record screenshots directly from the local browser DOM without external servers.

---

## ⚖️ COPYRIGHT NOTICE

```
© 2026 UAV VIRTUAL LAB. ALL RIGHTS RESERVED.
Department of Aeronautical & Aerospace Engineering
Autonomous Systems & Drone Technology Laboratory
Designed for Academic & Research Simulation
```
