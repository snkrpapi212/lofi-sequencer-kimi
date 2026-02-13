/**
 * StepButton.jsx
 * 
 * Individual step button component with memoization for performance.
 * Displays the active state, current step indicator, and handles clicks.
 */

import React from 'react';

/**
 * Individual step button in the sequencer grid
 * Uses React.memo to prevent unnecessary re-renders
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isActive - Whether the step is active (should play sound)
 * @param {boolean} props.isCurrent - Whether this is the currently playing step
 * @param {Function} props.onClick - Click handler
 * @param {string} props.trackId - Track identifier (for accessibility)
 * @param {number} props.stepIndex - Step index (for accessibility)
 * @param {boolean} props.isSelected - Whether this step is keyboard-selected
 */
const StepButton = React.memo(function StepButton({
  isActive,
  isCurrent,
  onClick,
  trackId,
  stepIndex,
  isSelected
}) {
  // Build class list based on state
  const classNames = ['step-button'];
  if (isActive) classNames.push('active');
  if (isCurrent) classNames.push('current-step');
  if (isSelected) classNames.push('selected');
  
  return (
    <button
      className={classNames.join(' ')}
      onClick={onClick}
      aria-label={`${trackId} step ${stepIndex + 1} ${isActive ? 'active' : 'inactive'}`}
      data-track={trackId}
      data-step={stepIndex}
      type="button"
    >
      <span className="step-indicator" />
    </button>
  );
});

export default StepButton;
