/**
 * Scheduler.js
 * 
 * Handles precise audio scheduling using the Web Audio API.
 * Uses a lookahead pattern: setTimeout checks periodically, 
 * but actual audio timing uses AudioContext.currentTime
 */

/**
 * Calculates the time duration of a 16th note at a given BPM
 * @param {number} bpm - Beats per minute
 * @returns {number} Duration of one 16th note in seconds
 */
export function calculateSixteenthNoteTime(bpm) {
  // 60 seconds / BPM = duration of one quarter note
  // Divide by 4 to get 16th note duration
  return (60.0 / bpm) / 4;
}

/**
 * Scheduler class manages the timing of step sequencer playback
 * Uses a lookahead pattern for precise audio scheduling without jitter
 */
export class Scheduler {
  /**
   * @param {Object} options - Configuration options
   * @param {AudioContext} options.audioContext - The Web Audio context
   * @param {Function} options.onStep - Callback when step changes (for UI)
   * @param {Function} options.onSchedule - Callback to trigger sounds
   * @param {number} options.tempo - Initial BPM
   */
  constructor({ audioContext, onStep, onSchedule, tempo = 85 }) {
    this.audioContext = audioContext;
    this.onStep = onStep;
    this.onSchedule = onSchedule;
    this.tempo = tempo;
    
    // Scheduling configuration
    this.lookahead = 25.0; // How often to call scheduler (ms)
    this.scheduleAheadTime = 0.1; // How far ahead to schedule (seconds)
    
    // Playback state
    this.isPlaying = false;
    this.currentStep = 0;
    this.nextNoteTime = 0.0;
    this.timerID = null;
  }

  /**
   * Updates the tempo without stopping playback
   * @param {number} newTempo - New BPM value
   */
  setTempo(newTempo) {
    this.tempo = newTempo;
  }

  /**
   * Advances the current step and calculates the next note time
   * Wraps from step 15 back to step 0 for continuous looping
   */
  nextNote() {
    // Calculate time for next 16th note based on current tempo
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat / 4; // Divide by 4 for 16th notes
    
    // Advance step counter, wrapping at 16
    this.currentStep = (this.currentStep + 1) % 16;
  }

  /**
   * Schedules all notes that fall within the lookahead window
   * This is called repeatedly while playing
   */
  scheduler() {
    // Schedule all notes that need to play before the next interval
    // The lookahead window ensures we don't miss any notes due to timer jitter
    while (
      this.nextNoteTime < 
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      // Notify UI of step change (for visual indicator)
      this.onStep(this.currentStep);
      
      // Schedule the actual audio events at the precise time
      this.onSchedule(this.currentStep, this.nextNoteTime);
      
      // Advance to next step
      this.nextNote();
    }
  }

  /**
   * Starts playback from the current position
   */
  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    // Start scheduling from the current audio context time
    this.nextNoteTime = this.audioContext.currentTime;
    
    // Begin the scheduling loop
    this.scheduler();
    this.timerID = setInterval(() => this.scheduler(), this.lookahead);
  }

  /**
   * Stops playback
   */
  stop() {
    this.isPlaying = false;
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
  }

  /**
   * Resets the step counter to 0
   * Call this when clearing or loading a new pattern
   */
  reset() {
    this.currentStep = 0;
  }

  /**
   * Cleans up resources
   */
  destroy() {
    this.stop();
  }
}

export default Scheduler;
