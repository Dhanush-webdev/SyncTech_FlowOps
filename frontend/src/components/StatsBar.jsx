import { CheckCircle2, AlertTriangle, Zap, Users } from 'lucide-react';

export default function StatsBar({ totalDelivered, totalDelayed, activeAgents, successRate }) {
  const stats = [
    { label: 'DELIVERED', value: totalDelivered, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    { label: 'DELAYED', value: totalDelayed, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
    { label: 'ACTIVE AGENTS', value: activeAgents, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { label: 'SUCCESS RATE', value: `${successRate}%`, icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3" data-testid="stats-bar">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex items-center gap-3 px-4 py-3 transition-colors duration-300"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon size={14} style={{ color: s.color }} className="flex-shrink-0" />
            <div>
              <div
                className="text-lg font-bold tabular-nums"
                style={{ fontFamily: 'var(--font-mono)', color: s.color, letterSpacing: '-0.03em' }}
              >
                {s.value}
              </div>
              <div className="text-[9px] font-bold tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
