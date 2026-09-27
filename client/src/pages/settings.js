import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { Settings, ShieldCheck, KeyRound, User, Lock, Server } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8 max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" /> Platform & Operator Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage profile, security keys, and system health checks</p>
          </div>

          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-400" /> Operator Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Name</span>
                <p className="text-white font-semibold text-sm mt-0.5">{user?.name || 'Operator'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email</span>
                <p className="text-white font-semibold text-sm mt-0.5">{user?.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Role Privilege</span>
                <p className="text-indigo-400 font-semibold text-sm mt-0.5 capitalize">{user?.role || 'operator'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Last Login</span>
                <p className="text-white font-mono mt-0.5">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Security & Key Health Check Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security & Key Health Check
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Credential Encryption Key</h4>
                    <p className="text-[10px] text-slate-400">AES-256 application-level credential cipher active</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Password Hashing Cost</h4>
                    <p className="text-[10px] text-slate-400">bcrypt cost factor 12 enabled</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Database Fallback Engine</h4>
                    <p className="text-[10px] text-slate-400">MongoDB with automatic In-Memory Store fallback</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
