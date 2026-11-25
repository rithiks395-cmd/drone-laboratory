import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Scene3D } from '../common/Scene3D';
import { FixedWingModel } from '../3d-models/FixedWingModel';
import { Save, Wrench, Eye, ShieldCheck, Search } from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  type: 'airframe' | 'propulsion' | 'avionics';
  installed: boolean;
  connectionInfo: string;
}

export const Exp2FixedWingAssembly: React.FC = () => {
  const { saveLabRecord, openInspection } = useLab();

  const [components, setComponents] = useState<ComponentItem[]>([
    { id: 'fuselage', name: 'Fuselage Main Pod', type: 'airframe', installed: true, connectionInfo: 'Central fuselage datum mounting carbon wing spar' },
    { id: 'leftWing', name: 'Left Main Wing & Aileron', type: 'airframe', installed: true, connectionInfo: 'Locks over 8mm carbon spar; connects CH1 Aileron servo lead' },
    { id: 'rightWing', name: 'Right Main Wing & Aileron', type: 'airframe', installed: true, connectionInfo: 'Locks over spar; connects CH5 Aileron servo lead' },
    { id: 'horizStab', name: 'Horizontal Stabilizer & Elevator', type: 'airframe', installed: true, connectionInfo: 'Epoxied to tail boom; connects CH2 Elevator pushrod' },
    { id: 'vertStab', name: 'Vertical Fin & Rudder', type: 'airframe', installed: true, connectionInfo: 'Aligned perpendicular to stabilizer; connects CH4 Rudder' },
    { id: 'motor', name: 'Brushless DC Motor', type: 'propulsion', installed: true, connectionInfo: 'Bolted to firewall with 2° right/down thrust offset' },
    { id: 'propeller', name: 'Carbon-Fibre Propeller', type: 'propulsion', installed: true, connectionInfo: 'Torqued with M6 bullet nut on 4mm motor shaft' },
    { id: 'esc', name: 'Electronic Speed Controller (ESC)', type: 'propulsion', installed: true, connectionInfo: '3x Bullet phases to motor; signal to FC Throttle CH3' },
    { id: 'flightController', name: 'Flight Controller', type: 'avionics', installed: true, connectionInfo: 'Damped silicone pads at CG; connects GPS and Pitot sensor' },
    { id: 'servos', name: 'Servo Motor', type: 'avionics', installed: true, connectionInfo: 'Pushrods with z-bends to control surface nylon horns' },
    { id: 'battery', name: 'LiPo Battery', type: 'avionics', installed: true, connectionInfo: 'Velcro strapped along longitudinal CG tray' },
  ]);

  const [explodedFactor, setExplodedFactor] = useState(0.2);
  const [selectedComp, setSelectedComp] = useState<ComponentItem>(components[0]);
  const [spinningMotor, setSpinningMotor] = useState(false);

  const toggleComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, installed: !c.installed } : c))
    );
  };

  const handleAssembleAll = () => {
    setComponents((prev) => prev.map((c) => ({ ...c, installed: true })));
    setExplodedFactor(0);
  };

  const handleExplodeAll = () => {
    setExplodedFactor(0.85);
  };

  const installedCount = components.filter((c) => c.installed).length;
  const isAssemblyComplete = installedCount === components.length && explodedFactor < 0.1;

  const handleSaveToRecord = () => {
    saveLabRecord({
      experimentId: 2,
      studentName: 'Student',
      rollNumber: 'UAV-001',
      date: new Date().toLocaleDateString(),
      observations: {
        totalComponents: components.length,
        assembledComponents: installedCount,
        assemblyStatus: isAssemblyComplete ? 'Completed & Airworthy' : 'Partial / Under Inspection',
        explodedInspectionFactor: `${Math.round(explodedFactor * 100)} %`,
      },
      calculations: {
        mechanicalLinkageSlop: '0.0 mm (Zero Play)',
        thrustLineOffset: '2.0 deg Down / 1.5 deg Right',
        airframeIntegrityCheck: 'Passed 100%',
      },
      resultSummary: 'Fixed-wing UAV airframe and avionics components assembled successfully in 3D. Control pushrods, motor firewall alignment, and wiring continuity were verified.',
    });
    alert('Fixed-Wing Assembly Report saved to Lab Record!');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            EXPERIMENT 02
          </span>
          <h2 className="text-lg font-bold text-white">Fixed-Wing UAV Frame & Avionics Assembly</h2>
          <p className="text-xs text-slate-400">
            Integrate aerodynamic airframe surfaces, pushrod linkages, and avionics bus with 3D exploded view inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAssembleAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-glow-blue"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Assemble All</span>
          </button>
          <button
            onClick={handleExplodeAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Exploded View</span>
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

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left 3D Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="h-[440px] w-full relative">
            <Scene3D cameraPosition={[3.2, 2.4, 3.2]} fov={45}>
              <FixedWingModel
                scale={1.3}
                explodedFactor={explodedFactor}
                spinning={spinningMotor}
                throttle={spinningMotor ? 40 : 0}
                highlightedComponent={selectedComp.name}
                onSelectComponent={(name) => {
                  const found = components.find((c) => c.name.includes(name) || name.includes(c.name));
                  if (found) setSelectedComp(found);
                  openInspection(name);
                }}
              />
            </Scene3D>

            {/* Exploded View Slider Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 flex items-center gap-4 text-xs">
              <span className="font-mono text-cyan-300 font-bold shrink-0">
                EXPLODED VIEW: {Math.round(explodedFactor * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <button
                onClick={() => setSpinningMotor(!spinningMotor)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  spinningMotor ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spinningMotor ? 'MOTOR RUNNING' : 'TEST PROP SPIN'}
              </button>
            </div>
          </div>

          {/* Component Details Card */}
          <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <span>INSPECTION: {selectedComp.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
                  {selectedComp.type}
                </span>
              </h4>
              <button
                onClick={() => openInspection(selectedComp.name)}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center gap-1 shadow-glow-cyan"
              >
                <Search className="w-3.5 h-3.5" />
                <span>3D Micro-Inspect</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Connection & Wiring Protocol:</strong> {selectedComp.connectionInfo}
            </p>
          </div>
        </div>

        {/* Right Component Library & Assembly Checklist (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">ASSEMBLY PROGRESS</span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {installedCount} / {components.length} Installed
            </span>
          </div>

          {/* Component List */}
          <div className="flex-1 p-3 bg-[#0f172a] border border-cyan-500/20 rounded-xl overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-2 uppercase">
              COMPONENT MANIFEST (CLICK TO INSPECT)
            </span>
            {components.map((comp) => {
              const isSelected = selectedComp.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    setSelectedComp(comp);
                    openInspection(comp.name);
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-200 shadow-glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium truncate flex items-center gap-1">
                      <span>{comp.name}</span>
                      <Search className="w-2.5 h-2.5 text-cyan-400 opacity-60" />
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">{comp.type}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComponent(comp.id);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      comp.installed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {comp.installed ? 'MOUNTED' : 'UNMOUNT'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
