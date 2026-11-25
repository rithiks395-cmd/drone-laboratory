import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { KK215BoardModel } from '../3d-models/KK215BoardModel';
import { Save, Cpu, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Exp10KK215Programming: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Menu navigation state
  // Menus:
  // 0: MAIN_STATUS
  // 1: MENU_LIST
  // 2: PI_EDITOR
  // 3: RECEIVER_TEST
  // 4: ACC_CALIBRATION
  // 5: MOTOR_LAYOUT
  // 6: ESC_CALIBRATION
  const [currentMenu, setCurrentMenu] = useState<number>(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState<number>(0);
  const [activeBtn, setActiveBtn] = useState<number>(-1);

  // PI Settings
  const [rollPitchP, setRollPitchP] = useState(50);
  const [rollPitchI, setRollPitchI] = useState(25);
  const [yawP, setYawP] = useState(50);
  const [yawI, setYawI] = useState(25);

  // Calibration status
  const [accCalibrated, setAccCalibrated] = useState(false);
  const [escCalibrated, setEscCalibrated] = useState(false);
  const [selfLevelOn, setSelfLevelOn] = useState(true);

  const menuItems = [
    '1. PI Editor',
    '2. Receiver Test',
    '3. Mode Settings',
    '4. Stick Scaling',
    '5. ACC Calibration',
    '6. Motor Layout',
    '7. ESC Calibration',
  ];

  const handleButton = (btnIdx: number) => {
    setActiveBtn(btnIdx);
    setTimeout(() => setActiveBtn(-1), 150);

    // btnIdx: 0: BACK, 1: DOWN, 2: UP, 3: ENTER
    if (currentMenu === 0) {
      // From main screen, ENTER opens menu
      if (btnIdx === 3) setCurrentMenu(1);
    } else if (currentMenu === 1) {
      if (btnIdx === 0) setCurrentMenu(0); // BACK to main
      if (btnIdx === 1) setSelectedMenuItem((p) => (p + 1) % menuItems.length); // DOWN
      if (btnIdx === 2) setSelectedMenuItem((p) => (p - 1 + menuItems.length) % menuItems.length); // UP
      if (btnIdx === 3) {
        // ENTER opens selected menu
        if (selectedMenuItem === 0) setCurrentMenu(2); // PI Editor
        if (selectedMenuItem === 1) setCurrentMenu(3); // Receiver Test
        if (selectedMenuItem === 4) setCurrentMenu(4); // ACC Calibration
        if (selectedMenuItem === 5) setCurrentMenu(5); // Motor Layout
        if (selectedMenuItem === 6) setCurrentMenu(6); // ESC Calibration
      }
    } else {
      // In submenus, BACK returns to menu list
      if (btnIdx === 0) setCurrentMenu(1);
      if (currentMenu === 4 && btnIdx === 3) {
        // Run ACC Cal
        setAccCalibrated(true);
      }
      if (currentMenu === 6 && btnIdx === 3) {
        // Run ESC Cal
        setEscCalibrated(true);
      }
    }
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 10,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        firmwarePlatform: 'KK 2.1.5 Multi-Rotor Control Board',
        imuSensor: 'InvenSense MPU6050 (6-Axis Gyro/Accel)',
        accCalibrationStatus: accCalibrated ? 'Calibrated (Level Datum 0,0,1g)' : 'Factory Default',
        escCalibrationStatus: escCalibrated ? 'Throttle Pass-through Calibrated' : 'Pending',
        rollPitchPgains: `P:${rollPitchP}, I:${rollPitchI}`,
        yawPgains: `P:${yawP}, I:${yawI}`,
        selfLevelState: selfLevelOn ? 'Active (Auto-Leveling)' : 'Acro / Rate Mode',
      },
      calculations: {
        loopRefreshRate: '400 Hz High-Speed PWM ESC Output',
        imuSamplingFrequency: '1 kHz I2C Bus',
        neutralPwmDeadband: '5 µs Deadband',
      },
      resultSummary: 'KK 2.1.5 Flight controller programmed and calibrated. 6-axis accelerometer leveled, PI closed-loop gains tuned, and motor layout verified for Quadcopter-X flight stability.',
    });
    alert('KK 2.1.5 Configuration Report saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 10
          </span>
          <h2 className="text-lg font-bold text-white">KK 2.1.5 Flight Controller Programming</h2>
          <p className="text-xs text-slate-400">
            Navigate authentic 128x64 LCD menus, calibrate 6-axis IMU sensors, tune PI loop gains, and execute ESC endpoint calibration.
          </p>
        </div>

        <button
          onClick={handleSaveToRecord}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-cyan"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save to Lab Record</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left 3D Board Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="h-[400px] w-full relative">
            <Scene3D cameraPosition={[0, 2.5, 2.2]}>
              <KK215BoardModel
                scale={1.4}
                activeButtonIndex={activeBtn}
                onButtonClick={handleButton}
              />
            </Scene3D>

            {/* Board Spec Callout */}
            <div className="absolute top-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-3 text-xs font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 text-[10px] block">FLIGHT CONTROLLER</span>
                <span className="text-cyan-300 font-bold">KK 2.1.5 (Atmega644PA)</span>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-cyan-400/80 bg-slate-900/80 px-2 py-1 rounded">
              CLICK 3D BUTTONS OR USE CONTROLS ON RIGHT
            </div>
          </div>
        </div>

        {/* Right Authentic 128x64 LCD Display & Keypad Emulator (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* LCD Casing Screen (Authentic Cyan-Blue Dot-Matrix Graphic UI) */}
          <div className="p-5 rounded-2xl bg-[#09152a] border-4 border-[#1e293b] shadow-2xl flex flex-col min-h-[280px]">
            {/* Screen Header */}
            <div className="border-b border-cyan-500/40 pb-1.5 mb-2 flex justify-between items-center text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <span>KK 2.1.5 PRO FC</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {selfLevelOn ? '[SELF-LEVEL ON]' : '[ACRO MODE]'}
              </span>
            </div>

            {/* Screen Body */}
            <div className="flex-1 font-mono text-cyan-200 text-xs space-y-1.5 overflow-hidden">
              {currentMenu === 0 && (
                <div className="space-y-2 py-2">
                  <div className="text-center font-bold text-sm text-cyan-100 tracking-wider">
                    SAFE (DISARMED)
                  </div>
                  <div className="text-[11px] text-cyan-400 space-y-1">
                    <div className="flex justify-between">
                      <span>BATTERY:</span> <span>11.4 V (OK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ACC STATUS:</span>{' '}
                      <span className={accCalibrated ? 'text-emerald-400' : 'text-amber-400'}>
                        {accCalibrated ? 'CALIBRATED' : 'NOT CAL'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESC STATUS:</span>{' '}
                      <span className={escCalibrated ? 'text-emerald-400' : 'text-amber-400'}>
                        {escCalibrated ? 'CALIBRATED' : 'DEFAULT'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MODE:</span> <span>QUADCOPTER X</span>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-cyan-400/80 pt-2 animate-pulse">
                    PRESS ENTER FOR MENU
                  </div>
                </div>
              )}

              {currentMenu === 1 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-white mb-1 border-b border-cyan-800">
                    MAIN MENU:
                  </div>
                  {menuItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-1 py-0.5 rounded text-[11px] ${
                        selectedMenuItem === idx ? 'bg-cyan-500 text-slate-950 font-bold' : ''
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {currentMenu === 2 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-white mb-1">PI GAIN EDITOR:</div>
                  <div className="flex justify-between text-[11px]">
                    <span>Roll/Pitch P-Gain:</span> <span>{rollPitchP}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Roll/Pitch I-Gain:</span> <span>{rollPitchI}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Yaw P-Gain:</span> <span>{yawP}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Yaw I-Gain:</span> <span>{yawI}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 pt-2">TUNED FOR STABLE HOVER</div>
                </div>
              )}

              {currentMenu === 3 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-white mb-1">RECEIVER TEST:</div>
                  <div className="flex justify-between text-[11px]">
                    <span>Aileron (CH1):</span> <span className="text-emerald-400">0 (OK)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Elevator (CH2):</span> <span className="text-emerald-400">0 (OK)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Throttle (CH3):</span> <span>0 (IDLE)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Rudder (CH4):</span> <span className="text-emerald-400">0 (OK)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Auxiliary (CH5):</span> <span>100 (ARMED)</span>
                  </div>
                </div>
              )}

              {currentMenu === 4 && (
                <div className="space-y-2 py-2">
                  <div className="text-[11px] font-bold text-white mb-1">ACCELEROMETER CALIBRATION:</div>
                  <p className="text-[10px] text-cyan-300">
                    Place multi-rotor level. Press ENTER to sample zero-G offsets.
                  </p>
                  <div className="p-2 bg-slate-900/60 rounded text-[10px] space-y-1">
                    <div>X-Axis: {accCalibrated ? '0.00 G (Calibrated)' : '0.04 G'}</div>
                    <div>Y-Axis: {accCalibrated ? '0.00 G (Calibrated)' : '-0.06 G'}</div>
                    <div>Z-Axis: {accCalibrated ? '1.00 G (Standard)' : '0.98 G'}</div>
                  </div>
                  {accCalibrated && (
                    <div className="text-emerald-400 font-bold text-xs">CALIBRATION SUCCESSFUL!</div>
                  )}
                </div>
              )}

              {currentMenu === 5 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-white mb-1">MOTOR LAYOUT: QUADCOPTER X</div>
                  <div className="text-[10px] space-y-0.5">
                    <div>M1: Rear-Right (CCW) - ESC CH1</div>
                    <div>M2: Front-Right (CW) - ESC CH2</div>
                    <div>M3: Rear-Left (CW) - ESC CH3</div>
                    <div>M4: Front-Left (CCW) - ESC CH4</div>
                  </div>
                  <div className="text-[10px] text-cyan-400 pt-1">CORRECT MOTOR DIRECTION CONFIRMED</div>
                </div>
              )}

              {currentMenu === 6 && (
                <div className="space-y-2 py-1">
                  <div className="text-[11px] font-bold text-white mb-1">ESC THROTTLE CALIBRATION:</div>
                  <p className="text-[10px] text-cyan-300">
                    Passes full throttle through to all 4 ESCs simultaneously to sync high/low endpoints.
                  </p>
                  <div className="text-[10px] font-bold text-emerald-400">
                    {escCalibrated ? 'ESC RANGE CALIBRATED (1000 - 2000 µs)' : 'PRESS ENTER TO RUN ESC CALIBRATION'}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated 4 Buttons Bar at bottom of LCD */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-cyan-800">
              {['BACK', 'DOWN', 'UP', 'ENTER'].map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleButton(i)}
                  className={`py-2 text-center rounded text-xs font-mono font-bold transition-all ${
                    activeBtn === i
                      ? 'bg-cyan-400 text-slate-950 scale-95'
                      : 'bg-[#14233c] hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick PI Adjustment Sliders */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase flex items-center justify-between">
              <span>PID TUNING SHORTCUTS</span>
              <button
                onClick={() => setSelfLevelOn(!selfLevelOn)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  selfLevelOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SELF-LEVEL: {selfLevelOn ? 'ON' : 'OFF'}
              </button>
            </h4>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Roll / Pitch P-Gain</span>
                <span className="font-mono text-cyan-400">{rollPitchP}</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={rollPitchP}
                onChange={(e) => setRollPitchP(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Roll / Pitch I-Gain</span>
                <span className="font-mono text-cyan-400">{rollPitchI}</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={rollPitchI}
                onChange={(e) => setRollPitchI(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
