/**
 * App.jsx
 * 
 * Main application component that orchestrates the audio engine,
 * state management, and UI rendering.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Window95Container from './components/Window95Container.jsx';
import Sequencer from './components/Sequencer.jsx';
import Controls from './components/Controls.jsx';
import { AudioEngine } from './audio/AudioEngine.js';
import { 
  initialPattern, 
  presets, 
  toggleStep, 
  clearPattern,
  tracks 
} from './utils/constants.js';
import './styles/windows95.css';
import './styles/sequencer.css';
import './styles/animations.css';

/**
 * Main application component
 * Manages audio engine, pattern state, and keyboard navigation
 */
function App() {
  // Audio engine ref (persisted across renders)
  const audioEngineRef = useRef(null);
  
  // Pattern state (64 steps total: 4 tracks × 16 steps)
  const [pattern, setPattern] = useState(initialPattern);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(85);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Keyboard navigation state
  const [selectedStep, setSelectedStep] = useState({ row: 0, col: 0 });

  /**
   * Initialize audio engine on first user interaction
   * Browsers require user gesture to create AudioContext
   */
  const initAudio = useCallback(async () => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AudioEngine();
    }
    
    const success = await audioEngineRef.current.init();
    if (success) {
      audioEngineRef.current.setPattern(pattern);
      setAudioInitialized(true);
    }
  }, [pattern]);

  /**
   * Toggle play/stop state
   */
  const handlePlayStop = useCallback(() => {
    if (!audioEngineRef.current) return;
    
    if (isPlaying) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
    } else {
      audioEngineRef.current.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  /**
   * Handle tempo change
   * @param {number} newTempo - New BPM value
   */
  const handleTempoChange = useCallback((newTempo) => {
    setTempo(newTempo);
    if (audioEngineRef.current) {
      audioEngineRef.current.setTempo(newTempo);
    }
  }, []);

  /**
   * Load a preset pattern
   * @param {string} presetName - Name of preset to load
   */
  const handlePresetChange = useCallback((presetName) => {
    const newPattern = presets[presetName];
    if (newPattern) {
      // Deep clone to avoid reference issues
      const clonedPattern = {
        kick: [...newPattern.kick],
        snare: [...newPattern.snare],
        hihat: [...newPattern.hihat],
        chord: [...newPattern.chord]
      };
      setPattern(clonedPattern);
      
      if (audioEngineRef.current) {
        audioEngineRef.current.setPattern(clonedPattern);
      }
    }
  }, []);

  /**
   * Clear all steps in the pattern
   */
  const handleClear = useCallback(() => {
    const cleared = clearPattern();
    setPattern(cleared);
    if (audioEngineRef.current) {
      audioEngineRef.current.setPattern(cleared);
    }
  }, []);

  /**
   * Toggle a step on/off
   * @param {string} track - Track ID
   * @param {number} step - Step index
   */
  const handleToggleStep = useCallback((track, step) => {
    setPattern(prevPattern => {
      const newPattern = toggleStep(prevPattern, track, step);
      if (audioEngineRef.current) {
        audioEngineRef.current.setPattern(newPattern);
      }
      return newPattern;
    });
  }, []);

  /**
   * Update current step from audio engine
   * Uses requestAnimationFrame for smooth UI updates
   */
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationId;
    const updateStep = () => {
      if (audioEngineRef.current) {
        setCurrentStep(audioEngineRef.current.currentStep);
      }
      animationId = requestAnimationFrame(updateStep);
    };
    
    animationId = requestAnimationFrame(updateStep);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  /**
   * Keyboard shortcuts handler
   * Space: Play/Stop
   * C: Clear pattern
   * Arrow keys: Navigate grid
   * Enter: Toggle selected step
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (audioInitialized) {
            handlePlayStop();
          }
          break;
          
        case 'c':
        case 'C':
          e.preventDefault();
          handleClear();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedStep(prev => ({
            ...prev,
            row: Math.max(0, prev.row - 1)
          }));
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setSelectedStep(prev => ({
            ...prev,
            row: Math.min(3, prev.row + 1)
          }));
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedStep(prev => ({
            ...prev,
            col: Math.max(0, prev.col - 1)
          }));
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          setSelectedStep(prev => ({
            ...prev,
            col: Math.min(15, prev.col + 1)
          }));
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedStep) {
            const trackId = tracks[selectedStep.row].id;
            handleToggleStep(trackId, selectedStep.col);
          }
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioInitialized, handlePlayStop, handleClear, selectedStep, handleToggleStep]);

  /**
   * Cleanup audio engine on unmount
   */
  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
    };
  }, []);

  return (
    <Window95Container title="Lo-Fi Beats.exe">
      <Controls
        isPlaying={isPlaying}
        audioInitialized={audioInitialized}
        tempo={tempo}
        onPlayStop={handlePlayStop}
        onTempoChange={handleTempoChange}
        onPresetChange={handlePresetChange}
        onClear={handleClear}
        onInitAudio={initAudio}
      />
      <Sequencer
        pattern={pattern}
        currentStep={currentStep}
        selectedStep={selectedStep}
        onToggleStep={handleToggleStep}
      />
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '11px', 
        color: '#404040',
        textAlign: 'center'
      }}>
        Shortcuts: Space = Play/Stop | C = Clear | Arrows = Navigate | Enter = Toggle
      </div>
    </Window95Container>
  );
}

export default App;
