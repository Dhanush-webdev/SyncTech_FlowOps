import { useCallback, useState } from 'react';
import { Zap, Play, VolumeX, Volume2 } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import DarkStores from './components/DarkStores';
import AgentStatus from './components/AgentStatus';
import DecisionLog from './components/DecisionLog';
import StatsBar from './components/StatsBar';
import CascadeAlert from './components/CascadeAlert';
import CascadeModal from './components/CascadeModal';
import WeatherPrediction from './components/WeatherPrediction';
import OrchestratorPanel from './components/OrchestratorPanel';
import { setMuted, isMuted } from './utils/sounds';

function App() {
  const {
    agents, stores, logs,
    totalDelivered, totalDelayed, successRate,
    cascadeAlert, cascadeEvent, setCascadeEvent,
    weather, conflicts,
    demoActive, activateDemoMode,
  } = useSimulation();

  const [soundOn, setSoundOn] = useState(true);
  const closeCascadeModal = useCallback(() => setCascadeEvent(null), [setCascadeEvent]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setMuted(!next);
  };

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
              <p className="text-[10px] leading-none" style={{ color: '#444' }}>Autonomous Quick-Commerce · v3.1</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mute toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ border: '1px solid #222' }}
              data-testid="sound-toggle-btn"
            >
              {soundOn
                ? <Volume2 size={12} style={{ color: '#10b981' }} />
                : <VolumeX size={12} style={{ color: '#555' }} />
              }
              <span className="text-[10px] font-medium" style={{ color: soundOn ? '#10b981' : '#555' }}>
                {soundOn ? 'SFX On' : 'SFX Off'}
              </span>
            </button>

            {/* Demo Mode button */}
            <button
              onClick={activateDemoMode}
              disabled={demoActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: demoActive ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)',
                border: `1px solid ${demoActive ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`,
                color: demoActive ? '#ef4444' : '#a855f7',
                cursor: demoActive ? 'not-allowed' : 'pointer',
                opacity: demoActive ? 0.7 : 1,
              }}
              data-testid="demo-mode-btn"
            >
              <Play size={11} fill={demoActive ? '#ef4444' : '#a855f7'} />
              <span className="text-[10px]">
                {demoActive ? 'Demo Running...' : 'Demo Mode'}
              </span>
            </button>

            {/* System status */}
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${demoActive ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-[11px]" style={{ color: '#555' }} data-testid="system-status">
                {demoActive ? 'Demo Active' : 'System Nominal'}
              </span>
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
