import { CloudRain, Sun, CloudLightning, Wind, Thermometer, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const WEATHER_ICONS = { sunny: Sun, rainy: CloudRain, stormy: CloudLightning, windy: Wind, heatwave: Thermometer };
const WEATHER_COLORS = {
  sunny: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
  rainy: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)' },
  stormy: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
  windy: { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.15)' },
  heatwave: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)' },
};
const DEMAND_IMPACT = {
  sunny: { label: 'NORMAL', modifier: 0 }, rainy: { label: 'HIGH', modifier: 25 },
  stormy: { label: 'VERY HIGH', modifier: 45 }, windy: { label: 'MODERATE', modifier: 10 },
  heatwave: { label: 'SURGE', modifier: 35 },
};

function ZonePredictionBar({ zone, base, modifier, color }) {
  const predicted = Math.min(100, base + modifier);
  const trend = modifier > 20 ? 'surge' : modifier > 0 ? 'rising' : 'stable';
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] w-14 flex-shrink-0 font-bold tracking-[0.1em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{zone}</span>
      <div className="flex-1 h-[6px] overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
        <div className="h-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${predicted}%`, backgroundColor: color }}>
          {modifier > 20 && <div className="absolute inset-0" style={{ animation: 'demandPulse 2s ease-in-out infinite', backgroundColor: `${color}40` }} />}
        </div>
      </div>
      <div className="flex items-center gap-1 w-16 justify-end">
        {trend === 'surge' ? <TrendingUp size={9} style={{ color: '#ef4444' }} /> : trend === 'rising' ? <TrendingUp size={9} style={{ color: '#f59e0b' }} /> : <TrendingDown size={9} style={{ color: '#10b981' }} />}
        <span className="text-[9px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: trend === 'surge' ? '#ef4444' : trend === 'rising' ? '#f59e0b' : '#10b981' }}>{predicted}%</span>
      </div>
    </div>
  );
}

export default function WeatherPrediction({ weather }) {
  if (!weather) return null;
  const WeatherIcon = WEATHER_ICONS[weather.condition] || Sun;
  const wc = WEATHER_COLORS[weather.condition] || WEATHER_COLORS.sunny;
  const impact = DEMAND_IMPACT[weather.condition] || DEMAND_IMPACT.sunny;

  return (
    <div className="flex flex-col h-full" data-testid="weather-prediction-panel">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>DEMAND PREDICTION</h2>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>LIVE</span>
        </span>
      </div>

      <div className="p-3 mb-3" style={{ backgroundColor: wc.bg, border: `1px solid ${wc.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: `${wc.color}12`, border: `1px solid ${wc.color}25` }}>
            <WeatherIcon size={16} style={{ color: wc.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold capitalize" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{weather.condition}</span>
              <span className="text-[9px] px-1.5 py-0.5 font-bold" style={{ fontFamily: 'var(--font-mono)', backgroundColor: `${wc.color}12`, color: wc.color }}>{weather.temp}°C</span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{weather.description}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: impact.modifier > 20 ? '#ef4444' : impact.modifier > 0 ? '#f59e0b' : '#10b981' }}>{impact.label}</div>
            <div className="text-[8px] font-bold tracking-[0.1em]" style={{ color: 'var(--text-dim)' }}>IMPACT</div>
          </div>
        </div>
      </div>

      {weather.event && (
        <div className="px-3 py-2 mb-3 flex items-center gap-2" style={{ backgroundColor: 'rgba(168,85,247,0.06)', borderLeft: '2px solid #a855f7' }}>
          <Calendar size={10} style={{ color: '#a855f7' }} />
          <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#a855f7' }}>{weather.event}</span>
          <span className="text-[9px] ml-auto font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>+{weather.eventModifier}%</span>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-[8px] font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>ZONE DEMAND FORECAST (2HR)</span>
        <ZonePredictionBar zone="Zone A" base={weather.zoneDemand?.a || 55} modifier={impact.modifier + (weather.eventModifier || 0)} color="#3b82f6" />
        <ZonePredictionBar zone="Zone B" base={weather.zoneDemand?.b || 42} modifier={impact.modifier} color="#14b8a6" />
        <ZonePredictionBar zone="Zone C" base={weather.zoneDemand?.c || 38} modifier={impact.modifier + Math.floor((weather.eventModifier || 0) / 2)} color="#8b5cf6" />
      </div>

      {weather.prediction && (
        <div className="mt-3 pt-2.5 text-[10px] leading-relaxed" style={{ borderTop: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }} data-testid="weather-ai-prediction">
          <span className="font-bold" style={{ color: '#a855f7' }}>AI: </span>
          <span style={{ color: 'var(--text-secondary)' }}>{weather.prediction}</span>
        </div>
      )}
    </div>
  );
}
