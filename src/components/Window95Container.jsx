/**
 * Window95Container.jsx
 * 
 * Main container with Windows 95 window styling and rain background.
 */

import React from 'react';
import TitleBar from './TitleBar.jsx';

/**
 * Windows 95 styled window container
 * Includes animated rain background and window chrome
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Window title
 * @param {React.ReactNode} props.children - Child content
 */
function Window95Container({ title, children }) {
  return (
    <div className="window95-wrapper">
      {/* Animated rain background */}
      <div className="rain-container">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main window */}
      <div className="window95">
        <TitleBar title={title} />
        <div className="window-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Window95Container;
