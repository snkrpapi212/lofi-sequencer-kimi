/**
 * SoundGenerator.js
 * 
 * Synthesizes lo-fi hip hop drum sounds and chords using the Web Audio API.
 * All sounds are generated in real-time - no samples used.
 */

/**
 * Creates a buffer of white noise for percussion synthesis
 * @param {AudioContext} context - The AudioContext to create the buffer in
 * @param {number} duration - Duration of the noise buffer in seconds
 * @returns {AudioBuffer} White noise buffer
 */
export function createNoiseBuffer(context, duration) {
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Fill buffer with random values between -1 and 1 (white noise)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
}

/**
 * Creates a kick drum sound with pitch envelope
 * Synthesizes an 808-style kick using oscillator frequency sweep
 * 
 * @param {AudioContext} context - The AudioContext
 * @param {number} time - The exact AudioContext time to start the sound
 * @param {GainNode} destination - The gain node to connect to (master gain)
 */
export function createKick(context, time, destination) {
  const osc = context.createOscillator();
  const oscGain = context.createGain();
  
  // Start at 150Hz and quickly sweep down to 50Hz for that punch
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.5);
  
  // Gain envelope: full volume then quick decay
  oscGain.gain.setValueAtTime(1, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  
  osc.type = 'sine';
  osc.connect(oscGain);
  oscGain.connect(destination);
  
  osc.start(time);
  osc.stop(time + 0.5);
  
  // Cleanup when done to prevent memory leaks
  osc.onended = () => {
    osc.disconnect();
    oscGain.disconnect();
  };
}

/**
 * Creates a snare drum sound using layered noise and tone
 * Combines white noise (for snap) with a tonal oscillator (for body)
 * 
 * @param {AudioContext} context - The AudioContext
 * @param {number} time - The exact AudioContext time to start the sound
 * @param {GainNode} destination - The gain node to connect to
 */
export function createSnare(context, time, destination) {
  // Noise component (the snap/crackle)
  const noise = context.createBufferSource();
  noise.buffer = createNoiseBuffer(context, 0.2);
  
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000; // Filter out low frequencies
  
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(1, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  
  // Tonal component (the body)
  const osc = context.createOscillator();
  const oscGain = context.createGain();
  
  osc.frequency.value = 180; // Near the fundamental of a snare drum
  oscGain.gain.setValueAtTime(0.7, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  
  // Connect noise path
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(destination);
  
  // Connect tone path
  osc.connect(oscGain);
  oscGain.connect(destination);
  
  // Start both components
  noise.start(time);
  noise.stop(time + 0.2);
  osc.start(time);
  osc.stop(time + 0.1);
  
  // Cleanup
  noise.onended = () => {
    noise.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
  };
  osc.onended = () => {
    osc.disconnect();
    oscGain.disconnect();
  };
}

/**
 * Creates a hi-hat sound using filtered noise
 * Highpass filter creates the metallic character
 * 
 * @param {AudioContext} context - The AudioContext
 * @param {number} time - The exact AudioContext time to start the sound
 * @param {GainNode} destination - The gain node to connect to
 */
export function createHiHat(context, time, destination) {
  const noise = context.createBufferSource();
  noise.buffer = createNoiseBuffer(context, 0.05);
  
  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000; // Very high frequency for metallic sound
  filter.Q.value = 1; // Resonance for character
  
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05); // Very short decay
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  
  noise.start(time);
  noise.stop(time + 0.05);
  
  noise.onended = () => {
    noise.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

/**
 * Creates a lo-fi jazz chord (Dm7 voicing)
 * Uses 3 oscillators with slight random detuning for analog warmth
 * 
 * @param {AudioContext} context - The AudioContext
 * @param {number} time - The exact AudioContext time to start the sound
 * @param {GainNode} destination - The gain node to connect to
 */
export function createChord(context, time, destination) {
  // Dm7 chord voicing: D4 (293.66), F4 (349.23), C5 (523.25)
  const frequencies = [293.66, 349.23, 523.25];
  
  frequencies.forEach(freq => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.frequency.value = freq;
    // Random detune between -5 and +5 cents for analog imperfection
    osc.detune.value = Math.random() * 10 - 5;
    osc.type = 'sine'; // Soft sine wave for lo-fi character
    
    // Multi-stage envelope for natural sound
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.05); // Quick attack
    gain.gain.linearRampToValueAtTime(0.1, time + 0.1);   // Slight decay
    gain.gain.setValueAtTime(0.1, time + 0.4);            // Sustain
    gain.gain.linearRampToValueAtTime(0, time + 0.6);     // Release
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start(time);
    osc.stop(time + 0.6);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  });
}

/**
 * Creates a bitcrusher effect for lo-fi degradation
 * Uses ScriptProcessorNode to quantize samples
 * Note: ScriptProcessor is deprecated but still widely supported
 * 
 * @param {AudioContext} context - The AudioContext
 * @returns {ScriptProcessorNode} The bitcrusher effect node
 */
export function createLoFiEffect(context) {
  const bufferSize = 4096;
  const bitcrusher = context.createScriptProcessor(bufferSize, 1, 1);
  
  const bits = 8; // Lower bits = more distortion
  const normFreq = 0.5; // Downsampling factor
  let lastSample = 0;
  let step = 0;
  
  bitcrusher.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);
    
    for (let i = 0; i < input.length; i++) {
      step++;
      // Hold sample for downsampling effect
      if (step % Math.max(1, Math.floor(1 / normFreq)) === 0) {
        // Quantize to N bits
        lastSample = Math.floor(input[i] * Math.pow(2, bits)) / Math.pow(2, bits);
      }
      output[i] = lastSample;
    }
  };
  
  return bitcrusher;
}
