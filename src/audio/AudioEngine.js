/**
 * AudioEngine.js
 * 
 * Main audio engine that orchestrates the Web Audio API context,
 * master effects chain, and instrument scheduling.
 */

import { createKick, createSnare, createHiHat, createChord } from './SoundGenerator.js';
import { Scheduler } from './Scheduler.js';

/**
 * AudioEngine manages the Web Audio API context, master effects,
 * and scheduling of all sequencer sounds.
 */
export class AudioEngine {
  /**
   * Creates a new AudioEngine instance
   * Note: AudioContext is NOT created in constructor due to browser autoplay policies
   */
  constructor() {
    this.context = null; // AudioContext - initialized on user interaction
    this.masterGain = null; // GainNode for master volume
    this.compressor = null; // DynamicsCompressorNode for limiting
    
    this.tempo = 85; // Default lo-fi BPM
    this.isPlaying = false;
    this.currentStep = 0;
    
    // Scheduler configuration
    this.scheduler = null;
    
    // Pattern data (set from outside)
    this.pattern = null;
  }

  /**
   * Initializes the AudioContext and audio chain
   * Must be called after user interaction (click/tap) per browser policy
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    // Create audio context if it doesn't exist
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
    }
    
    // Resume if suspended (browsers suspend until user interaction)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    
    // Setup master effects chain only once
    if (!this.masterGain) {
      this.setupMasterChain();
    }
    
    // Initialize scheduler
    if (!this.scheduler) {
      this.scheduler = new Scheduler({
        audioContext: this.context,
        onStep: (step) => {
          this.currentStep = step;
        },
        onSchedule: (step, time) => {
          this.scheduleStepSounds(step, time);
        },
        tempo: this.tempo
      });
    }
    
    return true;
  }

  /**
   * Sets up the master audio chain: source -> gain -> compressor -> destination
   * The compressor prevents clipping and adds subtle glue to the mix
   */
  setupMasterChain() {
    // Master gain at -6dB to prevent clipping with multiple voices
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.5; // -6dB
    
    // Compressor for gentle limiting and mix glue
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -20; // dB
    this.compressor.ratio.value = 4; // 4:1 compression ratio
    this.compressor.attack.value = 0.003; // 3ms attack (fast)
    this.compressor.release.value = 0.25; // 250ms release
    
    // Connect chain: masterGain -> compressor -> speakers
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.context.destination);
  }

  /**
   * Schedules sounds for a specific step based on the current pattern
   * @param {number} step - The step index (0-15)
   * @param {number} time - The exact AudioContext time to play
   */
  scheduleStepSounds(step, time) {
    if (!this.pattern) return;
    
    // Schedule kick if active
    if (this.pattern.kick[step]) {
      createKick(this.context, time, this.masterGain);
    }
    
    // Schedule snare if active
    if (this.pattern.snare[step]) {
      createSnare(this.context, time, this.masterGain);
    }
    
    // Schedule hi-hat if active
    if (this.pattern.hihat[step]) {
      createHiHat(this.context, time, this.masterGain);
    }
    
    // Schedule chord if active
    if (this.pattern.chord[step]) {
      createChord(this.context, time, this.masterGain);
    }
  }

  /**
   * Starts playback of the sequencer
   */
  start() {
    if (!this.scheduler || !this.context) return;
    
    this.isPlaying = true;
    this.scheduler.start();
  }

  /**
   * Stops playback of the sequencer
   */
  stop() {
    if (!this.scheduler) return;
    
    this.isPlaying = false;
    this.scheduler.stop();
  }

  /**
   * Toggles between play and stop states
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Updates the tempo
   * @param {number} newTempo - New BPM (60-180)
   */
  setTempo(newTempo) {
    this.tempo = newTempo;
    if (this.scheduler) {
      this.scheduler.setTempo(newTempo);
    }
  }

  /**
   * Sets the current pattern for playback
   * @param {Object} pattern - Pattern object with kick, snare, hihat, chord arrays
   */
  setPattern(pattern) {
    this.pattern = pattern;
  }

  /**
   * Resets the step counter to beginning
   */
  reset() {
    this.currentStep = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  /**
   * Cleans up audio resources
   */
  destroy() {
    this.stop();
    if (this.scheduler) {
      this.scheduler.destroy();
    }
    if (this.context) {
      this.context.close();
    }
  }
}

export default AudioEngine;
