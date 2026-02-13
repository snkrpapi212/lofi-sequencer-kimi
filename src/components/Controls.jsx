/**
 * Controls.jsx
 * 
 * Playback controls, tempo slider, preset selector, and clear button.
 */

import React from 'react';
import { defaults } from '../utils/constants.js';

/**
 * Control panel component with all sequencer controls
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isPlaying - Whether playback is active
 * @param {boolean} props.audioInitialized - Whether audio context is ready
 * @param {number} props.tempo - Current BPM
 * @param {Function} props.onPlayStop - Toggle play/stop
 * @param {Function} props.onTempoChange - Tempo slider change handler
 * @param {Function} props.onPresetChange - Preset dropdown change handler
 * @param {Function} props.onClear - Clear pattern handler
 * @param {Function} props.onInitAudio - Initialize audio button handler
 */
function Controls({
  isPlaying,
  audioInitialized,
  tempo,
  onPlayStop,
  onTempoChange,
  onPresetChange,
  onClear,
  onInitAudio
}) {
  return (
    <div className="controls">
      {!audioInitialized ? (
        <button
          className="win95-button init-button"
          onClick={onInitAudio}
          type="button"
        >
          🔊 Initialize Audio
        </button>
      ) : (
        <>
          <button
            className={`win95-button play-button ${isPlaying ? 'playing' : ''}`}
            onClick={onPlayStop}
            type="button"
            aria-label={isPlaying ? 'Stop playback' : 'Start playback'}
          >
            {isPlaying ? '⏹ STOP' : '▶ PLAY'}
          </button>

          <div className="tempo-control">
            <label htmlFor="tempo-slider">
              TEMPO: <span className="tempo-value">{tempo}</span> BPM
            </label>
            <input
              id="tempo-slider"
              type="range"
              min={defaults.minTempo}
              max={defaults.maxTempo}
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
              className="win95-slider"
              aria-valuemin={defaults.minTempo}
              aria-valuemax={defaults.maxTempo}
              aria-valuenow={tempo}
            />
          </div>

          <div className="preset-control">
            <label htmlFor="preset-select">PRESET:</label>
            <select
              id="preset-select"
              onChange={(e) => onPresetChange(e.target.value)}
              className="win95-select"
              defaultValue=""
            >
              <option value="" disabled>Select preset...</option>
              <option value="lofi">🎵 Lo-Fi</option>
              <option value="trap">🔥 Trap</option>
              <option value="jazz">🎷 Jazz</option>
              <option value="empty">📝 Empty</option>
            </select>
          </div>

          <button
            className="win95-button clear-button"
            onClick={onClear}
            type="button"
          >
            🗑 CLEAR
          </button>
        </>
      )}
    </div>
  );
}

export default Controls;
