import React from 'react';
import { useLab } from '../../context/LabContext';
import { X, Download, Check } from 'lucide-react';

export const ScreenshotModal: React.FC = () => {
  const { capturedImage, setCapturedImage } = useLab();

  if (!capturedImage) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `uav_sim_output_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-4 flex flex-col shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-cyan-300 font-mono">SIMULATION OUTPUT SCREENSHOT CAPTURED</h3>
            <p className="text-xs text-slate-400">High-resolution virtual experiment workspace snapshot</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={() => setCapturedImage(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="my-4 rounded-xl overflow-hidden border border-slate-700 max-h-[70vh] flex items-center justify-center bg-black">
          <img src={capturedImage} alt="Sim Output" className="object-contain w-full max-h-[70vh]" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Format: PNG (Lossless 24-bit)</span>
          <button
            onClick={() => setCapturedImage(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
