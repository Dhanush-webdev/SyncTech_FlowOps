import { CloudRain, Sun, CloudLightning, Wind, Thermometer, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const WEATHER_ICONS = {
  sunny: Sun,
  rainy: CloudRain,
  stormy: CloudLightning,
  windy: Wind,
  heatwave: Thermometer,
};

const WEATHER_COLORS = {
  sunny: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
  rainy: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)' },
  stormy: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
  windy: { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.15)' },
  heatwave: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)' },
};

const DEMAND_IMPACT = {
  sunny: { label: 'Normal', modifier: 0 },
  rainy: { label: 'High', modifier: 25 },
  stormy: { label: 'Very High', modifier: 45 },
  windy: { label: 'Moderate', modifier: 10 },
  heatwave: { label: 'Surge', modifier: 35 },
};

function ZonePredictionBar({ zone, base, modifier, color }) {
  const predicted = Math.min(100, base + modifier);
  const trend = modifier > 20 ? 'surge' : modifier > 0 ? 'rising' : 'stable';

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] w-14 flex-shrink-0" style={{ color: '#555' }}>{zone}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
        <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out" style={{ width: `${predicted}%`, backgroundColor: color }}>
          {modifier > 20 && (
            <div className="absolute inset-0 rounded-full" style={{ animation: 'demandPulse 2s ease-in-out infinite', backgroundColor: `${color}40` }} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 w-16 justify-end">
        {trend === 'surge' ? <TrendingUp size={9} style={{ color: '#ef4444' }} /> :
         trend === 'rising' ? <TrendingUp size={9} style={{ color: '#f59e0b' }} /> :
         <TrendingDown size={9} style={{ color: '#10b981' }} />}
        <span className="text-[9px] font-mono tabular-nums" style={{ color: trend === 'surge' ? '#ef4444' : trend === 'rising' ? '#f59e0b' : '#10b981' }}>
          {predicted}%
        </span>
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
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#555' }}>
          Demand Prediction
        </h2>
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#10b981' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Weather condition */}
      <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: wc.bg, border: `1px solid ${wc.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${wc.color}15`, border: `1px solid ${wc.color}25` }}>
            <WeatherIcon size={16} style={{ color: wc.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white capitalize">{weather.condition}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${wc.color}15`, color: wc.color }}>
                {weather.temp}°C
              </span>
            </div>
            <span className="text-[10px]" style={{ color: '#555' }}>{weather.description}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold" style={{ color: impact.modifier > 20 ? '#ef4444' : impact.modifier > 0 ? '#f59e0b' : '#10b981' }}>
              {impact.label}
            </div>
            <div className="text-[9px]" style={{ color: '#333' }}>demand impact</div>
          </div>
        </div>
      </div>

      {/* Active event */}
      {weather.event && (
        <div className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2" style={{ backgroundColor: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <Calendar size={10} style={{ color: '#a855f7' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#a855f7' }}>{weather.event}</span>
          <span className="text-[9px] ml-auto" style={{ color: '#555' }}>+{weather.eventModifier}% demand</span>
        </div>
      )}

      {/* Zone predictions */}
      <div className="space-y-2.5">
        <span className="text-[9px] font-bold tracking-wider" style={{ color: '#444' }}>ZONE DEMAND FORECAST (2HR)</span>
        <ZonePredictionBar zone="Zone A" base={weather.zoneDemand?.a || 55} modifier={impact.modifier + (weather.eventModifier || 0)} color="#60a5fa" />
        <ZonePredictionBar zone="Zone B" base={weather.zoneDemand?.b || 42} modifier={impact.modifier} color="#2dd4bf" />
        <ZonePredictionBar zone="Zone C" base={weather.zoneDemand?.c || 38} modifier={impact.modifier + Math.floor((weather.eventModifier || 0) / 2)} color="#a78bfa" />
      </div>

      {/* AI prediction note */}
      {weather.prediction && (
        <div className="mt-3 pt-3 text-[10px] leading-relaxed" style={{ borderTop: '1px solid #1e1e1e', color: '#666' }} data-testid="weather-ai-prediction">
          <span className="font-bold" style={{ color: '#a855f7' }}>AI Prediction: </span>
          {weather.prediction}
        </div>
      )}
    </div>
  );
}
