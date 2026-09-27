import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import Timeline from '../../components/Timeline';
import { PlayCircle, Pause, Play, XCircle, ArrowLeft, Clock, ShieldCheck, Activity } from 'lucide-react';
import api from '../../services/api';
import { subscribeToExecution } from '../../services/socket';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExecutionDetails();
      fetchTimelineLogs();

      const unsubscribe = subscribeToExecution(id, (newEvent) => {
        setTimelineLogs((prev) => [...prev, newEvent]);
        if (newEvent.agent === 'monitoring') {
          fetchExecutionDetails();
        }
      });

      return () => unsubscribe();
    }
  }, [id]);

  const fetchExecutionDetails = async () => {
    try {
      const res = await api.get(`/executions/${id}`);
      setExecution(res.data.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineLogs = async () => {
    try {
      const res = await api.get(`/executions/${id}/timeline`);
      setTimelineLogs(res.data.data || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handlePause = async () => {
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleResume = async () => {
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="py-12 text-center text-slate-500">Loading execution details...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/executions')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Execution Run #{id?.slice(-8)}
                </h1>
                <p className="text-xs text-slate-400">
                  {execution?.workflowSnapshot?.name || 'Workflow Execution'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}

              {(execution?.status === 'RUNNING' || execution?.status === 'PAUSED') && (
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Status Metadata Banner */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
              <p className="text-sm font-bold text-white mt-0.5">{execution?.status}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
              <p className="text-sm font-bold text-white mt-0.5">{execution?.duration || 0}s</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Retry Attempts</span>
              <p className="text-sm font-bold text-white mt-0.5">{execution?.retryCount || 0}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Step</span>
              <p className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                {execution?.currentNode || 'Done'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Live Agentic Event Timeline
            </h3>
            <Timeline logs={timelineLogs} />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
