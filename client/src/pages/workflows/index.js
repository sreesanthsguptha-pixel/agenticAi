import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import { GitFork, Plus, Search, Play, Copy, Trash2, Wand2, Tag } from 'lucide-react';
import api from '../../services/api';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, [search]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows', { params: { search } });
      setWorkflows(res.data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Custom Workflow',
        description: 'Created from scratch in workflow editor',
        nodes: [
          { id: 'node-1', type: 'triggerNode', position: { x: 100, y: 150 }, data: { label: 'Manual Trigger' } }
        ],
        edges: []
      });
      router.push(`/workflows/${res.data.data._id || res.data.data.id}`);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleExecute = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/execute`);
      router.push(`/executions/${res.data.data._id || res.data.data.id}`);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Workflows</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage and launch your agentic automation graphs</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/workflows/builder')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Wand2 className="w-4 h-4 text-indigo-400" /> Prompt Builder
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Create Workflow
              </button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search workflows by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <GitFork className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-semibold text-slate-300">No workflows found</p>
              <p className="text-xs text-slate-500 mt-1">Create one manually or generate via AI prompt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id || wf.id}
                  onClick={() => router.push(`/workflows/${wf._id || wf.id}`)}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 cursor-pointer shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        v{wf.version || 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {wf.nodes?.length || 0} Nodes
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{wf.description || 'No description provided.'}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => handleExecute(wf._id || wf.id, e)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" /> Execute
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDuplicate(wf._id || wf.id, e)}
                        title="Duplicate Workflow"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(wf._id || wf.id, e)}
                        title="Delete Workflow"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
