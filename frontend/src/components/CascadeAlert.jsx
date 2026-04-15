import { AlertTriangle } from 'lucide-react';

export default function CascadeAlert({ active, failCount }) {
  if (!active) return null;
  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 font-bold tracking-[0.15em] transition-all duration-300"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#ef4444',
        animation: 'cascadePulse 1.5s ease-in-out infinite',
      }}
      data-testid="cascade-alert-banner"
    >
      <AlertTriangle size={14} className="animate-pulse" />
      CASCADE ALERT — {failCount} SIMULTANEOUS ORDER FAILURES
      <span className="text-[9px] px-2 py-0.5 font-bold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>RESOLVING</span>
    </div>
  );
}
