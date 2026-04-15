import { Store } from 'lucide-react';

function StockBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  const barColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-[6px] overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span
        className="text-[10px] font-bold tabular-nums w-9 text-right"
        style={{ fontFamily: 'var(--font-mono)', color: barColor }}
      >
        {pct}%
      </span>
    </div>
  );
}

const STORE_COLORS = {
  'store-a': '#3b82f6',
  'store-b': '#14b8a6',
  'store-c': '#8b5cf6',
};

export default function DarkStores({ stores }) {
  return (
    <div className="flex flex-col h-full" data-testid="dark-stores-panel">
      <h2
        className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex-shrink-0"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
      >
        DARK STORE INVENTORY
      </h2>
      <div className="flex-1 space-y-3">
        {stores.map((store) => {
          const sc = STORE_COLORS[store.id] || '#3b82f6';
          const avgStock = Math.round(
            store.products.reduce((sum, p) => sum + (p.stock / p.maxStock) * 100, 0) / store.products.length
          );

          return (
            <div
              key={store.id}
              className="p-3.5 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' }}
              data-testid={`store-card-${store.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 flex items-center justify-center"
                    style={{ backgroundColor: `${sc}15`, border: `1px solid ${sc}30` }}
                  >
                    <Store size={12} style={{ color: sc }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{store.name}</div>
                    <div className="text-[9px] font-bold tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{store.zone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-sm font-bold tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)', color: avgStock > 50 ? '#10b981' : avgStock > 20 ? '#f59e0b' : '#ef4444' }}
                  >
                    {avgStock}%
                  </div>
                  <div className="text-[8px] font-bold tracking-[0.1em]" style={{ color: 'var(--text-dim)' }}>AVG STOCK</div>
                </div>
              </div>

              <div className="space-y-2">
                {store.products.map((product) => (
                  <div key={product.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{product.name}</span>
                      <span className="text-[10px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {product.stock}/{product.maxStock}
                      </span>
                    </div>
                    <StockBar value={product.stock} max={product.maxStock} />
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2.5 flex justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="text-[9px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{store.utilization}% UTIL</span>
                <span className="text-[9px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{store.totalOrders} FULFILLED</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
