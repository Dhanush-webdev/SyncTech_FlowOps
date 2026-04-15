const STATUS_CONFIG = {
  idle: { label: 'IDLE', dotColor: '#eab308', textColor: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.15)', cardBorder: 'var(--border-color)' },
  active: { label: 'ACTIVE', dotColor: '#10b981', textColor: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', cardBorder: 'rgba(16,185,129,0.15)' },
  stuck: { label: 'STUCK', dotColor: '#ef4444', textColor: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', cardBorder: 'rgba(239,68,68,0.2)' },
};

const ZONE_COLORS = {
  'Zone A': { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
  'Zone B': { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
  'Zone C': { bg: 'rgba(20,184,166,0.1)', color: '#2dd4bf' },
};

const INITIALS = { 'agent-1': 'RJ', 'agent-2': 'PR', 'agent-3': 'SR', 'agent-4': 'KV', 'agent-5': 'AR' };

export default function AgentStatus({ agents }) {
  return (
    <div className="flex flex-col h-full" data-testid="agent-status-panel">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
        >
          DELIVERY AGENTS
        </h2>
        <div className="flex items-center gap-3 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#10b981' }}>{agents.filter(a => a.status === 'active').length} active</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: '#eab308' }}>{agents.filter(a => a.status === 'idle').length} idle</span>
          {agents.filter(a => a.status === 'stuck').length > 0 && (
            <>
              <span style={{ color: 'var(--text-dim)' }}>|</span>
              <span style={{ color: '#ef4444' }}>{agents.filter(a => a.status === 'stuck').length} stuck</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {agents.map((agent) => {
          const cfg = STATUS_CONFIG[agent.status];
          const initials = INITIALS[agent.id] || agent.name.slice(0, 2).toUpperCase();
          const zc = ZONE_COLORS[agent.zone] || ZONE_COLORS['Zone A'];

          return (
            <div
              key={agent.id}
              className="p-3 transition-all duration-300"
              style={{ backgroundColor: 'var(--bg-surface-alt)', border: `1px solid ${cfg.cardBorder}` }}
              data-testid={`agent-card-${agent.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ fontFamily: 'var(--font-mono)', backgroundColor: zc.bg, color: zc.color, border: `1px solid ${zc.color}25` }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{agent.name}</span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 font-bold tracking-[0.1em]"
                      style={{ fontFamily: 'var(--font-mono)', backgroundColor: zc.bg, color: zc.color }}
                    >
                      {agent.zone}
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5 truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                    {agent.currentAction || `${agent.ordersCompleted} orders completed`}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 px-2 py-1 flex-shrink-0"
                  style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                  data-testid={`agent-status-badge-${agent.id}`}
                >
                  <span
                    className={`w-1.5 h-1.5 flex-shrink-0 ${agent.status !== 'idle' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: cfg.dotColor }}
                  />
                  <span className="text-[9px] font-bold tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)', color: cfg.textColor }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {agent.currentOrderId && (
                <div className="mt-2.5 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="text-[9px] font-bold tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>ORDER</span>
                  <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{agent.currentOrderId}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
