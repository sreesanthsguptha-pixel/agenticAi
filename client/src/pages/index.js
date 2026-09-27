import useRouter from 'next/router';
import { useRouter as useNextRouter } from 'next/router';
import { Bot, ArrowRight, Sparkles, Shield, Cpu, Zap, GitFork, Play } from 'lucide-react';

export default function LandingPage() {
  const router = useNextRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Agentflow AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Operations & Multi-Agent Orchestration
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Turn Natural Language into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Autonomous AI Workflows
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
          Agentflow AI lets operators describe complex business automations in plain English, visualize executable graphs,
          and run multi-agent chains with real-time Socket.IO timeline auditing and third-party integrations.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            Launch Console <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-base transition-all"
          >
            Operator Demo
          </button>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">5-Agent Chain</h3>
            <p className="mt-2 text-sm text-slate-400">
              Planner, Execution, Validation, Recovery, and Monitoring agents cooperate on every run.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">React Flow Canvas</h3>
            <p className="mt-2 text-sm text-slate-400">
              Interactive drag & drop node palette, side inspector, animated edges, and prompt generator.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">OAuth & Encryption</h3>
            <p className="mt-2 text-sm text-slate-400">
              AES-256 encrypted credentials at rest for Gmail, Slack, Discord, and Google Sheets.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
