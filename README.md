# 3D Journal Viewer - Modular File Structure

## Files

The application has been separated into three modular files:

### 1. **index.html** (2,489 lines)
- Main HTML structure
- All UI elements and panels
- External library references (Three.js, GSAP, Particles.js)
- Links to `styles.css` and `script.js`

### 2. **styles.css** (1,976 lines)
- All CSS styles
- Responsive design
- Animations and transitions
- Theme definitions
- Panel and UI styling

### 3. **script.js** (9,875 lines)
- All JavaScript functionality
- Three.js scene setup
- ⟐mniKeyboard system
- OmniSense Mode
- Camera controls
- Event handlers
- Particle systems
- All interactive features

---

## File Structure

```
project/
├── index.html          # HTML structure
├── styles.css          # All CSS
├── script.js           # All JavaScript
└── README.md          # This file
```

---

## Usage

**Open the project:**
1. All three files must be in the same directory
2. Open `index.html` in a web browser
3. Make sure you have internet connection (for CDN libraries)

**Development:**
- Edit `styles.css` for visual changes
- Edit `script.js` for functionality changes
- Edit `index.html` for structure changes

**External Dependencies (CDN):**
- Three.js r128
- GSAP 3.9.1
- Particles.js 2.0.0
- Google Fonts (Orbitron)

---

## Features

### ⟐mniKeyboard
- 68 interactive key cubes
- White levitating glow
- Billboard labels (always face camera)
- Arrow keys rotate selected cube
- Entity and Function fields
- Still Mode (typable keyboard)
- Click to select cubes
- Hover inspector updates

### OmniSense Mode
- Top-down workspace view
- Interactive control panels
- Grid visualization
- Manual transforms
- Docking system

### 3D Environment
- MySpace sphere
- Particle systems
- Jack In entrance sequence
- Camera controls (WASD + mouse)
- Fullscreen support

### Panels
- ⟐MNIKEYS INSPECTOR (combined inspector + controls)
- Help Panel
- Transform controls
- Position, rotation, scale sliders
- Still Mode checkbox
- Reset buttons

---

## Keyboard Shortcuts

**General:**
- `N` - Toggle ⟐mniKeyboard
- `L` - Toggle OmniSense Mode
- `O` - Reset camera
- `F` - Toggle fullscreen
- `C` - FPS mode (hold)
- `Q` - Toggle FAQ
- `X` - Toggle inspector
- `Z` - Toggle docks
- `B` - Balance camera rotation

**⟐mniKeyboard (when visible):**
- `Arrow Keys` - Rotate selected cube
- `Click` - Select cube
- `Any Key` - Jump animation (Still Mode ON)

**Camera Movement:**
- `W/A/S/D` - Move forward/left/back/right
- `R/F` - Move up/down
- `Mouse` - Look around

---

## Browser Compatibility

**Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- WebGL support
- JavaScript enabled
- Internet connection (for CDN libraries)

---

## Performance

**Desktop:**
- Smooth 60 FPS on modern hardware
- Optimized particle systems
- Efficient raycasting

**Mobile/Tablet:**
- Throttled controls for better performance
- Touch-optimized joystick with directional buttons
- Reduced particle updates
- Auto-scaling for smaller screens

---

## File Details

### index.html
Contains:
- DOCTYPE and meta tags
- Google Fonts link
- styles.css link
- All HTML panels and UI elements
- External library script tags
- script.js link

### styles.css
Contains:
- Base styles and resets
- Panel and button styles
- Responsive design rules
- Animations (@keyframes)
- Theme definitions
- Mobile optimizations
- Glow and visual effects

### script.js
Contains:
- Three.js scene setup
- Camera and renderer initialization
- ⟐mniKeyboard system (all functions)
- OmniSense Mode logic
- Event listeners (keyboard, mouse, touch)
- Animation loop
- Helper functions
- Data management
- Sound system
- All interactive features

---

## Notes

**Modular Benefits:**
- Easier to maintain
- Better code organization
- Faster development
- Cleaner version control
- Smaller individual file sizes

**File Loading:**
- All files load from the same directory
- No complex build process needed
- Works with any local web server
- Can be hosted on any static site host

---

## Version

**Current Version:** v2.1  
**Last Updated:** 2026-02-13  
**Total Lines:** 14,340 (combined)

---

## Future Enhancements

Potential additions:
- Face editor panel
- localStorage persistence
- Custom key mapping
- Export/import schemas
- Multi-cube selection
- Copy/paste faces
- Database integration

---

**Status:** ✅ Fully functional modular structure  
**Ready for:** Development, deployment, and schema integration
