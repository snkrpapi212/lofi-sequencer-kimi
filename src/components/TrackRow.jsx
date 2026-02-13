/**
 * TrackRow.jsx
 * 
 * Renders a single track row with label and 16 step buttons.
 */

import React from 'react';
import StepButton from './StepButton.jsx';

/**
 * A single track row in the sequencer grid
 * Contains the track label and all 16 step buttons
 * 
 * @param {Object} props - Component props
 * @param {string} props.trackId - Track identifier (kick, snare, hihat, chord)
 * @param {string} props.trackName - Display name for the track
 * @param {number[]} props.steps - Array of 16 values (0 or 1)
 * @param {number} props.currentStep - Currently playing step index
 * @param {number} props.selectedStep - Keyboard-selected step index (or -1)
 * @param {Function} props.onToggleStep - Callback when a step is clicked
 */
function TrackRow({
  trackId,
  trackName,
  steps,
  currentStep,
  selectedStep,
  onToggleStep
}) {
  return (
    <div className="track-row" data-track={trackId}>
      <div className="track-label" style={{ backgroundColor: '#000080' }}>
        {trackName}
      </div>
      <div className="track-steps">
        {steps.map((isActive, index) => (
          <StepButton
            key={`${trackId}-${index}`}
            isActive={isActive === 1}
            isCurrent={currentStep === index}
            isSelected={selectedStep === index}
            onClick={() => onToggleStep(trackId, index)}
            trackId={trackId}
            stepIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

export default TrackRow;
