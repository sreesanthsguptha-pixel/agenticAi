import { Zap, Mail, MessageSquare, Bot, FileSpreadsheet, Cpu } from 'lucide-react';

export default function NodePalette({ onAddNode }) {
  const paletteItems = [
    {
      type: 'triggerNode',
      label: 'Manual Trigger',
      icon: Zap,
      category: 'Triggers',
      description: 'Start execution on-demand or schedule',
      data: { label: 'Manual Trigger', triggerType: 'manual' }
    },
    {
      type: 'aiNode',
      label: 'AI Summarizer / Processor',
      icon: Cpu,
      category: 'AI Agents',
      description: 'Run LLM prompt processing',
      data: { label: 'AI Processor', model: 'gpt-4o-mini', prompt: 'Process inputs' }
    },
    {
      type: 'actionNode',
      label: 'Gmail Send Email',
      icon: Mail,
      category: 'Integrations',
      description: 'Dispatch email via Gmail OAuth',
      data: { label: 'Gmail Send Email', provider: 'gmail', action: 'send_email', config: { to: 'ops@company.com' } }
    },
    {
      type: 'actionNode',
      label: 'Slack Post Message',
      icon: MessageSquare,
      category: 'Integrations',
      description: 'Post notification to Slack channel',
      data: { label: 'Slack Post Message', provider: 'slack', action: 'post_message', config: { channel: '#general' } }
    },
    {
      type: 'actionNode',
      label: 'Discord Bot Alert',
      icon: Bot,
      category: 'Integrations',
      description: 'Send bot message to Discord',
      data: { label: 'Discord Bot Alert', provider: 'discord', action: 'post_bot_message', config: { channelId: 'alerts' } }
    },
    {
      type: 'actionNode',
      label: 'Google Sheets Append',
      icon: FileSpreadsheet,
      category: 'Integrations',
      description: 'Append row to Google Spreadsheet',
      data: { label: 'Sheets Append Row', provider: 'google-sheets', action: 'append_row', config: { spreadsheetId: 'sheet_1' } }
    }
  ];

  const onDragStart = (event, nodeType, data) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full sm:w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col h-full overflow-y-auto shrink-0">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Node Catalog</h3>

      <div className="space-y-3">
        {paletteItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => onDragStart(e, item.type, item.data)}
              onClick={() => onAddNode && onAddNode(item.type, item.data)}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
