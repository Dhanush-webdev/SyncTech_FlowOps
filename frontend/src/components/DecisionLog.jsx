import { useEffect, useRef, useState } from 'react';
import { AlertOctagon, Route, BarChart3, Package, Brain } from 'lucide-react';

const TYPE_CONFIG = {
  DEMAND: { label: 'DEMAND', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)', icon: BarChart3 },
  ROUTING: { label: 'ROUTING', color: '#22d3ee', bg: 'rgba(34,211,238,0.05)', border: 'rgba(34,211,238,0.1)', icon: Route },
  INVENTORY: { label: 'INVENTORY', color: '#60a5fa', bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.1)', icon: Package },
  ALERT: { label: 'ALERT', color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.12)', icon: AlertOctagon },
};

const PRIORITY_DOT = { low: '#3f3f46', medium: '#60a5fa', high: '#f59e0b', critical: '#ef4444' };

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function LogEntry({ log }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const cfg = TYPE_CONFIG[log.type];
  const Icon = cfg.icon;
  const hasReasoning = !!log.reasoning;

  return (
    <div
      className="px-3 py-2.5 animate-fade-in"
      style={{ backgroundColor: cfg.bg, borderLeft: `2px solid ${cfg.color}` }}
      data-testid="decision-log-entry"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={9} style={{ color: cfg.color }} />
          <span className="text-[9px] font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color: cfg.color }}>
            {cfg.label}
          </span>
          {hasReasoning && (
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1 px-1.5 py-0.5 ml-1 transition-colors hover:opacity-80"
              style={{
                border: '1px solid rgba(139,92,246,0.2)',
                backgroundColor: showReasoning ? 'rgba(139,92,246,0.12)' : 'transparent',
              }}
              data-testid="toggle-reasoning-btn"
            >
              <Brain size={8} style={{ color: '#a78bfa' }} />
              <span className="text-[7px] font-bold tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>AI</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1" style={{ backgroundColor: PRIORITY_DOT[log.priority] }} />
          <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: '#52525b' }}>
            {formatTime(log.timestamp)}
          </span>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>{log.message}</p>

      {hasReasoning && showReasoning && (
        <div
          className="mt-2 pt-2 text-[10px] leading-relaxed animate-fade-in"
          style={{ borderTop: '1px solid rgba(139,92,246,0.12)', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}
          data-testid="llm-reasoning-text"
        >
          <span className="font-bold" style={{ color: '#8b5cf6' }}>AI: </span>
          {log.reasoning}
        </div>
      )}
    </div>
  );
}

export default function DecisionLog({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full" data-testid="decision-log-panel">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-heading)', color: '#71717a' }}
        >
          AGENT DECISION LOG
        </h2>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>LIVE</span>
        </span>
      </div>

      {/* Counters */}
      <div className="flex gap-1.5 mb-3 flex-shrink-0">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = logs.filter(l => l.type === key).length;
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              className="flex-1 flex items-center justify-center gap-1 py-1.5"
              style={{ backgroundColor: cfg.bg, borderLeft: `2px solid ${cfg.color}` }}
              data-testid={`log-counter-${key.toLowerCase()}`}
            >
              <Icon size={9} style={{ color: cfg.color }} />
              <span className="text-[10px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: cfg.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5" data-testid="decision-log-list">
        {logs.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
        {logs.length === 0 && (
          <div className="text-center text-xs py-12" style={{ fontFamily: 'var(--font-mono)', color: '#3f3f46' }}>
            &gt; INITIALIZING AGENTS...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
