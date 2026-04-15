import { useCallback } from 'react';
import { Zap } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import DarkStores from './components/DarkStores';
import AgentStatus from './components/AgentStatus';
import DecisionLog from './components/DecisionLog';
import StatsBar from './components/StatsBar';
import CascadeAlert from './components/CascadeAlert';
import CascadeModal from './components/CascadeModal';
import WeatherPrediction from './components/WeatherPrediction';
import OrchestratorPanel from './components/OrchestratorPanel';

function App() {
  const {
    agents, stores, logs,
    totalDelivered, totalDelayed, successRate,
    cascadeAlert, cascadeEvent, setCascadeEvent,
    weather, conflicts,
  } = useSimulation();

  const closeCascadeModal = useCallback(() => setCascadeEvent(null), [setCascadeEvent]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0a0a0a', fontFamily: "'Inter', system-ui, sans-serif" }} data-testid="app-container">
      {/* Header */}
      <header className="flex-shrink-0 border-b px-6 py-2.5" style={{ borderColor: '#1a1a1a' }} data-testid="app-header">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Zap size={14} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide" data-testid="app-title">DarkOps Control Center</h1>
              <p className="text-[10px] leading-none" style={{ color: '#444' }}>Autonomous Quick-Commerce · v3.0</p>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-3 gap-3 min-h-0">
        {/* Cascade Alert */}
        {cascadeAlert.active && (
          <div className="flex-shrink-0">
            <CascadeAlert active={cascadeAlert.active} failCount={cascadeAlert.failCount} />
          </div>
        )}

        {/* Stats bar */}
        <div className="flex-shrink-0">
          <StatsBar
            totalDelivered={totalDelivered}
            totalDelayed={totalDelayed}
            activeAgents={agents.filter(a => a.status === 'active').length}
            successRate={successRate}
          />
        </div>

        {/* Weather + Orchestrator row */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-4" style={{ maxHeight: '200px' }}>
          <div className="rounded-xl border p-3.5 overflow-y-auto" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <WeatherPrediction weather={weather} />
          </div>
          <div className="rounded-xl border p-3.5 overflow-y-auto" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <OrchestratorPanel conflicts={conflicts} />
          </div>
        </div>

        {/* 3-column grid */}
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

      {/* SyncTech Footer */}
      <footer className="flex-shrink-0 py-1.5 px-6" style={{ borderTop: '1px solid #1a1a1a' }} data-testid="synctech-footer">
        <div className="max-w-[1600px] mx-auto flex items-center justify-center">
          <span className="text-[10px] tracking-wide" style={{ color: '#333' }}>
            Powered by <span className="font-semibold" style={{ color: '#555' }}>SyncTech FlowOps</span>
          </span>
        </div>
      </footer>

      {/* Cascade Modal */}
      <CascadeModal cascadeEvent={cascadeEvent} onClose={closeCascadeModal} />
    </div>
  );
}

export default App;
