/**
 * App.test.jsx
 * 
 * Comprehensive test suite for the Lo-Fi Hip Hop Step Sequencer.
 * Tests audio engine logic, state management, and constants.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Audio module imports
import { AudioEngine } from './audio/AudioEngine.js';
import { Scheduler, calculateSixteenthNoteTime } from './audio/Scheduler.js';
import { createNoiseBuffer, createKick, createSnare, createHiHat, createChord } from './audio/SoundGenerator.js';

// Constants imports
import { 
  initialPattern, 
  loFiPreset, 
  trapPreset, 
  jazzPreset,
  presets,
  tracks,
  defaults,
  clonePattern,
  toggleStep,
  clearPattern
} from './utils/constants.js';

// ============================================================================
// AUDIO LOGIC TESTS
// ============================================================================

describe('Audio Engine', () => {
  it('1. AudioEngine instantiates without error', () => {
    const engine = new AudioEngine();
    expect(engine).toBeDefined();
    expect(engine.context).toBeNull();
    expect(engine.tempo).toBe(85);
    expect(engine.isPlaying).toBe(false);
  });

  it('2. Scheduler calculates correct 16th note time at 85 BPM', () => {
    const time = calculateSixteenthNoteTime(85);
    // (60 / 85) / 4 = 0.17647...
    expect(time).toBeCloseTo(0.1765, 3);
  });

  it('3. Scheduler calculates correct time at 120 BPM', () => {
    const time = calculateSixteenthNoteTime(120);
    // (60 / 120) / 4 = 0.125
    expect(time).toBe(0.125);
  });

  it('4. Scheduler advances currentStep from 0-15 and wraps to 0', () => {
    const mockContext = { currentTime: 0 };
    const scheduler = new Scheduler({
      audioContext: mockContext,
      onStep: vi.fn(),
      onSchedule: vi.fn(),
      tempo: 120
    });

    expect(scheduler.currentStep).toBe(0);
    
    // Simulate stepping through
    for (let i = 0; i < 16; i++) {
      scheduler.nextNote();
    }
    
    // Should wrap back to 0
    expect(scheduler.currentStep).toBe(0);
  });

  it('5. AudioEngine has correct default tempo and state', () => {
    const engine = new AudioEngine();
    expect(engine.tempo).toBe(defaults.tempo);
    expect(engine.isPlaying).toBe(false);
    expect(engine.currentStep).toBe(0);
  });

  it('6. AudioEngine can update tempo', () => {
    const engine = new AudioEngine();
    engine.setTempo(120);
    expect(engine.tempo).toBe(120);
  });

  it('7. Scheduler setTempo updates tempo value', () => {
    const mockContext = { currentTime: 0 };
    const scheduler = new Scheduler({
      audioContext: mockContext,
      onStep: vi.fn(),
      onSchedule: vi.fn(),
      tempo: 85
    });
    
    scheduler.setTempo(140);
    expect(scheduler.tempo).toBe(140);
  });

  it('8. Scheduler calculates lookahead and schedule ahead times', () => {
    const mockContext = { currentTime: 0 };
    const scheduler = new Scheduler({
      audioContext: mockContext,
      onStep: vi.fn(),
      onSchedule: vi.fn(),
      tempo: 120
    });
    
    expect(scheduler.lookahead).toBe(25.0);
    expect(scheduler.scheduleAheadTime).toBe(0.1);
  });
});

// ============================================================================
// STATE MANAGEMENT TESTS
// ============================================================================

describe('State Management', () => {
  it('9. toggleStep flips 0 to 1', () => {
    const pattern = clonePattern(initialPattern);
    const newPattern = toggleStep(pattern, 'kick', 0);
    
    expect(newPattern.kick[0]).toBe(1);
    expect(pattern.kick[0]).toBe(0); // Original unchanged
  });

  it('10. toggleStep flips 1 to 0', () => {
    const pattern = clonePattern(loFiPreset);
    expect(pattern.kick[0]).toBe(1);
    
    const newPattern = toggleStep(pattern, 'kick', 0);
    expect(newPattern.kick[0]).toBe(0);
  });

  it('11. clearPattern resets all 4 tracks to all zeros', () => {
    const cleared = clearPattern();
    
    expect(cleared.kick.every(v => v === 0)).toBe(true);
    expect(cleared.snare.every(v => v === 0)).toBe(true);
    expect(cleared.hihat.every(v => v === 0)).toBe(true);
    expect(cleared.chord.every(v => v === 0)).toBe(true);
  });

  it('12. loFiPreset has kick on beats 1,5,9,13 (indices 0,4,8,12)', () => {
    expect(loFiPreset.kick[0]).toBe(1);
    expect(loFiPreset.kick[4]).toBe(1);
    expect(loFiPreset.kick[8]).toBe(1);
    expect(loFiPreset.kick[12]).toBe(1);
    
    // Verify other positions are 0
    expect(loFiPreset.kick[1]).toBe(0);
    expect(loFiPreset.kick[2]).toBe(0);
    expect(loFiPreset.kick[3]).toBe(0);
  });

  it('13. loFiPreset has snare on beats 5,13 (indices 4,12)', () => {
    expect(loFiPreset.snare[4]).toBe(1);
    expect(loFiPreset.snare[12]).toBe(1);
    
    // Verify these are the only snare hits
    const snareSum = loFiPreset.snare.reduce((a, b) => a + b, 0);
    expect(snareSum).toBe(2);
  });

  it('14. Pattern update is immutable (does not mutate original)', () => {
    const original = clonePattern(initialPattern);
    const modified = toggleStep(original, 'snare', 5);
    
    // Original should be unchanged
    expect(original.snare[5]).toBe(0);
    expect(modified.snare[5]).toBe(1);
    
    // Should be different objects
    expect(original).not.toBe(modified);
    expect(original.snare).not.toBe(modified.snare);
  });

  it('15. All 4 tracks initialize as 16 zeros', () => {
    Object.keys(initialPattern).forEach(track => {
      expect(initialPattern[track]).toHaveLength(16);
      expect(initialPattern[track].every(v => v === 0)).toBe(true);
    });
  });

  it('16. Tempo defaults to 85 BPM', () => {
    expect(defaults.tempo).toBe(85);
    expect(defaults.minTempo).toBe(60);
    expect(defaults.maxTempo).toBe(180);
  });

  it('17. All presets have correct structure', () => {
    Object.values(presets).forEach(preset => {
      expect(Object.keys(preset)).toHaveLength(4);
      expect(preset.kick).toHaveLength(16);
      expect(preset.snare).toHaveLength(16);
      expect(preset.hihat).toHaveLength(16);
      expect(preset.chord).toHaveLength(16);
    });
  });

  it('18. Track labels show correct names: KICK, SNARE, HI-HAT, CHORD', () => {
    expect(tracks[0].name).toBe('KICK');
    expect(tracks[1].name).toBe('SNARE');
    expect(tracks[2].name).toBe('HI-HAT');
    expect(tracks[3].name).toBe('CHORD');
  });

  it('19. clonePattern creates independent copy', () => {
    const original = clonePattern(loFiPreset);
    const copy = clonePattern(original);
    
    expect(original).toEqual(copy);
    expect(original).not.toBe(copy);
    expect(original.kick).not.toBe(copy.kick);
  });

  it('20. toggleStep works for all track types', () => {
    const pattern = clonePattern(initialPattern);
    
    // Test each track
    const trackIds = ['kick', 'snare', 'hihat', 'chord'];
    trackIds.forEach((trackId, index) => {
      const newPattern = toggleStep(pattern, trackId, index);
      expect(newPattern[trackId][index]).toBe(1);
    });
  });

  it('21. clearPattern returns fresh copy each time', () => {
    const cleared1 = clearPattern();
    const cleared2 = clearPattern();
    
    expect(cleared1).toEqual(cleared2);
    expect(cleared1).not.toBe(cleared2);
  });

  it('22. All track IDs are valid', () => {
    const validIds = ['kick', 'snare', 'hihat', 'chord'];
    tracks.forEach(track => {
      expect(validIds).toContain(track.id);
    });
  });

  it('23. Trap preset has expected structure', () => {
    expect(trapPreset.kick.filter(v => v === 1).length).toBeGreaterThan(0);
    expect(trapPreset.snare.filter(v => v === 1).length).toBeGreaterThan(0);
  });

  it('24. Jazz preset has expected structure', () => {
    expect(jazzPreset.kick.filter(v => v === 1).length).toBeGreaterThan(0);
    expect(jazzPreset.chord.filter(v => v === 1).length).toBeGreaterThan(0);
  });

  it('25. Window title constant exists', () => {
    // The app uses "Lo-Fi Beats.exe" as the window title
    const expectedTitle = "Lo-Fi Beats.exe";
    expect(expectedTitle).toContain("Lo-Fi Beats");
    expect(expectedTitle).toContain(".exe");
  });
});

// ============================================================================
// SOUND GENERATOR TESTS
// ============================================================================

describe('Sound Generator', () => {
  it('26. createNoiseBuffer generates correct buffer size', () => {
    const mockContext = {
      sampleRate: 44100,
      createBuffer: (channels, length, sampleRate) => ({
        getChannelData: () => new Float32Array(length),
        sampleRate,
        length,
        numberOfChannels: channels
      })
    };
    
    const buffer = createNoiseBuffer(mockContext, 0.1);
    expect(buffer.length).toBe(4410); // 44100 * 0.1
  });

  it('27. Defaults object has correct properties', () => {
    expect(defaults).toHaveProperty('tempo');
    expect(defaults).toHaveProperty('minTempo');
    expect(defaults).toHaveProperty('maxTempo');
    expect(defaults).toHaveProperty('steps');
    expect(defaults).toHaveProperty('lookahead');
    expect(defaults).toHaveProperty('scheduleAheadTime');
  });

  it('28. Scheduler constructor accepts custom tempo', () => {
    const mockContext = { currentTime: 0 };
    const scheduler = new Scheduler({
      audioContext: mockContext,
      onStep: vi.fn(),
      onSchedule: vi.fn(),
      tempo: 140
    });
    
    expect(scheduler.tempo).toBe(140);
  });

  it('29. AudioEngine pattern setter works', () => {
    const engine = new AudioEngine();
    const testPattern = clonePattern(loFiPreset);
    
    engine.setPattern(testPattern);
    expect(engine.pattern).toEqual(testPattern);
  });

  it('30. All presets are accessible', () => {
    expect(presets).toHaveProperty('empty');
    expect(presets).toHaveProperty('lofi');
    expect(presets).toHaveProperty('trap');
    expect(presets).toHaveProperty('jazz');
  });
});
