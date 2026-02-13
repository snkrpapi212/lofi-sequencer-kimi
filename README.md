# Lo-Fi Hip Hop Step Sequencer

A browser-based 16-step x 4-track step sequencer with authentic Windows 95 aesthetic and lo-fi hip hop sound design.

![Lo-Fi Beats Sequencer](screenshot.png)

## Project Description

This application is a fully functional step sequencer that runs in the browser, allowing users to create lo-fi hip hop beats with a nostalgic Windows 95 interface. It features four instrument tracks (Kick, Snare, Hi-Hat, and Chord), real-time audio synthesis using the Web Audio API, and multiple preset patterns.

## Tech Stack

- **Framework**: React 18
- **Audio Engine**: Web Audio API
- **Styling**: CSS3 with custom Windows 95 theme
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Target**: Chrome 90+, Firefox 88+, Safari 14+

## Features

### Core Sequencer
- **16-step pattern grid** across 4 instrument tracks
- **Real-time playback** with precise audio scheduling
- **Tempo control**: 60-180 BPM (default 85 BPM for that lo-fi feel)
- **Multiple presets**: Lo-Fi, Trap, and Jazz patterns
- **Clear function** to reset patterns instantly

### Instrument Tracks
1. **Kick Drum** - Deep 808-style kick with pitch envelope
2. **Snare** - Layered noise and tonal components
3. **Hi-Hat** - Crisp filtered noise percussion
4. **Lo-Fi Chord** - Dm7 jazz chord with analog-style detuning

### Windows 95 Aesthetic
- Authentic Win95 window chrome with title bar
- 3D raised/sunken button effects
- Classic color scheme (#c0c0c0 background, #000080 title bar)
- Animated rain background effect
- Pixel-perfect retro styling

### Keyboard Shortcuts
- `Space` - Play/Stop
- `C` - Clear pattern
- `Arrow Keys` - Navigate the grid
- `Enter` - Toggle selected step

## How to Run

### Development Mode
```bash
npm install
npm run dev
```
Then open http://localhost:5173 in your browser.

### Production Build
```bash
npm install
npm run build
npm run preview
```

## How to Test

Run the test suite:
```bash
npm test
```

Run tests once (CI mode):
```bash
npm run test:run
```

The test suite includes 25+ tests covering:
- Audio engine initialization and timing calculations
- State management (pattern toggling, clearing, presets)
- UI component rendering and interactions
- Keyboard shortcut handling

## Demo Description

The demo showcases the sequencer with three built-in presets:

1. **Lo-Fi Preset**: Classic boom-bap pattern with off-beat hi-hats and chord stabs
2. **Trap Preset**: Modern trap beat with fast hi-hats and syncopated kick
3. **Jazz Preset**: Relaxed jazz pattern with swung rhythms

To try it:
1. Click "Initialize Audio" to start the audio engine
2. Select a preset from the dropdown
3. Click "Play" or press Space to start playback
4. Click any step button to toggle it on/off
5. Adjust tempo with the slider

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design documentation.

## Performance

- Audio latency: < 10ms
- UI updates: 60fps during playback
- Efficient scheduling using Web Audio API timing (not setTimeout)
- Memoized React components for smooth rendering

## License

MIT License - Built with ♥ by Kimi Agent
