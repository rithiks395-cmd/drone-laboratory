import React, { useState, useMemo } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { BLDCMotorModel } from '../3d-models/BLDCMotorModel';
import { PropellerModel } from '../3d-models/PropellerModel';
import { ESCModel } from '../3d-models/ESCModel';
import { calculatePropulsionMetrics } from '../../utils/aerodynamics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Save, AlertTriangle, Gauge, Zap, Flame, RotateCcw } from 'lucide-react';

export const Exp3ThrustCalibration: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Selected parameters
  const [motorKv, setMotorKv] = useState(920); // 920 KV (2212)
  const [escMaxAmps, setEscMaxAmps] = useState(30); // 30A ESC
  const [propDiameter, setPropDiameter] = useState(10); // 10 inch
  const [propPitch, setPropPitch] = useState(4.5); // 4.5 inch
  const [propBlades, setPropBlades] = useState<2 | 3>(2);
  const [batteryVoltage, setBatteryVoltage] = useState(11.1); // 3S LiPo (11.1V)
  const [throttle, setThrottle] = useState(50); // 0 - 100%

  // Real-time calculated metrics
  const metrics = useMemo(() => {
    return calculatePropulsionMetrics(
      motorKv,
      batteryVoltage,
      propDiameter,
      propPitch,
      throttle,
      propBlades
    );
  }, [motorKv, batteryVoltage, propDiameter, propPitch, throttle, propBlades]);

  // Generate sweep curve for graphs (0% to 100% in 10% steps)
  const sweepData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 100; t += 10) {
      const m = calculatePropulsionMetrics(
        motorKv,
        batteryVoltage,
        propDiameter,
        propPitch,
        t,
        propBlades
      );
      data.push({
        throttle: `${t}%`,
        thrust: m.thrustGrams,
        current: m.currentAmps,
        power: m.powerWatts,
        rpm: m.rpm,
      });
    }
    return data;
  }, [motorKv, batteryVoltage, propDiameter, propPitch, propBlades]);

  const isOverCurrent = metrics.currentAmps > escMaxAmps;

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 3,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        motorKvRating: `${motorKv} KV`,
        escRating: `${escMaxAmps} A`,
        propellerGeometry: `${propDiameter}x${propPitch} (${propBlades}-blade)`,
        testVoltage: `${batteryVoltage} V`,
        testThrottle: `${throttle} %`,
        measuredRpm: metrics.rpm,
        estimatedThrustGrams: metrics.thrustGrams,
        currentDrawAmps: metrics.currentAmps,
        powerWatts: metrics.powerWatts,
        efficiencyGpW: metrics.efficiencyGpW,
      },
      calculations: {
        aerodynamicThrustNewtons: `${metrics.thrustNewtons} N`,
        pitchSpeedKmh: `${metrics.pitchSpeedKmh} km/h`,
        escHeadroomAmps: `${Math.round((escMaxAmps - metrics.currentAmps) * 10) / 10} A`,
      },
      resultSummary: `Brushless motor dynamic thrust test completed. At ${throttle}% throttle, thrust was ${metrics.thrustGrams}g consuming ${metrics.powerWatts}W at ${metrics.efficiencyGpW} g/W efficiency.`,
    });
    alert('Thrust Calibration Data saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 03
          </span>
          <h2 className="text-lg font-bold text-white">Motor Thrust Calibration Laboratory</h2>
          <p className="text-xs text-slate-400">
            Calibrate static thrust, RPM, current draw and efficiency across variable ESCs and propeller sizes.
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
        {/* Left 3D Dynamometer Stand (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[360px] w-full relative">
            <Scene3D cameraPosition={[1.8, 1.8, 1.8]}>
              {/* Test Bench Base & Load Cell */}
              <group position={[0, -0.4, 0]}>
                <mesh position={[0, -0.1, 0]}>
                  <boxGeometry args={[1.6, 0.2, 1.2]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Aluminum Test Stand Column */}
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.08, 0.12, 0.7, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
              </group>

              {/* Mounted Motor, Propeller, and ESC */}
              <group position={[0, 0.3, 0]}>
                <BLDCMotorModel
                  scale={1.2}
                  spinning={throttle > 0}
                  rpm={metrics.rpm}
                  highlighted={isOverCurrent}
                />
                <PropellerModel
                  position={[0, 0.6, 0]}
                  scale={1.0}
                  diameterInches={propDiameter}
                  pitchInches={propPitch}
                  blades={propBlades}
                  spinning={throttle > 0}
                  rpm={metrics.rpm}
                  color="#00f0ff"
                />
                {/* ESC mounted on stand column */}
                <group position={[0, -0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <ESCModel scale={0.7} ampRating={escMaxAmps} />
                </group>
              </group>
            </Scene3D>

            {/* Over-Current Thermal Warning Overlay */}
            {isOverCurrent && (
              <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-500/80 rounded-xl p-3 flex items-center gap-2 text-rose-200 text-xs shadow-2xl animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  <strong>WARNING: ESC OVERLOAD!</strong> Current draw ({metrics.currentAmps}A) exceeds continuous rating ({escMaxAmps}A). Risk of thermal runaway!
                </span>
              </div>
            )}

            {/* Real-Time Optical Telemetry Overlay */}
            <div className="absolute bottom-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">LOADED RPM</span>
                <span className="text-cyan-300 font-bold text-sm">{metrics.rpm}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">THRUST</span>
                <span className="text-emerald-400 font-bold text-sm">{metrics.thrustGrams} g</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">POWER</span>
                <span className="text-amber-400 font-bold text-sm">{metrics.powerWatts} W</span>
              </div>
            </div>
          </div>

          {/* Performance Curves (Thrust vs Throttle & Current vs Throttle) */}
          <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex flex-col h-56">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                PERFORMANCE CURVES: THRUST (g) & CURRENT (A) VS THROTTLE
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                *ESTIMATED SIMULATION VALUES (NOT PHYSICAL TESTS)
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sweepData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="throttle" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="thrust" stroke="#10b981" strokeWidth={2} name="Thrust (g)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={2} name="Current (A)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Controls & Parameter Inputs (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Throttle Master Slider */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-xl">
            <div className="flex justify-between items-center text-sm font-bold mb-2">
              <span className="text-cyan-300 font-mono flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" /> THROTTLE COMMAND
              </span>
              <span className="text-xl font-mono text-white">{throttle} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={throttle}
              onChange={(e) => setThrottle(Number(e.target.value))}
              className="w-full h-3 accent-cyan-400 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (IDLE)</span>
              <span>50% (HOVER)</span>
              <span>100% (WOT)</span>
            </div>
          </div>

          {/* Test Setup Configuration Parameters */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3.5 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
              PROPULSION HARDWARE CONFIGURATION
            </h4>

            {/* Motor Selection */}
            <div>
              <label className="text-slate-400 block mb-1">BRUSHLESS MOTOR MODEL</label>
              <select
                value={motorKv}
                onChange={(e) => setMotorKv(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value={2300}>2205 - 2300 KV (FPV Drone High RPM)</option>
                <option value={920}>2212 - 920 KV (Standard 450 Quadcopter)</option>
                <option value={700}>2814 - 700 KV (Mid-Size UAV)</option>
                <option value={350}>4114 - 350 KV (Heavy Lift Endurance UAV)</option>
              </select>
            </div>

            {/* ESC Selection */}
            <div>
              <label className="text-slate-400 block mb-1">ELECTRONIC SPEED CONTROLLER (ESC)</label>
              <select
                value={escMaxAmps}
                onChange={(e) => setEscMaxAmps(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value={20}>20A BLHeli ESC</option>
                <option value={30}>30A BLHeli-S ESC (Standard)</option>
                <option value={40}>40A Opto Heavy Duty ESC</option>
                <option value={60}>60A Pro Industrial ESC</option>
              </select>
            </div>

            {/* Battery Voltage Selection */}
            <div>
              <label className="text-slate-400 block mb-1">BATTERY SUPPLY VOLTAGE</label>
              <select
                value={batteryVoltage}
                onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value={7.4}>2S LiPo (7.4 V Nominal)</option>
                <option value={11.1}>3S LiPo (11.1 V Nominal)</option>
                <option value={14.8}>4S LiPo (14.8 V High Performance)</option>
                <option value={22.2}>6S LiPo (22.2 V Heavy Lift)</option>
              </select>
            </div>

            {/* Propeller Geometry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">DIAMETER: {propDiameter}"</label>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={propDiameter}
                  onChange={(e) => setPropDiameter(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">PITCH: {propPitch}"</label>
                <input
                  type="range"
                  min="3.0"
                  max="6.0"
                  step="0.5"
                  value={propPitch}
                  onChange={(e) => setPropPitch(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Blades: 2 vs 3 */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-slate-400">BLADE COUNT:</span>
              <button
                onClick={() => setPropBlades(2)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  propBlades === 2 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2 BLADES
              </button>
              <button
                onClick={() => setPropBlades(3)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  propBlades === 3 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3 BLADES
              </button>
            </div>
          </div>

          {/* Efficiency Metric Display */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">CURRENT DRAW</span>
              <span className={`text-sm font-bold ${isOverCurrent ? 'text-rose-400' : 'text-slate-200'}`}>
                {metrics.currentAmps} A
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">THRUST (N)</span>
              <span className="text-sm font-bold text-cyan-300">{metrics.thrustNewtons} N</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EFFICIENCY</span>
              <span className="text-sm font-bold text-emerald-400">{metrics.efficiencyGpW} g/W</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
