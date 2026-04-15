const STATUS_CONFIG = {
  idle: {
    label: 'Idle',
    dotColor: '#eab308',
    dotPulse: false,
    textColor: '#eab308',
    badgeBg: 'rgba(234,179,8,0.1)',
    badgeBorder: 'rgba(234,179,8,0.2)',
    cardBorder: '#222',
  },
  active: {
    label: 'Active',
    dotColor: '#10b981',
    dotPulse: true,
    textColor: '#10b981',
    badgeBg: 'rgba(16,185,129,0.1)',
    badgeBorder: 'rgba(16,185,129,0.25)',
    cardBorder: 'rgba(16,185,129,0.2)',
  },
  stuck: {
    label: 'Stuck',
    dotColor: '#ef4444',
    dotPulse: true,
    textColor: '#ef4444',
    badgeBg: 'rgba(239,68,68,0.1)',
    badgeBorder: 'rgba(239,68,68,0.25)',
    cardBorder: 'rgba(239,68,68,0.25)',
  },
};

const ZONE_BG = {
  'Zone A': 'rgba(59,130,246,0.1)',
  'Zone B': 'rgba(245,158,11,0.1)',
  'Zone C': 'rgba(20,184,166,0.1)',
};
const ZONE_COLOR = {
  'Zone A': '#60a5fa',
  'Zone B': '#fbbf24',
  'Zone C': '#2dd4bf',
};

const INITIALS = {
  'agent-1': 'RJ', 'agent-2': 'PR', 'agent-3': 'SR', 'agent-4': 'KV', 'agent-5': 'AR',
};

export default function AgentStatus({ agents }) {
  return (
    <div className="flex flex-col h-full" data-testid="agent-status-panel">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#555' }}>Delivery Agents</h2>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: '#444' }}>
          <span style={{ color: '#10b981' }}>{agents.filter(a => a.status === 'active').length} active</span>
          <span>·</span>
          <span style={{ color: '#eab308' }}>{agents.filter(a => a.status === 'idle').length} idle</span>
          {agents.filter(a => a.status === 'stuck').length > 0 && (
            <>
              <span>·</span>
              <span style={{ color: '#ef4444' }}>{agents.filter(a => a.status === 'stuck').length} stuck</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {agents.map((agent) => {
          const cfg = STATUS_CONFIG[agent.status];
          const initials = INITIALS[agent.id] || agent.name.slice(0, 2).toUpperCase();

          return (
            <div
              key={agent.id}
              className="rounded-xl p-3.5 transition-all duration-300"
              style={{
                backgroundColor: '#161616',
                border: `1px solid ${cfg.cardBorder}`,
              }}
              data-testid={`agent-card-${agent.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{
                    backgroundColor: ZONE_BG[agent.zone],
                    color: ZONE_COLOR[agent.zone],
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{agent.name}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: ZONE_BG[agent.zone],
                        color: ZONE_COLOR[agent.zone],
                      }}
                    >
                      {agent.zone}
                    </span>
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: '#555' }}>
                    {agent.currentAction
                      ? agent.currentAction
                      : `${agent.ordersCompleted} orders completed`}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: cfg.badgeBg,
                    border: `1px solid ${cfg.badgeBorder}`,
                  }}
                  data-testid={`agent-status-badge-${agent.id}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotPulse ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: cfg.dotColor }}
                  />
                  <span className="text-[10px] font-semibold" style={{ color: cfg.textColor }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {agent.currentOrderId && (
                <div className="mt-2.5 pt-2.5 flex items-center justify-between" style={{ borderTop: '1px solid #1e1e1e' }}>
                  <span className="text-[10px] font-mono" style={{ color: '#333' }}>Order</span>
                  <span className="text-[10px] font-mono font-medium" style={{ color: '#555' }}>{agent.currentOrderId}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
