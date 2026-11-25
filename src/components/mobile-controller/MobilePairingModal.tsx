import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Radio, 
  Copy, 
  Check, 
  Wifi, 
  Info, 
  Settings2, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface MobilePairingModalProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
  isPhoneConnected: boolean;
}

export const MobilePairingModal: React.FC<MobilePairingModalProps> = ({
  roomCode,
  isOpen,
  onClose,
  isPhoneConnected,
}) => {
  // Determine initial host IP
  const getInitialHost = () => {
    const hostname = window.location.hostname;
    // If hosted on a public domain (e.g. Vercel, Netlify, custom domain)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
      return hostname;
    }

    const saved = localStorage.getItem('uav_laptop_wifi_ip');
    if (saved && saved !== '192.168.1.3') return saved;

    // If opened on localhost, default to the laptop's live Wi-Fi IP (10.223.59.30)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || !hostname) {
      return '10.223.59.30';
    }
    return hostname;
  };

  const isPublicDomain = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' && 
    !window.location.hostname.startsWith('192.168.') && 
    !window.location.hostname.startsWith('10.');

  const [hostIp, setHostIp] = useState<string>(getInitialHost);
  const [port, setPort] = useState<string>(window.location.port || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Compute full controller URL for the smartphone
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const portStr = port && port !== '80' && port !== '443' ? `:${port}` : '';
  const controllerUrl = isPublicDomain 
    ? `${window.location.origin}/?mode=controller&room=${roomCode}`
    : `${protocol}//${hostIp}${portStr}/?mode=controller&room=${roomCode}`;

  // Save IP to localStorage when updated
  const handleIpChange = (newIp: string) => {
    setHostIp(newIp);
    localStorage.setItem('uav_laptop_wifi_ip', newIp);
  };

  useEffect(() => {
    if (isOpen && controllerUrl) {
      QRCode.toDataURL(controllerUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#00f0ff',
          light: '#070b16',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error', err));
    }
  }, [isOpen, controllerUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(controllerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-[#0b1122] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 flex flex-col shadow-2xl text-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>CONNECT PHONE JOYSTICK</span>
                {isPhoneConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" /> PAIRED
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Hold phone horizontally as a dual-joystick RC flight controller
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pairing Body */}
        <div className="my-4 flex flex-col items-center gap-3.5 text-center">
          {/* Status Message */}
          {isPhoneConnected ? (
            <div className="w-full p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 shadow-glow-cyan animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>PHONE CONNECTED & STREAMING!</strong> Use the virtual gimbals on your phone to fly the 3D drone on this screen.
              </span>
            </div>
          ) : (
            <div className="w-full p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-mono flex items-center gap-2 text-left">
              <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                1. Connect phone to the <strong>same Wi-Fi</strong> as your laptop.
                <br />
                2. Scan the QR code with your mobile camera.
              </span>
            </div>
          )}

          {/* QR Code Container */}
          <div className="p-3.5 rounded-2xl bg-[#070b16] border-2 border-cyan-500/50 shadow-glow-cyan flex flex-col items-center justify-center relative group">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Pairing QR Code"
                className="w-52 h-52 sm:w-56 sm:h-56 rounded-xl object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-500 font-mono text-xs">
                Generating QR Code...
              </div>
            )}
            <div className="mt-2 text-[10px] font-mono text-cyan-300/80">
              Scan with Phone Camera or Chrome/Safari
            </div>
          </div>

          {/* URL & PIN Info Box */}
          <div className="w-full flex flex-col gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">PHONE BROWSER URL:</span>
              <span className="text-[11px] text-cyan-400 font-bold">PIN: {roomCode}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#060911] px-3 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-300 overflow-x-auto select-all">
              <span className="truncate">{controllerUrl}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-mono transition-colors active:scale-95 shadow-glow-cyan"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Controller Link'}</span>
              </button>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                title="Change Laptop Wi-Fi IP address"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Change IP</span>
              </button>
            </div>
          </div>

          {/* Advanced / IP Config Section (Fixes "Site cannot be reached") */}
          {showAdvanced && (
            <div className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-left flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Why did phone say "Site cannot be reached"?</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Your phone cannot open <code>localhost</code> because on a phone, localhost is the phone itself! To reach your laptop, your phone needs your laptop's actual <strong>Wi-Fi IPv4 address</strong> on the local network.
              </p>

              <div className="flex flex-col gap-1 text-xs font-mono">
                <label className="text-slate-300">Laptop Wi-Fi IPv4 Address:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hostIp}
                    onChange={(e) => handleIpChange(e.target.value.trim())}
                    placeholder="192.168.1.3"
                    className="flex-1 bg-slate-900 border border-cyan-500/40 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value.trim())}
                    placeholder="5173"
                    className="w-20 bg-slate-900 border border-cyan-500/40 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                <span className="text-slate-400">Presets:</span>
                <button
                  onClick={() => handleIpChange('10.223.59.30')}
                  className="px-2 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-400 font-bold"
                >
                  10.223.59.30 (Active Wi-Fi)
                </button>
                <button
                  onClick={() => handleIpChange('192.168.1.3')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  192.168.1.3
                </button>
                <button
                  onClick={() => handleIpChange('192.168.56.1')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  192.168.56.1
                </button>
                <button
                  onClick={() => handleIpChange(window.location.hostname)}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  Current ({window.location.hostname})
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                Tip: In Windows, open Command Prompt and type <code>ipconfig</code> to see your IPv4 address under "Wireless LAN adapter Wi-Fi".
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>P2P Flight Telemetry Link</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-glow-cyan transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
