import { GitFork, PlayCircle, Activity, CheckCircle2 } from 'lucide-react';

export default function MetricGrid({ stats }) {
  const metrics = [
    {
      title: 'Total Workflows',
      value: stats?.totalWorkflows || 0,
      icon: GitFork,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      title: 'Active Workflows',
      value: stats?.activeWorkflows || 0,
      icon: Activity,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Total Executions',
      value: stats?.totalExecutions || 0,
      icon: PlayCircle,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Agent Success Rate',
      value: `${stats?.successRate || 100}%`,
      icon: CheckCircle2,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex items-center justify-between hover:border-slate-700/80 transition-all"
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{m.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{m.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} border flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
