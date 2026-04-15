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
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: '#161616',
        border: `1px solid ${conflict.resolved ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
      }}
      data-testid="orchestrator-conflict-entry"
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
        data-testid="orchestrator-conflict-toggle"
      >
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: conflict.resolved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
          {conflict.resolved ? <CheckCircle2 size={10} style={{ color: '#10b981' }} /> : <AlertTriangle size={10} style={{ color: '#f59e0b' }} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: agentA.bg, color: agentA.color }}>
              {conflict.agentA}
            </span>
            <span className="text-[9px]" style={{ color: '#333' }}>vs</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: agentB.bg, color: agentB.color }}>
              {conflict.agentB}
            </span>
          </div>
          <p className="text-[10px] mt-1 truncate" style={{ color: '#666' }}>{conflict.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[8px] font-mono" style={{ color: '#333' }}>
            {new Date(conflict.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
          {expanded ? <ChevronUp size={10} style={{ color: '#444' }} /> : <ChevronDown size={10} style={{ color: '#444' }} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3.5 pb-3 space-y-2.5" style={{ animation: 'fadeIn 0.2s ease' }}>
          {/* Conflict flow */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ backgroundColor: '#111', border: '1px solid #1e1e1e' }}>
            <span className="text-[9px] font-bold" style={{ color: agentA.color }}>{conflict.agentA}</span>
            <span className="text-[9px]" style={{ color: '#555' }}>wants</span>
            <span className="text-[10px] font-mono" style={{ color: '#888' }}>{conflict.actionA}</span>
            <ArrowRight size={8} style={{ color: '#333' }} />
            <span className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>CONFLICT</span>
            <ArrowRight size={8} style={{ color: '#333' }} />
            <span className="text-[9px] font-bold" style={{ color: agentB.color }}>{conflict.agentB}</span>
            <span className="text-[9px]" style={{ color: '#555' }}>wants</span>
            <span className="text-[10px] font-mono" style={{ color: '#888' }}>{conflict.actionB}</span>
          </div>

          {/* Resolution */}
          {conflict.resolved && (
            <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Network size={9} style={{ color: '#10b981' }} />
                <span className="text-[9px] font-bold tracking-wider" style={{ color: '#10b981' }}>ORCHESTRATOR RESOLUTION</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: '#888' }}>{conflict.resolution}</p>
            </div>
          )}

          {/* AI reasoning */}
          {conflict.reasoning && (
            <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Brain size={9} style={{ color: '#a78bfa' }} />
                <span className="text-[9px] font-bold tracking-wider" style={{ color: '#a78bfa' }}>AI REASONING</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: '#a78bfa' }}>{conflict.reasoning}</p>
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
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#555' }}>
          Orchestrator
        </h2>
        <div className="flex items-center gap-2 text-[10px]">
          {pending > 0 && (
            <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b' }} />
              {pending} active
            </span>
          )}
          <span style={{ color: '#10b981' }}>{resolved} resolved</span>
        </div>
      </div>

      {/* Active conflicts */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" data-testid="orchestrator-conflict-list">
        {conflicts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6" style={{ color: '#333' }}>
            <Network size={20} className="mb-2 opacity-30" />
            <span className="text-[10px]">No agent conflicts</span>
            <span className="text-[9px]" style={{ color: '#222' }}>System running in harmony</span>
          </div>
        )}
        {conflicts.map((conflict) => (
          <ConflictEntry key={conflict.id} conflict={conflict} />
        ))}
      </div>
    </div>
  );
}
