/**
 * TitleBar.jsx
 * 
 * Windows 95 style title bar with window controls.
 */

import React from 'react';

/**
 * Windows 95 style title bar component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Window title to display
 */
function TitleBar({ title }) {
  return (
    <div className="title-bar">
      <div className="title-bar-text">
        <span className="title-icon">🎹</span>
        {title}
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-button minimize" aria-label="Minimize">
          🗕
        </button>
        <button className="title-bar-button maximize" aria-label="Maximize">
          🗖
        </button>
        <button className="title-bar-button close" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
