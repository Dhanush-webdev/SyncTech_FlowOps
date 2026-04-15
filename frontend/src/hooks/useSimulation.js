import { useState, useEffect, useCallback, useRef } from 'react';
import { generateOrder, randomBetween, pickRandom } from '../utils/generators';
import { playSFX } from '../utils/sounds';

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
  const [demoActive, setDemoActive] = useState(false);

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

  // --- TRIGGER CASCADE (used by demo mode + normal flow) ---
  const triggerCascade = useCallback((triggerOrderId, zone, affectedOrderIds) => {
    const failCount = affectedOrderIds.length + 1;
    playSFX('cascadeAlert');

    setCascadeAlert({ active: true, failCount });
    setCascadeEvent({
      triggerOrder: triggerOrderId,
      affectedOrders: affectedOrderIds.slice(0, 3),
      zone,
      context: `${failCount} order delays within 10s window in ${zone}`,
    });

    const recoveryMsg = `RECOVERY AGENT: Cascade detected — ${triggerOrderId} delay rippling to ${affectedOrderIds.length} orders in ${zone}. Initiating auto-recovery.`;
    const log = createLog('ALERT', recoveryMsg, 'critical');
    addLog(log);

    queueLlmReasoning('recovery',
      `Cascade failure: ${triggerOrderId} delayed in ${zone}, affecting ${affectedOrderIds.join(', ')}. ${failCount} total failures in 10s.`,
      (reasoning) => {
        setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
      }
    );

    setTimeout(() => {
      playSFX('cascadeResolved');
      setCascadeAlert({ active: false, failCount: 0 });
      addLog(createLog('ROUTING', `RECOVERY AGENT: Cascade resolved — all ${failCount} affected orders rerouted successfully`, 'high'));
      recentDelaysRef.current = [];
    }, 8000);
  }, [addLog, queueLlmReasoning]);

  // --- TRIGGER CONFLICT (used by demo mode + normal flow) ---
  const triggerConflict = useCallback((template) => {
    const conflictId = `conflict-${++conflictCounter}-${Date.now()}`;
    playSFX('conflictDetected');

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

    const resolveDelay = randomBetween(3000, 5000);
    setTimeout(async () => {
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

        playSFX('conflictResolved');
        setConflicts(prev => prev.map(c =>
          c.id === conflictId ? { ...c, resolved: true, reasoning: data.reasoning } : c
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
  }, [addLog]);

  const checkCascade = useCallback((orderId, zone) => {
    const now = Date.now();
    recentDelaysRef.current.push({ orderId, zone, time: now });
    recentDelaysRef.current = recentDelaysRef.current.filter(d => now - d.time < 10000);

    if (recentDelaysRef.current.length >= 2) {
      const affectedOrders = recentDelaysRef.current.map(d => d.orderId).filter(id => id !== orderId);
      triggerCascade(orderId, zone, affectedOrders);
    }
  }, [triggerCascade]);

  // --- DEMO MODE ---
  const activateDemoMode = useCallback(() => {
    playSFX('demoMode');
    setDemoActive(true);

    // Step 1: Immediate — weather storm + demand spike
    const stormWeather = { condition: 'stormy', temp: 21, description: 'Thunderstorm warning — high delivery risk' };
    const stormEvent = { event: 'IPL Match — Zone A', eventModifier: 30 };
    setWeather(prev => ({
      ...stormWeather,
      ...stormEvent,
      zoneDemand: { a: 82, b: 65, c: 71 },
      prediction: prev.prediction,
    }));
    addLog(createLog('DEMAND', 'DEMAND AGENT: Weather shift — stormy + IPL Match — Zone A. Adjusting zone predictions.', 'high'));
    playSFX('demandSpike');

    // Fetch storm prediction
    fetch(`${BACKEND_URL}/api/weather-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition: 'stormy', event: 'IPL Match — Zone A', zone_demand: { a: 82, b: 65, c: 71 } }),
    })
      .then(r => r.json())
      .then(data => setWeather(prev => ({ ...prev, prediction: data.prediction })))
      .catch(() => {});

    // Step 2: 2s — Agent stuck
    setTimeout(() => {
      const currentAgents = agentsRef.current;
      const activeAgent = currentAgents.find(a => a.status === 'active');
      if (activeAgent) {
        playSFX('agentStuck');
        setAgents(prev => prev.map(a =>
          a.id === activeAgent.id ? { ...a, status: 'stuck', stuckSince: Date.now(), currentAction: 'Route blocked — storm flooding' } : a
        ));
        const log = createLog('ALERT', `${activeAgent.name} stuck in ${activeAgent.zone} — storm flooding detected. Route blocked.`, 'critical');
        addLog(log);
        queueLlmReasoning('routing',
          `Agent ${activeAgent.name} stuck in ${activeAgent.zone} due to storm flooding. Route completely blocked. No alternate path available.`,
          (reasoning) => {
            setLogs(prev => prev.map(l => l.id === log.id ? { ...l, reasoning } : l));
          }
        );

        // Recover after 6s
        setTimeout(() => {
          setAgents(prev => prev.map(a =>
            a.id === activeAgent.id ? { ...a, status: 'idle', currentOrderId: undefined, stuckSince: undefined, currentAction: undefined } : a
          ));
          addLog(createLog('ROUTING', `${activeAgent.name} route recovered via alternate path — returning to idle pool`, 'medium'));
        }, 6000);
      }
    }, 2000);

    // Step 3: 4s — Orchestrator conflict
    setTimeout(() => {
      const template = CONFLICT_TEMPLATES[0]; // DEMAND vs ROUTING — most dramatic
      triggerConflict(template);
    }, 4000);

    // Step 4: 6s — Cascade event
    setTimeout(() => {
      const ordA = `ORD-DEMO-${Date.now()}`;
      const ordB = `ORD-DEMO-${Date.now() + 1}`;
      const ordC = `ORD-DEMO-${Date.now() + 2}`;
      playSFX('orderDelayed');
      addLog(createLog('ALERT', `Delay detected on ${ordA} — SLA breach imminent in Zone A`, 'critical'));

      setTimeout(() => {
        playSFX('orderDelayed');
        addLog(createLog('ALERT', `Delay detected on ${ordB} — cascading from ${ordA}`, 'critical'));
        triggerCascade(ordA, 'Zone A', [ordB, ordC]);
      }, 1500);
    }, 6000);

    // Step 5: 10s — Second conflict
    setTimeout(() => {
      const template = CONFLICT_TEMPLATES[1]; // ROUTING vs RECOVERY
      triggerConflict(template);
    }, 10000);

    // Step 6: 16s — Demo ends, weather normalizes
    setTimeout(() => {
      setDemoActive(false);
      setWeather(prev => ({
        ...WEATHER_CONDITIONS[0],
        event: null,
        eventModifier: 0,
        zoneDemand: { a: 55, b: 42, c: 38 },
        prediction: prev.prediction,
      }));
      addLog(createLog('DEMAND', 'DEMAND AGENT: Storm clearing — reverting to standard demand models.', 'medium'));
    }, 16000);
  }, [addLog, queueLlmReasoning, triggerCascade, triggerConflict]);

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
      playSFX('orderDelayed');
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
          playSFX('agentStuck');
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
          playSFX('agentStuck');
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
          playSFX('demandSpike');
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

  // Weather cycle
  useEffect(() => {
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

      addLog(createLog('DEMAND',
        `DEMAND AGENT: Weather shift — ${newCondition.condition}${eventRoll ? ` + ${eventRoll.event}` : ''}. Adjusting zone predictions.`,
        'medium'
      ));
    }, 30000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Orchestrator conflict generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.6) return;
      const template = pickRandom(CONFLICT_TEMPLATES);
      triggerConflict(template);
    }, 15000);

    return () => clearInterval(interval);
  }, [triggerConflict]);

  return {
    orders, agents, stores, logs,
    totalDelivered, totalDelayed, successRate,
    cascadeAlert, cascadeEvent, setCascadeEvent,
    weather, conflicts,
    demoActive, activateDemoMode,
  };
}
