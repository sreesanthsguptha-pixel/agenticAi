import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import { PlayCircle, Clock, CheckCircle2, AlertCircle, RefreshCw, Pause, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function ExecutionsListPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/executions', { params: { status: statusFilter } });
      setExecutions(res.data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>;
      case 'FAILED':
        return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">FAILED</span>;
      case 'RUNNING':
        return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">RUNNING</span>;
      case 'PAUSED':
        return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">PAUSED</span>;
      default:
        return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Execution Audit Trail</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time status and agent timelines across all runs</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {['', 'COMPLETED', 'RUNNING', 'FAILED', 'PAUSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st || 'All Runs'}
                </button>
              ))}
            </div>
          </div>

          {/* Executions Table */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading execution runs...</div>
          ) : executions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-semibold text-slate-300">No execution runs found</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Execution ID</th>
                    <th className="px-6 py-4">Workflow</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Start Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {executions.map((run) => (
                    <tr
                      key={run._id || run.id}
                      onClick={() => router.push(`/executions/${run._id || run.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-indigo-400">
                        #{run._id ? run._id.toString().slice(-8) : run.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {run.workflowSnapshot?.name || 'Workflow Run'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                      <td className="px-6 py-4 font-mono">{run.duration || 0}s</td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {new Date(run.startTime || run.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-indigo-400 font-medium inline-flex items-center gap-1 hover:underline">
                          Inspect Timeline <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
