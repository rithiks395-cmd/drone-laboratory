import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  ArrowRight, 
  X, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'login' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
}) => {
  const { loginStudent, loginAdmin, registerStudent } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'admin'>(initialTab);

  // Sync tab whenever modal opens with a specific requested initialTab
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  // Student Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state (only username, email id, password as requested!)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Admin Login state (admin types their username and password directly)
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Error/Success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginStudent(loginEmail, loginPassword);
    if (res.success) {
      setSuccessMessage('Login successful! Entering lab workspace...');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMessage(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all required fields (Username, Email ID, Password).');
      return;
    }
    const res = registerStudent(regName, regEmail, regPassword);
    if (res.success) {
      setSuccessMessage('Account created successfully! Please sign in with your email ID and password.');
      setLoginEmail(regEmail);
      setLoginPassword('');
      // Do not enter automatically - redirect to login tab so user logs in with created credentials!
      setTimeout(() => {
        setSuccessMessage('Please enter your password to sign in:');
        setTab('login');
      }, 1000);
    } else {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginAdmin(adminUser, adminPassword);
    if (res.success) {
      setSuccessMessage(`Welcome Administrator ${adminUser}! Access granted.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMessage(res.message || 'Admin authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full rounded-2xl bg-gradient-to-br from-[#0c142c] via-[#080e22] to-[#040816] border-2 border-cyan-400 p-6 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.6)] text-slate-100 overflow-hidden">
        
        {/* Holographic animated scanline */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AEROSPACE AUTHENTICATION PORTAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {tab === 'login' && 'Student Account Login'}
            {tab === 'register' && 'Create Free Account'}
            {tab === 'admin' && 'Official Admin Access'}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {tab === 'admin'
              ? 'Institutional Administrator Credential Verification'
              : 'Secure individuality: your experiments and records saved to your account'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono mb-5">
          <button
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setTab('admin');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'admin'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            Admin 👑
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: STUDENT LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">Email ID or Username / Roll No:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. vasanth@psg.edu or PSG-AERO-042"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">Account Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black tracking-wider shadow-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>SIGN IN TO LABORATORY</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER (CREATE ACCOUNT - ONLY USERNAME, EMAIL, PASSWORD) */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">Username *:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter your chosen username"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">Email ID *:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">Password *:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter a secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        )}

        {/* TAB 3: ADMIN ACCESS (ADMIN LOGS IN THEMSELVES DIRECTLY) */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">Administrator Username:</label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter your administrator username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">Master Password:</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>LOGIN AS ADMINISTRATOR</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
