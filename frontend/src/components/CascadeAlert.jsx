import { AlertTriangle } from 'lucide-react';

export default function CascadeAlert({ active, failCount }) {
  if (!active) return null;

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
      style={{
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        animation: 'cascadePulse 1.5s ease-in-out infinite',
      }}
      data-testid="cascade-alert-banner"
    >
      <AlertTriangle size={14} className="text-red-400 animate-pulse" />
      <span className="text-xs font-bold text-red-400 tracking-wide">
        CASCADE ALERT — {failCount} simultaneous order failures detected
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
        RESOLVING
      </span>
    </div>
  );
}
