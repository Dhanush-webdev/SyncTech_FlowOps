import { useState, useEffect, useCallback, useRef } from 'react';
import { generateOrder, randomBetween, pickRandom } from '../utils/generators';

const INITIAL_STORES = [
  {
    id: 'store-a', name: 'Store Alpha', zone: 'Zone A',
    products: [
      { name: 'Dairy', stock: 85, maxStock: 100, category: 'dairy' },
      { name: 'Produce', stock: 60, maxStock: 100, category: 'produce' },
      { name: 'Beverages', stock: 90, maxStock: 100, category: 'beverages' },
      { name: 'Snacks', stock: 45, maxStock: 100, category: 'snacks' },
      { name: 'Personal Care', stock: 70, maxStock: 100, category: 'personal' },
    ],
    totalOrders: 0, utilization: 72,
  },
  {
    id: 'store-b', name: 'Store Beta', zone: 'Zone B',
    products: [
      { name: 'Dairy', stock: 30, maxStock: 100, category: 'dairy' },
      { name: 'Produce', stock: 80, maxStock: 100, category: 'produce' },
      { name: 'Beverages', stock: 55, maxStock: 100, category: 'beverages' },
      { name: 'Snacks', stock: 95, maxStock: 100, category: 'snacks' },
      { name: 'Personal Care', stock: 40, maxStock: 100, category: 'personal' },
    ],
    totalOrders: 0, utilization: 58,
  },
  {
    id: 'store-c', name: 'Store Gamma', zone: 'Zone C',
    products: [
      { name: 'Dairy', stock: 75, maxStock: 100, category: 'dairy' },
      { name: 'Produce', stock: 20, maxStock: 100, category: 'produce' },
      { name: 'Beverages', stock: 88, maxStock: 100, category: 'beverages' },
      { name: 'Snacks', stock: 65, maxStock: 100, category: 'snacks' },
      { name: 'Personal Care', stock: 92, maxStock: 100, category: 'personal' },
    ],
    totalOrders: 0, utilization: 81,
  },
];

const INITIAL_AGENTS = [
  { id: 'agent-1', name: 'Rajan', status: 'idle', zone: 'Zone A', ordersCompleted: 12 },
  { id: 'agent-2', name: 'Priya', status: 'idle', zone: 'Zone B', ordersCompleted: 18 },
  { id: 'agent-3', name: 'Suresh', status: 'idle', zone: 'Zone A', ordersCompleted: 9 },
  { id: 'agent-4', name: 'Kavya', status: 'idle', zone: 'Zone C', ordersCompleted: 22 },
  { id: 'agent-5', name: 'Arjun', status: 'idle', zone: 'Zone B', ordersCompleted: 15 },
];

const CURRENT_ACTIONS = [
  'Picking order from shelf',
  'Loading delivery bag',
  'En route to customer',
  'Navigating Zone traffic',
  'Last-mile delivery',
  'Confirming drop-off',
  'Returning to store',
];

let logCounter = 0;

function createLog(type, message, priority) {
  return {
    id: `log-${++logCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    message,
    priority,
  };
}

export function useSimulation() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [stores, setStores] = useState(INITIAL_STORES);
  const [logs, setLogs] = useState([]);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalDelayed, setTotalDelayed] = useState(0);
  const [successRate, setSuccessRate] = useState(93);

  const agentsRef = useRef(agents);
  const ordersRef = useRef(orders);
  const storesRef = useRef(stores);

  useEffect(() => { agentsRef.current = agents; }, [agents]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { storesRef.current = stores; }, [stores]);

  const addLog = useCallback((log) => {
    setLogs(prev => [log, ...prev].slice(0, 60));
  }, []);

  const assignOrderToAgent = useCallback((order) => {
    const currentAgents = agentsRef.current;
    const idleAgents = currentAgents.filter(a => a.status === 'idle');

    if (idleAgents.length === 0) {
      addLog(createLog('ALERT', `No idle agents — Order ${order.id} queued for ${order.zone}`, 'high'));
      return;
    }

    const zoneAgents = idleAgents.filter(a => a.zone === order.zone);
    const chosen = zoneAgents.length > 0 ? zoneAgents[0] : idleAgents[0];
    const storeInZone = storesRef.current.find(s => s.zone === order.zone) || storesRef.current[0];
    const action = pickRandom(CURRENT_ACTIONS);

    setAgents(prev => prev.map(a =>
      a.id === chosen.id
        ? { ...a, status: 'active', currentOrderId: order.id, currentAction: action }
        : a
    ));

    setOrders(prev => prev.map(o =>
      o.id === order.id
        ? { ...o, status: 'assigned', assignedAgent: chosen.name, storeId: storeInZone.id }
        : o
    ));

    const deliveryTime = order.delayed ? randomBetween(18000, 30000) : randomBetween(6000, 14000);

    if (order.delayed) {
      addLog(createLog('ALERT', `Delay detected on ${order.id} — ${chosen.name} assigned with extended SLA`, 'critical'));
    } else {
      addLog(createLog('ROUTING', `${chosen.name} dispatched for ${order.id} from ${storeInZone.name} → ${order.zone}`, 'low'));
    }

    setTimeout(() => {
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'in_transit' } : o
      ));
      setAgents(prev => prev.map(a =>
        a.id === chosen.id ? { ...a, currentAction: 'En route to customer' } : a
      ));
    }, 1500);

    setTimeout(() => {
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'delivered' } : o
      ));
      setAgents(prev => prev.map(a =>
        a.id === chosen.id
          ? { ...a, status: 'idle', currentOrderId: undefined, currentAction: undefined, ordersCompleted: a.ordersCompleted + 1 }
          : a
      ));
      setTotalDelivered(d => d + 1);
      setStores(prev => prev.map(s =>
        s.id === storeInZone.id ? { ...s, totalOrders: s.totalOrders + 1 } : s
      ));
    }, deliveryTime);
  }, [addLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      const order = generateOrder();
      if (order.delayed) setTotalDelayed(d => d + 1);
      setOrders(prev => [order, ...prev].slice(0, 25));
      assignOrderToAgent(order);

      setStores(prev => prev.map(store => ({
        ...store,
        products: store.products.map(p => ({
          ...p,
          stock: Math.max(5, Math.min(p.maxStock, p.stock + randomBetween(-8, 5))),
        })),
        utilization: Math.min(99, Math.max(20, store.utilization + randomBetween(-5, 5))),
      })));

      setSuccessRate(prev => {
        const next = prev + randomBetween(-1, 1);
        return Math.min(98, Math.max(85, next));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [assignOrderToAgent]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAgents = agentsRef.current;
      const activeAgents = currentAgents.filter(a => a.status === 'active');
      if (activeAgents.length === 0) return;

      const roll = Math.random();

      if (roll < 0.12) {
        const victim = pickRandom(activeAgents);
        const idleAgent = currentAgents.find(a => a.status === 'idle' && a.id !== victim.id);
        if (idleAgent) {
          setAgents(prev => prev.map(a => {
            if (a.id === victim.id) return { ...a, status: 'stuck', stuckSince: Date.now(), currentAction: 'Route blocked' };
            if (a.id === idleAgent.id) return { ...a, status: 'active', currentOrderId: victim.currentOrderId, currentAction: 'Picking up reassigned order' };
            return a;
          }));
          addLog(createLog('ROUTING', `ROUTING AGENT: ${victim.name} stuck — reassigning ${idleAgent.name} to cover order`, 'critical'));
        } else {
          setAgents(prev => prev.map(a =>
            a.id === victim.id ? { ...a, status: 'stuck', stuckSince: Date.now(), currentAction: 'Route blocked' } : a
          ));
          addLog(createLog('ALERT', `${victim.name} stuck — no idle agent available for reassignment`, 'critical'));
        }
      } else if (roll < 0.2) {
        const stuckAgents = currentAgents.filter(a => a.status === 'stuck');
        if (stuckAgents.length > 0) {
          const recovered = pickRandom(stuckAgents);
          setAgents(prev => prev.map(a =>
            a.id === recovered.id
              ? { ...a, status: 'idle', currentOrderId: undefined, stuckSince: undefined, currentAction: undefined }
              : a
          ));
          addLog(createLog('ROUTING', `${recovered.name} route recovered — returning to idle pool`, 'medium'));
        }
      }

      if (roll < 0.3) {
        const zones = ['Zone A', 'Zone B', 'Zone C'];
        const hotZone = pickRandom(zones);
        const sourceStore = storesRef.current.find(s => s.zone !== hotZone);
        const targetStore = storesRef.current.find(s => s.zone === hotZone);
        if (sourceStore && targetStore) {
          const units = randomBetween(10, 30);
          addLog(createLog('DEMAND',
            `DEMAND AGENT: Spike detected in ${hotZone} — transferring ${units} units from ${sourceStore.name}`,
            'high'
          ));
          setStores(prev => prev.map(s => {
            if (s.id === targetStore.id) {
              return {
                ...s,
                products: s.products.map(p => ({
                  ...p,
                  stock: Math.min(p.maxStock, p.stock + Math.floor(units / s.products.length)),
                })),
              };
            }
            return s;
          }));
        }
      }

      if (roll > 0.85) {
        const lowStoreProduct = (() => {
          for (const store of storesRef.current) {
            const lowProduct = store.products.find(p => p.stock < 25);
            if (lowProduct) return { store, product: lowProduct };
          }
          return null;
        })();
        if (lowStoreProduct) {
          addLog(createLog('INVENTORY',
            `INVENTORY AGENT: Low stock alert — ${lowStoreProduct.product.name} at ${lowStoreProduct.store.name} (${lowStoreProduct.product.stock} units) — reorder triggered`,
            'high'
          ));
          setStores(prev => prev.map(s =>
            s.id === lowStoreProduct.store.id
              ? {
                ...s,
                products: s.products.map(p =>
                  p.name === lowStoreProduct.product.name
                    ? { ...p, stock: Math.min(p.maxStock, p.stock + randomBetween(20, 40)) }
                    : p
                ),
              }
              : s
          ));
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [addLog]);

  return { orders, agents, stores, logs, totalDelivered, totalDelayed, successRate };
}
