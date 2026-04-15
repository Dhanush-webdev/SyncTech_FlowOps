import { Zap } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import DarkStores from './components/DarkStores';
import AgentStatus from './components/AgentStatus';
import DecisionLog from './components/DecisionLog';
import StatsBar from './components/StatsBar';

function App() {
  const { agents, stores, logs, totalDelivered, totalDelayed, successRate } = useSimulation();

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0a0a0a', fontFamily: "'Inter', system-ui, sans-serif" }} data-testid="app-container">
      <header className="flex-shrink-0 border-b px-6 py-3" style={{ borderColor: '#1a1a1a' }} data-testid="app-header">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Zap size={14} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide" data-testid="app-title">DarkOps Control Center</h1>
              <p className="text-[10px] leading-none" style={{ color: '#444' }}>Autonomous Quick-Commerce · v2.4.1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px]" style={{ color: '#555' }} data-testid="system-status">System Nominal</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-6 py-4 gap-4 min-h-0">
        <div className="flex-shrink-0">
          <StatsBar
            totalDelivered={totalDelivered}
            totalDelayed={totalDelayed}
            activeAgents={agents.filter(a => a.status === 'active').length}
            successRate={successRate}
          />
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden" data-testid="main-grid">
          <div className="flex flex-col min-h-0 overflow-y-auto rounded-xl border p-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <DarkStores stores={stores} />
          </div>

          <div className="flex flex-col min-h-0 overflow-y-auto rounded-xl border p-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <AgentStatus agents={agents} />
          </div>

          <div className="flex flex-col min-h-0 overflow-hidden rounded-xl border p-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <DecisionLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
