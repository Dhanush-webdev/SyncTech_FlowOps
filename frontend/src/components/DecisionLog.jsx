import { useEffect, useRef } from 'react';
import { AlertOctagon, Route, BarChart3, Package } from 'lucide-react';

const TYPE_CONFIG = {
  DEMAND: {
    label: 'DEMAND',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    icon: BarChart3,
  },
  ROUTING: {
    label: 'ROUTING',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.05)',
    border: 'rgba(34,211,238,0.12)',
    icon: Route,
  },
  INVENTORY: {
    label: 'INVENTORY',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.05)',
    border: 'rgba(96,165,250,0.12)',
    icon: Package,
  },
  ALERT: {
    label: 'ALERT',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
    icon: AlertOctagon,
  },
};

const PRIORITY_COLOR = {
  low: '#333',
  medium: '#60a5fa',
  high: '#f59e0b',
  critical: '#ef4444',
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

export default function DecisionLog({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full" data-testid="decision-log-panel">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#555' }}>
          Agent Decision Log
        </h2>
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#10b981' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex gap-1.5 mb-3 flex-shrink-0">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = logs.filter(l => l.type === key).length;
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg"
              style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
              data-testid={`log-counter-${key.toLowerCase()}`}
            >
              <Icon size={9} style={{ color: cfg.color }} />
              <span className="text-[10px] font-bold tabular-nums" style={{ color: cfg.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5" data-testid="decision-log-list">
        {logs.map((log) => {
          const cfg = TYPE_CONFIG[log.type];
          const Icon = cfg.icon;
          return (
            <div
              key={log.id}
              className="rounded-lg px-3 py-2.5"
              style={{
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                animation: 'fadeIn 0.3s ease',
              }}
              data-testid="decision-log-entry"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={9} style={{ color: cfg.color }} />
                  <span className="text-[9px] font-bold tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLOR[log.priority] }}
                  />
                  <span className="text-[9px] font-mono" style={{ color: '#333' }}>
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#888' }}>{log.message}</p>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center text-xs py-12" style={{ color: '#333' }}>
            Agents initializing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
