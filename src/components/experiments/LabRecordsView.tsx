import React from 'react';
import { useLab } from '../../context/LabContext';
import { EXPERIMENTS_LIST } from '../../utils/experimentsData';
import { BookOpen, FileText, Printer, CheckCircle2, Clock, Camera, Image, ChevronRight } from 'lucide-react';

export const LabRecordsView: React.FC = () => {
  const {
    experiments,
    labRecords,
    setSelectedReportExpId,
    setIsRecordModalOpen,
    studentName,
    rollNumber,
  } = useLab();

  const handleOpenReport = (expId: number) => {
    setSelectedReportExpId(expId);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col gap-5 p-6 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0f172a] border border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            ACADEMIC RECORD
          </span>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>University UAV Practical Laboratory Records</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              CURRICULUM SYLLABUS
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Student: <strong>{studentName}</strong> | Roll No: <strong>{rollNumber}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedReportExpId(1);
            setIsRecordModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Generate Complete Lab Record</span>
        </button>
      </div>

      {/* Experiment-wise Records Table */}
      <div className="p-4 bg-[#0f172a] border border-cyan-500/20 rounded-xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
          EXPERIMENT LOGBOOK & RECORD CERTIFICATION
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3">EXP #</th>
                <th className="py-2.5 px-3">Experiment Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Screenshot</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {EXPERIMENTS_LIST.map((exp) => {
                const currentStatus = experiments.find((e) => e.id === exp.id);
                const record = labRecords[exp.id];

                return (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">EXP 0{exp.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{exp.title}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{exp.aim}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{exp.category}</td>
                    <td className="py-3 px-3">
                      {currentStatus?.completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {record?.screenshotUrl ? (
                        <div className="w-12 h-8 rounded border border-cyan-500/40 overflow-hidden bg-black">
                          <img
                            src={record.screenshotUrl}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenReport(exp.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Lab Manual</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
