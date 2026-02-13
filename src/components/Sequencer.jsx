/**
 * Sequencer.jsx
 * 
 * Main sequencer grid component containing all track rows.
 */

import React from 'react';
import TrackRow from './TrackRow.jsx';
import { tracks } from '../utils/constants.js';

/**
 * Main sequencer grid component
 * Renders all 4 tracks with their 16 steps each
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pattern - Current pattern state
 * @param {number} props.currentStep - Currently playing step index
 * @param {Object} props.selectedStep - { row: number, col: number } or null
 * @param {Function} props.onToggleStep - Callback when a step is toggled
 */
function Sequencer({ pattern, currentStep, selectedStep, onToggleStep }) {
  return (
    <div className="sequencer" role="grid" aria-label="Step sequencer grid">
      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          trackId={track.id}
          trackName={track.name}
          steps={pattern[track.id]}
          currentStep={currentStep}
          selectedStep={selectedStep?.row === index ? selectedStep.col : -1}
          onToggleStep={onToggleStep}
        />
      ))}
    </div>
  );
}

export default Sequencer;
