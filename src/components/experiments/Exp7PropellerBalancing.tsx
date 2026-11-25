import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { BalanceStandModel } from '../3d-models/BalanceStandModel';
import { PropellerModel } from '../3d-models/PropellerModel';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, Disc, RotateCcw, CheckCircle2, Play, Pause, AlertTriangle } from 'lucide-react';

export const Exp7PropellerBalancing: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Selected configuration
  const [blades, setBlades] = useState<2 | 3>(2);
  const [propSize, setPropSize] = useState(10); // 10 inch
  const [imbalanceGrams, setImbalanceGrams] = useState(0.45); // heavy blade mass offset
  const [appliedCorrectionGrams, setAppliedCorrectionGrams] = useState(0.0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Tilt angle on magnetic balancer stand (-1 to +1 radians)
  const netImbalance = Math.max(0, Math.round((imbalanceGrams - appliedCorrectionGrams) * 100) / 100);
  const tiltAngle = (netImbalance / 0.5) * 0.45; // Radians of gravity tilt
  const vibrationLevelMmS = isSpinning ? Math.max(0.4, netImbalance * 18.5) : 0; // mm/s RMS

  const isBalanced = netImbalance <= 0.05;

  // Generate simulated vibration waveform data for chart
  const vibrationWaveform = Array.from({ length: 30 }).map((_, i) => {
    const t = i * 0.2;
    const noise = (Math.random() - 0.5) * 0.2;
    const amplitude = vibrationLevelMmS;
    const value = amplitude * Math.sin(t * 8) + noise;
    return {
      sample: `${i}`,
      vibration: Math.round(value * 100) / 100,
    };
  });

  const handleApplyTape = () => {
    setAppliedCorrectionGrams((prev) => Math.min(imbalanceGrams, Math.round((prev + 0.15) * 100) / 100));
  };

  const handleReset = () => {
    setAppliedCorrectionGrams(0);
    setIsSpinning(false);
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 7,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        propellerType: `${propSize}x4.5 Carbon (${blades}-blade)`,
        initialImbalance: `${imbalanceGrams} g`,
        correctiveTapeMass: `${appliedCorrectionGrams} g`,
        residualImbalance: `${netImbalance} g`,
        vibrationLevelRms: `${Math.round(vibrationLevelMmS * 10) / 10} mm/s`,
        balanceEquilibriumStatus: isBalanced ? 'Horizontally Level (Balanced)' : 'Heavy Blade Drop (Unbalanced)',
      },
      calculations: {
        staticImbalanceTorque: `${Math.round(netImbalance * 9.81 * (propSize * 12.7) * 10) / 1000} N·mm`,
        vibrationMitigationFactor: `${Math.round(((18.5 * 0.45 - vibrationLevelMmS) / (18.5 * 0.45)) * 100)} %`,
        isoVibrationGrade: isBalanced ? 'ISO 1940 G2.5 (Precision Aero)' : 'ISO 1940 G16 (Unacceptable)',
      },
      resultSummary: 'Propeller balancing procedure executed on magnetic suspension stand. High blade vibration was mitigated to acceptable aviation limits after corrective balance tape application.',
    });
    alert('Propeller Balancing Data saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 07
          </span>
          <h2 className="text-lg font-bold text-white">Propeller Balancing Procedure Laboratory</h2>
          <p className="text-xs text-slate-400">
            Detect static mass imbalance on magnetic suspension stand, apply corrective counter-weight, and inspect FFT vibration spectra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Balance</span>
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
        {/* Left 3D Stand Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[380px] w-full relative">
            <Scene3D cameraPosition={[0, 1.6, 2.5]}>
              <BalanceStandModel scale={1.3} />
              {/* Suspended Propeller pivoted on arbor */}
              <group
                position={[0, 1.56, 0]}
                rotation={isSpinning ? [0, 0, 0] : [0, 0, tiltAngle]}
              >
                <PropellerModel
                  scale={1.0}
                  diameterInches={propSize}
                  blades={blades}
                  spinning={isSpinning}
                  rpm={isSpinning ? 4500 : 0}
                  imbalanceOffset={imbalanceGrams}
                  showBalanceClip={appliedCorrectionGrams > 0}
                  color="#0284c7"
                />
              </group>
            </Scene3D>

            {/* Balancer Equilibrium Status Pill */}
            <div className="absolute top-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono">
              <Disc className={`w-4 h-4 ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <span className="text-slate-400 text-[10px] block">EQUILIBRIUM STATE</span>
                <span className={`font-bold ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isBalanced ? 'STATICALLY & DYNAMICALLY BALANCED' : 'HEAVY BLADE TILT (UNBALANCED)'}
                </span>
              </div>
            </div>

            {/* Real-Time Vibration Readout */}
            <div className="absolute bottom-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">VIBRATION LEVEL</span>
                <span className={`font-bold text-sm ${vibrationLevelMmS > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {Math.round(vibrationLevelMmS * 10) / 10} mm/s RMS
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">RESIDUAL MASS OFFSET</span>
                <span className="text-cyan-300 font-bold text-sm">{netImbalance} g</span>
              </div>
            </div>
          </div>

          {/* Accelerometer Vibration Waveform Plot */}
          <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex flex-col h-52">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                ACCELEROMETER VIBRATION WAVEFORM (HIGH-SPEED SPIN TEST)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isSpinning ? '4500 RPM ACTIVE' : 'MOTOR STOPPED'}
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vibrationWaveform} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="sample" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis domain={[-10, 10]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vibration"
                    stroke={vibrationLevelMmS > 3 ? '#ef4444' : '#10b981'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Propeller Setup & Balancing Procedure Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Propeller Geometry */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3.5 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
              PROPELLER TEST APPARATUS
            </h4>

            <div>
              <label className="text-slate-400 block mb-1">BLADE CONFIGURATION</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBlades(2)}
                  className={`py-1.5 rounded font-mono font-bold text-xs ${
                    blades === 2 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  2-BLADE PROPELLER
                </button>
                <button
                  onClick={() => setBlades(3)}
                  className={`py-1.5 rounded font-mono font-bold text-xs ${
                    blades === 3 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  3-BLADE PROPELLER
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">PROPELLER DIAMETER: {propSize}"</label>
              <input
                type="range"
                min="8"
                max="15"
                step="1"
                value={propSize}
                onChange={(e) => setPropSize(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                INITIAL HEAVY BLADE IMBALANCE: {imbalanceGrams} g
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={imbalanceGrams}
                onChange={(e) => setImbalanceGrams(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>
          </div>

          {/* Balancing Procedure Step Controls */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
              CORRECTIVE BALANCING INTERACTION
            </h4>

            <p className="text-slate-300 leading-relaxed">
              Apply high-grade balancing tape or adhesive vinyl to the lighter blade until the propeller remains perfectly horizontal.
            </p>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between font-mono">
              <span className="text-slate-400">APPLIED TAPE MASS:</span>
              <span className="text-emerald-400 font-bold text-sm">
                +{appliedCorrectionGrams} g
              </span>
            </div>

            <button
              onClick={handleApplyTape}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono shadow-glow-cyan"
            >
              + APPLY BALANCING TAPE (+0.15g)
            </button>

            {/* Spin Test Button */}
            <button
              onClick={() => setIsSpinning(!isSpinning)}
              className={`w-full py-2.5 rounded-lg font-bold font-mono flex items-center justify-center gap-2 transition-all ${
                isSpinning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue'
              }`}
            >
              {isSpinning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSpinning ? 'STOP HIGH-SPEED SPIN TEST' : 'RUN HIGH-SPEED SPIN VIBRATION TEST'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
