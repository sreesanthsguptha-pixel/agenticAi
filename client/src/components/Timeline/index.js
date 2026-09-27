import { CheckCircle2, AlertTriangle, AlertCircle, Info, Cpu, Play, Search, RefreshCw, Activity } from 'lucide-react';

export default function Timeline({ logs = [] }) {
  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return { label: 'Planner Agent', icon: Cpu, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'execution':
        return { label: 'Execution Agent', icon: Play, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'validation':
        return { label: 'Validation Agent', icon: Search, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'recovery':
        return { label: 'Recovery Agent', icon: RefreshCw, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'monitoring':
        return { label: 'Monitoring Agent', icon: Activity, bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      default:
        return { label: agent, icon: Info, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No execution timeline events logged yet. Trigger run to observe live agent events.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((item, idx) => {
        const agentInfo = getAgentBadge(item.agent);
        const Icon = agentInfo.icon;

        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-4 hover:border-slate-700/80 transition-all"
          >
            <div className={`p-2 rounded-lg border ${agentInfo.bg} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${agentInfo.bg}`}>
                  {agentInfo.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
              <p className="text-xs text-white font-medium">{item.message}</p>

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <pre className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-850 text-[10px] text-indigo-300 font-mono overflow-x-auto">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
