/**
 * constants.js
 * 
 * Application constants including default patterns and presets.
 */

/**
 * Initial empty pattern - all tracks silent
 * 16 steps per track, 4 tracks total
 */
export const initialPattern = {
  kick:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  chord: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

/**
 * Classic lo-fi hip hop pattern
 * Kick on beats 1,5,9,13 (4-on-the-floor with swing feel)
 * Snare on beats 5,13 (backbeat)
 * Hi-hats on off-beats for that shuffled feel
 * Chords on beats 1 and 9 for space
 */
export const loFiPreset = {
  kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  chord: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
};

/**
 * Trap-style pattern
 * Fast hi-hats with rolls, syncopated kick for bounce
 */
export const trapPreset = {
  kick:  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hihat: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
  chord: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
};

/**
 * Jazz-style pattern
 * Sparse, swung feel with chord stabs
 */
export const jazzPreset = {
  kick:  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
  snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hihat: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  chord: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]
};

/**
 * All available presets
 */
export const presets = {
  empty: initialPattern,
  lofi: loFiPreset,
  trap: trapPreset,
  jazz: jazzPreset
};

/**
 * Track definitions for UI display
 */
export const tracks = [
  { id: 'kick', name: 'KICK', color: '#ff6b6b' },
  { id: 'snare', name: 'SNARE', color: '#4ecdc4' },
  { id: 'hihat', name: 'HI-HAT', color: '#ffe66d' },
  { id: 'chord', name: 'CHORD', color: '#a855f7' }
];

/**
 * Default application settings
 */
export const defaults = {
  tempo: 85,
  minTempo: 60,
  maxTempo: 180,
  steps: 16,
  lookahead: 25.0,
  scheduleAheadTime: 0.1
};

/**
 * Creates a deep copy of a pattern object
 * Ensures immutability when updating state
 * @param {Object} pattern - Pattern to clone
 * @returns {Object} Deep cloned pattern
 */
export function clonePattern(pattern) {
  return {
    kick: [...pattern.kick],
    snare: [...pattern.snare],
    hihat: [...pattern.hihat],
    chord: [...pattern.chord]
  };
}

/**
 * Toggles a step in the pattern (0 -> 1, 1 -> 0)
 * Returns a new pattern object (immutable update)
 * @param {Object} pattern - Current pattern
 * @param {string} track - Track ID (kick, snare, hihat, chord)
 * @param {number} step - Step index (0-15)
 * @returns {Object} New pattern with toggled step
 */
export function toggleStep(pattern, track, step) {
  const newPattern = clonePattern(pattern);
  newPattern[track][step] = newPattern[track][step] ? 0 : 1;
  return newPattern;
}

/**
 * Clears all steps in a pattern
 * @returns {Object} Empty pattern
 */
export function clearPattern() {
  return clonePattern(initialPattern);
}
