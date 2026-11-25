import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { RCTransmitterModel } from '../3d-models/RCTransmitterModel';
import { Save, Radio, RotateCcw, CheckCircle2, ChevronRight, Zap, RefreshCw } from 'lucide-react';

export const Exp6TransmitterCalibration: React.FC = () => {
  const { saveLabRecord } = useLab();

  const [txModel, setTxModel] = useState('FlySky FS-i6X (10CH 2.4GHz AFHDS-2A)');
  const [rxModel, setRxModel] = useState('FS-iA6B 6CH Dual-Antenna Receiver');
  
  // Wizard steps: 1: Factory Reset, 2: Stick Endpoint Cal, 3: Channel Calibration, 4: Frequency Binding
  const [currentStep, setCurrentStep] = useState(1);
  const [stickCalProgress, setStickCalProgress] = useState(0); // 0 to 100%
  const [isBinding, setIsBinding] = useState(false);
  const [isBound, setIsBound] = useState(false);
  const [rssi, setRssi] = useState(-85); // dBm

  // Channels state
  const [channels, setChannels] = useState([
    { name: 'CH1: Roll / Aileron', before: '1040 µs - 1920 µs', after: '1000 µs - 2000 µs', center: '1500 µs', calibrated: false },
    { name: 'CH2: Pitch / Elevator', before: '1060 µs - 1940 µs', after: '1000 µs - 2000 µs', center: '1500 µs', calibrated: false },
    { name: 'CH3: Throttle', before: '1020 µs - 1980 µs', after: '1000 µs - 2000 µs', center: '1000 µs (Low)', calibrated: false },
    { name: 'CH4: Yaw / Rudder', before: '1050 µs - 1930 µs', after: '1000 µs - 2000 µs', center: '1500 µs', calibrated: false },
  ]);

  const handleStepNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setStickCalProgress(100);
      setChannels((prev) => prev.map((c) => ({ ...c, calibrated: true })));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSimulateBind = () => {
    setIsBinding(true);
    setTimeout(() => {
      setIsBinding(false);
      setIsBound(true);
      setRssi(-48); // Strong close RF signal
    }, 2000);
  };

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 6,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        transmitterSystem: txModel,
        receiverSystem: rxModel,
        protocol: '2.4GHz AFHDS-2A / FHSS',
        rfBindingStatus: isBound ? 'Bound (GUID Confirmed)' : 'Unbound',
        rfLinkRssi: `${rssi} dBm`,
        stickEndpointCalibration: stickCalProgress === 100 ? 'Completed' : 'Pending',
      },
      calculations: {
        pwmLowerEndpoint: '1000 µs (0% travel)',
        pwmCenterEndpoint: '1500 µs (Neutral)',
        pwmUpperEndpoint: '2000 µs (100% travel)',
        channelResolution: '2048 steps (11-bit)',
      },
      resultSummary: 'Transmitter memory reset, stick gimbal 4-axis endpoint calibration, and 2.4GHz FHSS frequency binding sequence with FS-iA6B receiver executed and verified.',
    });
    alert('Transmitter Calibration & Binding Report saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 06
          </span>
          <h2 className="text-lg font-bold text-white">RC Transmitter Calibration & Frequency Binding</h2>
          <p className="text-xs text-slate-400">
            Execute memory reset, potentiometer stick endpoint calibration (1000 - 2000 µs), and 2.4GHz RF GUID binding.
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
        {/* Left 3D Transmitter Viewport (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="h-[400px] w-full relative">
            <Scene3D cameraPosition={[0, 2.5, 2.5]}>
              <RCTransmitterModel
                scale={1.4}
                bound={isBound}
                leftStick={currentStep === 2 ? { x: Math.sin(Date.now() * 0.003), y: Math.cos(Date.now() * 0.003) } : { x: 0, y: 0 }}
                rightStick={currentStep === 2 ? { x: -Math.sin(Date.now() * 0.003), y: -Math.cos(Date.now() * 0.003) } : { x: 0, y: 0 }}
              />
            </Scene3D>

            {/* RF Binding Indicator Overlay */}
            <div className="absolute top-4 left-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono">
              <Radio className={`w-4 h-4 ${isBound ? 'text-emerald-400' : isBinding ? 'text-amber-400 animate-spin' : 'text-rose-400'}`} />
              <div>
                <span className="text-slate-400 text-[10px] block">RF LINK STATUS</span>
                <span className={`font-bold ${isBound ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isBound ? `BOUND (RSSI: ${rssi} dBm)` : isBinding ? 'SYNCHRONIZING...' : 'UNBOUND'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Hardware Selection Dropdowns */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">TRANSMITTER SYSTEM</label>
                <select
                  value={txModel}
                  onChange={(e) => setTxModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="FlySky FS-i6X (10CH 2.4GHz AFHDS-2A)">FlySky FS-i6X (10CH AFHDS-2A)</option>
                  <option value="FrSky Taranis QX7 (16CH OpenTX)">FrSky Taranis QX7 (16CH ACCESS)</option>
                  <option value="Radiomaster TX16S (EdgeTX Multiprotocol)">Radiomaster TX16S (EdgeTX)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-mono">AIRBORNE RECEIVER</label>
                <select
                  value={rxModel}
                  onChange={(e) => setRxModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="FS-iA6B 6CH Dual-Antenna Receiver">FS-iA6B 6CH Dual-Antenna</option>
                  <option value="FrSky R-XSR Ultra-Light S.Bus Receiver">FrSky R-XSR S.Bus Receiver</option>
                  <option value="TBS Crossfire Nano Long Range RX">TBS Crossfire Nano RX</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Step-by-Step Calibration Wizard (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono">
            {['1. Reset', '2. Sticks', '3. Channels', '4. Binding'].map((label, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i + 1)}
                className={`py-2 text-center rounded-lg font-bold transition-all ${
                  currentStep === i + 1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Active Step Panel */}
          <div className="flex-1 p-5 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-4 text-xs">
            {currentStep === 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 font-mono">STEP 1: FACTORY SYSTEM RESET</h4>
                <p className="text-slate-300 leading-relaxed">
                  Clears all stored model memory slots, previous mix tables, dual rates, and corrupt endpoint offsets to ensure a known clean baseline.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>MEMORY SLOT: MODEL 01</span>
                    <span className="text-emerald-400">EEPROM READY</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>TYPE: AIRPLANE / MULTIROTOR</span>
                    <span className="text-cyan-300">DEFAULT</span>
                  </div>
                </div>
                <button
                  onClick={handleStepNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  <span>Execute Reset & Proceed</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 font-mono">STEP 2: STICK GIMBAL POTENTIOMETER CALIBRATION</h4>
                <p className="text-slate-300 leading-relaxed">
                  Rotate both transmitter gimbals through their complete circular boundaries to detect maximum physical ADC voltage limits and center rest positions.
                </p>
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300 shadow-glow-cyan"
                    style={{ width: `${stickCalProgress || 70}%` }}
                  ></div>
                </div>
                <div className="text-slate-400 font-mono text-[11px] flex justify-between">
                  <span>POTENTIOMETER SWEEP</span>
                  <span className="text-cyan-300">{stickCalProgress || 70}% ACQUIRED</span>
                </div>
                <button
                  onClick={handleStepNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  <span>Save Potentiometer Endpoints</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 font-mono">STEP 3: 4-CHANNEL ENDPOINT CALIBRATION TABLE</h4>
                <p className="text-slate-300 leading-relaxed">
                  Verified channel pulse widths mapped to standard hobby 1000µs (Min) - 1500µs (Center) - 2000µs (Max).
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  {channels.map((ch, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-slate-200 font-semibold">{ch.name}</div>
                        <div className="text-[10px] text-slate-500">Uncalibrated: {ch.before}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-300 font-bold">{ch.after}</div>
                        <div className="text-[10px] text-emerald-400">Center: {ch.center}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleStepNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  <span>Proceed to RF Binding</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 font-mono">STEP 4: 2.4GHz FHSS FREQUENCY BINDING PROCEDURE</h4>
                <p className="text-slate-300 leading-relaxed">
                  1. Insert bind plug into B/VCC port of receiver and apply 5V power.<br />
                  2. Red LED flashes rapidly (waiting for transmitter handshake).<br />
                  3. Press and hold BIND key on transmitter while powering ON.<br />
                  4. Receiver LED turns solid; remove bind plug and cycle power.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
                  <span>RECEIVER LED STATUS:</span>
                  <span className={`font-bold ${isBound ? 'text-emerald-400' : isBinding ? 'text-amber-400 animate-pulse' : 'text-rose-400'}`}>
                    {isBound ? 'SOLID GREEN (BOUND)' : isBinding ? 'FLASHING FAST (BINDING)' : 'OFF / UNBOUND'}
                  </span>
                </div>
                <button
                  onClick={handleSimulateBind}
                  disabled={isBinding}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isBinding ? 'SYNCHRONIZING RF PACKETS...' : isBound ? 'RE-EXECUTE RF BIND' : 'START 2.4GHz BINDING SEQUENCE'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
