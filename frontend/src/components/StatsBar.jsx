import { CheckCircle2, AlertTriangle, Zap, Users } from 'lucide-react';

export default function StatsBar({ totalDelivered, totalDelayed, activeAgents, successRate }) {
  const stats = [
    {
      label: 'Delivered',
      value: totalDelivered,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'border-emerald-400/15',
      bg: 'rgba(16,185,129,0.06)',
    },
    {
      label: 'Delayed',
      value: totalDelayed,
      icon: AlertTriangle,
      color: 'text-red-400',
      border: 'border-red-400/15',
      bg: 'rgba(239,68,68,0.06)',
    },
    {
      label: 'Active Agents',
      value: activeAgents,
      icon: Users,
      color: 'text-blue-400',
      border: 'border-blue-400/15',
      bg: 'rgba(59,130,246,0.06)',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-400/15',
      bg: 'rgba(245,158,11,0.06)',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3" data-testid="stats-bar">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stat.border}`}
            style={{ backgroundColor: stat.bg }}
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon size={14} className={`${stat.color} flex-shrink-0`} />
            <div>
              <div className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] leading-tight" style={{ color: '#444' }}>{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
