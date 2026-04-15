import { useCallback, useState } from 'react';
import { Zap, Play, VolumeX, Volume2, Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { useSimulation } from './hooks/useSimulation';
import DarkStores from './components/DarkStores';
import AgentStatus from './components/AgentStatus';
import DecisionLog from './components/DecisionLog';
import StatsBar from './components/StatsBar';
import CascadeAlert from './components/CascadeAlert';
import CascadeModal from './components/CascadeModal';
import WeatherPrediction from './components/WeatherPrediction';
import OrchestratorPanel from './components/OrchestratorPanel';
import { setMuted } from './utils/sounds';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
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
    <div
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-app)', fontFamily: 'var(--font-body)' }}
      data-testid="app-container"
    >
      {/* ══════════ HEADER ══════════ */}
      <header
        className="flex-shrink-0 px-5 py-2.5 transition-colors duration-300"
        style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        data-testid="app-header"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <Zap size={14} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h1
                className="text-sm font-black tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                data-testid="app-title"
              >
                DarkOps Control Center
              </h1>
              <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                AUTONOMOUS QUICK-COMMERCE · v3.1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 transition-colors hover:opacity-80"
              style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-alt)' }}
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark'
                ? <Sun size={12} style={{ color: '#fbbf24' }} />
                : <Moon size={12} style={{ color: '#6366f1' }} />
              }
              <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-2.5 py-1.5 transition-colors hover:opacity-80"
              style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-alt)' }}
              data-testid="sound-toggle-btn"
            >
              {soundOn
                ? <Volume2 size={12} style={{ color: '#10b981' }} />
                : <VolumeX size={12} style={{ color: 'var(--text-muted)' }} />
              }
              <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: soundOn ? '#10b981' : 'var(--text-muted)' }}>
                {soundOn ? 'SFX' : 'MUTE'}
              </span>
            </button>

            {/* Demo Mode */}
            <button
              onClick={activateDemoMode}
              disabled={demoActive}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.05em',
                backgroundColor: demoActive ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)',
                border: `1px solid ${demoActive ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`,
                color: demoActive ? '#ef4444' : '#a855f7',
                cursor: demoActive ? 'not-allowed' : 'pointer',
                opacity: demoActive ? 0.7 : 1,
              }}
              data-testid="demo-mode-btn"
            >
              <Play size={10} fill={demoActive ? '#ef4444' : '#a855f7'} />
              {demoActive ? 'DEMO RUNNING' : 'DEMO MODE'}
            </button>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 pl-2" style={{ borderLeft: '1px solid var(--border-color)' }}>
              <span className={`w-1.5 h-1.5 ${demoActive ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} data-testid="system-status">
                {demoActive ? 'DEMO' : 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ MAIN ══════════ */}
      <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-5 py-3 gap-3 min-h-0">
        {/* Cascade Alert */}
        {cascadeAlert.active && (
          <div className="flex-shrink-0">
            <CascadeAlert active={cascadeAlert.active} failCount={cascadeAlert.failCount} />
          </div>
        )}

        {/* Stats */}
        <div className="flex-shrink-0">
          <StatsBar
            totalDelivered={totalDelivered}
            totalDelayed={totalDelayed}
            activeAgents={agents.filter(a => a.status === 'active').length}
            successRate={successRate}
          />
        </div>

        {/* Weather + Orchestrator */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-3" style={{ maxHeight: '195px' }}>
          <div
            className="overflow-y-auto p-3.5 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <WeatherPrediction weather={weather} />
          </div>
          <div
            className="overflow-y-auto p-3.5 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <OrchestratorPanel conflicts={conflicts} />
          </div>
        </div>

        {/* 3-column grid */}
        <div className="flex-1 grid grid-cols-3 gap-3 min-h-0 overflow-hidden" data-testid="main-grid">
          <div
            className="flex flex-col min-h-0 overflow-y-auto p-4 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <DarkStores stores={stores} />
          </div>

          <div
            className="flex flex-col min-h-0 overflow-y-auto p-4 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <AgentStatus agents={agents} />
          </div>

          <div
            className="flex flex-col min-h-0 overflow-hidden p-4 transition-colors duration-300"
            style={{ backgroundColor: 'var(--terminal-bg)', border: '1px solid var(--border-color)' }}
          >
            <DecisionLog logs={logs} />
          </div>
        </div>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <footer
        className="flex-shrink-0 py-1.5 px-5 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        data-testid="synctech-footer"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-center">
          <span className="text-[10px] tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            POWERED BY <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>SYNCTECH FLOWOPS</span>
          </span>
        </div>
      </footer>

      <CascadeModal cascadeEvent={cascadeEvent} onClose={closeCascadeModal} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
