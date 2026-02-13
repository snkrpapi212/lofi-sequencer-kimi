# Architecture Documentation

## System Overview

The Lo-Fi Hip Hop Step Sequencer is built with a modular architecture separating audio concerns from UI concerns. The system consists of three main layers:

1. **Audio Layer** - Web Audio API synthesis and scheduling
2. **State Layer** - React hooks for pattern and playback state
3. **Presentation Layer** - React components with Windows 95 styling

## Audio Engine Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                     AudioEngine                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐                  │
│  │ AudioContext │───▶│ Master Gain  │──┐               │
│  └──────────────┘    └──────────────┘  │               │
│                                         ▼               │
│                              ┌──────────────────┐      │
│                              │  Compressor      │      │
│                              │  (-20dB thresh)  │      │
│                              └──────────────────┘      │
│                                         │               │
│                                         ▼               │
│                              ┌──────────────────┐      │
│                              │   Destination    │      │
│                              └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Scheduler  │    │ Sound Gen   │    │  Bitcrusher │
│  (setTimeout│    │ (Kick/Snare/│    │  (Lo-Fi FX) │
│   + WA time)│    │  Hat/Chord) │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Scheduling System

The scheduler uses a "lookahead" pattern for precise audio timing:

```
time ──────────────────────────────────────────────▶

AudioContext.currentTime
         │
         ▼
    ┌────────┐
    │  now   │
    └────────┘
         │
         │    scheduleAheadTime (0.1s)
         │    ┌──────────────────┐
         └───▶│  schedule window │◀── notes queued here
              └──────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
      [note1]   [note2]   [note3]  ...scheduled ahead
         │         │         │
         ▼         ▼         ▼
      play      play      play     ...exact AudioContext time
```

**Key Design Decisions:**
- `setTimeout` at 25ms intervals is ONLY for checking if new notes need scheduling
- Actual audio timing uses `AudioContext.currentTime` for sample-accurate playback
- Notes are scheduled 100ms ahead of time to avoid jitter

### Sound Synthesis

Each instrument is synthesized in real-time using Web Audio API:

#### Kick Drum
- Oscillator with exponential frequency ramp (150Hz → 50Hz)
- Gain envelope for punchy decay
- Sine wave for sub-bass presence

#### Snare
- Parallel signal path:
  - White noise through highpass filter (1000Hz) for snap
  - Triangle/sine oscillator at 180Hz for body
- Independent gain envelopes for each component

#### Hi-Hat
- White noise through steep highpass (7000Hz)
- Short envelope (50ms) for crisp transient
- High Q value for metallic character

#### Chord
- 3 oscillators (D4, F4, C5) for Dm7 voicing
- Random detune (±5 cents) per note for analog warmth
- Multi-stage envelope (attack → sustain → release)

## Component Tree

```
App
├── Window95Container
│   ├── TitleBar
│   │   └── WindowControls (minimize, maximize, close buttons)
│   ├── RainBackground (animated rain effect)
│   └── WindowContent
│       ├── Controls
│       │   ├── PlayButton
│       │   ├── TempoSlider
│       │   ├── PresetSelector
│       │   └── ClearButton
│       └── Sequencer
│           └── TrackRow (×4)
│               ├── TrackLabel
│               └── StepButton (×16 per row)
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `App` | Audio engine initialization, keyboard event handling |
| `Window95Container` | Window chrome styling, rain animation |
| `TitleBar` | Drag handling (visual only), window controls |
| `Controls` | Playback control UI, tempo/preset management |
| `Sequencer` | Grid layout, step state coordination |
| `TrackRow` | Track-specific rendering, label display |
| `StepButton` | Individual step toggle, visual states |

## Data Flow

### State Management

The application uses React's built-in `useState` and `useReducer` for state management:

```
┌─────────────────────────────────────────────────────────────┐
│                         App State                            │
├─────────────────────────────────────────────────────────────┤
│  pattern: { kick[], snare[], hihat[], chord[] }             │
│  isPlaying: boolean                                         │
│  tempo: number (60-180)                                     │
│  currentStep: number (0-15)                                 │
│  selectedStep: { row, col }                                 │
│  audioInitialized: boolean                                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐       ┌──────────┐
    │Controls  │        │Sequencer │       │AudioEng  │
    │Component │        │Component │       │ine       │
    └──────────┘        └──────────┘       └──────────┘
          │                   │                   │
          ▼                   ▼                   ▼
    tempo change        toggleStep()      scheduleNote()
    play/stop           clearPattern()    createKick()
    preset load         keyboard nav      createSnare()
                                              etc.
```

### Audio Initialization Flow

Due to browser autoplay policies, AudioContext must be initialized on user interaction:

```
User clicks "Initialize Audio"
         │
         ▼
┌─────────────────┐
│ Create AudioCtx │
│ (if not exists) │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Setup Master    │
│ Chain (Gain→Comp│
│ →Destination)   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Resume Context  │
│ (if suspended)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Enable Controls │
└─────────────────┘
```

### Step Toggle Flow

```
User clicks step button
         │
         ▼
┌─────────────────────────┐
│ toggleStep(track, step) │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Create new pattern obj  │
│ (immutable update)      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ setPattern(newPattern)  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ React re-renders Step   │
│ with new active state   │
└─────────────────────────┘
```

## Performance Optimizations

### Audio Performance
1. **No garbage collection during playback** - Pre-allocated noise buffers
2. **Sample-accurate scheduling** - Uses AudioContext time, not setTimeout
3. **Efficient lookahead** - Only 25ms checks, 100ms scheduling window
4. **Compressor on master** - Prevents clipping without complex per-voice limiting

### UI Performance
1. **React.memo on StepButton** - Prevents unnecessary re-renders
2. **requestAnimationFrame for indicator** - Smooth step indicator without React overhead
3. **CSS transforms for animations** - GPU-accelerated visual effects
4. **Lazy audio context creation** - Only created when user interacts

## File Structure

```
src/
├── components/
│   ├── Window95Container.jsx    # Main window chrome + rain bg
│   ├── TitleBar.jsx             # Win95 title bar with controls
│   ├── Sequencer.jsx            # Main sequencer grid
│   ├── TrackRow.jsx             # Single track row (16 steps)
│   ├── StepButton.jsx           # Individual step button
│   └── Controls.jsx             # Play, tempo, presets, clear
├── audio/
│   ├── AudioEngine.js           # Main audio engine class
│   ├── Scheduler.js             # Note scheduling logic
│   └── SoundGenerator.js        # Instrument synthesis
├── styles/
│   ├── windows95.css            # Win95 UI components
│   ├── sequencer.css            # Sequencer-specific styles
│   └── animations.css           # Rain and glow animations
├── utils/
│   └── constants.js             # Presets, defaults, config
├── App.jsx                      # Root component
├── main.jsx                     # Entry point
└── App.test.jsx                 # Test suite
```

## Browser Compatibility

The application targets modern browsers with Web Audio API support:

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| AudioContext | 90+ | 88+ | 14+ |
| DynamicsCompressor | ✓ | ✓ | ✓ |
| createBufferSource | ✓ | ✓ | ✓ |
| exponentialRamp | ✓ | ✓ | ✓ |

Note: Safari requires user interaction before AudioContext can resume.
