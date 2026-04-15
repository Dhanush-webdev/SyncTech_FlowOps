import { useState } from 'react';
import { Network, AlertTriangle, CheckCircle2, ArrowRight, Brain, ChevronDown, ChevronUp } from 'lucide-react';

const AGENT_COLORS = {
  DEMAND: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ROUTING: { color: '#22d3ee', bg: 'rgba(34,211,238,0.06)' },
  RECOVERY: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
  INVENTORY: { color: '#60a5fa', bg: 'rgba(96,165,250,0.06)' },
};

function ConflictEntry({ conflict }) {
  const [expanded, setExpanded] = useState(false);
  const agentA = AGENT_COLORS[conflict.agentA] || AGENT_COLORS.DEMAND;
  const agentB = AGENT_COLORS[conflict.agentB] || AGENT_COLORS.ROUTING;

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{ backgroundColor: 'var(--bg-surface-alt)', border: `1px solid ${conflict.resolved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`, borderLeft: `2px solid ${conflict.resolved ? '#10b981' : '#f59e0b'}` }}
      data-testid="orchestrator-conflict-entry"
    >
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:opacity-80"
        onClick={() => setExpanded(!expanded)}
        data-testid="orchestrator-conflict-toggle"
      >
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: conflict.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
          {conflict.resolved ? <CheckCircle2 size={10} style={{ color: '#10b981' }} /> : <AlertTriangle size={10} style={{ color: '#f59e0b' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold px-1.5 py-0.5 tracking-wider" style={{ fontFamily: 'var(--font-mono)', backgroundColor: agentA.bg, color: agentA.color }}>{conflict.agentA}</span>
            <span className="text-[8px] font-bold" style={{ color: 'var(--text-dim)' }}>VS</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 tracking-wider" style={{ fontFamily: 'var(--font-mono)', backgroundColor: agentB.bg, color: agentB.color }}>{conflict.agentB}</span>
          </div>
          <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{conflict.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[8px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            {new Date(conflict.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
          {expanded ? <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 py-2 px-3" style={{ backgroundColor: 'var(--terminal-bg)', border: '1px solid var(--border-color)' }}>
            <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: agentA.color }}>{conflict.agentA}</span>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>wants</span>
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{conflict.actionA}</span>
            <ArrowRight size={8} style={{ color: 'var(--text-dim)' }} />
            <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>CONFLICT</span>
          </div>

          {conflict.resolved && (
            <div className="px-3 py-2.5" style={{ backgroundColor: 'rgba(16,185,129,0.04)', borderLeft: '2px solid #10b981' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Network size={9} style={{ color: '#10b981' }} />
                <span className="text-[9px] font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>RESOLUTION</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{conflict.resolution}</p>
            </div>
          )}

          {conflict.reasoning && (
            <div className="px-3 py-2.5" style={{ backgroundColor: 'rgba(139,92,246,0.04)', borderLeft: '2px solid #a78bfa' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Brain size={9} style={{ color: '#a78bfa' }} />
                <span className="text-[9px] font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>AI REASONING</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>{conflict.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrchestratorPanel({ conflicts }) {
  const resolved = conflicts.filter(c => c.resolved).length;
  const pending = conflicts.length - resolved;

  return (
    <div className="flex flex-col h-full" data-testid="orchestrator-panel">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>ORCHESTRATOR</h2>
        <div className="flex items-center gap-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          {pending > 0 && <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}><span className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: '#f59e0b' }} />{pending} active</span>}
          <span style={{ color: '#10b981' }}>{resolved} resolved</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" data-testid="orchestrator-conflict-list">
        {conflicts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6">
            <Network size={18} style={{ color: 'var(--text-dim)', opacity: 0.3 }} className="mb-2" />
            <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>NO CONFLICTS</span>
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.5 }}>System in harmony</span>
          </div>
        )}
        {conflicts.map((conflict) => (
          <ConflictEntry key={conflict.id} conflict={conflict} />
        ))}
      </div>
    </div>
  );
}
