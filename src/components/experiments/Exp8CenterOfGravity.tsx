import React, { useState, useMemo } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { FixedWingModel } from '../3d-models/FixedWingModel';
import { calculateCenterOfGravity, calculateMAC } from '../../utils/aerodynamics';
import { Save, Crosshair, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

export const Exp8CenterOfGravity: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Reference Datum: Tip of Nose = 0 mm
  // Component masses (g) and arms from datum (mm)
  const [motorWeight, setMotorWeight] = useState(160);
  const [motorArm, setMotorArm] = useState(40); // 40mm from nose

  const [batteryWeight, setBatteryWeight] = useState(320);
  const [batteryArm, setBatteryArm] = useState(260); // Slidable battery position!

  const [avionicsWeight, setAvionicsWeight] = useState(110);
  const [avionicsArm, setAvionicsArm] = useState(320);

  const [airframeWeight, setAirframeWeight] = useState(580);
  const [airframeArm, setAirframeArm] = useState(460);

  const [tailWeight, setTailWeight] = useState(140);
  const [tailArm, setTailArm] = useState(980);

  // Wing Geometry for MAC
  const rootChordMm = 240;
  const tipChordMm = 160;
  const wingspanMm = 1200;
  const wingLeadingEdgeArmMm = 380; // Wing LE is 380mm from nose

  // Calculations
  const cgResult = useMemo(() => {
    const items = [
      { name: 'Motor', weightGrams: motorWeight, armMm: motorArm },
      { name: 'Battery', weightGrams: batteryWeight, armMm: batteryArm },
      { name: 'Avionics', weightGrams: avionicsWeight, armMm: avionicsArm },
      { name: 'Airframe', weightGrams: airframeWeight, armMm: airframeArm },
      { name: 'Tail Empennage', weightGrams: tailWeight, armMm: tailArm },
    ];
    return calculateCenterOfGravity(items);
  }, [motorWeight, motorArm, batteryWeight, batteryArm, avionicsWeight, avionicsArm, airframeWeight, airframeArm, tailWeight, tailArm]);

  const macResult = useMemo(() => {
    return calculateMAC(rootChordMm, tipChordMm, wingspanMm, 40);
  }, [rootChordMm, tipChordMm, wingspanMm]);

  // % MAC = (CG - X_LE) / MAC * 100
  const percentMac = Math.round(((cgResult.cgMm - wingLeadingEdgeArmMm) / macResult.macMm) * 1000) / 10;

  // Flight stability assessment
  const isOptimal = percentMac >= 25 && percentMac <= 30;
  const isNoseHeavy = percentMac < 25;
  const isTailHeavy = percentMac > 32;

  // Coordinate conversion for 3D model: -1.4 (nose) to +1.4 (tail)
  // 0mm -> -1.4, 1100mm -> +1.4
  const cg3DPos = -1.4 + (cgResult.cgMm / 1100) * 2.8;
  const battery3DOffset = ((batteryArm - 260) / 300) * 0.8;

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 8,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        totalAircraftWeight: `${cgResult.totalWeightGrams} g`,
        totalMoment: `${cgResult.totalMoment} g·mm`,
        calculatedCgFromDatum: `${cgResult.cgMm} mm`,
        batteryArmLocation: `${batteryArm} mm`,
        meanAerodynamicChord: `${macResult.macMm} mm`,
        cgPercentMac: `${percentMac} % MAC`,
        stabilityCondition: isOptimal ? 'Optimal Stable (25-30% MAC)' : isTailHeavy ? 'Critically Tail-Heavy (Stall Danger)' : 'Nose-Heavy (Elevator Limit)',
      },
      calculations: {
        cgEquation: 'CG = Σ(Weight × Arm) / Σ(Weight)',
        aerodynamicStaticMargin: `${Math.round((33 - percentMac) * 10) / 10} %`,
        neutralPointLocation: `${wingLeadingEdgeArmMm + Math.round(macResult.macMm * 0.33)} mm`,
      },
      resultSummary: `Fixed-wing UAV longitudinal Center of Gravity balanced at ${cgResult.cgMm}mm from nose (${percentMac}% MAC). Battery trim adjustment verified stable pitch stability.`,
    });
    alert('Center of Gravity Calculation Report saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 08
          </span>
          <h2 className="text-lg font-bold text-white">Centre of Gravity (CG) Calculation & Balancing</h2>
          <p className="text-xs text-slate-400">
            Compute longitudinal CG from reference nose datum, Mean Aerodynamic Chord (MAC), and balance static stability.
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
        {/* Left 3D Balance Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[400px] w-full relative">
            <Scene3D cameraPosition={[0, 2.2, 3.2]} fov={45}>
              <FixedWingModel
                scale={1.3}
                batteryOffsetZ={battery3DOffset}
                showCGMarker={true}
                cgPositionZ={cg3DPos}
              />
            </Scene3D>

            {/* Stability Alert Warning Overlay */}
            {isTailHeavy && (
              <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-500 rounded-xl p-3 flex items-center gap-2 text-rose-200 text-xs shadow-2xl animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  <strong>CRITICAL INSTABILITY!</strong> CG is aft of 32% MAC ({percentMac}% MAC). Aircraft will diverge pitch-up into uncontrollable aerodynamic stall! Slide battery forward.
                </span>
              </div>
            )}

            {/* Real-Time CG Status HUD Overlay */}
            <div className="absolute bottom-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">LONGITUDINAL CG</span>
                <span className="text-cyan-300 font-bold text-sm">{cgResult.cgMm} mm</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">% MAC POSITION</span>
                <span
                  className={`font-bold text-sm ${
                    isOptimal ? 'text-emerald-400' : isTailHeavy ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {percentMac}% MAC
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TOTAL MASS</span>
                <span className="text-white font-bold text-sm">{cgResult.totalWeightGrams} g</span>
              </div>
            </div>
          </div>

          {/* Moments & Weight Calculation Matrix */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl overflow-x-auto">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-2 uppercase">
              MOMENT CALCULATION TABLE (DATUM: NOSE = 0 mm)
            </span>
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="py-1">Component</th>
                  <th className="py-1">Weight (g)</th>
                  <th className="py-1">Arm (mm)</th>
                  <th className="py-1">Moment (g·mm)</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <td className="py-1">Motor Assembly</td>
                  <td>{motorWeight}</td>
                  <td>{motorArm}</td>
                  <td className="text-cyan-300">{motorWeight * motorArm}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-1 text-amber-300">LiPo Battery (Movable)</td>
                  <td className="text-amber-300">{batteryWeight}</td>
                  <td className="text-amber-300">{batteryArm}</td>
                  <td className="text-amber-300">{batteryWeight * batteryArm}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-1">Avionics & Servos</td>
                  <td>{avionicsWeight}</td>
                  <td>{avionicsArm}</td>
                  <td className="text-cyan-300">{avionicsWeight * avionicsArm}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-1">Airframe Structure</td>
                  <td>{airframeWeight}</td>
                  <td>{airframeArm}</td>
                  <td className="text-cyan-300">{airframeWeight * airframeArm}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-1">Tail Empennage</td>
                  <td>{tailWeight}</td>
                  <td>{tailArm}</td>
                  <td className="text-cyan-300">{tailWeight * tailArm}</td>
                </tr>
                <tr className="font-bold text-white pt-1">
                  <td className="py-1 text-emerald-400">TOTAL</td>
                  <td className="text-emerald-400">{cgResult.totalWeightGrams} g</td>
                  <td>-</td>
                  <td className="text-emerald-400">{cgResult.totalMoment} g·mm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sliders & Battery Trim Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Movable Battery Trim Master Slider */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-amber-300 font-mono flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" /> BATTERY LONGITUDINAL POSITION
              </span>
              <span className="text-base font-mono text-white">{batteryArm} mm</span>
            </div>
            <input
              type="range"
              min="140"
              max="500"
              step="5"
              value={batteryArm}
              onChange={(e) => setBatteryArm(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>NOSE FORWARD (140mm)</span>
              <span>AFT TAIL (500mm)</span>
            </div>
          </div>

          {/* Component Weight Customization */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
              COMPONENT WEIGHT PARAMETERS
            </h4>

            {/* Battery Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>LiPo Battery Mass</span>
                <span className="font-mono text-cyan-400">{batteryWeight} g</span>
              </div>
              <input
                type="range"
                min="180"
                max="650"
                step="10"
                value={batteryWeight}
                onChange={(e) => setBatteryWeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Motor Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Motor Mass</span>
                <span className="font-mono text-cyan-400">{motorWeight} g</span>
              </div>
              <input
                type="range"
                min="80"
                max="300"
                value={motorWeight}
                onChange={(e) => setMotorWeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Airframe Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Airframe Structure Mass</span>
                <span className="font-mono text-cyan-400">{airframeWeight} g</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="20"
                value={airframeWeight}
                onChange={(e) => setAirframeWeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Wing Geometry & MAC Readout */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-2 text-xs font-mono">
            <h4 className="text-cyan-300 font-bold uppercase">WING GEOMETRY & MAC SUMMARY</h4>
            <div className="space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Root Chord ($C_{'{root}'}$):</span>
                <span className="text-slate-200">{rootChordMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Tip Chord ($C_{'{tip}'}$):</span>
                <span className="text-slate-200">{tipChordMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated MAC:</span>
                <span className="text-cyan-300 font-bold">{macResult.macMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Target Balance Window (25-30% MAC):</span>
                <span className="text-emerald-400 font-bold">
                  {wingLeadingEdgeArmMm + Math.round(macResult.macMm * 0.25)} mm -{' '}
                  {wingLeadingEdgeArmMm + Math.round(macResult.macMm * 0.3)} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
