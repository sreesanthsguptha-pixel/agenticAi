import { useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { Wand2, Save, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('Read incoming customer emails, summarize with AI, post alert to Slack, and append row to Google Sheets');
  const [loading, setLoading] = useState(false);
  const [generatedGraph, setGeneratedGraph] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/workflows/generate', { prompt });
      setGeneratedGraph(res.data.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedGraph) return;
    try {
      const res = await api.post('/workflows', generatedGraph);
      router.push(`/workflows/${res.data.data._id || res.data.data.id}`);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" /> AI Prompt-to-Workflow Generator
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Describe an operational process in natural language to construct an executable graph
              </p>
            </div>

            {generatedGraph && (
              <button
                onClick={handleSaveAndOpen}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> Open in Canvas Editor
              </button>
            )}
          </div>

          {/* Prompt Input Form */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Natural Language Prompt
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. When a high priority email arrives in Gmail, analyze invoice details with AI, send Slack notification, and append row to Google Sheets."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Supports OpenRouter, Google Gemini, and Rule-Engine fallbacks</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Synthesizing Graph...' : 'Generate Workflow'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Generated Canvas Preview */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[450px] relative">
            {generatedGraph ? (
              <WorkflowCanvas
                nodes={generatedGraph.nodes || []}
                edges={generatedGraph.edges || []}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Wand2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Graph preview will materialize here after submission</p>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
