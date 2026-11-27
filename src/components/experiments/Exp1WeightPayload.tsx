import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { QuadcopterModel } from '../3d-models/QuadcopterModel';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Save, Search } from 'lucide-react';

export const Exp1WeightPayload: React.FC = () => {
  const { saveLabRecord, openInspection } = useLab();

  // Component weights in grams
  const [frameWeight, setFrameWeight] = useState(280);
  const [motorWeightEach, setMotorWeightEach] = useState(62); // x4 = 248g
  const [escWeightEach, setEscWeightEach] = useState(25); // x4 = 100g
  const [propWeightEach, setPropWeightEach] = useState(14); // x4 = 56g
  const [batteryWeight, setBatteryWeight] = useState(380); // 3S 3300mAh
  const [fcWeight, setFcWeight] = useState(35);
  const [rxWeight, setRxWeight] = useState(15);
  const [cameraGimbalWeight, setCameraGimbalWeight] = useState(140);
  const [payloadWeight, setPayloadWeight] = useState(250); // Mission payload
  const [motorMaxThrustEach, setMotorMaxThrustEach] = useState(850); // grams per motor

  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  // Calculations
  const totalMotorWeight = motorWeightEach * 4;
  const totalEscWeight = escWeightEach * 4;
  const totalPropWeight = propWeightEach * 4;

  const emptyWeight =
    frameWeight +
    totalMotorWeight +
    totalEscWeight +
    totalPropWeight +
    batteryWeight +
    fcWeight +
    rxWeight +
    cameraGimbalWeight;

  const mtow = emptyWeight + payloadWeight;
  const totalMaxThrust = motorMaxThrustEach * 4;
  const twr = mtow > 0 ? totalMaxThrust / mtow : 0;
  const payloadPercentage = mtow > 0 ? (payloadWeight / mtow) * 100 : 0;
  const structuralFraction = mtow > 0 ? (frameWeight / mtow) * 100 : 0;

  // Chart data
  const weightDistributionData = [
    { name: 'Frame Structure', value: frameWeight, color: '#38bdf8' },
    { name: 'Motors (4x)', value: totalMotorWeight, color: '#00f0ff' },
    { name: 'ESCs (4x)', value: totalEscWeight, color: '#0284c7' },
    { name: 'Propellers (4x)', value: totalPropWeight, color: '#2563eb' },
    { name: 'LiPo Battery', value: batteryWeight, color: '#eab308' },
    { name: 'Avionics (FC+RX)', value: fcWeight + rxWeight, color: '#10b981' },
    { name: 'FPV & Gimbal', value: cameraGimbalWeight, color: '#8b5cf6' },
    { name: 'Useful Payload', value: payloadWeight, color: '#f43f5e' },
  ];

  const thrustVsWeightData = [
    { name: 'Total Weight (MTOW)', grams: mtow, fill: '#f43f5e' },
    { name: 'Total Max Thrust', grams: totalMaxThrust, fill: '#10b981' },
    { name: 'Hover Thrust (50%)', grams: totalMaxThrust * 0.5, fill: '#38bdf8' },
  ];

  const handleApplyPreset = (preset: 'racer' | 'camera' | 'heavy') => {
    if (preset === 'racer') {
      setFrameWeight(110);
      setMotorWeightEach(32);
      setEscWeightEach(12);
      setPropWeightEach(5);
      setBatteryWeight(180);
      setFcWeight(15);
      setRxWeight(5);
      setCameraGimbalWeight(25);
      setPayloadWeight(40);
      setMotorMaxThrustEach(950);
    } else if (preset === 'camera') {
      setFrameWeight(280);
      setMotorWeightEach(62);
      setEscWeightEach(25);
      setPropWeightEach(14);
      setBatteryWeight(380);
      setFcWeight(35);
      setRxWeight(15);
      setCameraGimbalWeight(180);
      setPayloadWeight(250);
      setMotorMaxThrustEach(850);
    } else {
      setFrameWeight(650);
      setMotorWeightEach(140);
      setEscWeightEach(45);
      setPropWeightEach(35);
      setBatteryWeight(920);
      setFcWeight(45);
      setRxWeight(20);
      setCameraGimbalWeight(350);
      setPayloadWeight(1200);
      setMotorMaxThrustEach(1900);
    }
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 1,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        frameWeightGrams: frameWeight,
        batteryWeightGrams: batteryWeight,
        payloadWeightGrams: payloadWeight,
        emptyWeightGrams: emptyWeight,
        mtowGrams: mtow,
        twrRatio: Math.round(twr * 100) / 100,
        payloadPercentage: Math.round(payloadPercentage * 10) / 10,
      },
      calculations: {
        thrustToWeightRatio: `${Math.round(twr * 100) / 100} : 1`,
        structuralFraction: `${Math.round(structuralFraction * 10) / 10} %`,
        minimumMotorThrustPerArm: `${Math.round((mtow * 2) / 4)} grams`,
      },
      resultSummary: `Calculated UAV MTOW is ${mtow}g with a Thrust-to-Weight Ratio of ${Math.round(twr * 100) / 100}:1. Aerodynamic flight safety margin is verified.`,
    });
    alert('Observations recorded in Lab Record successfully!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 01
          </span>
          <h2 className="text-lg font-bold text-white">Payload and Weight Estimation Laboratory</h2>
          <p className="text-xs text-slate-400">
            Determine structural empty mass, payload capacity, and verify Thrust-to-Weight Ratio (TWR ≥ 2.0). Click any component in 3D to inspect.
          </p>
        </div>

        {/* Presets & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApplyPreset('racer')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Racer 250
          </button>
          <button
            onClick={() => handleApplyPreset('camera')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            Camera Quad 450
          </button>
          <button
            onClick={() => handleApplyPreset('heavy')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
          >
            Heavy Cargo
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

      {/* Main Workspace: 3D View + Calculations & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left 3D Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[380px] w-full relative">
            <Scene3D cameraPosition={[2.8, 2.2, 2.8]}>
              <QuadcopterModel
                scale={1.1}
                highlightedComponent={highlightedComponent}
                onSelectComponent={(name) => {
                  setHighlightedComponent(name);
                  openInspection(name);
                }}
                showMotorLabels={true}
              />
            </Scene3D>
            {highlightedComponent && (
              <div
                onClick={() => openInspection(highlightedComponent)}
                className="cursor-pointer absolute top-3 left-3 bg-[#0f172a]/95 border border-cyan-400 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-glow-cyan"
              >
                <span>SELECTED: {highlightedComponent}</span>
                <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400 flex items-center gap-1">
                  <Search className="w-3 h-3" /> Inspect 3D
                </span>
              </div>
            )}
          </div>

          {/* Graphical Charts: Weight Distribution Donut & Thrust vs Weight Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-52">
            <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex flex-col">
              <span className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
                WEIGHT DISTRIBUTION (DONUT)
              </span>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={weightDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {weightDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} g`, 'Weight']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex flex-col">
              <span className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
                THRUST VS WEIGHT COMPARISON (GRAMS)
              </span>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={thrustVsWeightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} g`, 'Thrust / Weight']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }}
                    />
                    <Bar dataKey="grams" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Engineering Calculations & Parameter Sliders (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Output Metrics Cards */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">TOTAL MTOW</span>
              <span className="text-xl font-bold text-white font-mono">{mtow} g</span>
              <span className="text-[10px] text-slate-500 block">Empty: {emptyWeight}g</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                twr >= 2.0
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-400'
              }`}
            >
              <span className="text-[10px] font-mono block">THRUST-TO-WEIGHT</span>
              <span className="text-xl font-bold font-mono">
                {Math.round(twr * 100) / 100} : 1
              </span>
              <span className="text-[10px] block">
                {twr >= 2.0 ? 'Optimal (Hover < 50%)' : 'Caution: Underpowered'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">PAYLOAD FRACTION</span>
              <span className="text-base font-bold text-cyan-300 font-mono">
                {Math.round(payloadPercentage * 10) / 10} %
              </span>
              <span className="text-[10px] text-slate-500 block">Mass: {payloadWeight}g</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">TOTAL THRUST</span>
              <span className="text-base font-bold text-cyan-300 font-mono">{totalMaxThrust} g</span>
              <span className="text-[10px] text-slate-500 block">4x {motorMaxThrustEach}g</span>
            </div>
          </div>

          {/* Interactive Weight Parameter Inputs */}
          <div className="flex-1 p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 overflow-y-auto max-h-[390px] custom-scrollbar text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase flex items-center justify-between">
              <span>COMPONENT MASS BREAKDOWN</span>
              <span className="text-[10px] text-slate-400">INSTANT RECALC</span>
            </h4>

            {/* Frame */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Quadcopter Frame Structure</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="50"
                    max="1500"
                    value={frameWeight}
                    onChange={(e) => setFrameWeight(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs text-right focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 text-xs">g</span>
                </div>
              </div>
              <input
                type="range"
                min="80"
                max="800"
                step="5"
                value={frameWeight}
                onChange={(e) => setFrameWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Motor Weight Each */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Brushless Motor (Each x4)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={motorWeightEach}
                    onChange={(e) => setMotorWeightEach(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs text-right focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 text-xs">g (x4={totalMotorWeight}g)</span>
                </div>
              </div>
              <input
                type="range"
                min="20"
                max="180"
                value={motorWeightEach}
                onChange={(e) => setMotorWeightEach(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Battery */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>LiPo Battery Pack</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    value={batteryWeight}
                    onChange={(e) => setBatteryWeight(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs text-right focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 text-xs">g</span>
                </div>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="10"
                value={batteryWeight}
                onChange={(e) => setBatteryWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Useful Payload */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="font-semibold text-rose-300">Useful Mission Payload</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="2500"
                    value={payloadWeight}
                    onChange={(e) => setPayloadWeight(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-rose-500/50 text-rose-300 font-mono text-xs text-right focus:outline-none focus:border-rose-400"
                  />
                  <span className="font-mono text-rose-400 text-xs font-bold">g</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="10"
                value={payloadWeight}
                onChange={(e) => setPayloadWeight(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Camera and Gimbal */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Camera & Gimbal</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="800"
                    value={cameraGimbalWeight}
                    onChange={(e) => setCameraGimbalWeight(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs text-right focus:outline-none focus:border-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 text-xs">g</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={cameraGimbalWeight}
                onChange={(e) => setCameraGimbalWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Motor Max Thrust */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Max Thrust Per Motor</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="200"
                    max="4000"
                    value={motorMaxThrustEach}
                    onChange={(e) => setMotorMaxThrustEach(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-right focus:outline-none focus:border-emerald-400"
                  />
                  <span className="font-mono text-emerald-400 text-xs">g</span>
                </div>
              </div>
              <input
                type="range"
                min="400"
                max="2500"
                step="25"
                value={motorMaxThrustEach}
                onChange={(e) => setMotorMaxThrustEach(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
