import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  X, 
  Activity, 
  FileText, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminPortalModal: React.FC = () => {
  const { 
    currentUser, 
    isAdmin, 
    users, 
    removeStudent, 
    addStudentByAdmin, 
    isAdminPortalOpen, 
    setIsAdminPortalOpen 
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Aeronautical Engineering');

  if (!isAdminPortalOpen || !isAdmin) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    addStudentByAdmin(newStudentName, newStudentEmail, newStudentRoll, newStudentDept);
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentRoll('');
    setShowAddForm(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-br from-[#0c142c] via-[#080e22] to-[#040816] border-2 border-amber-400 p-6 shadow-[0_0_70px_rgba(245,158,11,0.5)] text-slate-100 overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <span>AEROSPACE LAB ADMINISTRATOR PORTAL</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400 font-mono font-bold">
                    HOD / DIRECTOR VIEW
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Logged in as: <strong className="text-amber-300">{currentUser?.name}</strong> • Monitor registered students, permissions & syllabus completions
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminPortalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0 font-mono text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student by name, email or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Close Form' : 'Enroll New Student'}</span>
            </button>
          </div>
        </div>

        {/* Add Student Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="mb-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono shrink-0 animate-in fade-in">
            <div>
              <label className="block text-slate-400 mb-1">Student Full Name *:</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Email Address *:</label>
              <input
                type="email"
                required
                placeholder="Email"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Roll / Register No:</label>
              <input
                type="text"
                placeholder="Roll No"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
              >
                + Add Student
              </button>
            </div>
          </form>
        )}

        {/* Registered Users Table */}
        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-3">User / Student</th>
                <th className="p-3">Roll No & Dept</th>
                <th className="p-3">Role</th>
                <th className="p-3">Last Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No users found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {user.role === 'admin' ? (
                          <span className="text-amber-400">👑</span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                        <span>{user.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="p-3">
                      <div className="text-cyan-300 font-bold">{user.rollNumber}</div>
                      <div className="text-[10px] text-slate-400">{user.department}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(user.lastActive).toLocaleDateString()} {new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-3 text-right">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove student "${user.name}"?`)) {
                              removeStudent(user.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0 mt-3">
          <span>Total Registered Users: <strong>{users.length}</strong> ({users.filter(u => u.role === 'student').length} Students)</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Database Sync Active
          </span>
        </div>
      </div>
    </div>
  );
};
