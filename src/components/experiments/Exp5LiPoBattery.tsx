import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { LiPoBatteryModel } from '../3d-models/LiPoBatteryModel';
import { getLipoCellSoC } from '../../utils/aerodynamics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Save, BatteryCharging, AlertTriangle, ShieldCheck, Play, Pause, RotateCcw, Zap } from 'lucide-react';

export const Exp5LiPoBattery: React.FC = () => {
  const { saveLabRecord } = useLab();

  // Battery setup
  const [cellCount, setCellCount] = useState<2 | 3 | 4 | 6>(3);
  const [capacityMah, setCapacityMah] = useState(3300);
  const [simMode, setSimMode] = useState<'idle' | 'charging' | 'balancing' | 'discharging'>('idle');
  
  // Individual cell voltages
  const [cells, setCells] = useState<number[]>([4.18, 3.92, 4.15]); // Unbalanced 3S
  const [temperature, setTemperature] = useState(26); // °C
  const [internalResistance, setInternalResistance] = useState<number[]>([12, 28, 14]); // mOhm per cell
  const [history, setHistory] = useState<Array<{ time: string; avgVoltage: number; current: number }>>([]);

  // Sync cell count changes
  useEffect(() => {
    let initial: number[];
    let ir: number[];
    if (cellCount === 2) {
      initial = [4.16, 3.94];
      ir = [14, 25];
    } else if (cellCount === 3) {
      initial = [4.18, 3.92, 4.15];
      ir = [12, 28, 14];
    } else if (cellCount === 4) {
      initial = [4.20, 3.88, 4.16, 4.12];
      ir = [10, 32, 12, 14];
    } else {
      initial = [4.18, 3.90, 4.15, 4.12, 3.95, 4.19];
      ir = [11, 29, 12, 15, 27, 13];
    }
    setCells(initial);
    setInternalResistance(ir);
    setHistory([]);
  }, [cellCount]);

  // Simulation timer loop
  useEffect(() => {
    if (simMode === 'idle') return;

    const interval = setInterval(() => {
      setCells((prev) => {
        let next = [...prev];
        if (simMode === 'balancing') {
          // Bring all cells towards the lowest cell or 4.20V
          const target = 4.20;
          next = next.map((v) => {
            if (v < target) return Math.min(target, Math.round((v + 0.008) * 1000) / 1000);
            return v;
          });
          setTemperature((t) => Math.min(34, t + 0.1));
        } else if (simMode === 'charging') {
          next = next.map((v) => Math.min(4.20, Math.round((v + 0.015) * 1000) / 1000));
          setTemperature((t) => Math.min(38, t + 0.2));
        } else if (simMode === 'discharging') {
          next = next.map((v, i) => Math.max(3.20, Math.round((v - 0.02 - (internalResistance[i] || 15) * 0.0005) * 1000) / 1000));
          setTemperature((t) => Math.min(58, t + 0.5));
        }
        return next;
      });

      // Update telemetry history
      setHistory((prev) => {
        const avg = cells.reduce((a, b) => a + b, 0) / cells.length;
        const current = simMode === 'charging' ? 3.3 : simMode === 'discharging' ? 22.5 : simMode === 'balancing' ? 0.8 : 0;
        const newHist = [...prev, { time: `${prev.length * 2}s`, avgVoltage: Math.round(avg * 100) / 100, current }];
        return newHist.slice(-20);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [simMode, cells, internalResistance]);

  const totalVoltage = Math.round(cells.reduce((a, b) => a + b, 0) * 100) / 100;
  const avgCellVoltage = cells.length > 0 ? totalVoltage / cells.length : 0;
  const maxCell = Math.max(...cells);
  const minCell = Math.min(...cells);
  const cellDeltaMv = Math.round((maxCell - minCell) * 1000);
  const batterySoC = getLipoCellSoC(avgCellVoltage);

  const isLowVoltage = minCell < 3.30;
  const isOverTemp = temperature > 52;
  const isBalanced = cellDeltaMv <= 15;

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 5,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        cellConfiguration: `${cellCount}S (${totalVoltage} V)`,
        capacityRating: `${capacityMah} mAh`,
        cellVoltages: cells.map((c, i) => `C${i + 1}:${c}V`).join(', '),
        cellVoltageDelta: `${cellDeltaMv} mV`,
        packTemperature: `${Math.round(temperature)} °C`,
        stateOfCharge: `${batterySoC} %`,
        balanceStatus: isBalanced ? 'Balanced (Δ ≤ 15mV)' : 'Unbalanced (Requires Balancing)',
      },
      calculations: {
        maximumCellVoltage: `${maxCell} V`,
        minimumCellVoltage: `${minCell} V`,
        internalResistanceAvg: `${Math.round(internalResistance.reduce((a, b) => a + b, 0) / internalResistance.length)} mΩ`,
      },
      resultSummary: `LiPo testing completed. Pack ${cellCount}S at ${totalVoltage}V demonstrated cell balancing down to ${cellDeltaMv}mV spread under CC/CV simulation.`,
    });
    alert('LiPo Battery Lab Data saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 05
          </span>
          <h2 className="text-lg font-bold text-white">LiPo Battery Testing, Balancing & Maintenance</h2>
          <p className="text-xs text-slate-400">
            Monitor per-cell electrochemical voltages, active balance charging, C-rate discharge, and thermal safety thresholds.
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
        {/* Left 3D LiPo Pack Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="h-[360px] w-full relative">
            <Scene3D cameraPosition={[2.2, 1.8, 2.2]}>
              <LiPoBatteryModel
                scale={1.4}
                cells={cellCount}
                capacityMah={capacityMah}
                highlighted={simMode === 'charging' || simMode === 'balancing'}
              />
            </Scene3D>

            {/* Safety Warnings Overlay */}
            {(isLowVoltage || isOverTemp) && (
              <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-500 rounded-xl p-2.5 flex items-center gap-2 text-rose-200 text-xs shadow-2xl animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {isLowVoltage && 'CRITICAL LOW VOLTAGE (< 3.3V/cell)! Incurring cell damage. '}
                  {isOverTemp && 'THERMAL OVERHEAT (> 52°C)! Risk of battery swelling/fire.'}
                </span>
              </div>
            )}

            {/* Mode Telemetry Pill */}
            <div className="absolute bottom-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">PACK VOLTAGE</span>
                <span className="text-cyan-300 font-bold text-sm">{totalVoltage} V</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">STATE OF CHARGE</span>
                <span className="text-emerald-400 font-bold text-sm">{batterySoC}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TEMPERATURE</span>
                <span className={`font-bold text-sm ${isOverTemp ? 'text-rose-400' : 'text-slate-200'}`}>
                  {Math.round(temperature)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Voltage vs Time Plot */}
          <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex flex-col h-52">
            <span className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
              AVERAGE CELL VOLTAGE & CURRENT DRAW OVER TIME
            </span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis domain={[3.0, 4.3]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="avgVoltage" stroke="#00f0ff" strokeWidth={2} name="Avg Cell (V)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Individual Cell Monitor & Smart Charger Controls (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Individual Cells Bar Indicators */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
                INDIVIDUAL CELL VOLTAGE MONITOR
              </h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isBalanced
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                Δ {cellDeltaMv} mV {isBalanced ? '(BALANCED)' : '(UNBALANCED)'}
              </span>
            </div>

            <div className="space-y-2.5">
              {cells.map((v, i) => {
                const pct = Math.max(0, Math.min(100, ((v - 3.2) / (4.2 - 3.2)) * 100));
                return (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1 font-mono">
                      <span>CELL #{i + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[10px]">IR: {internalResistance[i] || 15} mΩ</span>
                        <span className={`font-bold ${v < 3.4 ? 'text-rose-400' : v > 4.15 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                          {v.toFixed(3)} V
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          v < 3.4
                            ? 'bg-rose-500'
                            : v > 4.15
                            ? 'bg-emerald-400 shadow-glow-cyan'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Charger Controls */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <h4 className="font-mono text-cyan-300 font-bold text-xs uppercase">
              MICROPROCESSOR SMART CHARGER MODES
            </h4>

            {/* Pack Selection */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">SELECT PACK:</span>
              {[2, 3, 4, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => setCellCount(s as any)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    cellCount === s
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}S
                </button>
              ))}
            </div>

            {/* Charge Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setSimMode(simMode === 'balancing' ? 'idle' : 'balancing')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg font-bold text-xs font-mono transition-all ${
                  simMode === 'balancing'
                    ? 'bg-emerald-600 text-white shadow-glow-cyan'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <BatteryCharging className="w-4 h-4" />
                <span>{simMode === 'balancing' ? 'STOP BALANCING' : 'BALANCE CHARGE'}</span>
              </button>

              <button
                onClick={() => setSimMode(simMode === 'discharging' ? 'idle' : 'discharging')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg font-bold text-xs font-mono transition-all ${
                  simMode === 'discharging'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{simMode === 'discharging' ? 'STOP DISCHARGE' : 'FLIGHT LOAD DISCHARGE'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCells([4.18, 3.92, 4.15]);
                setTemperature(26);
                setSimMode('idle');
              }}
              className="w-full mt-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Unbalanced Condition</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
