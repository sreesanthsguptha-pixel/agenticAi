import { useState } from 'react';
import { useRouter } from 'next/router';
import { Bot, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('operator@agentflow.ai');
  const [password, setPassword] = useState('operator123');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleDemoFill = () => {
    setEmail('operator@agentflow.ai');
    setPassword('operator123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Operator Login</h2>
          <p className="text-xs text-slate-400 mt-1">Access Agentflow AI Operations Console</p>
        </div>

        {(localError || error) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="operator@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-3 text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-xs font-medium text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Fill Demo Credentials
          </button>

          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button onClick={() => router.push('/register')} className="text-indigo-400 hover:underline font-medium">
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
