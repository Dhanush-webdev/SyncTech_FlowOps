import { Store } from 'lucide-react';

function StockBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  const barColor =
    pct > 60 ? '#10b981' :
    pct > 30 ? '#f59e0b' :
    '#ef4444';
  const labelColor =
    pct > 60 ? '#10b981' :
    pct > 30 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums w-8 text-right" style={{ color: labelColor }}>{pct}%</span>
    </div>
  );
}

const STORE_COLORS = {
  'store-a': { dot: '#60a5fa', label: '#60a5fa' },
  'store-b': { dot: '#2dd4bf', label: '#2dd4bf' },
  'store-c': { dot: '#a78bfa', label: '#a78bfa' },
};

export default function DarkStores({ stores }) {
  return (
    <div className="flex flex-col h-full" data-testid="dark-stores-panel">
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-4 flex-shrink-0" style={{ color: '#555' }}>
        Dark Store Inventory
      </h2>
      <div className="flex-1 space-y-3">
        {stores.map((store) => {
          const sc = STORE_COLORS[store.id] || STORE_COLORS['store-a'];
          const avgStock = Math.round(
            store.products.reduce((sum, p) => sum + (p.stock / p.maxStock) * 100, 0) / store.products.length
          );

          return (
            <div
              key={store.id}
              className="rounded-xl p-4 transition-all duration-300"
              style={{ backgroundColor: '#161616', border: '1px solid #1e1e1e' }}
              data-testid={`store-card-${store.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${sc.dot}18` }}
                  >
                    <Store size={12} style={{ color: sc.label }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{store.name}</div>
                    <div className="text-[10px]" style={{ color: '#444' }}>{store.zone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xs font-bold"
                    style={{ color: avgStock > 60 ? '#10b981' : avgStock > 30 ? '#f59e0b' : '#ef4444' }}
                  >
                    {avgStock}%
                  </div>
                  <div className="text-[9px]" style={{ color: '#333' }}>avg stock</div>
                </div>
              </div>

              <div className="space-y-2">
                {store.products.map((product) => (
                  <div key={product.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px]" style={{ color: '#555' }}>{product.name}</span>
                      <span className="text-[10px] font-mono tabular-nums" style={{ color: '#333' }}>
                        {product.stock}/{product.maxStock}
                      </span>
                    </div>
                    <StockBar value={product.stock} max={product.maxStock} />
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: '1px solid #1e1e1e' }}>
                <span className="text-[10px]" style={{ color: '#333' }}>{store.utilization}% utilization</span>
                <span className="text-[10px]" style={{ color: '#333' }}>{store.totalOrders} fulfilled</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
