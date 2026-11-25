import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { FixedWingModel } from '../3d-models/FixedWingModel';
import { VirtualJoystick } from '../common/VirtualJoystick';
import { Save, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const Exp4ControlSurfaces: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Stick positions: -1.0 to +1.0
  const [leftStick, setLeftStick] = useState({ x: 0, y: -0.5 }); // Yaw, Throttle
  const [rightStick, setRightStick] = useState({ x: 0, y: 0 }); // Roll (Aileron), Pitch (Elevator)

  // Digital Trims (-50 to +50 clicks)
  const [trimElevator, setTrimElevator] = useState(12); // Simulated aerodynamic offset
  const [trimAileron, setTrimAileron] = useState(-8);
  const [trimRudder, setTrimRudder] = useState(0);

  // Keyboard controls for transmitter gimbals fallback on laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.2;
      switch (e.key) {
        case 'ArrowUp':
          setRightStick((prev) => ({ ...prev, y: Math.min(1, prev.y + step) }));
          break;
        case 'ArrowDown':
          setRightStick((prev) => ({ ...prev, y: Math.max(-1, prev.y - step) }));
          break;
        case 'ArrowLeft':
          setRightStick((prev) => ({ ...prev, x: Math.max(-1, prev.x - step) }));
          break;
        case 'ArrowRight':
          setRightStick((prev) => ({ ...prev, x: Math.min(1, prev.x + step) }));
          break;
        case 'w':
        case 'W':
          setLeftStick((prev) => ({ ...prev, y: Math.min(1, prev.y + step) }));
          break;
        case 's':
        case 'S':
          setLeftStick((prev) => ({ ...prev, y: Math.max(-1, prev.y - step) }));
          break;
        case 'a':
        case 'A':
          setLeftStick((prev) => ({ ...prev, x: Math.max(-1, prev.x - step) }));
          break;
        case 'd':
        case 'D':
          setLeftStick((prev) => ({ ...prev, x: Math.min(1, prev.x + step) }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Net Control Surface Angles including trim (Radians)
  const netAileron = rightStick.x * 0.35 + (trimAileron / 50) * 0.15;
  const netElevator = -rightStick.y * 0.35 + (trimElevator / 50) * 0.15;
  const netRudder = leftStick.x * 0.35 + (trimRudder / 50) * 0.15;

  // Compute PWM values in microseconds (1000 - 2000 µs)
  const pwmAileron = Math.round(1500 + netAileron * 1400);
  const pwmElevator = Math.round(1500 - netElevator * 1400);
  const pwmThrottle = Math.round(1000 + ((leftStick.y + 1) / 2) * 1000);
  const pwmRudder = Math.round(1500 + netRudder * 1400);

  const isNeutralTrimmed = Math.abs(trimAileron) <= 1 && Math.abs(trimElevator) <= 1;

  const handleCenterSticks = () => {
    setLeftStick({ x: 0, y: -0.5 });
    setRightStick({ x: 0, y: 0 });
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 4,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        ch1AileronPwm: `${pwmAileron} µs`,
        ch2ElevatorPwm: `${pwmElevator} µs`,
        ch3ThrottlePwm: `${pwmThrottle} µs`,
        ch4RudderPwm: `${pwmRudder} µs`,
        aileronTrimOffset: trimAileron,
        elevatorTrimOffset: trimElevator,
        neutralCalibrationState: isNeutralTrimmed ? 'Neutral Balanced' : 'Off-Center',
      },
      calculations: {
        aileronAngularDeflection: `${Math.round((netAileron * 180) / Math.PI)} deg`,
        elevatorAngularDeflection: `${Math.round((netElevator * 180) / Math.PI)} deg`,
        rudderAngularDeflection: `${Math.round((netRudder * 180) / Math.PI)} deg`,
      },
      resultSummary: 'Transmitter control surface response and trimming procedures verified in 3D. Control horn deflections matched PWM commands with zero mechanical slop.',
    });
    alert('Control Surface & Trimming Data saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 04
          </span>
          <h2 className="text-lg font-bold text-white">UAV Control Testing & Trimming Laboratory</h2>
          <p className="text-xs text-slate-400">
            Manipulate virtual transmitter touch joysticks, observe control surface deflections in 3D, and calibrate digital sub-trims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterSticks}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Center Sticks</span>
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
        {/* Left 3D Aircraft Model Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[380px] w-full relative">
            <Scene3D cameraPosition={[3, 2, 2.5]} fov={45}>
              <FixedWingModel
                scale={1.3}
                aileronAngle={netAileron}
                elevatorAngle={netElevator}
                rudderAngle={netRudder}
                spinning={leftStick.y > -0.6}
                throttle={(leftStick.y + 1) * 45}
              />
            </Scene3D>

            {/* Surface Angles HUD Indicator */}
            <div className="absolute top-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">AILERON</span>
                <span className="text-cyan-300 font-bold">
                  {Math.round((netAileron * 180) / Math.PI)}°
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ELEVATOR</span>
                <span className="text-cyan-300 font-bold">
                  {Math.round((netElevator * 180) / Math.PI)}°
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">RUDDER</span>
                <span className="text-cyan-300 font-bold">
                  {Math.round((netRudder * 180) / Math.PI)}°
                </span>
              </div>
            </div>

            {/* Hint */}
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyan-400/80 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 hidden sm:block">
              TOUCH JOYSTICKS ON RIGHT OR KEYBOARD W/A/S/D & ARROW KEYS
            </div>
          </div>

          {/* Oscilloscope PWM Channel Readout Table */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-3 uppercase">
              50Hz PWM CHANNEL PULSE MONITOR (1000 - 2000 µs)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CH1: AILERON</span>
                <span className="text-sm font-bold text-cyan-300">{pwmAileron} µs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CH2: ELEVATOR</span>
                <span className="text-sm font-bold text-cyan-300">{pwmElevator} µs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CH3: THROTTLE</span>
                <span className="text-sm font-bold text-amber-400">{pwmThrottle} µs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CH4: RUDDER</span>
                <span className="text-sm font-bold text-cyan-300">{pwmRudder} µs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Touchscreen Gimbals & Trimming Dashboard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Dual Touchscreen Gimbals */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-4">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase flex items-center justify-between">
              <span>TOUCHSCREEN RC TRANSMITTER</span>
              <span className="text-[10px] text-emerald-400">2.4 GHz LINK ACTIVE</span>
            </h4>

            {/* Interactive Touch Joysticks */}
            <div className="flex items-center justify-around gap-2 pt-1">
              <VirtualJoystick
                label="THROTTLE / YAW"
                subLabel="LEFT"
                size={120}
                springReturnY={false}
                initialY={leftStick.y}
                onChange={(pos) => setLeftStick(pos)}
              />
              <VirtualJoystick
                label="PITCH / ROLL"
                subLabel="RIGHT"
                size={120}
                springReturnY={true}
                onChange={(pos) => setRightStick(pos)}
              />
            </div>
          </div>

          {/* Digital Sub-Trim Adjustments */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase flex items-center justify-between">
              <span>DIGITAL SUB-TRIM CALIBRATION</span>
              <span className={`text-[10px] font-mono ${isNeutralTrimmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isNeutralTrimmed ? 'NEUTRAL ALIGNED' : 'TRIM REQUIRED'}
              </span>
            </h4>

            {/* Elevator Trim */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Elevator Sub-Trim</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTrimElevator((t) => Math.max(-50, t - 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono text-cyan-400 font-bold">
                  {trimElevator > 0 ? `+${trimElevator}` : trimElevator}
                </span>
                <button
                  onClick={() => setTrimElevator((t) => Math.min(50, t + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  +
                </button>
              </div>
            </div>

            {/* Aileron Trim */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Aileron Sub-Trim</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTrimAileron((t) => Math.max(-50, t - 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono text-cyan-400 font-bold">
                  {trimAileron > 0 ? `+${trimAileron}` : trimAileron}
                </span>
                <button
                  onClick={() => setTrimAileron((t) => Math.min(50, t + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rudder Trim */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Rudder Sub-Trim</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTrimRudder((t) => Math.max(-50, t - 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono text-cyan-400 font-bold">
                  {trimRudder > 0 ? `+${trimRudder}` : trimRudder}
                </span>
                <button
                  onClick={() => setTrimRudder((t) => Math.min(50, t + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setTrimElevator(0);
                setTrimAileron(0);
                setTrimRudder(0);
              }}
              className="w-full mt-2 py-1.5 text-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono"
            >
              Reset All Trims to 0
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
