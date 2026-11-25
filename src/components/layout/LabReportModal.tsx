import React from 'react';
import { useLab } from '../../context/LabContext';
import { EXPERIMENTS_LIST } from '../../utils/experimentsData';
import { X, Printer, Download, Award, CheckCircle, FileText } from 'lucide-react';

export const LabReportModal: React.FC = () => {
  const {
    isRecordModalOpen,
    setIsRecordModalOpen,
    selectedReportExpId,
    setSelectedReportExpId,
    labRecords,
    studentName,
    rollNumber,
    markCompleted,
  } = useLab();

  if (!isRecordModalOpen) return null;

  const exp = EXPERIMENTS_LIST.find((e) => e.id === selectedReportExpId) || EXPERIMENTS_LIST[0];
  const record = labRecords[selectedReportExpId];

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndCertify = () => {
    markCompleted(selectedReportExpId, 100);
    alert(`Experiment ${selectedReportExpId} marked as completed in practical record!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>LABORATORY RECORD GENERATOR</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                  EXP #{exp.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official UAV Engineering Practical Experiment Manual & Record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Experiment selector dropdown */}
            <select
              value={selectedReportExpId}
              onChange={(e) => setSelectedReportExpId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {EXPERIMENTS_LIST.map((e) => (
                <option key={e.id} value={e.id}>
                  EXP {e.id}: {e.shortTitle}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Lab Document Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm print:p-0 print:text-black print:bg-white custom-scrollbar">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-700 pb-4 space-y-1">
            <h2 className="text-xl font-bold tracking-wider text-cyan-400 uppercase print:text-black">
              Department of Aeronautical & Aerospace Engineering
            </h2>
            <h3 className="text-sm font-semibold tracking-wide text-slate-300 print:text-gray-800">
              UNMANNED AERIAL VEHICLE (UAV) VIRTUAL LABORATORY MANUAL
            </h3>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 mt-2 font-mono print:text-gray-600">
              <span><strong>STUDENT:</strong> {studentName}</span>
              <span><strong>ROLL NO:</strong> {rollNumber}</span>
              <span><strong>DATE:</strong> {record?.date || new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Title & Aim */}
          <div>
            <h4 className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-1">
              EXPERIMENT NO. {exp.id}: {exp.title}
            </h4>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
              <strong>AIM:</strong> {exp.aim}
            </div>
          </div>

          {/* Software & Virtual Hardware */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
              <strong className="text-cyan-300 block mb-1">1. SOFTWARE REQUIRED:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {exp.softwareRequired.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
              <strong className="text-cyan-300 block mb-1">2. COMPONENTS & APPARATUS USED:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {exp.componentsUsed.slice(0, 5).map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Theory */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
            <strong className="text-cyan-300 block mb-1">3. THEORY & GOVERNING EQUATIONS:</strong>
            <p>{exp.theory}</p>
          </div>

          {/* Procedure */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
            <strong className="text-cyan-300 block mb-1">4. EXPERIMENTAL PROCEDURE:</strong>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              {exp.procedure.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Observations and Calculations Table */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs">
            <strong className="text-cyan-300 block mb-2">5. SIMULATION OBSERVATIONS & CALCULATED PARAMETERS:</strong>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-700">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="border border-slate-700 px-3 py-1.5">S.No</th>
                    <th className="border border-slate-700 px-3 py-1.5">Parameter / Variable</th>
                    <th className="border border-slate-700 px-3 py-1.5">Simulated Value</th>
                    <th className="border border-slate-700 px-3 py-1.5">Engineering Units</th>
                    <th className="border border-slate-700 px-3 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr>
                    <td className="border border-slate-700 px-3 py-1">1</td>
                    <td className="border border-slate-700 px-3 py-1">Primary Simulation Test State</td>
                    <td className="border border-slate-700 px-3 py-1 text-cyan-300">Calibrated Baseline</td>
                    <td className="border border-slate-700 px-3 py-1">-</td>
                    <td className="border border-slate-700 px-3 py-1 text-emerald-400">Verified</td>
                  </tr>
                  {record?.observations &&
                    Object.entries(record.observations).map(([key, val], idx) => (
                      <tr key={key}>
                        <td className="border border-slate-700 px-3 py-1">{idx + 2}</td>
                        <td className="border border-slate-700 px-3 py-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="border border-slate-700 px-3 py-1 text-cyan-300">{String(val)}</td>
                        <td className="border border-slate-700 px-3 py-1">Metric</td>
                        <td className="border border-slate-700 px-3 py-1 text-emerald-400">Recorded</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Captured Screenshot Preview (if captured) */}
          {record?.screenshotUrl && (
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs">
              <strong className="text-cyan-300 block mb-2">6. CAPTURED SIMULATION OUTPUT SCREEN:</strong>
              <div className="rounded-lg overflow-hidden border border-cyan-500/30">
                <img
                  src={record.screenshotUrl}
                  alt={`EXP ${exp.id} Simulation Output`}
                  className="w-full object-contain max-h-72 bg-black"
                />
              </div>
            </div>
          )}

          {/* Result */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-slate-300">
            <strong className="text-emerald-400 block mb-1">7. RESULT:</strong>
            <p>
              The simulation experiment on <strong>{exp.title}</strong> was successfully performed in the UAV Virtual Laboratory. All analytical calculations, 3D kinematics, and simulated telemetry observations were recorded and verified within acceptable aerodynamic tolerance.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 rounded-b-2xl">
          <div className="text-xs text-slate-400 font-mono">
            UAV Virtual Lab • University Syllabus Compliant
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndCertify}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Exp as Completed</span>
            </button>
            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
