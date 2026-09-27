import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import MetricGrid from '../components/MetricGrid';
import { Wand2, GitFork, PlayCircle, ArrowRight, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8">
          {/* Header Action Banner */}
          <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Operations Console</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Describe an automation prompt or build workflows on the React Flow canvas to launch 5-agent orchestration chains.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => router.push('/workflows/builder')}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Wand2 className="w-4 h-4" /> Generate AI Workflow
              </button>
              <button
                onClick={() => router.push('/workflows')}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <GitFork className="w-4 h-4" /> Workflows
              </button>
            </div>
          </div>

          {/* Metric Grid */}
          <MetricGrid stats={stats} />

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Executions Panel */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">Recent Execution Runs</h3>
                </div>
                <button
                  onClick={() => router.push('/executions')}
                  className="text-xs text-indigo-400 hover:underline font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {loading ? (
                <div className="py-8 text-center text-slate-500">Loading runs...</div>
              ) : !stats?.recentExecutions || stats.recentExecutions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No executions recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {stats.recentExecutions.map((run) => (
                    <div
                      key={run._id || run.id}
                      onClick={() => router.push(`/executions/${run._id || run.id}`)}
                      className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {run.status === 'COMPLETED' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : run.status === 'FAILED' ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                        )}
                        <div>
                          <h4 className="text-xs font-semibold text-white">
                            Execution #{run._id ? run._id.toString().slice(-6) : run.id}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(run.startTime || run.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : run.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{run.duration || 0}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Agent Status Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Agent Pipeline Status</h3>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Planner Agent', desc: 'Topological sorter & graph planner', status: 'Online' },
                  { name: 'Execution Agent', desc: 'Integration & AI task runner', status: 'Online' },
                  { name: 'Validation Agent', desc: 'Output schema verifier', status: 'Online' },
                  { name: 'Recovery Agent', desc: 'Error classifier & backoff handler', status: 'Online' },
                  { name: 'Monitoring Agent', desc: 'Socket.IO timeline logger', status: 'Online' }
                ].map((agent, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400">{agent.desc}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
