import { useState, useEffect } from 'react';
import { Settings2, X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel({ node, onClose, onDelete }) {
  const { updateNodeConfig } = useWorkflowStore();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  if (!node) return null;

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    updateNodeConfig(node.id, updated);
  };

  const handleConfigChange = (cfgKey, value) => {
    const currentConfig = formData.config || {};
    const updatedConfig = { ...currentConfig, [cfgKey]: value };
    const updated = { ...formData, config: updatedConfig };
    setFormData(updated);
    updateNodeConfig(node.id, updated);
  };

  return (
    <div className="fixed sm:relative inset-x-0 bottom-0 sm:inset-auto z-30 w-full sm:w-80 max-h-[70vh] sm:max-h-none bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-800 p-5 flex flex-col h-auto sm:h-full overflow-y-auto shadow-2xl sm:shadow-none shrink-0">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Node Inspector</h3>
        </div>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button onClick={() => onDelete(node.id)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Node Title</label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {node.type === 'aiNode' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">LLM Model</label>
              <select
                value={formData.model || 'gpt-4o-mini'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Default)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="anthropic/claude-3-haiku">claude-3-haiku</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Prompt Template</label>
              <textarea
                rows={4}
                value={formData.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </>
        )}

        {node.type === 'actionNode' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Integration Provider</label>
              <input
                type="text"
                disabled
                value={formData.provider || ''}
                className="w-full bg-slate-800/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
              />
            </div>

            {formData.provider === 'gmail' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Recipient Email (To)</label>
                <input
                  type="email"
                  value={formData.config?.to || ''}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {formData.provider === 'slack' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Slack Channel</label>
                <input
                  type="text"
                  value={formData.config?.channel || '#general'}
                  onChange={(e) => handleConfigChange('channel', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {formData.provider === 'google-sheets' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={formData.config?.spreadsheetId || 'sheet_1'}
                  onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
