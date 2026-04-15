import { useState, useEffect } from 'react';
import { X, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

const PHASES = ['detecting', 'analyzing', 'recovering', 'resolved'];
const PHASE_DURATION = 2500;

export default function CascadeModal({ cascadeEvent, onClose }) {
  const [phase, setPhase] = useState(0);
  const [recoveryReasoning, setRecoveryReasoning] = useState('');

  useEffect(() => {
    if (!cascadeEvent) return;
    setPhase(0);
    setRecoveryReasoning('');

    const timers = PHASES.map((_, i) => setTimeout(() => setPhase(i), i * PHASE_DURATION));

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    fetch(`${backendUrl}/api/cascade-reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger_order: cascadeEvent.triggerOrder,
        affected_orders: cascadeEvent.affectedOrders,
        zone: cascadeEvent.zone,
        context: cascadeEvent.context || 'Multiple order delays detected',
      }),
    })
      .then(r => r.json())
      .then(data => setRecoveryReasoning(data.reasoning))
      .catch(() => setRecoveryReasoning('Auto-recovery protocol initiated. Rerouting agents.'));

    const autoClose = setTimeout(() => onClose(), PHASES.length * PHASE_DURATION + 2000);
    return () => { timers.forEach(clearTimeout); clearTimeout(autoClose); };
  }, [cascadeEvent, onClose]);

  if (!cascadeEvent) return null;

  const phaseConfig = [
    { label: 'DETECTING', color: '#ef4444', desc: `Delay detected on ${cascadeEvent.triggerOrder}` },
    { label: 'ANALYZING', color: '#f59e0b', desc: `${cascadeEvent.affectedOrders.length} downstream orders at risk` },
    { label: 'RECOVERING', color: '#22d3ee', desc: 'Recovery Agent initiating auto-compensation' },
    { label: 'RESOLVED', color: '#10b981', desc: 'All affected orders rerouted' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} data-testid="cascade-modal-overlay">
      <div
        className="relative w-full max-w-2xl mx-4 overflow-hidden"
        style={{ backgroundColor: '#111', border: `1px solid ${phaseConfig[phase].color}30`, boxShadow: `0 0 80px ${phaseConfig[phase].color}10` }}
        data-testid="cascade-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Shield size={14} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>CASCADE EVENT DETECTED</h3>
              <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#52525b' }}>RECOVERY AGENT — AUTONOMOUS RESOLUTION</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 transition-colors" data-testid="cascade-modal-close">
            <X size={14} style={{ color: '#52525b' }} />
          </button>
        </div>

        {/* Timeline */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-6">
            {phaseConfig.map((p, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${i <= phase ? '' : 'opacity-30'}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: i <= phase ? `${p.color}15` : '#1e1e1e',
                      border: `2px solid ${i <= phase ? p.color : '#333'}`,
                      color: i <= phase ? p.color : '#333',
                    }}
                  >
                    {i < phase ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className="text-[7px] mt-1.5 font-bold tracking-[0.15em] text-center" style={{ fontFamily: 'var(--font-mono)', color: i <= phase ? p.color : '#333' }}>{p.label}</span>
                </div>
                {i < phaseConfig.length - 1 && <ArrowRight size={10} style={{ color: i < phase ? phaseConfig[i + 1].color : '#333' }} className="flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Current phase */}
          <div className="p-4 mb-4 transition-all duration-500" style={{ backgroundColor: `${phaseConfig[phase].color}06`, borderLeft: `2px solid ${phaseConfig[phase].color}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: phaseConfig[phase].color }} />
              <span className="text-[10px] font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color: phaseConfig[phase].color }}>{phaseConfig[phase].label}</span>
            </div>
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>{phaseConfig[phase].desc}</p>
          </div>

          {/* Cascade chain */}
          <div className="p-4 mb-4" style={{ backgroundColor: '#161616', border: '1px solid #1e1e1e' }}>
            <span className="text-[8px] font-bold tracking-[0.2em] block mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#52525b' }}>CASCADE CHAIN</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-[11px] font-bold" style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{cascadeEvent.triggerOrder}</span>
              <ArrowRight size={12} style={{ color: '#ef4444' }} />
              {cascadeEvent.affectedOrders.map((orderId, i) => (
                <span key={orderId} className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 text-[11px] font-medium transition-all duration-500"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: phase >= 3 ? 'rgba(16,185,129,0.1)' : phase >= 2 ? 'rgba(34,211,238,0.06)' : 'rgba(245,158,11,0.1)',
                      color: phase >= 3 ? '#10b981' : phase >= 2 ? '#22d3ee' : '#f59e0b',
                      border: `1px solid ${phase >= 3 ? 'rgba(16,185,129,0.2)' : phase >= 2 ? 'rgba(34,211,238,0.12)' : 'rgba(245,158,11,0.2)'}`,
                    }}
                  >{orderId}</span>
                  {i < cascadeEvent.affectedOrders.length - 1 && <ArrowRight size={10} style={{ color: '#333' }} />}
                </span>
              ))}
            </div>
          </div>

          {/* Recovery reasoning */}
          {phase >= 2 && recoveryReasoning && (
            <div className="p-4 animate-fade-in" style={{ backgroundColor: 'rgba(34,211,238,0.03)', borderLeft: '2px solid #22d3ee' }} data-testid="cascade-llm-reasoning">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={10} style={{ color: '#22d3ee' }} />
                <span className="text-[9px] font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color: '#22d3ee' }}>RECOVERY AGENT AI</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>{recoveryReasoning}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
