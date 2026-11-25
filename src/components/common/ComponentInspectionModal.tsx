import React, { useState } from 'react';
import { COMPONENT_SPECS, ComponentSpec } from '../../utils/componentSpecs';
import { Scene3D } from './Scene3D';
import { BLDCMotorModel } from '../3d-models/BLDCMotorModel';
import { ESCModel } from '../3d-models/ESCModel';
import { PropellerModel } from '../3d-models/PropellerModel';
import { LiPoBatteryModel } from '../3d-models/LiPoBatteryModel';
import { FlightControllerModel } from '../3d-models/FlightControllerModel';
import { GPSModuleModel } from '../3d-models/GPSModuleModel';
import { ServoMotorModel } from '../3d-models/ServoMotorModel';
import { X, Layers, Wrench, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

interface ComponentInspectionModalProps {
  componentName: string | null;
  onClose: () => void;
  onSelectComponent: (name: string) => void;
}

export const ComponentInspectionModal: React.FC<ComponentInspectionModalProps> = ({
  componentName,
  onClose,
  onSelectComponent,
}) => {
  if (!componentName) return null;

  // Resolve specification data
  const specKey = Object.keys(COMPONENT_SPECS).find(
    (k) => k.toLowerCase() === componentName.toLowerCase() || componentName.includes(k) || k.includes(componentName)
  ) || 'Brushless DC Motor';

  const spec: ComponentSpec = COMPONENT_SPECS[specKey] || COMPONENT_SPECS['Brushless DC Motor'];

  const [subExploded, setSubExploded] = useState(false);
  const [spinMotor, setSpinMotor] = useState(false);

  // Render the specific 3D model for isolation inspection
  const renderIsolated3DModel = () => {
    switch (spec.id) {
      case 'bldc-motor':
        return (
          <BLDCMotorModel
            scale={2.2}
            spinning={spinMotor}
            rpm={spinMotor ? 3600 : 0}
            exploded={subExploded}
          />
        );
      case 'esc':
        return <ESCModel scale={1.8} />;
      case 'propeller':
        return <PropellerModel scale={1.8} diameterInches={10} blades={2} spinning={spinMotor} rpm={spinMotor ? 2400 : 0} />;
      case 'lipo-battery':
        return <LiPoBatteryModel scale={1.7} cells={4} capacityMah={3300} />;
      case 'flight-controller':
        return <FlightControllerModel scale={2.4} />;
      case 'gps-module':
        return <GPSModuleModel scale={1.8} />;
      case 'servo-motor':
        return <ServoMotorModel scale={2.4} angle={spinMotor ? Math.sin(Date.now() * 0.005) * 0.5 : 0} />;
      default:
        return <BLDCMotorModel scale={2.2} spinning={spinMotor} rpm={spinMotor ? 3600 : 0} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#090e1a] border border-cyan-500/40 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">{spec.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase border border-blue-400/30">
                  {spec.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Aerospace Hardware Micro-Inspection & Engineering Specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switcher Dropdown */}
            <select
              value={specKey}
              onChange={(e) => onSelectComponent(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
            >
              {Object.keys(COMPONENT_SPECS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left 3D Isolated Canvas + Right Engineering Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto custom-scrollbar p-6 gap-6">
          {/* Left 3D Isolated Viewport (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="h-[380px] w-full relative">
              <Scene3D cameraPosition={[2.2, 1.8, 2.2]} fov={40}>
                {renderIsolated3DModel()}
              </Scene3D>

              {/* Sub-Explode and Spin Control Pills */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                <div className="flex gap-2">
                  {spec.id === 'bldc-motor' && (
                    <button
                      onClick={() => setSubExploded(!subExploded)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        subExploded
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
                      }`}
                    >
                      {subExploded ? 'ASSEMBLE MOTOR' : 'EXPLODE STATOR / ROTOR'}
                    </button>
                  )}
                  {(spec.id === 'bldc-motor' || spec.id === 'propeller' || spec.id === 'servo-motor') && (
                    <button
                      onClick={() => setSpinMotor(!spinMotor)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        spinMotor
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {spinMotor ? 'STOP ROTATION' : 'TEST ROTATION'}
                    </button>
                  )}
                </div>
                <div className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[10px] text-cyan-400">
                  360° ORBIT ENABLED
                </div>
              </div>
            </div>

            {/* Purpose & Working Principle Cards */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs leading-relaxed">
              <h4 className="text-cyan-300 font-bold uppercase font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> PURPOSE IN UAV ARCHITECTURE
              </h4>
              <p className="text-slate-300">{spec.purpose}</p>

              <h4 className="text-cyan-300 font-bold uppercase font-mono flex items-center gap-1.5 pt-2">
                <Zap className="w-4 h-4 text-amber-400" /> WORKING PRINCIPLE & ENGINEERING SCIENCE
              </h4>
              <p className="text-slate-400">{spec.workingPrinciple}</p>
            </div>
          </div>

          {/* Right Engineering Specs & Wiring Pinout (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Technical Specifications Table */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                <span>TECHNICAL SPECIFICATIONS SHEET</span>
                <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001 TOLERANCE VERIFIED
                </span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">MASS / WEIGHT:</span>
                  <span className="text-white font-bold">{spec.specs.weightGrams} grams</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">PHYSICAL DIMENSIONS:</span>
                  <span className="text-cyan-300 font-bold">{spec.specs.dimensionsMm}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">OPERATING VOLTAGE:</span>
                  <span className="text-emerald-400 font-bold">{spec.specs.operatingVoltage}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">MAX CURRENT / POWER:</span>
                  <span className="text-amber-400 font-bold">{spec.specs.maxCurrentOrPower}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">MANUFACTURING MATERIALS:</span>
                  <span className="text-slate-200 text-right max-w-xs">{spec.specs.material}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">INTERFACE PROTOCOL:</span>
                  <span className="text-cyan-300 text-right max-w-xs">{spec.specs.interfaceProtocol}</span>
                </div>
              </div>
            </div>

            {/* Electrical Pinout & Wiring Connections */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
              <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>ELECTRICAL PINOUT & WIRING PROTOCOL</span>
              </h4>
              <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                {spec.wiringPins.map((pin, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950/80 border border-cyan-900/40 text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">[{idx + 1}]</span>
                    <span>{pin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="text-xs font-mono text-slate-400">
            Component: <strong>{spec.name}</strong> • UAV Aerospace Engineering Virtual Lab
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
