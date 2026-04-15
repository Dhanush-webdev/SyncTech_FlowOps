import { useState, useEffect, useCallback, useRef } from 'react';
import { generateOrder, randomBetween, pickRandom } from '../utils/generators';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

const WEATHER_CONDITIONS = [
  { condition: 'sunny', temp: 32, description: 'Clear skies, normal traffic flow' },
  { condition: 'rainy', temp: 24, description: 'Heavy rainfall — road delays expected' },
  { condition: 'stormy', temp: 21, description: 'Thunderstorm warning — high delivery risk' },
  { condition: 'windy', temp: 28, description: 'Strong winds — minor route adjustments' },
  { condition: 'heatwave', temp: 42, description: 'Extreme heat — beverage demand surge' },
];

const LOCAL_EVENTS = [
  { event: 'IPL Match — Zone A', eventModifier: 30 },
  { event: 'Diwali Festival Sale', eventModifier: 45 },
  { event: 'College Fest — Zone B', eventModifier: 20 },
  { event: 'Weekend Rush Hour', eventModifier: 15 },
  null, null,
];

const CONFLICT_TEMPLATES = [
  {
    agentA: 'DEMAND', agentB: 'ROUTING',
    description: 'Stock transfer conflicts with active delivery routes',
    actionA: 'transfer stock from Store Beta',
    actionB: 'use Store Beta for active deliveries',
    resolution: 'Redirecting transfer to Store Gamma surplus while preserving Beta fulfillment pipeline',
  },
  {
    agentA: 'ROUTING', agentB: 'RECOVERY',
    description: 'Agent reassignment conflicts with recovery protocol',
    actionA: 'reassign idle agent to new order',
    actionB: 'hold idle agent for cascade recovery',
    resolution: 'Prioritizing recovery — holding agent for 60s then releasing to routing pool',
  },
  {
    agentA: 'DEMAND', agentB: 'INVENTORY',
    description: 'Demand restock conflicts with reorder schedule',
    actionA: 'pull emergency stock from warehouse',
    actionB: 'scheduled reorder already in transit',
    resolution: 'Canceling emergency pull — scheduled reorder ETA within threshold. Adjusting demand predictions.',
  },
  {
    agentA: 'INVENTORY', agentB: 'ROUTING',
    description: 'Store restocking conflicts with pickup scheduling',
    actionA: 'initiate Store Alpha receiving dock restock',
    actionB: 'dispatch agents for pickup from Store Alpha',
    resolution: 'Staggering operations — routing completes pickups first, then inventory dock opens for restock',
  },
  {
    agentA: 'RECOVERY', agentB: 'DEMAND',
    description: 'Recovery reroute conflicts with demand prediction',
    actionA: 'reroute orders away from Zone C',
    actionB: 'increase Zone C inventory for predicted surge',
    resolution: 'Partial reroute — redirecting 60% of orders while maintaining Zone C capacity for incoming surge',
  },
];

let logCounter = 0;
let conflictCounter = 0;

function createLog(type, message, priority, reasoning) {
  return {
    id: `log-${++logCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    message,
    priority,
    reasoning: reasoning || null,
  };
}

async function fetchAgentReasoning(agentType, context) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agent-reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_type: agentType, context }),
    });
    const data = await res.json();
    return data.reasoning;
  } catch {
    return null;
  }
}

export function useSimulation() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [stores, setStores] = useState(INITIAL_STORES);
  const [logs, setLogs] = useState([]);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalDelayed, setTotalDelayed] = useState(0);
  const [successRate, setSuccessRate] = useState(93);
  const [cascadeAlert, setCascadeAlert] = useState({ active: false, failCount: 0 });
  const [cascadeEvent, setCascadeEvent] = useState(null);
  const [weather, setWeather] = useState({
    ...WEATHER_CONDITIONS[0],
    event: null,
    eventModifier: 0,
    zoneDemand: { a: 55, b: 42, c: 38 },
    prediction: null,
  });
  const [conflicts, setConflicts] = useState([]);

  const agentsRef = useRef(agents);
  const ordersRef = useRef(orders);
  const storesRef = useRef(stores);
  const recentDelaysRef = useRef([]);
  const llmQueueRef = useRef(Promise.resolve());

  useEffect(() => { agentsRef.current = agents; }, [agents]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { storesRef.current = stores; }, [stores]);

  const addLog = useCallback((log) => {
    setLogs(prev => [log, ...prev].slice(0, 60));
  }, []);

  const queueLlmReasoning = useCallback((agentType, context, callback) => {
    llmQueueRef.current = llmQueueRef.current.then(async () => {
      const reasoning = await fetchAgentReasoning(agentType, context);
      if (reasoning) callback(reasoning);
    });
  }, []);

  const checkCascade = useCallback((orderId, zone) => {
    const now = Date.now();
    recentDelaysRef.current.push({ orderId, zone, time: now });
    recentDelaysRef.current = recentDelaysRef.current.filter(d => now - d.time < 10000);

    if (recentDelaysRef.current.length >= 2) {
      const failCount = recentDelaysRef.current.length;
      const affectedOrders = recentDelaysRef.current.map(d => d.orderId).filter(id => id !== orderId);

      setCascadeAlert({ active: true, failCount });
      setCascadeEvent({
        triggerOrder: orderId,
        affectedOrders: affectedOrders.slice(0, 3),
        zone,
        context: `${failCount} order delays within 10s window in ${zone}`,
      });

      const recoveryMsg = `RECOVERY AGENT: Cascade detected — ${orderId} delay rippling to ${affectedOrders.length} orders in ${zone}. Initiating auto-recovery.`;
      const log = createLog('ALERT', recoveryMsg, 'critical');
      addLog(log);

      queueLlmReasoning('recovery',
        `Cascade failure: ${orderId} delayed in ${zone}, affecting ${affectedOrders.join(', ')}. ${failCount} total failures in 10s.`,
        (reasoning) => {
          setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
        }
      );

      setTimeout(() => {
        setCascadeAlert({ active: false, failCount: 0 });
        addLog(createLog('ROUTING', `RECOVERY AGENT: Cascade resolved — all ${failCount} affected orders rerouted successfully`, 'high'));
        recentDelaysRef.current = [];
      }, 8000);
    }
  }, [addLog, queueLlmReasoning]);

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
      const alertMsg = `Delay detected on ${order.id} — ${chosen.name} assigned with extended SLA`;
      const log = createLog('ALERT', alertMsg, 'critical');
      addLog(log);
      checkCascade(order.id, order.zone);

      queueLlmReasoning('routing',
        `Order ${order.id} is delayed in ${order.zone}. Agent ${chosen.name} assigned from ${storeInZone.name}. SLA at risk.`,
        (reasoning) => {
          setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
        }
      );
    } else {
      const routingMsg = `${chosen.name} dispatched for ${order.id} from ${storeInZone.name} → ${order.zone}`;
      const log = createLog('ROUTING', routingMsg, 'low');
      addLog(log);

      if (Math.random() < 0.25) {
        queueLlmReasoning('routing',
          `Dispatching ${chosen.name} from ${storeInZone.name} to ${order.zone} for order ${order.id} (${order.product} x${order.quantity}). Zone load normal.`,
          (reasoning) => {
            setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
          }
        );
      }
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
  }, [addLog, checkCascade, queueLlmReasoning]);

  // Main order generation loop
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

  // Agent events loop
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
          const routingMsg = `ROUTING AGENT: ${victim.name} stuck — reassigning ${idleAgent.name} to cover order`;
          const log = createLog('ROUTING', routingMsg, 'critical');
          addLog(log);

          queueLlmReasoning('routing',
            `Agent ${victim.name} is stuck in ${victim.zone} with route blocked. Reassigning ${idleAgent.name} from ${idleAgent.zone} to cover order ${victim.currentOrderId}.`,
            (reasoning) => {
              setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
            }
          );
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
          const demandMsg = `DEMAND AGENT: Spike detected in ${hotZone} — transferring ${units} units from ${sourceStore.name}`;
          const log = createLog('DEMAND', demandMsg, 'high');
          addLog(log);

          queueLlmReasoning('demand',
            `Demand spike in ${hotZone}. Transferring ${units} units from ${sourceStore.name} to ${targetStore.name}. Source utilization: ${sourceStore.utilization}%, Target utilization: ${targetStore.utilization}%.`,
            (reasoning) => {
              setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
            }
          );

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

      if (roll > 0.8) {
        const lowStoreProduct = (() => {
          for (const store of storesRef.current) {
            const lowProduct = store.products.find(p => p.stock < 25);
            if (lowProduct) return { store, product: lowProduct };
          }
          return null;
        })();
        if (lowStoreProduct) {
          const invMsg = `INVENTORY AGENT: Low stock alert — ${lowStoreProduct.product.name} at ${lowStoreProduct.store.name} (${lowStoreProduct.product.stock} units) — reorder triggered`;
          const log = createLog('INVENTORY', invMsg, 'high');
          addLog(log);

          queueLlmReasoning('inventory',
            `${lowStoreProduct.product.name} stock at ${lowStoreProduct.store.name} dropped to ${lowStoreProduct.product.stock}/${lowStoreProduct.product.maxStock} units. Zone: ${lowStoreProduct.store.zone}.`,
            (reasoning) => {
              setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
            }
          );

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
  }, [addLog, queueLlmReasoning]);

  // Weather cycle — changes every 30s
  useEffect(() => {
    // Initial weather prediction
    const fetchInitialPrediction = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/weather-prediction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ condition: 'sunny', event: '', zone_demand: { a: 55, b: 42, c: 38 } }),
        });
        const data = await res.json();
        setWeather(prev => ({ ...prev, prediction: data.prediction }));
      } catch { /* ignore */ }
    };
    fetchInitialPrediction();

    const interval = setInterval(() => {
      const newCondition = pickRandom(WEATHER_CONDITIONS);
      const eventRoll = pickRandom(LOCAL_EVENTS);
      const newZoneDemand = {
        a: randomBetween(35, 75),
        b: randomBetween(30, 65),
        c: randomBetween(25, 60),
      };

      setWeather(prev => ({
        ...newCondition,
        event: eventRoll?.event || null,
        eventModifier: eventRoll?.eventModifier || 0,
        zoneDemand: newZoneDemand,
        prediction: prev.prediction,
      }));

      // Fetch new AI prediction
      const fetchPrediction = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/weather-prediction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              condition: newCondition.condition,
              event: eventRoll?.event || '',
              zone_demand: newZoneDemand,
            }),
          });
          const data = await res.json();
          setWeather(prev => ({ ...prev, prediction: data.prediction }));
        } catch { /* ignore */ }
      };
      fetchPrediction();

      // Log weather-driven demand change
      addLog(createLog('DEMAND',
        `DEMAND AGENT: Weather shift — ${newCondition.condition}${eventRoll ? ` + ${eventRoll.event}` : ''}. Adjusting zone predictions.`,
        'medium'
      ));
    }, 30000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Orchestrator conflict generation — every 15-20s
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.6) return; // 40% chance to generate a conflict

      const template = pickRandom(CONFLICT_TEMPLATES);
      const conflictId = `conflict-${++conflictCounter}-${Date.now()}`;

      const newConflict = {
        id: conflictId,
        ...template,
        timestamp: Date.now(),
        resolved: false,
        reasoning: null,
      };

      setConflicts(prev => [newConflict, ...prev].slice(0, 8));

      addLog(createLog('ALERT',
        `ORCHESTRATOR: Conflict — ${template.agentA} vs ${template.agentB}: ${template.description}`,
        'high'
      ));

      // Resolve after 3-5 seconds with LLM reasoning
      const resolveDelay = randomBetween(3000, 5000);
      setTimeout(async () => {
        // Fetch orchestrator reasoning
        try {
          const res = await fetch(`${BACKEND_URL}/api/orchestrator-reasoning`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_a: template.agentA,
              agent_b: template.agentB,
              action_a: template.actionA,
              action_b: template.actionB,
              context: template.description,
            }),
          });
          const data = await res.json();

          setConflicts(prev => prev.map(c =>
            c.id === conflictId
              ? { ...c, resolved: true, reasoning: data.reasoning }
              : c
          ));

          addLog(createLog('ROUTING',
            `ORCHESTRATOR: Resolved ${template.agentA} vs ${template.agentB} — ${template.resolution}`,
            'high'
          ));
        } catch {
          setConflicts(prev => prev.map(c =>
            c.id === conflictId ? { ...c, resolved: true } : c
          ));
        }
      }, resolveDelay);
    }, 15000);

    return () => clearInterval(interval);
  }, [addLog]);

  return {
    orders, agents, stores, logs,
    totalDelivered, totalDelayed, successRate,
    cascadeAlert, cascadeEvent, setCascadeEvent,
    weather, conflicts,
  };
}
