import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import Timeline from '../../components/Timeline';
import { Save, Play, GitFork, ArrowLeft, Terminal } from 'lucide-react';
import api from '../../services/api';
import { useWorkflowStore } from '../../store/workflowStore';
import { subscribeToExecution } from '../../services/socket';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { activeWorkflow, setActiveWorkflow, executionLogs, addExecutionLog } = useWorkflowStore();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const res = await api.get(`/workflows/${id}`);
      const wf = res.data.data;
      setActiveWorkflow(wf);
      setWorkflowName(wf.name);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const handleAddNode = (type, data) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/workflows/${id}`, {
        name: workflowName,
        nodes,
        edges
      });
      setActiveWorkflow(res.data.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setShowLogs(true);
    try {
      const res = await api.post(`/workflows/${id}/execute`);
      const executionId = res.data.data._id || res.data.data.id;

      // Subscribe to real-time Socket.IO execution events
      const unsubscribe = subscribeToExecution(executionId, (eventPayload) => {
        addExecutionLog(eventPayload);
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-full flex flex-col">
          {/* Top Canvas Toolbar */}
          <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/workflows')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-sm sm:text-base font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1 max-w-[140px] sm:max-w-xs truncate"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  showLogs ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Real-time</span> Logs
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> {executing ? 'Running...' : 'Execute'}
              </button>
            </div>
          </div>

          {/* Main Work Area: Palette + Canvas + Inspector Panel */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950 relative border border-slate-800">
            <div className="hidden md:block">
              <NodePalette onAddNode={handleAddNode} />
            </div>

            <div className="flex-1 h-full relative min-h-[350px]">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            </div>

            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onDelete={handleDeleteNode}
              />
            )}
          </div>

          {/* Bottom Live Execution Timeline Drawer */}
          {showLogs && (
            <div className="h-64 bg-slate-900 border-t border-slate-800 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Live Socket.IO Execution Events
                </h4>
                <button onClick={() => setShowLogs(false)} className="text-xs text-slate-400 hover:text-white">
                  Close Drawer
                </button>
              </div>
              <Timeline logs={executionLogs} />
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
