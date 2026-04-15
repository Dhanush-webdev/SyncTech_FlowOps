// Web Audio API sound effects — no external files needed
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15, ramp = true) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    if (ramp) {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — fail silently
  }
}

function playSequence(notes, interval = 120) {
  notes.forEach(([freq, dur, type, vol], i) => {
    setTimeout(() => playTone(freq, dur, type, vol), i * interval);
  });
}

export const SFX = {
  // CASCADE ALERT — urgent double-beep alarm
  cascadeAlert: () => {
    playSequence([
      [880, 0.15, 'square', 0.12],
      [880, 0.15, 'square', 0.12],
      [660, 0.2, 'square', 0.1],
      [880, 0.15, 'square', 0.12],
      [880, 0.15, 'square', 0.12],
    ], 130);
  },

  // AGENT STUCK — descending warning
  agentStuck: () => {
    playSequence([
      [600, 0.2, 'sawtooth', 0.08],
      [440, 0.2, 'sawtooth', 0.06],
      [330, 0.3, 'sawtooth', 0.05],
    ], 150);
  },

  // CONFLICT DETECTED — two clashing tones
  conflictDetected: () => {
    playSequence([
      [520, 0.15, 'triangle', 0.1],
      [380, 0.15, 'triangle', 0.1],
      [520, 0.12, 'triangle', 0.08],
    ], 100);
  },

  // CONFLICT RESOLVED — ascending resolution
  conflictResolved: () => {
    playSequence([
      [440, 0.12, 'sine', 0.08],
      [554, 0.12, 'sine', 0.08],
      [659, 0.2, 'sine', 0.1],
    ], 120);
  },

  // CASCADE RESOLVED — triumphant chime
  cascadeResolved: () => {
    playSequence([
      [523, 0.12, 'sine', 0.1],
      [659, 0.12, 'sine', 0.1],
      [784, 0.15, 'sine', 0.12],
      [1047, 0.3, 'sine', 0.1],
    ], 130);
  },

  // ORDER DELAYED — single low alert
  orderDelayed: () => {
    playTone(330, 0.3, 'triangle', 0.06);
  },

  // DEMAND SPIKE — quick ascending pip
  demandSpike: () => {
    playSequence([
      [660, 0.08, 'sine', 0.06],
      [880, 0.12, 'sine', 0.06],
    ], 80);
  },

  // DEMO MODE ACTIVATED — distinctive startup sound
  demoMode: () => {
    playSequence([
      [392, 0.1, 'sine', 0.1],
      [523, 0.1, 'sine', 0.1],
      [659, 0.1, 'sine', 0.1],
      [784, 0.15, 'sine', 0.12],
      [1047, 0.3, 'sine', 0.1],
    ], 100);
  },
};

// Mute control
let muted = false;

export function setMuted(val) {
  muted = val;
}

export function isMuted() {
  return muted;
}

// Wrapped SFX that respects mute
export function playSFX(name) {
  if (muted) return;
  if (SFX[name]) SFX[name]();
}
