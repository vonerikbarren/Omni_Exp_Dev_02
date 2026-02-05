// Global variables
let scene, camera, renderer;
let interactiveObjects = [];
let journalPages = [];
let gridObjects = [];
let selectedObject = null;
let hoveredObject = null;
let isRotating = false;
let previousMousePosition = { x: 0, y: 0 };
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const cameraTarget = new THREE.Vector3(0, 0, 0);

// Keyboard controls
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    r: false,
    f: false,
    c: false
};
const moveSpeed = 0.2;

// Mouse look controls - only active when holding C
let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;
const lookSensitivity = 0.002;

// Camera breathing effect (Metroid Prime style)
let breathTime = 0;
const breathSpeed = 0.8;
const breathIntensity = 0.02;

// Hand menus
let leftHandVisible = false;
let rightHandVisible = false;
let consciousHandVisible = false;

// MySpace (grid sphere) state
let mySpaceExpanded = true;

// Particle Energy State variables
let particleSystem = null;
let particleCount = 3000;
let particleVelocities = null;

// Particle Behavior State
let particleBehaviorMode = 'calm'; // 'calm', 'forward', 'backward', 'connected', 'glitch', 'constellation'
let forwardFlowSpeed = 0.5; // 0-1 range
let backwardFlowSpeed = 0.5; // 0-1 range
let connectionFrequency = 0.5; // 0-1 range for connected mode
let glitchIntensity = 0.5; // 0-1 range for glitch mode
let constellationDistance = 3.0; // Distance for constellation connections (scaled from slider)

// FPS tracking
let lastFrameTime = performance.now();
let fps = 60;
let fpsFrames = 0;
let fpsTime = 0;
let mySpaceAnimating = false;
const expandedRadius = 25;
const collapsedRadius = 5;

// Pocket system with pagination
let pocketVisible = false;
let pocketItems = {}; // Object to store pocket items with metadata
const slotsPerPage = 20;
const totalPages = 10;
const maxPocketSlots = slotsPerPage * totalPages; // 200 total slots
let currentPocketPage = 1;

// Initialize pocket slots
for (let i = 0; i < maxPocketSlots; i++) {
    pocketItems[i] = {
        occupied: false,
        deployed: false, // true if item is out in the scene
        itemData: null,
        password: null
    };
}

// Docks visibility
let docksVisible = false; // Start hidden by default

// Session timer
let sessionStartTime = Date.now();
let timerInterval = null;

// Theme system
const themes = {
    'silver': {
        name: 'Silver',
        primary: 'rgba(60, 60, 70, 0.8)',
        accent: '#C0C0C0',
        text: '#E8E8E8',
        dockBg: '#ffffff',
        dockText: '#333333',
        dockGlow: 'rgba(255, 255, 255, 0.6)',
        preview: 'linear-gradient(135deg, #3c3c46, #808080)'
    },
    'darkblue': {
        name: 'Dark Blue',
        primary: 'rgba(25, 25, 30, 0.7)',
        accent: '#808080',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#1a1a2e',
        dockGlow: 'rgba(128, 128, 128, 0.6)',
        preview: 'linear-gradient(135deg, #0f0f23, #808080)'
    },
    'orange': {
        name: 'Orange',
        primary: 'rgba(30, 20, 10, 0.7)',
        accent: '#FF8C00',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#1e140a',
        dockGlow: 'rgba(255, 140, 0, 0.6)',
        preview: 'linear-gradient(135deg, #FF6B00, #FFA500)'
    },
    'yellow': {
        name: 'Yellow',
        primary: 'rgba(40, 40, 20, 0.7)',
        accent: '#FFD700',
        text: '#333',
        dockBg: '#ffffff',
        dockText: '#282814',
        dockGlow: 'rgba(255, 215, 0, 0.6)',
        preview: 'linear-gradient(135deg, #FFC107, #FFD700)'
    },
    'red': {
        name: 'Red',
        primary: 'rgba(30, 10, 10, 0.7)',
        accent: '#DC143C',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#1e0a0a',
        dockGlow: 'rgba(220, 20, 60, 0.6)',
        preview: 'linear-gradient(135deg, #DC143C, #FF6B6B)'
    },
    'purple': {
        name: 'Purple',
        primary: 'rgba(20, 10, 30, 0.7)',
        accent: '#9370DB',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#140a1e',
        dockGlow: 'rgba(147, 112, 219, 0.6)',
        preview: 'linear-gradient(135deg, #6A0DAD, #9370DB)'
    },
    'teal': {
        name: 'Teal',
        primary: 'rgba(10, 25, 25, 0.7)',
        accent: '#20B2AA',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#0a1919',
        dockGlow: 'rgba(32, 178, 170, 0.6)',
        preview: 'linear-gradient(135deg, #008B8B, #20B2AA)'
    },
    'neonblue': {
        name: 'Neon Blue',
        primary: 'rgba(10, 10, 25, 0.7)',
        accent: '#00FFFF',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#0a0a19',
        dockGlow: 'rgba(0, 255, 255, 0.6)',
        preview: 'linear-gradient(135deg, #00CED1, #00FFFF)'
    },
    'magenta': {
        name: 'Magenta',
        primary: 'rgba(30, 10, 30, 0.7)',
        accent: '#FF00FF',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#1e0a1e',
        dockGlow: 'rgba(255, 0, 255, 0.6)',
        preview: 'linear-gradient(135deg, #C71585, #FF00FF)'
    },
    'rainbow': {
        name: 'Rainbow Static',
        primary: 'rgba(20, 20, 35, 0.75)',
        accent: '#FF00FF',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#141423',
        dockGlow: 'rgba(255, 0, 255, 0.6)',
        preview: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
        isRainbow: true,
        animated: false
    },
    'rainbowFlow': {
        name: 'Rainbow Flow',
        primary: 'rgba(20, 20, 35, 0.75)',
        accent: '#FF00FF',
        text: '#fff',
        dockBg: '#ffffff',
        dockText: '#141423',
        dockGlow: 'rgba(255, 0, 255, 0.6)',
        preview: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
        isRainbow: true,
        animated: true
    },
    'whiteBright': {
        name: 'White Bright',
        primary: 'rgba(255, 255, 255, 0.85)',
        accent: '#ffffff',
        text: '#333',
        dockBg: '#ffffff',
        dockText: '#333',
        dockGlow: 'rgba(255, 255, 255, 0.9)',
        preview: 'linear-gradient(135deg, #ffffff, #f0f0f0)'
    }
};

let currentTheme = 'silver';

// Wisdom, jokes, and FYIs
const wiseSayings = [
    "The journey of a thousand miles begins with a single step.",
    "It does not matter how slowly you go as long as you do not stop.",
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, don't waste it living someone else's life.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "Believe you can and you're halfway there.",
    "Do not wait for leaders; do it alone, person to person.",
    "The future belongs to those who believe in the beauty of their dreams."
];

const funnyJokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the bicycle fall over? It was two tired!",
    "What did one wall say to the other? I'll meet you at the corner!",
    "Why don't skeletons fight each other? They don't have the guts!",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
    "How does a penguin build its house? Igloos it together!"
];

const randomFYIs = [
    "FYI: Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
    "FYI: Octopuses have three hearts and blue blood!",
    "FYI: A group of flamingos is called a 'flamboyance'!",
    "FYI: The shortest war in history lasted 38 minutes!",
    "FYI: Bananas are berries, but strawberries aren't!",
    "FYI: There are more stars in the universe than grains of sand on Earth!",
    "FYI: A single bolt of lightning contains enough energy to toast 100,000 slices of bread!",
    "FYI: The human brain uses 20% of the body's energy despite being only 2% of body weight!",
    "FYI: Venus is the only planet that rotates clockwise!",
    "FYI: A jiffy is an actual unit of time - 1/100th of a second!"
];

function showWisdomPrompt() {
    document.getElementById('restart-prompt').classList.remove('visible');
    
    const allContent = [...wiseSayings, ...funnyJokes, ...randomFYIs];
    const randomContent = allContent[Math.floor(Math.random() * allContent.length)];
    
    document.getElementById('wisdom-text').textContent = randomContent;
    document.getElementById('wisdom-prompt').classList.add('visible');
    playSound('passive');
}

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;

    currentTheme = themeName;
    
    // Remove any existing rainbow animations
    document.querySelectorAll('.rainbow-animated, .rainbow-border, .rainbow-glow').forEach(el => {
        el.classList.remove('rainbow-animated', 'rainbow-border', 'rainbow-glow');
    });
    
    // Kill any existing rainbow GSAP animations
    if (window.rainbowTimeline) {
        window.rainbowTimeline.kill();
        window.rainbowTimeline = null;
    }
    
    // Kill all GSAP tweens on UI elements
    gsap.killTweensOf('.side-menu, #inspector-panel, #info-panel, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, .menu-item, .submenu-item, #transform-panel, .control-btn, .action-btn, #virtual-keyboard, .key-btn, .menu-title, .info-space-title, .breadcrumb-current, .controls-title, .prompt-title, .joystick-stick');
    
    // Reset CSS properties that GSAP may have modified
    document.querySelectorAll('.side-menu, #inspector-panel, #info-panel, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, .menu-item, .submenu-item, #transform-panel, .control-btn, .action-btn, #virtual-keyboard, .key-btn').forEach(el => {
        el.style.borderColor = '';
        el.style.backgroundPosition = '';
        el.style.backgroundSize = '';
    });
    
    document.querySelectorAll('.menu-title, .info-space-title, .breadcrumb-current, .controls-title, .prompt-title, .joystick-stick').forEach(el => {
        el.style.backgroundPosition = '';
        el.style.backgroundSize = '';
    });

    // Handle rainbow themes
    const isRainbow = theme.isRainbow;
    const isAnimated = theme.animated;
    
    // Update CSS variables or directly update elements
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-text', theme.text);

    // Update all panels (including header-bar and particle-behavior-panel)
    document.querySelectorAll('.side-menu, #inspector-panel, #header-bar, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, #transform-panel, #particle-behavior-panel').forEach(el => {
        el.style.background = theme.primary;
        el.style.backdropFilter = 'blur(20px)';
        el.style.color = theme.text;
        if (isRainbow && isAnimated) {
            el.classList.add('rainbow-border');
        }
    });

    // Update accent colors with rainbow
    document.querySelectorAll('.menu-title, .info-space-title, .breadcrumb-current, .controls-title, .prompt-title').forEach(el => {
        if (isRainbow) {
            el.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
            el.style.webkitTextFillColor = 'transparent';
            if (isAnimated) {
                el.classList.add('rainbow-animated');
            }
        } else {
            el.style.color = theme.accent;
            el.style.background = 'none';
            el.style.backgroundClip = 'unset';
            el.style.webkitBackgroundClip = 'unset';
            el.style.webkitTextFillColor = 'unset';
        }
    });

    // Update borders
    document.querySelectorAll('.side-menu, #inspector-panel, #header-bar, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, .menu-item, .submenu-item, #transform-panel, #particle-behavior-panel').forEach(el => {
        if (isRainbow && !isAnimated) {
            el.style.borderImage = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1';
        } else if (!isRainbow) {
            el.style.borderImage = 'none';
            el.style.borderColor = theme.accent + '80';
        }
    });

    // Update hamburger spans
    document.querySelectorAll('.hamburger-btn span').forEach(el => {
        el.style.background = theme.accent;
    });

    // Update text elements
    document.querySelectorAll('.menu-item, .submenu-item, .breadcrumb, .info-username, .faq-answer, .faq-question, .prompt-message').forEach(el => {
        el.style.color = theme.text;
    });
    
    // Update navbar text elements
    document.querySelectorAll('#header-username, #header-description, #session-timer, #fps-counter').forEach(el => {
        el.style.color = theme.text;
    });
    
    // Update navbar buttons
    document.querySelectorAll('.quick-action-btn').forEach(el => {
        el.style.background = theme.primary;
        el.style.borderColor = theme.accent + '80';
        el.style.color = theme.text;
    });
    
    // Update inspector input fields
    document.querySelectorAll('#object-data-header, #object-data-body, #object-data-footer').forEach(el => {
        el.style.background = 'rgba(0, 0, 0, 0.3)';
        el.style.borderColor = theme.accent + '50';
        el.style.color = theme.text;
    });
    
    // Update inspector submit button
    const submitBtn = document.getElementById('object-data-submit');
    if (submitBtn) {
        submitBtn.style.background = theme.primary;
        submitBtn.style.borderColor = theme.accent + '80';
        submitBtn.style.color = theme.text;
    }
    
    // Update inspector labels and values
    document.querySelectorAll('.info-label').forEach(el => {
        el.style.color = 'rgba(255, 255, 255, 0.6)';
    });
    
    document.querySelectorAll('#object-position, #object-rotation, #object-scale').forEach(el => {
        el.style.background = 'rgba(0, 0, 0, 0.3)';
        el.style.borderColor = theme.accent + '50';
        el.style.color = theme.text;
    });

    // Keep timer always visible (bold white or dark depending on theme)
    const timer = document.querySelector('.info-timer');
    if (timer) {
        timer.style.color = theme.text === '#333' ? '#000' : '#fff';
    }

    // Update breadcrumb separators
    document.querySelectorAll('.breadcrumb-separator').forEach(el => {
        el.style.color = theme.text === '#333' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    });

    // Update dock items with white glow and theme-specific text
    document.querySelectorAll('.dock-item').forEach(el => {
        el.style.background = '#ffffff';
        el.style.color = theme.dockText;
        el.style.border = `1px solid ${theme.accent}`;
        el.style.boxShadow = `0 0 10px ${theme.dockGlow}, 0 0 20px ${theme.dockGlow}, inset 0 0 5px rgba(255, 255, 255, 0.3)`;
        el.style.textShadow = `0 0 8px ${theme.accent}, 0 0 12px ${theme.accent}`;
    });

    // Update docks background
    document.querySelectorAll('.dock').forEach(el => {
        el.style.background = theme.primary;
        el.style.borderColor = theme.accent + '50';
    });

    // Update mobile controls (joystick and buttons)
    const joystickBase = document.querySelector('.joystick-base');
    if (joystickBase) {
        joystickBase.style.background = theme.primary;
        joystickBase.style.borderColor = theme.accent + '50';
    }

    const joystickStick = document.querySelector('.joystick-stick');
    if (joystickStick) {
        if (isRainbow) {
            joystickStick.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
            joystickStick.style.borderColor = '#ff00ff';
            if (isAnimated) {
                joystickStick.classList.add('rainbow-animated', 'rainbow-border');
            }
        } else {
            joystickStick.style.background = theme.accent + '99';
            joystickStick.style.borderColor = theme.accent;
        }
    }

    // Update control buttons
    document.querySelectorAll('.control-btn').forEach(el => {
        el.style.background = theme.primary;
        el.style.color = theme.text;
        if (isRainbow && isAnimated) {
            el.classList.add('rainbow-border');
        } else if (!isRainbow) {
            el.style.borderColor = theme.accent + '50';
        } else {
            el.style.borderImage = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1';
        }
    });

    // Update action buttons
    document.querySelectorAll('.action-btn').forEach(el => {
        el.style.background = theme.primary;
        el.style.color = theme.text;
        if (isRainbow && isAnimated) {
            el.classList.add('rainbow-border');
        } else if (!isRainbow) {
            el.style.borderColor = theme.accent + '50';
        } else {
            el.style.borderImage = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1';
        }
    });

    // Update transform panel inputs
    document.querySelectorAll('.transform-input, .step-input').forEach(el => {
        el.style.background = 'rgba(255, 255, 255, 0.05)';
        el.style.borderColor = theme.accent + '50';
        el.style.color = theme.text;
    });

    // Update camera circle
    const cameraCircle = document.getElementById('camera-circle');
    if (cameraCircle) {
        cameraCircle.style.borderColor = theme.accent + '33';
    }

    // Update hand menu radial items
    document.querySelectorAll('.radial-item').forEach(el => {
        el.style.borderColor = theme.accent + '99';
        el.style.boxShadow = `0 0 10px ${theme.accent}66`;
    });

    // Update pause overlay
    const pauseTitle = document.querySelector('.pause-title');
    if (pauseTitle) {
        pauseTitle.style.color = theme.accent;
    }

    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.style.background = theme.accent + '66';
        pauseBtn.style.borderColor = theme.accent + 'B3';
    }

    // Update pocket panel
    const pocketPanel = document.getElementById('pocket-panel');
    if (pocketPanel) {
        pocketPanel.style.background = theme.primary;
        pocketPanel.style.borderColor = theme.accent + '66';
    }

    const pocketHeader = document.querySelector('.pocket-header');
    if (pocketHeader) {
        pocketHeader.style.color = theme.accent;
    }

    document.querySelectorAll('.pocket-slot').forEach(el => {
        el.style.borderColor = theme.accent + '80';
    });

    // Update virtual keyboard
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    if (virtualKeyboard) {
        virtualKeyboard.style.background = theme.primary;
        if (isRainbow && isAnimated) {
            virtualKeyboard.classList.add('rainbow-border');
        } else if (isRainbow && !isAnimated) {
            virtualKeyboard.style.borderImage = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1';
        } else {
            virtualKeyboard.style.borderImage = 'none';
            virtualKeyboard.style.borderColor = theme.accent + '66';
        }
    }

    document.querySelectorAll('.key-btn').forEach(el => {
        el.style.color = theme.text;
        if (isRainbow) {
            el.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
            if (isAnimated) {
                el.classList.add('rainbow-animated', 'rainbow-border');
            } else {
                el.style.borderImage = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1';
            }
        } else {
            el.style.background = theme.accent + '50';
            el.style.borderColor = theme.accent + '80';
            el.style.borderImage = 'none';
        }
    });

    // Update menu item hovers
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .menu-item:hover, .submenu-item:hover {
            background: ${theme.accent}33 !important;
            border-color: ${theme.accent}80 !important;
        }
        .prompt-btn {
            background: ${theme.accent}50 !important;
            border-color: ${theme.accent}80 !important;
        }
        .prompt-btn:hover {
            background: ${theme.accent}80 !important;
        }
        .search-input {
            color: ${theme.text} !important;
            border-color: ${theme.accent}50 !important;
        }
        .search-input:focus {
            border-color: ${theme.accent}99 !important;
            background: ${theme.accent}1A !important;
        }
        .dock-item:hover {
            background: #ffffff !important;
            border-color: ${theme.accent} !important;
            box-shadow: 0 0 15px ${theme.dockGlow}, 0 0 30px ${theme.dockGlow}, inset 0 0 8px rgba(255, 255, 255, 0.4) !important;
            text-shadow: 0 0 10px ${theme.accent}, 0 0 15px ${theme.accent} !important;
            transform: scale(1.1);
        }
        .dock-item.dragging {
            opacity: 0.5;
        }
        .control-btn:hover, .action-btn:hover {
            background: ${theme.accent}50 !important;
            border-color: ${theme.accent}99 !important;
        }
        .control-btn.active, .action-btn.active {
            background: ${theme.accent}99 !important;
            border-color: ${theme.accent} !important;
            color: ${theme.dockText} !important;
        }
        .joystick-stick:active {
            background: ${theme.accent} !important;
        }
        .transform-input:focus, .step-input:focus {
            border-color: ${theme.accent}99 !important;
            background: ${theme.accent}1A !important;
        }
        .transform-input, .step-input {
            color: ${theme.text} !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: ${theme.accent}50 !important;
        }
        .fps-mode #camera-circle {
            border-color: ${theme.accent}99 !important;
            border-width: 3px;
        }
        .fps-mode #camera-circle::before {
            background: ${theme.accent}E6 !important;
        }
        .summon-btn, .transform-submit-btn {
            background: ${theme.accent}50 !important;
            border-color: ${theme.accent}80 !important;
            color: ${theme.text} !important;
        }
        .summon-btn:hover, .transform-submit-btn:hover {
            background: ${theme.accent}80 !important;
            border-color: ${theme.accent} !important;
        }
        .radial-item:hover {
            background: ${theme.accent}E6 !important;
            border-color: ${theme.accent} !important;
        }
        .pause-title {
            color: ${theme.accent} !important;
        }
        .pause-btn {
            background: ${theme.accent}66 !important;
            border-color: ${theme.accent}B3 !important;
        }
        .pause-btn:hover {
            background: ${theme.accent}B3 !important;
            box-shadow: 0 0 20px ${theme.accent}99 !important;
        }
        .pocket-panel {
            background: ${theme.primary} !important;
            border-color: ${theme.accent}66 !important;
        }
        .pocket-header {
            color: ${theme.accent} !important;
        }
        .pocket-slot {
            border-color: ${theme.accent}80 !important;
        }
        .pocket-slot:hover {
            background: ${theme.accent}80 !important;
            border-color: ${theme.accent}E6 !important;
        }
        #virtual-keyboard {
            background: ${theme.primary} !important;
            border-color: ${theme.accent}66 !important;
        }
        .key-btn {
            background: ${theme.accent}50 !important;
            border-color: ${theme.accent}80 !important;
            color: ${theme.text} !important;
        }
        .key-btn:hover {
            background: ${theme.accent}99 !important;
            border-color: ${theme.accent} !important;
        }
        .key-btn:active {
            background: ${theme.accent}CC !important;
        }
    `;
    
    // Remove old theme styles
    const oldStyle = document.getElementById('theme-dynamic-styles');
    if (oldStyle) oldStyle.remove();
    styleSheet.id = 'theme-dynamic-styles';
    document.head.appendChild(styleSheet);

    // Update active theme in grid
    document.querySelectorAll('.theme-option').forEach(el => {
        el.classList.remove('active');
    });
    const activeTheme = document.querySelector(`[data-theme="${themeName}"]`);
    if (activeTheme) {
        activeTheme.classList.add('active');
    }
    
    // Create GSAP rainbow flow animation if needed
    if (isRainbow && isAnimated) {
        const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3', '#ff0000'];
        const duration = 9.2;
        const colorDuration = duration / rainbowColors.length;
        
        // Create master timeline that we can kill later
        window.rainbowTimeline = gsap.timeline({ repeat: -1, paused: false });
        
        // Animate borders through rainbow - add to master timeline
        document.querySelectorAll('.side-menu, #inspector-panel, #info-panel, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, .menu-item, .submenu-item, #transform-panel, .control-btn, .action-btn, #virtual-keyboard').forEach(el => {
            rainbowColors.forEach((color, i) => {
                gsap.to(el, {
                    borderColor: color,
                    duration: colorDuration,
                    ease: 'linear',
                    repeat: -1,
                    repeatDelay: duration - colorDuration,
                    delay: i * colorDuration
                });
            });
        });
        
        // Animate text gradients
        document.querySelectorAll('.menu-title, .info-space-title, .breadcrumb-current, .controls-title, .prompt-title').forEach(el => {
            gsap.to(el, {
                backgroundPosition: '200% center',
                duration: duration,
                ease: 'linear',
                repeat: -1,
                backgroundSize: '200% 100%'
            });
        });
        
        // Animate joystick stick
        const joystickStick = document.querySelector('.joystick-stick');
        if (joystickStick) {
            gsap.to(joystickStick, {
                backgroundPosition: '200% center',
                duration: duration,
                ease: 'linear',
                repeat: -1,
                backgroundSize: '200% 100%'
            });
        }
        
        // Animate key buttons
        document.querySelectorAll('.key-btn').forEach(el => {
            rainbowColors.forEach((color, i) => {
                gsap.to(el, {
                    borderColor: color,
                    duration: colorDuration,
                    ease: 'linear',
                    repeat: -1,
                    repeatDelay: duration - colorDuration,
                    delay: i * colorDuration
                });
            });
        });
    }

    playSound('active');
}

function initThemeSelector() {
    const grid = document.getElementById('theme-grid');
    grid.innerHTML = '';

    Object.keys(themes).forEach(themeKey => {
        const theme = themes[themeKey];
        const option = document.createElement('div');
        option.className = 'theme-option';
        option.setAttribute('data-theme', themeKey);
        if (themeKey === currentTheme) {
            option.classList.add('active');
        }
        
        option.innerHTML = `
            <div class="theme-color-preview" style="background: ${theme.preview}"></div>
            <div>${theme.name}</div>
        `;
        
        option.addEventListener('click', () => {
            applyTheme(themeKey);
        });
        
        grid.appendChild(option);
    });
}

function setupHandMenus() {
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    const consciousHand = document.getElementById('conscious-hand');
    const pauseOverlay = document.getElementById('pause-overlay');
    const resumeBtn = document.getElementById('resume-btn');

    // Create radial menu items for Left Hand
    const lhRadial = document.getElementById('lh-radial');
    const lhOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 
                      'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
    createRadialMenu(lhRadial, lhOptions, 'lh');

    // Create radial menu items for Right Hand
    const rhRadial = document.getElementById('rh-radial');
    const rhOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 
                      'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
    createRadialMenu(rhRadial, rhOptions, 'rh');

    // Create radial menu items for Conscious Hand
    const chRadial = document.getElementById('ch-radial');
    const chOptions = ['Pause Menu', 'MySpace', 'User Pocket', 'Option 4', 'Option 5', 
                      'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
    createRadialMenu(chRadial, chOptions, 'ch');

    // Resume button
    resumeBtn.addEventListener('click', () => {
        pauseOverlay.classList.remove('visible');
        playSound('active');
    });

    // Mobile buttons
    const btnLH = document.getElementById('btn-lh');
    const btnRH = document.getElementById('btn-rh');
    const btnCH = document.getElementById('btn-ch');

    if (btnLH) {
        btnLH.addEventListener('click', () => {
            toggleLeftHand();
        });
    }

    if (btnRH) {
        btnRH.addEventListener('click', () => {
            toggleRightHand();
        });
    }

    if (btnCH) {
        btnCH.addEventListener('click', () => {
            toggleConsciousHand();
        });
    }

    const btnDocks = document.getElementById('btn-docks');
    if (btnDocks) {
        btnDocks.addEventListener('click', () => {
            docksVisible = !docksVisible;
            const docks = document.querySelectorAll('.dock');
            docks.forEach(dock => {
                if (docksVisible) {
                    dock.classList.remove('hidden');
                } else {
                    dock.classList.add('hidden');
                }
            });
            playSound('passive');
        });
    }

    const btnKeyboard = document.getElementById('btn-keyboard');
    if (btnKeyboard) {
        btnKeyboard.addEventListener('click', () => {
            toggleVirtualKeyboard();
        });
    }

    const btnActionGrid = document.getElementById('btn-action-grid');
    if (btnActionGrid) {
        btnActionGrid.addEventListener('click', () => {
            toggleActionGrid();
        });
    }

    const btnNav = document.getElementById('btn-nav');
    if (btnNav) {
        btnNav.addEventListener('click', () => {
            const headerBar = document.getElementById('header-bar');
            if (headerBar.style.display === 'none') {
                headerBar.style.display = 'flex';
            } else {
                headerBar.style.display = 'none';
            }
            playSound('active');
        });
    }

    const btnRulers = document.getElementById('btn-rulers');
    if (btnRulers) {
        btnRulers.addEventListener('click', () => {
            const xRuler = document.getElementById('x-axis-ruler');
            const yRuler = document.getElementById('y-axis-ruler');
            const zRuler = document.getElementById('z-axis-ruler');
            
            if (xRuler && yRuler && zRuler) {
                const isVisible = xRuler.style.display === 'flex';
                xRuler.style.display = isVisible ? 'none' : 'flex';
                yRuler.style.display = isVisible ? 'none' : 'flex';
                zRuler.style.display = isVisible ? 'none' : 'flex';
                playSound('active');
            }
        });
    }

    // Up and Down movement buttons (R and F keys)
    const btnUp = document.getElementById('btn-up');
    if (btnUp) {
        btnUp.addEventListener('mousedown', () => {
            keys['r'] = true;
        });
        btnUp.addEventListener('mouseup', () => {
            keys['r'] = false;
        });
        btnUp.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['r'] = true;
        });
        btnUp.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['r'] = false;
        });
    }

    const btnDown = document.getElementById('btn-down');
    if (btnDown) {
        btnDown.addEventListener('mousedown', () => {
            keys['f'] = true;
        });
        btnDown.addEventListener('mouseup', () => {
            keys['f'] = false;
        });
        btnDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['f'] = true;
        });
        btnDown.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['f'] = false;
        });
    }

    // Center button (O key - reset camera)
    const btnCenter = document.getElementById('btn-center');
    if (btnCenter) {
        btnCenter.addEventListener('click', () => {
            gsap.to(camera.position, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 10,
                ease: 'power2.inOut'
            });
            camera.quaternion.set(0, 0, 0, 1); // Reset rotation
            playSound('active');
        });
    }
}

function createRadialMenu(container, options, handType) {
    const radius = 100; // Distance from center
    const angleStep = (Math.PI * 2) / options.length;

    options.forEach((option, index) => {
        const angle = angleStep * index - Math.PI / 2; // Start from top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const item = document.createElement('div');
        item.className = 'radial-item';
        item.textContent = option;
        item.style.left = `calc(50% + ${x}px)`;
        item.style.top = `calc(50% + ${y}px)`;
        item.style.transform = 'translate(-50%, -50%)';

        item.addEventListener('click', () => {
            handleRadialItemClick(handType, option, index);
        });

        container.appendChild(item);
    });
}

function handleRadialItemClick(handType, option, index) {
    console.log(`${handType} - ${option} clicked (index: ${index})`);
    playSound('active');

    // Handle special options
    if (handType === 'ch' && option === 'Pause Menu') {
        document.getElementById('pause-overlay').classList.add('visible');
        // Hide conscious hand when pause menu opens
        toggleConsciousHand();
    }

    if (handType === 'ch' && option === 'MySpace') {
        toggleMySpace();
        // Hide conscious hand after selection
        toggleConsciousHand();
    }

    if (handType === 'ch' && option === 'User Pocket') {
        togglePocket();
        // Hide conscious hand after selection
        toggleConsciousHand();
    }

    // Add more functionality here for each option
}

function toggleLeftHand() {
    leftHandVisible = !leftHandVisible;
    const leftHand = document.getElementById('left-hand');
    
    if (leftHandVisible) {
        leftHand.classList.add('visible');
        // Hide other hands
        document.getElementById('right-hand').classList.remove('visible');
        document.getElementById('conscious-hand').classList.remove('visible');
        rightHandVisible = false;
        consciousHandVisible = false;
    } else {
        leftHand.classList.remove('visible');
    }
    playSound('passive');
}

function toggleRightHand() {
    rightHandVisible = !rightHandVisible;
    const rightHand = document.getElementById('right-hand');
    
    if (rightHandVisible) {
        rightHand.classList.add('visible');
        // Hide other hands
        document.getElementById('left-hand').classList.remove('visible');
        document.getElementById('conscious-hand').classList.remove('visible');
        leftHandVisible = false;
        consciousHandVisible = false;
    } else {
        rightHand.classList.remove('visible');
    }
    playSound('passive');
}

function toggleConsciousHand() {
    consciousHandVisible = !consciousHandVisible;
    const consciousHand = document.getElementById('conscious-hand');
    
    if (consciousHandVisible) {
        consciousHand.classList.add('visible');
        // Hide other hands
        document.getElementById('left-hand').classList.remove('visible');
        document.getElementById('right-hand').classList.remove('visible');
        leftHandVisible = false;
        rightHandVisible = false;
    } else {
        consciousHand.classList.remove('visible');
    }
    playSound('passive');
}

function toggleMySpace() {
    if (mySpaceAnimating) return; // Prevent multiple animations
    
    mySpaceAnimating = true;
    mySpaceExpanded = !mySpaceExpanded;
    
    const targetRadius = mySpaceExpanded ? expandedRadius : collapsedRadius;
    
    // Animate each grid panel one by one
    gridObjects.forEach((panel, index) => {
        // Stagger the animation for each panel
        setTimeout(() => {
            // Calculate new position on sphere
            const currentPos = panel.position.clone().normalize();
            const targetPos = currentPos.multiplyScalar(targetRadius);
            
            gsap.to(panel.position, {
                duration: 0.6,
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Make panel look at center
                    panel.lookAt(0, 0, 0);
                    
                    // Mark animation complete on last panel
                    if (index === gridObjects.length - 1) {
                        mySpaceAnimating = false;
                    }
                }
            });
            
            // Also animate opacity for collapse effect
            gsap.to(panel.material, {
                duration: 0.6,
                opacity: mySpaceExpanded ? 0.2 : 0.1,
                ease: 'power2.inOut'
            });
            
        }, index * 20); // 20ms delay between each panel
    });
    
    playSound('active');
}

function togglePocket() {
    pocketVisible = !pocketVisible;
    const pocketPanel = document.getElementById('pocket-panel');
    
    if (pocketVisible) {
        pocketPanel.classList.add('visible');
    } else {
        pocketPanel.classList.remove('visible');
    }
    
    playSound('passive');
}

let keyboardVisible = false;

function toggleVirtualKeyboard() {
    keyboardVisible = !keyboardVisible;
    const keyboard = document.getElementById('virtual-keyboard');
    
    if (keyboardVisible) {
        keyboard.classList.add('visible');
    } else {
        keyboard.classList.remove('visible');
    }
    
    playSound('passive');
}

let actionGridVisible = false;

function toggleActionGrid() {
    actionGridVisible = !actionGridVisible;
    const actionGrid = document.getElementById('action-grid');
    
    if (actionGridVisible) {
        actionGrid.classList.remove('hidden');
    } else {
        actionGrid.classList.add('hidden');
    }
    
    playSound('passive');
}

function initVirtualKeyboard() {
    const keyboard = document.getElementById('virtual-keyboard');
    
    const keys = [
        ['Q', 'W', 'E', 'R', 'F', 'A', 'S', 'D'],
        ['0', '9', 'X', 'Z', 'O', 'C', 'ENTER']
    ];
    
    keys.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.className = 'key-btn';
            if (key === 'ENTER') {
                keyBtn.classList.add('wide');
            }
            keyBtn.textContent = key;
            
            keyBtn.addEventListener('click', () => {
                simulateKeyPress(key);
                playSound('passive');
            });
            
            rowDiv.appendChild(keyBtn);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

function simulateKeyPress(key) {
    const keyMap = {
        'ENTER': 'Enter',
        '0': '0',
        '9': '9'
    };
    
    const eventKey = keyMap[key] || key.toLowerCase();
    
    // Simulate keydown
    const keydownEvent = new KeyboardEvent('keydown', {
        key: eventKey,
        code: 'Key' + key,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true
    });
    window.dispatchEvent(keydownEvent);
    
    // Simulate keyup after short delay
    setTimeout(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
            key: eventKey,
            code: 'Key' + key,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true
        });
        window.dispatchEvent(keyupEvent);
    }, 100);
}

function setupUITransparency() {
    const slider = document.getElementById('ui-transparency-slider');
    const valueDisplay = document.getElementById('transparency-value');
    
    if (!slider) return;
    
    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        valueDisplay.textContent = value + '%';
        
        // Calculate opacity (0 = 5% visible, 100 = 100% visible)
        const minOpacity = 0.05;
        const maxOpacity = 1.0;
        const opacity = minOpacity + (value / 100) * (maxOpacity - minOpacity);
        
        // Apply to all UI elements
        const uiElements = document.querySelectorAll(
            '.side-menu, #inspector-panel, #info-panel, #search-panel, ' +
            '.dock, .hamburger-btn, #faq-panel, .prompt-modal, #transform-panel, ' +
            '.joystick-base, .control-buttons, #action-grid, #virtual-keyboard, ' +
            '#pocket-panel, .radial-menu'
        );
        
        uiElements.forEach(el => {
            el.style.opacity = opacity;
        });
        
        playSound('passive');
    });
}

function setupParticleBehavior() {
    const panel = document.getElementById('particle-behavior-panel');
    const closeBtn = document.getElementById('particle-behavior-close');
    const modeButtons = document.querySelectorAll('.behavior-mode-btn');
    const forwardControls = document.getElementById('forward-controls');
    const backwardControls = document.getElementById('backward-controls');
    const connectedControls = document.getElementById('connected-controls');
    const glitchControls = document.getElementById('glitch-controls');
    const constellationControls = document.getElementById('constellation-controls');
    const forwardSpeedSlider = document.getElementById('forward-speed-slider');
    const backwardSpeedSlider = document.getElementById('backward-speed-slider');
    const connectedFrequencySlider = document.getElementById('connected-frequency-slider');
    const glitchIntensitySlider = document.getElementById('glitch-intensity-slider');
    const constellationDistanceSlider = document.getElementById('constellation-distance-slider');
    const particleCountSlider = document.getElementById('particle-count-slider');
    const forwardSpeedValue = document.getElementById('forward-speed-value');
    const backwardSpeedValue = document.getElementById('backward-speed-value');
    const connectedFrequencyValue = document.getElementById('connected-frequency-value');
    const glitchIntensityValue = document.getElementById('glitch-intensity-value');
    const constellationDistanceValue = document.getElementById('constellation-distance-value');
    const particleCountValue = document.getElementById('particle-count-value');
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            playSound('passive');
        });
    }
    
    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            
            // Update active state
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update behavior mode
            particleBehaviorMode = mode;
            
            // Show/hide appropriate controls
            forwardControls.style.display = mode === 'forward' ? 'block' : 'none';
            backwardControls.style.display = mode === 'backward' ? 'block' : 'none';
            connectedControls.style.display = mode === 'connected' ? 'block' : 'none';
            glitchControls.style.display = mode === 'glitch' ? 'block' : 'none';
            constellationControls.style.display = mode === 'constellation' ? 'block' : 'none';
            
            playSound('active');
        });
    });
    
    // Forward speed slider
    if (forwardSpeedSlider) {
        forwardSpeedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            forwardSpeedValue.textContent = value;
            forwardFlowSpeed = value / 100;
            playSound('passive');
        });
    }
    
    // Backward speed slider
    if (backwardSpeedSlider) {
        backwardSpeedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            backwardSpeedValue.textContent = value;
            backwardFlowSpeed = value / 100;
            playSound('passive');
        });
    }
    
    // Connected frequency slider
    if (connectedFrequencySlider) {
        connectedFrequencySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            connectedFrequencyValue.textContent = value;
            connectionFrequency = value / 100;
            playSound('passive');
        });
    }
    
    // Glitch intensity slider
    if (glitchIntensitySlider) {
        glitchIntensitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            glitchIntensityValue.textContent = value;
            glitchIntensity = value / 100;
            playSound('passive');
        });
    }
    
    // Constellation distance slider
    if (constellationDistanceSlider) {
        constellationDistanceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            constellationDistanceValue.textContent = value;
            constellationDistance = value / 10; // Scale 1-100 to 0.1-10
            playSound('passive');
        });
    }
    
    // Particle count slider
    if (particleCountSlider) {
        particleCountSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            particleCountValue.textContent = value.toLocaleString();
            // Update particle count (will require reinitializing the particle system)
            updateParticleCount(value);
            playSound('passive');
        });
    }
    
    // Particle rotation sliders
    const particleRotXSlider = document.getElementById('particle-rot-x-slider');
    const particleRotYSlider = document.getElementById('particle-rot-y-slider');
    const particleRotZSlider = document.getElementById('particle-rot-z-slider');
    const particleRotXValue = document.getElementById('particle-rot-x-value');
    const particleRotYValue = document.getElementById('particle-rot-y-value');
    const particleRotZValue = document.getElementById('particle-rot-z-value');
    const particleRotReset = document.getElementById('particle-rot-reset');
    
    if (particleRotXSlider) {
        particleRotXSlider.addEventListener('input', (e) => {
            const degrees = parseInt(e.target.value);
            particleRotXValue.textContent = degrees + '°';
            if (particleSystem) {
                particleSystem.rotation.x = degrees * Math.PI / 180;
            }
            playSound('passive');
        });
    }
    
    if (particleRotYSlider) {
        particleRotYSlider.addEventListener('input', (e) => {
            const degrees = parseInt(e.target.value);
            particleRotYValue.textContent = degrees + '°';
            if (particleSystem) {
                particleSystem.rotation.y = degrees * Math.PI / 180;
            }
            playSound('passive');
        });
    }
    
    if (particleRotZSlider) {
        particleRotZSlider.addEventListener('input', (e) => {
            const degrees = parseInt(e.target.value);
            particleRotZValue.textContent = degrees + '°';
            if (particleSystem) {
                particleSystem.rotation.z = degrees * Math.PI / 180;
            }
            playSound('passive');
        });
    }
    
    if (particleRotReset) {
        particleRotReset.addEventListener('click', () => {
            // Reset to default (0, 0, 71)
            particleRotXSlider.value = 0;
            particleRotYSlider.value = 0;
            particleRotZSlider.value = 71;
            particleRotXValue.textContent = '0°';
            particleRotYValue.textContent = '0°';
            particleRotZValue.textContent = '71°';
            if (particleSystem) {
                particleSystem.rotation.set(0, 0, 71 * Math.PI / 180);
            }
            playSound('active');
        });
    }
}

function updateParticleCount(newCount) {
    if (!particleSystem) return;
    
    // Store old count
    const oldCount = particleCount;
    particleCount = newCount;
    
    // Create new geometry with new particle count
    const newGeometry = new THREE.BufferGeometry();
    const newPositions = new Float32Array(particleCount * 3);
    const newVelocities = new Float32Array(particleCount * 3);
    
    // Initialize new particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 10;
        const z = (Math.random() - 0.5) * 4;
        
        newPositions[i * 3] = Math.cos(angle) * radius;
        newPositions[i * 3 + 1] = Math.sin(angle) * radius;
        newPositions[i * 3 + 2] = z;
        
        newVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
        newVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        newVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    // Update geometry
    newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
    
    // Dispose old geometry
    particleSystem.geometry.dispose();
    
    // Apply new geometry
    particleSystem.geometry = newGeometry;
    
    // Update velocity array
    particleVelocities = newVelocities;
}

function setupMySpaceGrid() {
    const panel = document.getElementById('myspace-grid-panel');
    const closeBtn = document.getElementById('myspace-grid-close');
    const gridButtons = document.querySelectorAll('.myspace-grid-btn');
    const gridSizeSlider = document.getElementById('grid-size-slider');
    const gridSpacingSlider = document.getElementById('grid-spacing-slider');
    const gridSizeValue = document.getElementById('grid-size-value');
    const gridSpacingValue = document.getElementById('grid-spacing-value');
    const applyBtn = document.getElementById('apply-grid-btn');
    
    let currentGridType = 'spherical';
    let currentGridSize = 15;
    let currentGridSpacing = 2;
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            playSound('passive');
        });
    }
    
    // Grid type buttons
    gridButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentGridType = btn.getAttribute('data-grid-type');
            
            // Update active state
            gridButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            playSound('active');
        });
    });
    
    // Grid size slider
    if (gridSizeSlider) {
        gridSizeSlider.addEventListener('input', (e) => {
            currentGridSize = parseInt(e.target.value);
            gridSizeValue.textContent = currentGridSize;
            playSound('passive');
        });
    }
    
    // Grid spacing slider
    if (gridSpacingSlider) {
        gridSpacingSlider.addEventListener('input', (e) => {
            currentGridSpacing = parseFloat(e.target.value);
            gridSpacingValue.textContent = currentGridSpacing;
            playSound('passive');
        });
    }
    
    // Apply button
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Recreate grid panels with new configuration
            if (window.createMySpaceGrid) {
                const radius = currentGridSpacing * 10; // Scale spacing to radius
                window.createMySpaceGrid(currentGridType, currentGridSize, radius);
                playSound('active');
            }
        });
    }
}

function setupProfile() {
    const profileImageContainer = document.getElementById('profile-image-container');
    const profileImageInput = document.getElementById('profile-image-input');
    const headerUsername = document.getElementById('header-username');
    const headerDescription = document.getElementById('header-description');
    
    // Load saved profile data
    const savedImage = localStorage.getItem('userProfileImage');
    const savedUsername = localStorage.getItem('userProfileUsername');
    const savedDescription = localStorage.getItem('userProfileDescription');
    
    if (savedImage) {
        profileImageContainer.style.backgroundImage = `url(${savedImage})`;
        profileImageContainer.style.backgroundSize = 'cover';
        profileImageContainer.style.backgroundPosition = 'center';
        profileImageContainer.textContent = '';
    }
    
    if (savedUsername) headerUsername.textContent = savedUsername;
    if (savedDescription) headerDescription.textContent = savedDescription;
    
    // Click to upload image
    profileImageContainer.addEventListener('click', () => {
        profileImageInput.click();
    });
    
    profileImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                profileImageContainer.style.backgroundImage = `url(${imageData})`;
                profileImageContainer.style.backgroundSize = 'cover';
                profileImageContainer.style.backgroundPosition = 'center';
                profileImageContainer.textContent = '';
                localStorage.setItem('userProfileImage', imageData);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Save username on blur
    headerUsername.addEventListener('blur', () => {
        localStorage.setItem('userProfileUsername', headerUsername.textContent);
    });
    
    // Save description on blur
    headerDescription.addEventListener('blur', () => {
        localStorage.setItem('userProfileDescription', headerDescription.textContent);
    });
    
    // Styling on focus
    headerUsername.addEventListener('focus', function() {
        this.style.borderColor = 'rgba(128, 128, 128, 0.5)';
    });
    
    headerUsername.addEventListener('blur', function() {
        this.style.borderColor = 'transparent';
    });
    
    headerDescription.addEventListener('focus', function() {
        this.style.borderColor = 'rgba(128, 128, 128, 0.5)';
    });
    
    headerDescription.addEventListener('blur', function() {
        this.style.borderColor = 'transparent';
    });
}


function initPocket() {
    renderPocketPage();
    setupPocketPagination();
}

function renderPocketPage() {
    const pocketGrid = document.getElementById('pocket-grid');
    pocketGrid.innerHTML = ''; // Clear existing slots
    
    const startSlot = (currentPocketPage - 1) * slotsPerPage;
    const endSlot = startSlot + slotsPerPage;
    
    // Create 20 pocket slots for current page
    for (let i = startSlot; i < endSlot; i++) {
        const slot = document.createElement('div');
        slot.className = 'pocket-slot empty';
        slot.setAttribute('data-slot', i);
        
        // Slot number
        const slotNumber = document.createElement('div');
        slotNumber.className = 'pocket-slot-number';
        slotNumber.textContent = i + 1;
        slot.appendChild(slotNumber);
        
        // Slot content (icon + text)
        const slotContent = document.createElement('div');
        slotContent.className = 'pocket-slot-content';
        
        const slotIcon = document.createElement('div');
        slotIcon.className = 'pocket-slot-icon';
        slotIcon.textContent = '📦';
        slotContent.appendChild(slotIcon);
        
        const slotText = document.createElement('div');
        slotText.textContent = 'Empty';
        slotContent.appendChild(slotText);
        
        slot.appendChild(slotContent);
        
        // Click handler
        slot.addEventListener('click', () => {
            handlePocketSlotClick(i);
        });
        
        pocketGrid.appendChild(slot);
        
        // Update visual state based on existing data
        updatePocketSlot(i);
    }
    
    // Update page info
    document.getElementById('pocket-page-info').textContent = `Page ${currentPocketPage} / ${totalPages}`;
}

function setupPocketPagination() {
    const prevBtn = document.getElementById('pocket-prev-page');
    const nextBtn = document.getElementById('pocket-next-page');
    
    prevBtn.addEventListener('click', () => {
        if (currentPocketPage > 1) {
            currentPocketPage--;
            renderPocketPage();
            playSound('passive');
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPocketPage < totalPages) {
            currentPocketPage++;
            renderPocketPage();
            playSound('passive');
        }
    });
}

function handlePocketSlotClick(slotIndex) {
    const slot = pocketItems[slotIndex];
    
    console.log(`Pocket slot ${slotIndex} clicked`);
    playSound('active');
    
    if (!slot.occupied) {
        // Empty slot - could add item here
        console.log('Empty slot - ready to add item');
    } else if (slot.deployed) {
        // Item is deployed in scene - recall it
        console.log('Recalling item from scene');
        slot.deployed = false;
        updatePocketSlot(slotIndex);
    } else {
        // Item is in pocket - deploy it
        console.log('Deploying item to scene');
        slot.deployed = true;
        updatePocketSlot(slotIndex);
    }
}

function updatePocketSlot(slotIndex) {
    const slot = pocketItems[slotIndex];
    const slotElement = document.querySelector(`[data-slot="${slotIndex}"]`);
    
    if (!slotElement) return;
    
    // Update visual state
    slotElement.classList.remove('empty', 'in-scene');
    
    if (!slot.occupied) {
        slotElement.classList.add('empty');
    } else if (slot.deployed) {
        slotElement.classList.add('in-scene');
    }
    
    // Update transparency based on state
    if (slot.deployed) {
        slotElement.style.opacity = '0.2'; // Item out in scene (20%)
    } else {
        slotElement.style.opacity = '0.35'; // Item in pocket (35%)
    }
}

// Mobile controls
let joystickActive = false;
let joystickStartPos = { x: 0, y: 0 };
let currentTransformMode = null; // 'position', 'rotation', 'scale'

// Panel drag functionality
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let panelStartX = 20;
let panelStartY = 20;

// Sound effects
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'hover') {
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'active') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'passive') {
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }
}

// Initialize scene
function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    scene.add(camera); // Add camera to scene so children render

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Outer sphere with gradient
    const sphereGeometry = new THREE.SphereGeometry(30, 64, 64);
    const sphereMaterial = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
            color1: { value: new THREE.Color(0x333333) },
            color2: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec3 vPosition;
            void main() {
                float mixValue = (vPosition.y + 30.0) / 60.0;
                gl_FragColor = vec4(mix(color1, color2, mixValue), 1.0);
            }
        `
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // User Energy State - Particle System
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = new Float32Array(particleCount * 3);
    
    // Create particles in sphere shape - smaller radius for better centering
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random spherical coordinates
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 8 + Math.random() * 4; // 8-12 range (closer to user)
        
        // Convert to Cartesian
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
        
        // Gentle random velocities for calm animation
        particleVelocities[i3] = (Math.random() - 0.5) * 0.02;
        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Create circular texture for round particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: particleTexture
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    // Attach particle system to camera so it follows both position and rotation
    camera.add(particleSystem);
    // Reset to origin - no offset
    particleSystem.position.set(0, 0, 0);
    // Rotate to (0, 0, 71 degrees) for optimal forward flow
    particleSystem.rotation.set(0, 0, 71 * Math.PI / 180);

    // Grid plane at 0, -5, 0
    const gridSize = 50;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0xffffff);
    gridHelper.position.set(0, -5, 0);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Initialize MySpace grid with default spherical configuration
    window.gridPanelObjects = [];
    createMySpaceGrid('spherical', 8, 25);
    
    function createMySpaceGrid(gridType, segments, radius) {
        // Clear existing grid panels
        if (window.gridPanelObjects && window.gridPanelObjects.length > 0) {
            window.gridPanelObjects.forEach(panel => {
                scene.remove(panel);
                if (panel.geometry) panel.geometry.dispose();
                if (panel.material) panel.material.dispose();
                const index = gridObjects.indexOf(panel);
                if (index > -1) gridObjects.splice(index, 1);
                const interactiveIndex = interactiveObjects.indexOf(panel);
                if (interactiveIndex > -1) interactiveObjects.splice(interactiveIndex, 1);
            });
            window.gridPanelObjects = [];
        }
        
        const gridGeometry = new THREE.PlaneGeometry(3, 3);
        const totalPanels = segments * segments * 2; // Approximate total
        
        if (gridType === 'spherical') {
            // Original spherical grid
            for (let lat = 0; lat < segments; lat++) {
                for (let lon = 0; lon < segments * 2; lon++) {
                    const phi = (lat / segments) * Math.PI;
                    const theta = (lon / (segments * 2)) * Math.PI * 2;
                    
                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.cos(phi);
                    const z = radius * Math.sin(phi) * Math.sin(theta);
                    
                    createGridPanel(gridGeometry, x, y, z, lat, lon);
                }
            }
        } else if (gridType === 'planar') {
            // Planar walls - 5x5 grid, multiple layers
            const spacing = radius / 8;
            for (let layer = 0; layer < 5; layer++) {
                const zPos = layer * spacing * 2 - spacing * 4;
                for (let x = 0; x < 5; x++) {
                    for (let y = 0; y < 5; y++) {
                        const xPos = (x - 2) * spacing;
                        const yPos = (y - 2) * spacing;
                        createGridPanel(gridGeometry, xPos, yPos, zPos, x, y + (layer * 5));
                    }
                }
            }
        } else if (gridType === 'helix') {
            // Helix/spiral arrangement
            const height = radius * 2;
            const helixRadius = radius * 0.6;
            const turns = 5;
            const panelsPerTurn = Math.floor(segments / 2);
            
            for (let i = 0; i < turns * panelsPerTurn; i++) {
                const t = i / panelsPerTurn;
                const angle = t * Math.PI * 2;
                const y = (t / turns) * height - height / 2;
                const x = helixRadius * Math.cos(angle);
                const z = helixRadius * Math.sin(angle);
                createGridPanel(gridGeometry, x, y, z, i, 0);
            }
        } else if (gridType === 'cube') {
            // Cubic grid arrangement
            const divisions = Math.floor(segments / 2);
            const spacing = radius / divisions;
            const halfSize = radius / 2;
            
            // Create panels on all 6 faces of the cube
            for (let face = 0; face < 6; face++) {
                for (let i = 0; i < divisions; i++) {
                    for (let j = 0; j < divisions; j++) {
                        const u = (i / divisions) * radius - halfSize;
                        const v = (j / divisions) * radius - halfSize;
                        
                        let x, y, z;
                        if (face === 0) { x = u; y = v; z = halfSize; }  // Front
                        else if (face === 1) { x = u; y = v; z = -halfSize; }  // Back
                        else if (face === 2) { x = halfSize; y = v; z = u; }  // Right
                        else if (face === 3) { x = -halfSize; y = v; z = u; }  // Left
                        else if (face === 4) { x = u; y = halfSize; z = v; }  // Top
                        else if (face === 5) { x = u; y = -halfSize; z = v; }  // Bottom
                        
                        createGridPanel(gridGeometry, x, y, z, i, j + (face * divisions));
                    }
                }
            }
        }
        
        function createGridPanel(geometry, x, y, z, lat, lon) {
            const gridMaterial = new THREE.MeshBasicMaterial({
                color: 0xeeeeee,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            
            const gridPanel = new THREE.Mesh(geometry, gridMaterial);
            gridPanel.position.set(x, y, z);
            gridPanel.lookAt(0, 0, 0);
            gridPanel.userData = { 
                type: 'grid',
                label: `Grid ${lat}-${lon}`,
                originalColor: 0xeeeeee,
                originalPosition: { x, y, z }
            };
            
            scene.add(gridPanel);
            gridObjects.push(gridPanel);
            interactiveObjects.push(gridPanel);
            window.gridPanelObjects.push(gridPanel);
            
            // Add grid lines
            const edgesGeometry = new THREE.EdgesGeometry(geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({ 
                color: 0xeeeeee, 
                opacity: 0.3, 
                transparent: true 
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            gridPanel.add(edges);
        }
    }
    
    // Make function globally accessible
    window.createMySpaceGrid = createMySpaceGrid;

    // Grid radius for positioning journal pages
    const gridRadius = 25;

    // Journal pages - now square and positioned on grid
    const pageData = [
        { title: 'Morning\nRoutine', color: 0x808080, lat: 2, lon: 0 },
        { title: 'Job\nRoutine', color: 0xF5A623, lat: 4, lon: 4 },
        { title: 'Before Bed\nRoutine', color: 0x9013FE, lat: 6, lon: 8 }
    ];

    pageData.forEach((data, index) => {
        // Calculate position on grid sphere
        const phi = (data.lat / 8) * Math.PI;
        const theta = (data.lon / 16) * 2 * Math.PI;
        
        const x = gridRadius * Math.sin(phi) * Math.cos(theta);
        const y = gridRadius * Math.cos(phi);
        const z = gridRadius * Math.sin(phi) * Math.sin(theta);
        
        // Square geometry (2.5 x 2.5)
        const pageGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.1);
        const pageMaterial = new THREE.MeshPhongMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        
        const page = new THREE.Mesh(pageGeometry, pageMaterial);
        page.position.set(x, y, z);
        page.lookAt(0, 0, 0); // Face center
        page.userData = {
            type: 'page',
            title: data.title.replace('\n', ' '),
            index: index,
            originalColor: data.color,
            originalPosition: { x, y, z }
        };
        
        scene.add(page);
        journalPages.push(page);
        interactiveObjects.push(page);

        // Add text using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = data.title.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, 256, 256 + (i - 0.5) * 50);
        });
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            side: THREE.DoubleSide
        });
        const textPlane = new THREE.PlaneGeometry(2.3, 2.3);
        const textMesh = new THREE.Mesh(textPlane, textMaterial);
        textMesh.position.z = 0.06;
        page.add(textMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x808080, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xF5A623, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    
    // Mouse wheel zoom for 3D panel viewing
    renderer.domElement.addEventListener('wheel', (e) => {
        if (scene3DDataPanel) {
            e.preventDefault();
            const zoomSpeed = 0.5;
            const minZ = 8;  // Closest zoom
            const maxZ = 30; // Farthest zoom
            
            if (e.deltaY < 0) {
                // Zoom in
                camera.position.z = Math.max(minZ, camera.position.z - zoomSpeed);
            } else {
                // Zoom out
                camera.position.z = Math.min(maxZ, camera.position.z + zoomSpeed);
            }
        }
    }, { passive: false });
    window.addEventListener('resize', onResize);

    // Panel controls
    setupPanelControls();
    setupInspectorDataSave();
    setupJSONViewer();

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        // Disable keyboard controls when typing in text fields
        const activeElement = document.activeElement;
        const isTextField = activeElement.tagName === 'INPUT' || 
                           activeElement.tagName === 'TEXTAREA' || 
                           activeElement.isContentEditable;
        
        if (isTextField) {
            return; // Don't process keyboard shortcuts
        }
        
        const key = e.key.toLowerCase();
        if (key in keys) {
            keys[key] = true;
            // Add visual feedback for C key (FPS mode)
            if (key === 'c') {
                document.body.classList.add('fps-mode');
            }
        }
        // FAQ panel toggle
        if (key === 'q') {
            const faqPanel = document.getElementById('faq-panel');
            faqPanel.classList.toggle('visible');
            playSound('passive');
        }
        // Inspector panel toggle
        if (key === 'x') {
            const inspectorPanel = document.getElementById('inspector-panel');
            inspectorPanel.classList.toggle('visible');
            playSound('passive');
        }
        // Docks toggle
        if (key === 'z') {
            docksVisible = !docksVisible;
            const docks = document.querySelectorAll('.dock');
            docks.forEach(dock => {
                if (docksVisible) {
                    dock.classList.remove('hidden');
                } else {
                    dock.classList.add('hidden');
                }
            });
            playSound('passive');
        }
        // Reset camera position
        if (key === 'o') {
            gsap.to(camera.position, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 10,
                ease: 'power2.inOut'
            });
            camera.quaternion.set(0, 0, 0, 1); // Reset rotation
            playSound('active');
        }
        // Left Hand toggle (Left Shift)
        if (e.key === 'Shift' && e.location === 1) { // Left Shift
            e.preventDefault();
            toggleLeftHand();
        }
        // Right Hand toggle (Right Shift)
        if (e.key === 'Shift' && e.location === 2) { // Right Shift
            e.preventDefault();
            toggleRightHand();
        }
        // Conscious Hand toggle (Enter)
        if (e.key === 'Enter') {
            e.preventDefault();
            toggleConsciousHand();
        }
        // MySpace toggle (0 key)
        if (e.key === '0') {
            e.preventDefault();
            toggleMySpace();
        }
        // Pocket toggle (9 key)
        if (e.key === '9') {
            e.preventDefault();
            togglePocket();
        }
    });

    window.addEventListener('keyup', (e) => {
        // Disable keyboard controls when typing in text fields
        const activeElement = document.activeElement;
        const isTextField = activeElement.tagName === 'INPUT' || 
                           activeElement.tagName === 'TEXTAREA' || 
                           activeElement.isContentEditable;
        
        if (isTextField) {
            return; // Don't process keyboard shortcuts
        }
        
        const key = e.key.toLowerCase();
        if (key in keys) {
            keys[key] = false;
            // Remove visual feedback for C key
            if (key === 'c') {
                document.body.classList.remove('fps-mode');
            }
        }
    });

    // Mobile controls
    setupMobileControls();
    setupTransformPanel();
    setupActionGrid();
    setupHamburgerMenus();
    setupDockDragDrop();
    setupTimer();
    setupTimezone();
    setupSearchPanel();
    setupHandMenus();
    initPocket();
    initVirtualKeyboard();
    setupUITransparency();
    setupParticleBehavior();
    setupMySpaceGrid();
    setupProfile();

    // Apply default theme
    applyTheme('silver');

    // Start animation
    animate();
}

function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Mouse look - only when holding C key (Metroid Prime style)
    if (keys.c && !isRotating) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        // Apply FPS-style rotation
        if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            // Horizontal rotation (yaw) - rotate around world Y axis
            camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -deltaX * lookSensitivity);
            
            // Vertical rotation (pitch) - rotate around camera's local X axis
            const pitchAxis = new THREE.Vector3(1, 0, 0);
            const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(pitchAxis, -deltaY * lookSensitivity);
            camera.quaternion.multiply(pitchQuaternion);
            
            // Clamp pitch to prevent looking too far up or down
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            
            // If looking too far down, clamp it
            if (forward.y < -0.99) {
                const correctionAxis = new THREE.Vector3(1, 0, 0);
                const correctionAngle = -0.01;
                const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, correctionAngle);
                camera.quaternion.multiply(correctionQuaternion);
            }
            // If looking too far up, clamp it
            else if (forward.y > 0.99) {
                const correctionAxis = new THREE.Vector3(1, 0, 0);
                const correctionAngle = 0.01;
                const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, correctionAngle);
                camera.quaternion.multiply(correctionQuaternion);
            }
        }
    } else {
        // Update last mouse position even when not looking
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    // Orbit rotation (when dragging without C key)
    if (isRotating && !keys.c) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        const rotationSpeed = 0.005;
        const euler = new THREE.Euler(
            deltaY * rotationSpeed,
            deltaX * rotationSpeed,
            0,
            'XYZ'
        );
        
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        camera.position.applyQuaternion(quaternion);
        camera.lookAt(cameraTarget);
        
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    // Raycasting for hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
        const hoveredObj = intersects[0].object;
        if (hoveredObj !== hoveredObject) {
            if (hoveredObject && hoveredObject !== selectedObject) {
                hoveredObject.material.color.setHex(hoveredObject.userData.originalColor);
                hoveredObject.material.opacity = hoveredObject.userData.type === 'grid' ? 0.2 : 0.8;
            }
            hoveredObject = hoveredObj;
            if (hoveredObj !== selectedObject) {
                hoveredObj.material.color.setHex(0x888888);
                hoveredObj.material.opacity = 0.6;
            }
            playSound('hover');
        }
    } else {
        if (hoveredObject && hoveredObject !== selectedObject) {
            hoveredObject.material.color.setHex(hoveredObject.userData.originalColor);
            hoveredObject.material.opacity = hoveredObject.userData.type === 'grid' ? 0.2 : 0.8;
        }
        hoveredObject = null;
    }
}

function onMouseDown(event) {
    if (event.button === 0) {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera({ x, y }, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects);

        if (intersects.length > 0) {
            const clickedObj = intersects[0].object;
            
            // Check if clicked on scroll icon
            if (clickedObj.userData.isScrollIcon) {
                const parentObj = clickedObj.userData.parentObject;
                if (parentObj) {
                    // Load JSON data and show viewer
                    const objectId = parentObj.uuid;
                    const savedData = localStorage.getItem(`object_data_${objectId}`);
                    if (savedData) {
                        const data = JSON.parse(savedData);
                        if (data.isJSON) {
                            showJSONViewer(data.body);
                            
                            // Move camera to center for viewing
                            gsap.to(camera.position, {
                                duration: 1.5,
                                x: 0,
                                y: 0,
                                z: 15,
                                ease: 'power2.inOut'
                            });
                            gsap.to(cameraTarget, {
                                duration: 1.5,
                                x: 0,
                                y: 0,
                                z: 0,
                                ease: 'power2.inOut'
                            });
                        }
                    }
                }
                playSound('active');
                return; // Don't continue with normal selection
            }
            
            // Reset previous selection
            if (selectedObject) {
                selectedObject.material.color.setHex(selectedObject.userData.originalColor);
                selectedObject.material.opacity = selectedObject.userData.type === 'grid' ? 0.2 : 0.8;
                // Only set emissive if material supports it
                if (selectedObject.material.emissive) {
                    selectedObject.material.emissive.setHex(0x000000);
                    selectedObject.material.emissiveIntensity = 0;
                }
            }
            
            selectedObject = clickedObj;
            clickedObj.material.color.setHex(0xffffff);
            clickedObj.material.opacity = 1.0;
            // Only set emissive if material supports it
            if (clickedObj.material.emissive !== undefined) {
                clickedObj.material.emissive.setHex(0xffffff);
                clickedObj.material.emissiveIntensity = 0.5;
            }
            playSound('active');
            
            // Update UI
            updateInspectorPanel();
            
            // Animate camera
            gsap.to(camera.position, {
                duration: 1.5,
                x: clickedObj.position.x * 1.5,
                y: clickedObj.position.y * 1.5,
                z: clickedObj.position.z + 10,
                ease: 'power2.inOut',
                onUpdate: () => {
                    camera.lookAt(clickedObj.position);
                }
            });
            
            gsap.to(cameraTarget, {
                duration: 1.5,
                x: clickedObj.position.x,
                y: clickedObj.position.y,
                z: clickedObj.position.z,
                ease: 'power2.inOut'
            });
        } else {
            isRotating = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    }
}

function onMouseUp() {
    isRotating = false;
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateInspectorPanel() {
    if (selectedObject) {
        const objName = selectedObject.userData.title || selectedObject.userData.label || 'Unknown';
        document.getElementById('selected-name').textContent = objName;
        
        // Update position
        document.getElementById('object-position').textContent = 
            `X: ${selectedObject.position.x.toFixed(2)} | Y: ${selectedObject.position.y.toFixed(2)} | Z: ${selectedObject.position.z.toFixed(2)}`;
        
        // Update rotation (convert from radians to degrees)
        document.getElementById('object-rotation').textContent = 
            `X: ${(selectedObject.rotation.x * 180 / Math.PI).toFixed(2)}° | Y: ${(selectedObject.rotation.y * 180 / Math.PI).toFixed(2)}° | Z: ${(selectedObject.rotation.z * 180 / Math.PI).toFixed(2)}°`;
        
        // Update scale
        document.getElementById('object-scale').textContent = 
            `X: ${selectedObject.scale.x.toFixed(2)} | Y: ${selectedObject.scale.y.toFixed(2)} | Z: ${selectedObject.scale.z.toFixed(2)}`;
        
        // Load saved object data from localStorage
        const objectId = selectedObject.uuid; // Use THREE.js UUID
        const savedData = localStorage.getItem(`object_data_${objectId}`);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('object-data-header').value = data.header || '';
            document.getElementById('object-data-body').value = data.body || '';
            document.getElementById('object-data-footer').value = data.footer || '';
            
            // Update labels with header, footer, and icon
            updateObjectLabel(selectedObject, data.header, data.footer, data.icon);
            
            // Add scroll icon if JSON detected
            if (data.isJSON) {
                addScrollIconToObject(selectedObject);
            }
            
            // Show selected icon in UI
            if (data.icon) {
                if (data.icon.type === 'image' && data.icon.imageData) {
                    document.getElementById('selected-icon-text').textContent = `Image selected`;
                } else if (data.icon.value) {
                    document.getElementById('selected-icon-text').textContent = `Selected: ${data.icon.value}`;
                }
            }
        } else {
            // Clear fields if no saved data
            document.getElementById('object-data-header').value = '';
            document.getElementById('object-data-body').value = '';
            document.getElementById('object-data-footer').value = '';
            document.getElementById('selected-icon-text').textContent = 'No icon selected';
        }
        
        document.getElementById('object-details').style.display = 'block';
    } else {
        document.getElementById('selected-name').textContent = 'None';
        document.getElementById('object-details').style.display = 'none';
    }
}

function setupInspectorDataSave() {
    const submitBtn = document.getElementById('object-data-submit');
    
    // Icon selector state
    let selectedIconType = 'emoji';
    let selectedIconValue = null;
    let selectedImageData = null;
    
    if (!submitBtn) {
        console.warn('Inspector submit button not found');
        return;
    }
    
    // Icon type button handlers
    document.querySelectorAll('.icon-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            document.querySelectorAll('.icon-type-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'rgba(128, 128, 128, 0.3)';
            });
            
            // Add active to clicked
            btn.classList.add('active');
            btn.style.background = 'rgba(128, 128, 128, 0.5)';
            
            selectedIconType = btn.getAttribute('data-type');
            
            // Show appropriate picker
            document.getElementById('emoji-picker').style.display = selectedIconType === 'emoji' ? 'grid' : 'none';
            document.getElementById('image-picker').style.display = selectedIconType === 'image' ? 'block' : 'none';
            document.getElementById('fontawesome-picker').style.display = selectedIconType === 'fontawesome' ? 'grid' : 'none';
            
            playSound('passive');
        });
    });
    
    // Emoji selection
    document.querySelectorAll('.emoji-option').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedIconValue = btn.getAttribute('data-emoji');
            document.getElementById('selected-icon-text').textContent = `Selected: ${selectedIconValue}`;
            playSound('passive');
        });
    });
    
    // FontAwesome selection
    document.querySelectorAll('.fa-option').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedIconValue = btn.textContent; // Using emoji representation
            document.getElementById('selected-icon-text').textContent = `Selected: ${selectedIconValue}`;
            playSound('passive');
        });
    });
    
    // Image upload
    const imageUpload = document.getElementById('icon-image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    selectedImageData = event.target.result;
                    const preview = document.getElementById('image-preview');
                    preview.innerHTML = `<img src="${selectedImageData}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
                    document.getElementById('selected-icon-text').textContent = `Image: ${file.name}`;
                    playSound('passive');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Save button handler
    submitBtn.addEventListener('click', () => {
        if (selectedObject) {
            const objectId = selectedObject.uuid;
            const header = document.getElementById('object-data-header').value;
            const body = document.getElementById('object-data-body').value;
            const footer = document.getElementById('object-data-footer').value;
            
            // Prepare icon data
            let iconData = null;
            if (selectedIconValue || selectedImageData) {
                iconData = {
                    type: selectedIconType,
                    value: selectedIconValue,
                    imageData: selectedImageData
                };
            }
            
            // Check if body contains JSON
            let isJSON = false;
            try {
                if (body && body.trim().startsWith('{') || body.trim().startsWith('[')) {
                    JSON.parse(body);
                    isJSON = true;
                }
            } catch (e) {
                isJSON = false;
            }
            
            const data = {
                header: header,
                body: body,
                footer: footer,
                icon: iconData,
                isJSON: isJSON,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(`object_data_${objectId}`, JSON.stringify(data));
            
            // Update labels and icons
            updateObjectLabel(selectedObject, header, footer, iconData);
            
            // Add scroll icon if JSON detected
            if (isJSON) {
                addScrollIconToObject(selectedObject);
            } else if (selectedObject.userData.scrollIcon) {
                // Remove scroll icon if body is no longer JSON
                selectedObject.remove(selectedObject.userData.scrollIcon);
                selectedObject.userData.scrollIcon = null;
            }
            
            // Visual feedback
            submitBtn.textContent = 'SAVED!';
            submitBtn.style.background = 'rgba(74, 226, 144, 0.3)';
            submitBtn.style.borderColor = 'rgba(74, 226, 144, 0.5)';
            
            setTimeout(() => {
                submitBtn.textContent = 'SAVE DATA';
                submitBtn.style.background = 'rgba(128, 128, 128, 0.3)';
                submitBtn.style.borderColor = 'rgba(128, 128, 128, 0.5)';
            }, 2000);
            
            playSound('active');
        }
    });
}

function updateObjectLabel(object, headerText, footerText, iconData) {
    // Remove existing labels
    if (object.userData.headerLabel) {
        object.remove(object.userData.headerLabel);
        if (object.userData.headerLabel.geometry) object.userData.headerLabel.geometry.dispose();
        if (object.userData.headerLabel.material) object.userData.headerLabel.material.dispose();
        object.userData.headerLabel = null;
    }
    if (object.userData.footerLabel) {
        object.remove(object.userData.footerLabel);
        if (object.userData.footerLabel.geometry) object.userData.footerLabel.geometry.dispose();
        if (object.userData.footerLabel.material) object.userData.footerLabel.material.dispose();
        object.userData.footerLabel = null;
    }
    if (object.userData.iconSprite) {
        object.remove(object.userData.iconSprite);
        if (object.userData.iconSprite.geometry) object.userData.iconSprite.geometry.dispose();
        if (object.userData.iconSprite.material) object.userData.iconSprite.material.dispose();
        object.userData.iconSprite = null;
    }
    if (object.userData.scrollIcon) {
        object.remove(object.userData.scrollIcon);
        if (object.userData.scrollIcon.geometry) object.userData.scrollIcon.geometry.dispose();
        if (object.userData.scrollIcon.material) object.userData.scrollIcon.material.dispose();
        object.userData.scrollIcon = null;
    }
    
    // Create header label if text provided
    if (headerText && headerText.trim()) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Draw background
        context.fillStyle = 'rgba(80, 80, 90, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = 'rgba(128, 128, 128, 0.5)';
        context.lineWidth = 2;
        context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        // Text with glow
        context.font = 'bold 48px Orbitron, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(255, 255, 255, 0.8)';
        context.shadowBlur = 15;
        context.fillStyle = '#ffffff';
        context.fillText(headerText, canvas.width / 2, canvas.height / 2);
        context.fillText(headerText, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 1, 1);
        sprite.position.set(0, 3.5, 0); // Higher to not cover object
        object.add(sprite);
        object.userData.headerLabel = sprite;
    }
    
    // Create footer label if text provided
    if (footerText && footerText.trim()) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Draw background
        context.fillStyle = 'rgba(80, 80, 90, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = 'rgba(128, 128, 128, 0.5)';
        context.lineWidth = 2;
        context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        // Text with glow
        context.font = 'bold 38px Orbitron, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(255, 255, 255, 0.8)';
        context.shadowBlur = 15;
        context.fillStyle = '#ffffff';
        context.fillText(footerText, canvas.width / 2, canvas.height / 2);
        context.fillText(footerText, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 1, 1);
        sprite.position.set(0, -2.5, 0); // Bottom of object
        object.add(sprite);
        object.userData.footerLabel = sprite;
    }
    
    // Create icon sprite if icon data provided
    if (iconData && iconData.type && iconData.value) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;
        
        // Semi-transparent background
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        if (iconData.type === 'emoji' || iconData.type === 'fontawesome') {
            // Draw emoji/icon
            context.font = '120px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = '#ffffff';
            context.fillText(iconData.value, canvas.width / 2, canvas.height / 2);
        } else if (iconData.type === 'image' && iconData.imageData) {
            // Draw image
            const img = new Image();
            img.src = iconData.imageData;
            img.onload = () => {
                context.drawImage(img, 20, 20, canvas.width - 40, canvas.height - 40);
                const texture = new THREE.CanvasTexture(canvas);
                if (object.userData.iconSprite && object.userData.iconSprite.material) {
                    object.userData.iconSprite.material.map = texture;
                    object.userData.iconSprite.material.needsUpdate = true;
                }
            };
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.5, 1.5, 1);
        sprite.position.set(0, 0, 0.1); // Slightly in front of object
        object.add(sprite);
        object.userData.iconSprite = sprite;
    }
}

function addScrollIconToObject(object) {
    // Remove existing scroll icon
    if (object.userData.scrollIcon) {
        object.remove(object.userData.scrollIcon);
        if (object.userData.scrollIcon.geometry) object.userData.scrollIcon.geometry.dispose();
        if (object.userData.scrollIcon.material) object.userData.scrollIcon.material.dispose();
    }
    
    // Create scroll icon
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    // Background
    context.fillStyle = 'rgba(100, 100, 255, 0.8)';
    context.beginPath();
    context.arc(64, 64, 60, 0, Math.PI * 2);
    context.fill();
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 4;
    context.stroke();
    
    // Scroll emoji
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText('📜', 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 1, 1);
    sprite.position.set(1.5, 1.5, 0); // Top right corner
    sprite.userData.isScrollIcon = true;
    sprite.userData.parentObject = object;
    
    object.add(sprite);
    object.userData.scrollIcon = sprite;
    
    // Add to interactive objects for clicking
    interactiveObjects.push(sprite);
}

function showJSONViewer(jsonString) {
    const panel = document.getElementById('json-viewer-panel');
    const content = document.getElementById('json-viewer-pre');
    
    if (!panel || !content) return;
    
    // Format JSON
    try {
        const parsed = JSON.parse(jsonString);
        content.textContent = JSON.stringify(parsed, null, 2);
    } catch (e) {
        content.textContent = jsonString;
    }
    
    // Show panel
    panel.style.display = 'block';
    playSound('passive');
}

function setupJSONViewer() {
    const panel = document.getElementById('json-viewer-panel');
    const minimizedTab = document.getElementById('json-viewer-minimized');
    const closeBtn = document.getElementById('close-json-viewer');
    const minimizeBtn = document.getElementById('minimize-json-viewer');
    const toggle3DBtn = document.getElementById('toggle-3d-viewer');
    const scrollUpBtn = document.getElementById('json-scroll-up');
    const scrollDownBtn = document.getElementById('json-scroll-down');
    const contentArea = document.getElementById('json-viewer-content');
    const opacitySlider = document.getElementById('json-viewer-opacity');
    const opacityValue = document.getElementById('json-viewer-opacity-value');
    
    // Opacity slider
    if (opacitySlider && opacityValue && panel) {
        opacitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            opacityValue.textContent = `${Math.round(value * 100)}%`;
            panel.style.background = `rgba(25, 25, 30, ${value})`;
            playSound('passive');
        });
    }
    
    // Make panel draggable
    const header = document.getElementById('json-viewer-header');
    if (header && panel) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                const rect = panel.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
                panel.style.transform = 'none';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                panel.style.left = currentX + 'px';
                panel.style.top = currentY + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            playSound('passive');
        });
    }
    
    // Minimize button
    if (minimizeBtn && panel && minimizedTab) {
        minimizeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            minimizedTab.style.display = 'block';
            playSound('passive');
        });
    }
    
    // Restore from minimized
    if (minimizedTab && panel) {
        minimizedTab.addEventListener('click', () => {
            minimizedTab.style.display = 'none';
            panel.style.display = 'block';
            playSound('passive');
        });
    }
    
    // Toggle 3D View
    if (toggle3DBtn) {
        toggle3DBtn.addEventListener('click', () => {
            // Close 2D panel
            panel.style.display = 'none';
            
            // Create or show 3D panel
            show3DDataPanel();
            playSound('active');
        });
    }
    
    // Scroll buttons
    if (scrollUpBtn && contentArea) {
        scrollUpBtn.addEventListener('click', () => {
            contentArea.scrollBy({ top: -100, behavior: 'smooth' });
            playSound('passive');
        });
    }
    
    if (scrollDownBtn && contentArea) {
        scrollDownBtn.addEventListener('click', () => {
            contentArea.scrollBy({ top: 100, behavior: 'smooth' });
            playSound('passive');
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (panel && panel.style.display === 'block') {
                panel.style.display = 'none';
                playSound('passive');
            }
        }
    });
}

let scene3DDataPanel = null;
let scene3DDataTexture = null;

function show3DDataPanel() {
    const jsonContent = document.getElementById('json-viewer-pre').textContent;
    
    // Remove existing 3D panel if exists
    if (scene3DDataPanel) {
        scene.remove(scene3DDataPanel);
        if (scene3DDataTexture) scene3DDataTexture.dispose();
    }
    
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 2048;
    
    // Background
    context.fillStyle = 'rgba(25, 25, 30, 0.95)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Header
    context.fillStyle = 'rgba(128, 128, 128, 0.3)';
    context.fillRect(0, 0, canvas.width, 80);
    context.font = 'bold 36px Orbitron';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText('📜 DATA VIEWER', canvas.width / 2, 50);
    
    // JSON Content
    context.font = '20px Courier New';
    context.fillStyle = '#ffffff';
    context.textAlign = 'left';
    
    const lines = jsonContent.split('\n');
    let y = 120;
    const lineHeight = 28;
    const maxWidth = canvas.width - 40;
    
    lines.forEach(line => {
        if (y < canvas.height - 40) {
            // Wrap long lines
            const words = line.split(' ');
            let currentLine = '';
            
            words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const metrics = context.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    context.fillText(currentLine, 20, y);
                    y += lineHeight;
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            });
            
            context.fillText(currentLine, 20, y);
            y += lineHeight;
        }
    });
    
    // Scroll controls hint
    context.font = 'bold 24px Orbitron';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.textAlign = 'center';
    context.fillText('▲ W Key - Scroll Up ▲', canvas.width / 2, canvas.height - 50);
    context.fillText('▼ S Key - Scroll Down ▼', canvas.width / 2, canvas.height - 20);
    
    // Create texture and material
    scene3DDataTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: scene3DDataTexture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(10, 20);
    scene3DDataPanel = new THREE.Mesh(geometry, material);
    
    // Position at center
    scene3DDataPanel.position.set(0, 0, 0);
    scene3DDataPanel.userData.is3DPanel = true;
    scene3DDataPanel.userData.scrollOffset = 0;
    scene3DDataPanel.userData.jsonContent = jsonContent;
    scene3DDataPanel.userData.canvasHeight = canvas.height;
    
    scene.add(scene3DDataPanel);
    
    // Move camera to viewing position
    gsap.to(camera.position, {
        duration: 1.5,
        x: 0,
        y: 0,
        z: 15,
        ease: 'power2.inOut'
    });
    
    gsap.to(cameraTarget, {
        duration: 1.5,
        x: 0,
        y: 0,
        z: 0,
        ease: 'power2.inOut'
    });
    
    // Show 3D panel controls
    const controlsPanel = document.getElementById('panel-3d-controls');
    if (controlsPanel) {
        controlsPanel.style.display = 'block';
    }
    
    // Setup 3D panel controls
    setup3DPanelControls();
}

function setup3DPanelControls() {
    const controlsPanel = document.getElementById('panel-3d-controls');
    const closeBtn = document.getElementById('close-3d-controls');
    const header = document.getElementById('panel-3d-header');
    
    // Position controls
    const posX = document.getElementById('panel-3d-pos-x');
    const posY = document.getElementById('panel-3d-pos-y');
    const posZ = document.getElementById('panel-3d-pos-z');
    
    // Rotation controls
    const rotX = document.getElementById('panel-3d-rot-x');
    const rotY = document.getElementById('panel-3d-rot-y');
    const rotZ = document.getElementById('panel-3d-rot-z');
    
    // Scale controls
    const scaX = document.getElementById('panel-3d-sca-x');
    const scaY = document.getElementById('panel-3d-sca-y');
    const scaZ = document.getElementById('panel-3d-sca-z');
    
    // Color and opacity
    const colorPicker = document.getElementById('panel-3d-color');
    const colorValue = document.getElementById('panel-3d-color-value');
    const opacitySlider = document.getElementById('panel-3d-opacity');
    const opacityValue = document.getElementById('panel-3d-opacity-value');
    
    // Buttons
    const pocketBtn = document.getElementById('save-to-pocket-3d');
    const resetBtn = document.getElementById('reset-3d-panel');
    const removeBtn = document.getElementById('remove-3d-panel');
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            controlsPanel.style.display = 'none';
            playSound('passive');
        });
    }
    
    // Position updates
    if (posX && scene3DDataPanel) {
        posX.addEventListener('input', (e) => {
            scene3DDataPanel.position.x = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (posY && scene3DDataPanel) {
        posY.addEventListener('input', (e) => {
            scene3DDataPanel.position.y = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (posZ && scene3DDataPanel) {
        posZ.addEventListener('input', (e) => {
            scene3DDataPanel.position.z = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    
    // Rotation updates
    if (rotX && scene3DDataPanel) {
        rotX.addEventListener('input', (e) => {
            scene3DDataPanel.rotation.x = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (rotY && scene3DDataPanel) {
        rotY.addEventListener('input', (e) => {
            scene3DDataPanel.rotation.y = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (rotZ && scene3DDataPanel) {
        rotZ.addEventListener('input', (e) => {
            scene3DDataPanel.rotation.z = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    
    // Scale updates
    if (scaX && scene3DDataPanel) {
        scaX.addEventListener('input', (e) => {
            scene3DDataPanel.scale.x = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (scaY && scene3DDataPanel) {
        scaY.addEventListener('input', (e) => {
            scene3DDataPanel.scale.y = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    if (scaZ && scene3DDataPanel) {
        scaZ.addEventListener('input', (e) => {
            scene3DDataPanel.scale.z = parseFloat(e.target.value);
            playSound('passive');
        });
    }
    
    // Color update
    if (colorPicker && colorValue && scene3DDataPanel) {
        colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            colorValue.textContent = color.toUpperCase();
            updatePanelColor(color);
            playSound('passive');
        });
    }
    
    // Opacity update
    if (opacitySlider && opacityValue && scene3DDataPanel) {
        opacitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            opacityValue.textContent = `${Math.round(value * 100)}%`;
            scene3DDataPanel.material.opacity = value;
            playSound('passive');
        });
    }
    
    // Reset button
    if (resetBtn && scene3DDataPanel) {
        resetBtn.addEventListener('click', () => {
            // Reset to default position
            scene3DDataPanel.position.set(0, 0, 0);
            scene3DDataPanel.rotation.set(0, 0, 0);
            scene3DDataPanel.scale.set(1, 1, 1);
            
            // Reset sliders
            if (posX) posX.value = 0;
            if (posY) posY.value = 0;
            if (posZ) posZ.value = 0;
            if (rotX) rotX.value = 0;
            if (rotY) rotY.value = 0;
            if (rotZ) rotZ.value = 0;
            if (scaX) scaX.value = 1;
            if (scaY) scaY.value = 1;
            if (scaZ) scaZ.value = 1;
            
            // Reset camera
            gsap.to(camera.position, {
                duration: 1,
                x: 0,
                y: 0,
                z: 15,
                ease: 'power2.inOut'
            });
            
            playSound('active');
        });
    }
    
    // Remove button
    if (removeBtn && scene3DDataPanel) {
        removeBtn.addEventListener('click', () => {
            if (confirm('Remove 3D panel from scene?')) {
                scene.remove(scene3DDataPanel);
                scene3DDataPanel = null;
                controlsPanel.style.display = 'none';
                playSound('active');
            }
        });
    }
    
    // Put in pocket
    if (pocketBtn) {
        pocketBtn.addEventListener('click', () => {
            // Store panel data in pocket
            const panelData = {
                type: '3d-panel',
                jsonContent: scene3DDataPanel.userData.jsonContent,
                position: {
                    x: scene3DDataPanel.position.x,
                    y: scene3DDataPanel.position.y,
                    z: scene3DDataPanel.position.z
                },
                rotation: {
                    x: scene3DDataPanel.rotation.x,
                    y: scene3DDataPanel.rotation.y,
                    z: scene3DDataPanel.rotation.z
                },
                scale: {
                    x: scene3DDataPanel.scale.x,
                    y: scene3DDataPanel.scale.y,
                    z: scene3DDataPanel.scale.z
                }
            };
            
            // Find next available pocket slot
            let slotIndex = 0;
            while (slotIndex < maxPocketSlots && pocketItems[slotIndex]) {
                slotIndex++;
            }
            
            if (slotIndex < maxPocketSlots) {
                pocketItems[slotIndex] = panelData;
                localStorage.setItem(`pocket_item_${slotIndex}`, JSON.stringify(panelData));
                
                // Remove from scene
                scene.remove(scene3DDataPanel);
                scene3DDataPanel = null;
                controlsPanel.style.display = 'none';
                
                // Visual feedback
                pocketBtn.textContent = '✓ STORED!';
                setTimeout(() => {
                    pocketBtn.textContent = '💼 SAVE TO POCKET';
                }, 2000);
                
                playSound('active');
            } else {
                alert('Pocket is full!');
            }
        });
    }
    
    // Make controls panel draggable
    if (header && controlsPanel) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target === header || header.contains(e.target.querySelector('span'))) {
                isDragging = true;
                const rect = controlsPanel.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
                controlsPanel.style.transform = 'none';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                controlsPanel.style.right = 'auto';
                controlsPanel.style.left = currentX + 'px';
                controlsPanel.style.top = currentY + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

function updatePanelColor(color) {
    if (!scene3DDataPanel) return;
    
    const jsonContent = scene3DDataPanel.userData.jsonContent;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 2048;
    
    // Convert hex to RGB
    const r = parseInt(color.substr(1,2), 16);
    const g = parseInt(color.substr(3,2), 16);
    const b = parseInt(color.substr(5,2), 16);
    
    // Background with new color
    context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Header
    context.fillStyle = 'rgba(128, 128, 128, 0.3)';
    context.fillRect(0, 0, canvas.width, 80);
    context.font = 'bold 36px Orbitron';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText('📜 DATA VIEWER', canvas.width / 2, 50);
    
    // JSON Content
    context.font = '20px Courier New';
    context.fillStyle = '#ffffff';
    context.textAlign = 'left';
    
    const lines = jsonContent.split('\n');
    let y = 120;
    const lineHeight = 28;
    const maxWidth = canvas.width - 40;
    
    lines.forEach(line => {
        if (y < canvas.height - 40) {
            const words = line.split(' ');
            let currentLine = '';
            
            words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const metrics = context.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    context.fillText(currentLine, 20, y);
                    y += lineHeight;
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            });
            
            context.fillText(currentLine, 20, y);
            y += lineHeight;
        }
    });
    
    // Scroll hints
    context.font = 'bold 24px Orbitron';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.textAlign = 'center';
    context.fillText('▲ W Key - Scroll Up ▲', canvas.width / 2, canvas.height - 50);
    context.fillText('▼ S Key - Scroll Down ▼', canvas.width / 2, canvas.height - 20);
    
    // Update texture
    const newTexture = new THREE.CanvasTexture(canvas);
    scene3DDataPanel.material.map = newTexture;
    scene3DDataPanel.material.needsUpdate = true;
    
    // Dispose old texture
    if (scene3DDataTexture) scene3DDataTexture.dispose();
    scene3DDataTexture = newTexture;
}

// Add scroll functionality for 3D panel in animate loop
window.scroll3DPanel = function(direction) {
    if (scene3DDataPanel && scene3DDataPanel.userData.is3DPanel) {
        const scrollAmount = 0.5;
        scene3DDataPanel.userData.scrollOffset += direction * scrollAmount;
        
        // Update texture offset for scrolling effect
        if (scene3DDataPanel.material.map) {
            scene3DDataPanel.material.map.offset.y = scene3DDataPanel.userData.scrollOffset * 0.001;
            scene3DDataPanel.material.map.needsUpdate = true;
        }
    }
};


function setupPanelControls() {
    const panel = document.getElementById('inspector-panel');
    const header = document.getElementById('panel-header');
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (!panel || !header || !minimizeBtn || !closeBtn) {
        console.warn('Inspector panel elements not found');
        return;
    }

    // Minimize
    minimizeBtn.addEventListener('click', () => {
        panel.classList.toggle('minimized');
        const content = document.getElementById('panel-content');
        if (content) {
            content.classList.toggle('hidden');
        }
        minimizeBtn.textContent = panel.classList.contains('minimized') ? '□' : '_';
    });

    // Close (hide via toggle class)
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('visible');
        playSound('passive');
    });

    // Drag
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX - panel.offsetLeft;
        dragStartY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            panel.style.left = (e.clientX - dragStartX) + 'px';
            panel.style.top = (e.clientY - dragStartY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
    
    // Inspector resize
    const resizeHandle = document.getElementById('inspector-resize-handle');
    let isResizing = false;
    let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;
    
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            resizeStartWidth = panel.offsetWidth;
            resizeStartHeight = panel.offsetHeight;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const newWidth = resizeStartWidth + (e.clientX - resizeStartX);
                const newHeight = resizeStartHeight + (e.clientY - resizeStartY);
                panel.style.width = Math.max(320, newWidth) + 'px';
                panel.style.maxHeight = Math.max(200, newHeight) + 'px';
            }
        });
    }
    
    // View Panel
    const openViewPanelBtn = document.getElementById('open-view-panel-btn');
    const viewPanel = document.getElementById('view-panel');
    const viewPanelClose = document.getElementById('view-panel-close');
    
    if (openViewPanelBtn && viewPanel) {
        openViewPanelBtn.addEventListener('click', () => {
            if (selectedObject) {
                // Load data into view panel
                const objectId = selectedObject.uuid;
                const savedData = localStorage.getItem(`object_data_${objectId}`);
                
                if (savedData) {
                    const data = JSON.parse(savedData);
                    document.getElementById('view-header').textContent = data.header || '—';
                    document.getElementById('view-body').textContent = data.body || '—';
                    document.getElementById('view-footer').textContent = data.footer || '—';
                } else {
                    document.getElementById('view-header').textContent = '—';
                    document.getElementById('view-body').textContent = '—';
                    document.getElementById('view-footer').textContent = '—';
                }
                
                viewPanel.style.display = 'block';
                playSound('active');
            } else {
                alert('No object selected. Please select an object first.');
            }
        });
    }
    
    if (viewPanelClose) {
        viewPanelClose.addEventListener('click', () => {
            viewPanel.style.display = 'none';
            playSound('passive');
        });
    }
    
    // View Panel Drag
    const viewPanelHeader = document.getElementById('view-panel-header');
    let isViewDragging = false;
    let viewDragStartX, viewDragStartY;
    
    if (viewPanelHeader && viewPanel) {
        viewPanelHeader.addEventListener('mousedown', (e) => {
            // Don't drag if clicking close button
            if (e.target.closest('#view-panel-close')) return;
            
            isViewDragging = true;
            viewDragStartX = e.clientX - viewPanel.offsetLeft;
            viewDragStartY = e.clientY - viewPanel.offsetTop;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isViewDragging) {
                viewPanel.style.left = (e.clientX - viewDragStartX) + 'px';
                viewPanel.style.top = (e.clientY - viewDragStartY) + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            isViewDragging = false;
            isViewResizing = false;
        });
    }
    
    // View Panel Resize
    const viewResizeHandle = document.getElementById('view-panel-resize-handle');
    let isViewResizing = false;
    let viewResizeStartX, viewResizeStartY, viewResizeStartWidth, viewResizeStartHeight;
    
    if (viewResizeHandle && viewPanel) {
        viewResizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isViewResizing = true;
            viewResizeStartX = e.clientX;
            viewResizeStartY = e.clientY;
            viewResizeStartWidth = viewPanel.offsetWidth;
            viewResizeStartHeight = viewPanel.offsetHeight;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isViewResizing) {
                const newWidth = viewResizeStartWidth + (e.clientX - viewResizeStartX);
                const newHeight = viewResizeStartHeight + (e.clientY - viewResizeStartY);
                viewPanel.style.width = Math.max(300, newWidth) + 'px';
                viewPanel.style.maxHeight = Math.max(200, newHeight) + 'px';
            }
        });
    }
    
    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.getAttribute('data-copy');
            let textToCopy = '';
            
            if (field === 'header') {
                textToCopy = document.getElementById('view-header').textContent;
            } else if (field === 'body') {
                textToCopy = document.getElementById('view-body').textContent;
            } else if (field === 'footer') {
                textToCopy = document.getElementById('view-footer').textContent;
            }
            
            if (textToCopy && textToCopy !== '—') {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = '✓ COPIED';
                    btn.style.background = 'rgba(74, 226, 144, 0.3)';
                    btn.style.borderColor = 'rgba(74, 226, 144, 0.5)';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = 'rgba(128, 128, 128, 0.3)';
                        btn.style.borderColor = 'rgba(128, 128, 128, 0.5)';
                    }, 2000);
                    
                    playSound('active');
                });
            }
        });
    });

    // FAQ panel close
    const faqClose = document.getElementById('faq-close');
    if (faqClose) {
        faqClose.addEventListener('click', () => {
            document.getElementById('faq-panel').classList.remove('visible');
        });
    }
}

function setupMobileControls() {
    const joystickStick = document.getElementById('joystick-stick');
    const joystickBase = joystickStick.parentElement;

    // Joystick touch/mouse controls
    joystickStick.addEventListener('mousedown', startJoystick);
    joystickStick.addEventListener('touchstart', startJoystick);

    function startJoystick(e) {
        e.preventDefault();
        joystickActive = true;
        const rect = joystickBase.getBoundingClientRect();
        joystickStartPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        document.addEventListener('mousemove', moveJoystick);
        document.addEventListener('touchmove', moveJoystick);
        document.addEventListener('mouseup', stopJoystick);
        document.addEventListener('touchend', stopJoystick);
    }

    function moveJoystick(e) {
        if (!joystickActive) return;
        
        e.preventDefault(); // Prevent scrolling on mobile
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - joystickStartPos.x;
        const deltaY = clientY - joystickStartPos.y;

        const distance = Math.min(45, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
        const angle = Math.atan2(deltaY, deltaX);

        const maxOffset = 45;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        joystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

        // Move camera based on joystick
        const moveX = (offsetX / maxOffset) * moveSpeed;
        const moveZ = (offsetY / maxOffset) * moveSpeed;

        camera.position.x += moveX;
        camera.position.z += moveZ;
        cameraTarget.x += moveX;
        cameraTarget.z += moveZ;
    }

    function stopJoystick() {
        joystickActive = false;
        joystickStick.style.transform = 'translate(-50%, -50%)';
        document.removeEventListener('mousemove', moveJoystick);
        document.removeEventListener('touchmove', moveJoystick);
        document.removeEventListener('mouseup', stopJoystick);
        document.removeEventListener('touchend', stopJoystick);
    }

    // Mobile touch for FPS camera look (single finger on canvas)
    const canvas = renderer.domElement;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchLooking = false;

    canvas.addEventListener('touchstart', (e) => {
        // Only handle single finger touch for camera look
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            isTouchLooking = true;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isTouchLooking && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Apply FPS-style rotation (same as C key mouse look)
            if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
                // Horizontal rotation (yaw)
                camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -deltaX * lookSensitivity * 2);
                
                // Vertical rotation (pitch)
                const pitchAxis = new THREE.Vector3(1, 0, 0);
                const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(pitchAxis, -deltaY * lookSensitivity * 2);
                camera.quaternion.multiply(pitchQuaternion);
                
                // Clamp pitch
                const forward = new THREE.Vector3(0, 0, -1);
                forward.applyQuaternion(camera.quaternion);
                
                if (forward.y < -0.99) {
                    const correctionAxis = new THREE.Vector3(1, 0, 0);
                    const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, -0.01);
                    camera.quaternion.multiply(correctionQuaternion);
                } else if (forward.y > 0.99) {
                    const correctionAxis = new THREE.Vector3(1, 0, 0);
                    const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, 0.01);
                    camera.quaternion.multiply(correctionQuaternion);
                }
            }
        }
    });

    canvas.addEventListener('touchend', () => {
        isTouchLooking = false;
    });
}

function setupTransformPanel() {
    const transformPanel = document.getElementById('transform-panel');
    const transformClose = document.getElementById('transform-close');
    const transformTitle = document.getElementById('transform-title');
    
    const btnPos = document.getElementById('btn-pos');
    const btnRot = document.getElementById('btn-rot');
    const btnScale = document.getElementById('btn-scale');

    const transformX = document.getElementById('transform-x');
    const transformY = document.getElementById('transform-y');
    const transformZ = document.getElementById('transform-z');
    const stepSize = document.getElementById('step-size');

    transformClose.addEventListener('click', () => {
        transformPanel.style.display = 'none';
        currentTransformMode = null;
        btnPos.classList.remove('active');
        btnRot.classList.remove('active');
        btnScale.classList.remove('active');
    });

    btnPos.addEventListener('click', () => {
        showTransformPanel('POSITION', 'position', btnPos);
    });

    btnRot.addEventListener('click', () => {
        showTransformPanel('ROTATION', 'rotation', btnRot);
    });

    btnScale.addEventListener('click', () => {
        showTransformPanel('SCALE', 'scale', btnScale);
    });

    function showTransformPanel(title, mode, button) {
        transformTitle.textContent = title;
        currentTransformMode = mode;
        transformPanel.style.display = 'block';

        // Update active states
        btnPos.classList.remove('active');
        btnRot.classList.remove('active');
        btnScale.classList.remove('active');
        button.classList.add('active');

        // Update values based on selected object
        if (selectedObject) {
            if (mode === 'position') {
                transformX.value = selectedObject.position.x.toFixed(2);
                transformY.value = selectedObject.position.y.toFixed(2);
                transformZ.value = selectedObject.position.z.toFixed(2);
            } else if (mode === 'rotation') {
                transformX.value = (selectedObject.rotation.x * 180 / Math.PI).toFixed(2);
                transformY.value = (selectedObject.rotation.y * 180 / Math.PI).toFixed(2);
                transformZ.value = (selectedObject.rotation.z * 180 / Math.PI).toFixed(2);
            } else if (mode === 'scale') {
                transformX.value = selectedObject.scale.x.toFixed(2);
                transformY.value = selectedObject.scale.y.toFixed(2);
                transformZ.value = selectedObject.scale.z.toFixed(2);
            }
        }
    }

    // Apply transform changes
    function applyTransform() {
        if (!selectedObject || !currentTransformMode) return;

        const x = parseFloat(transformX.value) || 0;
        const y = parseFloat(transformY.value) || 0;
        const z = parseFloat(transformZ.value) || 0;

        if (currentTransformMode === 'position') {
            selectedObject.position.set(x, y, z);
        } else if (currentTransformMode === 'rotation') {
            selectedObject.rotation.set(
                x * Math.PI / 180,
                y * Math.PI / 180,
                z * Math.PI / 180
            );
        } else if (currentTransformMode === 'scale') {
            selectedObject.scale.set(x, y, z);
        }

        updateInspectorPanel();
        playSound('active');
    }

    // Submit button applies changes
    const transformSubmit = document.getElementById('transform-submit');
    transformSubmit.addEventListener('click', () => {
        applyTransform();
    });

    // Arrow keys for fine control (but don't apply immediately)
    [transformX, transformY, transformZ].forEach(input => {
        input.addEventListener('keydown', (e) => {
            const step = parseFloat(stepSize.value) || 1;
            const currentValue = parseFloat(input.value) || 0;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                input.value = (currentValue + step).toFixed(2);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                input.value = (currentValue - step).toFixed(2);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                applyTransform();
            }
        });
    });
}

function setupActionGrid() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Toggle active state
            btn.classList.toggle('active');
            
            // Custom action for each button
            console.log(`Action button ${index + 1} clicked`);
            playSound('passive');
            
            // You can add specific functionality for each button here
            // For example, save states, trigger animations, etc.
        });
    });
}

function setupHamburgerMenus() {
    const leftHamburger = document.getElementById('left-hamburger');
    const rightHamburger = document.getElementById('right-hamburger');
    const leftMenu = document.getElementById('left-menu');
    const rightMenu = document.getElementById('right-menu');
    const leftBreadcrumb = document.getElementById('left-breadcrumb');
    const rightBreadcrumb = document.getElementById('right-breadcrumb');

    // Toggle left menu
    leftHamburger.addEventListener('click', () => {
        leftMenu.classList.toggle('open');
        leftHamburger.classList.toggle('menu-open');
        playSound('passive');
    });

    // Toggle right menu
    rightHamburger.addEventListener('click', () => {
        rightMenu.classList.toggle('open');
        rightHamburger.classList.toggle('menu-open');
        playSound('passive');
    });

    // Handle menu item clicks for both menus
    const allMenuItems = document.querySelectorAll('.menu-item');
    allMenuItems.forEach(item => {
        const header = item.querySelector('.menu-item-header');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle submenu expansion
            item.classList.toggle('expanded');
            
            const page = item.getAttribute('data-page');
            const isLeftMenu = item.closest('#left-menu');
            const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
            const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
            
            // Update breadcrumb
            const pageName = header.querySelector('span').textContent;
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item breadcrumb-current">${pageName}</span>
            `;
            
            playSound('passive');
        });
    });

    // Handle submenu item clicks
    const allSubmenuItems = document.querySelectorAll('.submenu-item');
    allSubmenuItems.forEach(subitem => {
        subitem.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const submenuId = subitem.getAttribute('data-submenu');
            
            // Handle special admin items
            if (submenuId === 'admin-restart') {
                document.getElementById('restart-prompt').classList.add('visible');
                playSound('active');
                return;
            }
            
            if (submenuId === 'admin-theme') {
                initThemeSelector();
                document.getElementById('theme-prompt').classList.add('visible');
                playSound('active');
                return;
            }
            
            if (submenuId === 'admin-08') {
                document.getElementById('particle-behavior-panel').style.display = 'block';
                playSound('active');
                return;
            }
            
            if (submenuId === 'system-01') {
                // Open MySpace Grid Panel
                document.getElementById('myspace-grid-panel').style.display = 'block';
                playSound('active');
                return;
            }
            
            if (submenuId === 'system-11') {
                // Toggle header bar visibility
                const headerBar = document.getElementById('header-bar');
                if (headerBar.style.display === 'none') {
                    headerBar.style.display = 'flex';
                } else {
                    headerBar.style.display = 'none';
                }
                playSound('active');
                return;
            }
            
            const parentItem = subitem.closest('.menu-item');
            const page = parentItem.getAttribute('data-page');
            const isLeftMenu = subitem.closest('#left-menu');
            const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
            const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
            const pageName = parentItem.querySelector('.menu-item-header span').textContent;
            
            // Update breadcrumb with submenu
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item" data-level="page">${pageName}</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item breadcrumb-current">${subitem.textContent}</span>
            `;
            
            playSound('active');
            
            console.log('Submenu clicked:', submenuId, 'Parent:', page);
            // You can add navigation logic here
        });
    });

    // Breadcrumb navigation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('breadcrumb-item') && e.target.getAttribute('data-level')) {
            const level = e.target.getAttribute('data-level');
            const isLeftMenu = e.target.closest('#left-menu');
            const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
            const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
            
            if (level === 'root') {
                breadcrumb.innerHTML = `
                    <span class="breadcrumb-item breadcrumb-current">${menuTitle}</span>
                `;
                // Collapse all submenus
                const menu = isLeftMenu ? leftMenu : rightMenu;
                menu.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('expanded');
                });
            } else if (level === 'page') {
                const pageName = e.target.textContent;
                breadcrumb.innerHTML = `
                    <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                    <span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-item breadcrumb-current">${pageName}</span>
                `;
            }
            playSound('passive');
        }
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!leftMenu.contains(e.target) && !leftHamburger.contains(e.target)) {
            leftMenu.classList.remove('open');
            leftHamburger.classList.remove('menu-open');
        }
        if (!rightMenu.contains(e.target) && !rightHamburger.contains(e.target)) {
            rightMenu.classList.remove('open');
            rightHamburger.classList.remove('menu-open');
        }
    });
}

function setupDockDragDrop() {
    const dockItems = document.querySelectorAll('.dock-item');
    const docks = document.querySelectorAll('.dock');
    let draggedItem = null;

    dockItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            playSound('hover');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
    });

    docks.forEach(dock => {
        dock.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dock.classList.add('drag-over');
        });

        dock.addEventListener('dragleave', () => {
            dock.classList.remove('drag-over');
        });

        dock.addEventListener('drop', (e) => {
            e.preventDefault();
            dock.classList.remove('drag-over');
            
            if (draggedItem && draggedItem.parentElement !== dock) {
                // Remove from old dock
                draggedItem.parentElement.removeChild(draggedItem);
                
                // Add to new dock
                dock.appendChild(draggedItem);
                
                playSound('active');
            }
        });
    });
}

function setupTimer() {
    const timerElement = document.getElementById('session-timer');
    
    function updateTimer() {
        const elapsed = Date.now() - sessionStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = elapsed % 1000;
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    // Update timer every 10ms for smooth milliseconds
    timerInterval = setInterval(updateTimer, 10);
    updateTimer(); // Initial call
}

function setupTimezone() {
    const timezoneDisplay = document.getElementById('timezone-display');
    const timezoneSelector = document.getElementById('timezone-selector');
    const currentTimeEl = document.getElementById('current-time');
    const timezoneAbbr = document.getElementById('timezone-abbr');
    const autoDetectBtn = document.getElementById('auto-detect-tz');
    
    let selectedTimezone = localStorage.getItem('userTimezone') || 'America/New_York';
    let timezoneInterval;
    
    const timezoneAbbreviations = {
        'America/New_York': 'EST',
        'America/Chicago': 'CST',
        'America/Denver': 'MST',
        'America/Los_Angeles': 'PST',
        'Europe/London': 'GMT',
        'Europe/Paris': 'CET',
        'Asia/Tokyo': 'JST',
        'Australia/Sydney': 'AEDT'
    };
    
    function updateClock() {
        const now = new Date();
        const options = { 
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const timeString = now.toLocaleTimeString('en-US', options);
        currentTimeEl.textContent = timeString;
        timezoneAbbr.textContent = timezoneAbbreviations[selectedTimezone] || 'UTC';
    }
    
    // Toggle timezone selector
    timezoneDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = timezoneSelector.style.display === 'block';
        timezoneSelector.style.display = isVisible ? 'none' : 'block';
        playSound('passive');
    });
    
    // Close selector when clicking outside
    document.addEventListener('click', (e) => {
        if (!timezoneDisplay.contains(e.target)) {
            timezoneSelector.style.display = 'none';
        }
    });
    
    // Timezone option selection
    document.querySelectorAll('.timezone-option').forEach(option => {
        option.addEventListener('click', () => {
            selectedTimezone = option.getAttribute('data-tz');
            localStorage.setItem('userTimezone', selectedTimezone);
            updateClock();
            timezoneSelector.style.display = 'none';
            playSound('active');
        });
        
        // Hover effect
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgba(128, 128, 128, 0.3)';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
    });
    
    // Auto-detect timezone
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener('click', () => {
            try {
                const detectedTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
                selectedTimezone = detectedTZ;
                localStorage.setItem('userTimezone', detectedTZ);
                updateClock();
                timezoneSelector.style.display = 'none';
                playSound('active');
                
                // Show feedback
                autoDetectBtn.textContent = `✓ Detected: ${detectedTZ}`;
                setTimeout(() => {
                    autoDetectBtn.textContent = '🌐 Auto-Detect Location';
                }, 2000);
            } catch (error) {
                console.error('Could not detect timezone', error);
            }
        });
    }
    
    // Start clock
    updateClock();
    timezoneInterval = setInterval(updateClock, 1000);
}

function setupSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    const searchInput = document.getElementById('search-input');
    
    searchPanel.addEventListener('click', (e) => {
        if (searchPanel.classList.contains('collapsed')) {
            searchPanel.classList.remove('collapsed');
            searchPanel.classList.add('expanded');
            playSound('passive');
            // Focus input after animation
            setTimeout(() => searchInput.focus(), 300);
        }
    });
    
    // Click outside to collapse
    document.addEventListener('click', (e) => {
        if (!searchPanel.contains(e.target) && searchPanel.classList.contains('expanded')) {
            searchPanel.classList.remove('expanded');
            searchPanel.classList.add('collapsed');
            searchInput.value = ''; // Clear on collapse
        }
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        console.log('Search query:', query);
        // You can add actual search functionality here
    });
    
    // Prevent Enter from closing
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Search submitted:', searchInput.value);
            // Add search action here
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // FPS tracking
    const currentTime = performance.now();
    const delta = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    fpsFrames++;
    fpsTime += delta;
    
    if (fpsTime >= 1000) {
        fps = Math.round((fpsFrames * 1000) / fpsTime);
        document.getElementById('fps-counter').textContent = `${fps}`;
        fpsFrames = 0;
        fpsTime = 0;
    }
    
    // Animate particle energy state
    if (particleSystem) {
        // When C key is held (focus mode), make particle tunnel follow mouse
        if (keys.c) {
            // Convert mouse coordinates to camera-local offset
            // mouse.x and mouse.y are in range -1 to 1
            const offsetScale = 5; // How much particles offset from center
            particleSystem.position.x = mouse.x * offsetScale;
            particleSystem.position.y = mouse.y * offsetScale;
        } else {
            // Reset to center when not focusing
            particleSystem.position.x = 0;
            particleSystem.position.y = 0;
        }
        
        const positions = particleSystem.geometry.attributes.position.array;
        
        if (particleBehaviorMode === 'calm') {
            // CALM MODE: Original gentle floating behavior
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Update positions with gentle movement
                positions[i3] += particleVelocities[i3];
                positions[i3 + 1] += particleVelocities[i3 + 1];
                positions[i3 + 2] += particleVelocities[i3 + 2];
                
                // Calculate distance from center
                const x = positions[i3];
                const y = positions[i3 + 1];
                const z = positions[i3 + 2];
                const distance = Math.sqrt(x * x + y * y + z * z);
                
                // Keep particles within sphere bounds (8-12 radius)
                if (distance > 12 || distance < 8) {
                    // Reverse velocity if hitting boundaries
                    const normalX = x / distance;
                    const normalY = y / distance;
                    const normalZ = z / distance;
                    
                    // Reflect velocity
                    const dot = particleVelocities[i3] * normalX + 
                               particleVelocities[i3 + 1] * normalY + 
                               particleVelocities[i3 + 2] * normalZ;
                    
                    particleVelocities[i3] -= 2 * dot * normalX;
                    particleVelocities[i3 + 1] -= 2 * dot * normalY;
                    particleVelocities[i3 + 2] -= 2 * dot * normalZ;
                    
                    // Clamp to boundary
                    const targetRadius = distance > 12 ? 12 : 8;
                    positions[i3] = normalX * targetRadius;
                    positions[i3 + 1] = normalY * targetRadius;
                    positions[i3 + 2] = normalZ * targetRadius;
                }
                
                // Add gentle pulsing effect
                const pulseSpeed = 0.001;
                const pulseAmount = Math.sin(Date.now() * pulseSpeed + i * 0.1) * 0.01;
                positions[i3] *= (1 + pulseAmount);
                positions[i3 + 1] *= (1 + pulseAmount);
                positions[i3 + 2] *= (1 + pulseAmount);
            }
            
            // Gentle rotation for calm mode
            particleSystem.rotation.y += 0.0005;
            
        } else if (particleBehaviorMode === 'forward') {
            // FORWARD MODE: Particles flow straight toward user (lightspeed tunnel)
            const flowSpeed = forwardFlowSpeed * 2;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Move particles straight toward camera (negative Z in camera space)
                positions[i3 + 2] -= flowSpeed;
                
                // Reset particles that pass through camera
                if (positions[i3 + 2] < -5) {
                    // Respawn at far edge in CIRCULAR pattern (tunnel effect)
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.sqrt(Math.random()) * 10; // Circular distribution
                    
                    positions[i3] = Math.cos(angle) * radius; // X position
                    positions[i3 + 1] = Math.sin(angle) * radius; // Y position
                    positions[i3 + 2] = 15; // Far Z edge
                }
            }
            
        } else if (particleBehaviorMode === 'backward') {
            // BACKWARD MODE: Particles flow away from user (reverse tunnel)
            const flowSpeed = backwardFlowSpeed * 2;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Move particles away from camera (positive Z)
                positions[i3 + 2] += flowSpeed;
                
                // Reset particles that go too far
                if (positions[i3 + 2] > 15) {
                    // Respawn at near edge in CIRCULAR pattern (tunnel effect)
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.sqrt(Math.random()) * 10; // Circular distribution
                    
                    positions[i3] = Math.cos(angle) * radius; // X position
                    positions[i3 + 1] = Math.sin(angle) * radius; // Y position
                    positions[i3 + 2] = -5; // Near Z edge
                }
            }
            
        } else if (particleBehaviorMode === 'connected') {
            // CONNECTED MODE: Draw lines between nearby particles (particles.js style)
            // First do gentle float like CALM
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                positions[i3] += particleVelocities[i3];
                positions[i3 + 1] += particleVelocities[i3 + 1];
                positions[i3 + 2] += particleVelocities[i3 + 2];
                
                const x = positions[i3];
                const y = positions[i3 + 1];
                const z = positions[i3 + 2];
                const distance = Math.sqrt(x * x + y * y + z * z);
                
                if (distance > 12 || distance < 8) {
                    const normalX = x / distance;
                    const normalY = y / distance;
                    const normalZ = z / distance;
                    
                    const dot = particleVelocities[i3] * normalX + 
                               particleVelocities[i3 + 1] * normalY + 
                               particleVelocities[i3 + 2] * normalZ;
                    
                    particleVelocities[i3] -= 2 * dot * normalX;
                    particleVelocities[i3 + 1] -= 2 * dot * normalY;
                    particleVelocities[i3 + 2] -= 2 * dot * normalZ;
                    
                    const targetRadius = distance > 12 ? 12 : 8;
                    positions[i3] = normalX * targetRadius;
                    positions[i3 + 1] = normalY * targetRadius;
                    positions[i3 + 2] = normalZ * targetRadius;
                }
            }
            
            // Draw connection lines
            // Remove old lines if they exist
            if (window.particleLines) {
                scene.remove(window.particleLines);
                window.particleLines.geometry.dispose();
                window.particleLines.material.dispose();
            }
            
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = [];
            const maxDistance = 5 * connectionFrequency; // Frequency affects connection distance
            
            // Check connections between particles
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const x1 = positions[i3];
                const y1 = positions[i3 + 1];
                const z1 = positions[i3 + 2];
                
                // Only check a subset of particles for performance
                const checkCount = Math.floor(10 * connectionFrequency) + 1;
                for (let j = 0; j < checkCount; j++) {
                    const randomIdx = Math.floor(Math.random() * particleCount);
                    if (randomIdx === i) continue;
                    
                    const j3 = randomIdx * 3;
                    const x2 = positions[j3];
                    const y2 = positions[j3 + 1];
                    const z2 = positions[j3 + 2];
                    
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const dz = z2 - z1;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (dist < maxDistance) {
                        linePositions.push(x1, y1, z1);
                        linePositions.push(x2, y2, z2);
                    }
                }
            }
            
            if (linePositions.length > 0) {
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.3 * connectionFrequency,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                window.particleLines = new THREE.LineSegments(lineGeometry, lineMaterial);
                camera.add(window.particleLines); // Attach to camera like particles
            }
            
            particleSystem.rotation.y += 0.0003;
            
        } else if (particleBehaviorMode === 'glitch') {
            // GLITCH MODE: Random teleportation/glitch effect
            const glitchChance = glitchIntensity * 0.1; // Higher intensity = more glitches
            const glitchDistance = glitchIntensity * 5; // How far particles can teleport
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Random chance to glitch
                if (Math.random() < glitchChance) {
                    // Teleport to random nearby position
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.sqrt(Math.random()) * glitchDistance;
                    const zOffset = (Math.random() - 0.5) * glitchDistance;
                    
                    positions[i3] += Math.cos(angle) * radius;
                    positions[i3 + 1] += Math.sin(angle) * radius;
                    positions[i3 + 2] += zOffset;
                } else {
                    // Normal gentle movement
                    positions[i3] += particleVelocities[i3] * 0.5;
                    positions[i3 + 1] += particleVelocities[i3 + 1] * 0.5;
                    positions[i3 + 2] += particleVelocities[i3 + 2] * 0.5;
                }
                
                // Keep in bounds
                const x = positions[i3];
                const y = positions[i3 + 1];
                const z = positions[i3 + 2];
                const distance = Math.sqrt(x * x + y * y + z * z);
                
                if (distance > 12) {
                    const normalX = x / distance;
                    const normalY = y / distance;
                    const normalZ = z / distance;
                    positions[i3] = normalX * 12;
                    positions[i3 + 1] = normalY * 12;
                    positions[i3 + 2] = normalZ * 12;
                }
            }
            
            // Jittery rotation
            particleSystem.rotation.y += (Math.random() - 0.5) * 0.01 * glitchIntensity;
            
        } else if (particleBehaviorMode === 'constellation') {
            // CONSTELLATION MODE: Random connections between all particles
            // Gentle float like CALM
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                positions[i3] += particleVelocities[i3];
                positions[i3 + 1] += particleVelocities[i3 + 1];
                positions[i3 + 2] += particleVelocities[i3 + 2];
                
                const x = positions[i3];
                const y = positions[i3 + 1];
                const z = positions[i3 + 2];
                const distance = Math.sqrt(x * x + y * y + z * z);
                
                if (distance > 12 || distance < 8) {
                    const normalX = x / distance;
                    const normalY = y / distance;
                    const normalZ = z / distance;
                    
                    const dot = particleVelocities[i3] * normalX + 
                               particleVelocities[i3 + 1] * normalY + 
                               particleVelocities[i3 + 2] * normalZ;
                    
                    particleVelocities[i3] -= 2 * dot * normalX;
                    particleVelocities[i3 + 1] -= 2 * dot * normalY;
                    particleVelocities[i3 + 2] -= 2 * dot * normalZ;
                    
                    const targetRadius = distance > 12 ? 12 : 8;
                    positions[i3] = normalX * targetRadius;
                    positions[i3 + 1] = normalY * targetRadius;
                    positions[i3 + 2] = normalZ * targetRadius;
                }
            }
            
            // Draw random constellation lines
            if (window.particleLines) {
                scene.remove(window.particleLines);
                window.particleLines.geometry.dispose();
                window.particleLines.material.dispose();
            }
            
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = [];
            
            // Each particle randomly connects to a few nearby particles
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const x1 = positions[i3];
                const y1 = positions[i3 + 1];
                const z1 = positions[i3 + 2];
                
                // Random number of connections per particle (1-3)
                const connectionCount = Math.floor(Math.random() * 3) + 1;
                
                for (let c = 0; c < connectionCount; c++) {
                    const randomIdx = Math.floor(Math.random() * particleCount);
                    if (randomIdx === i) continue;
                    
                    const j3 = randomIdx * 3;
                    const x2 = positions[j3];
                    const y2 = positions[j3 + 1];
                    const z2 = positions[j3 + 2];
                    
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const dz = z2 - z1;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (dist < constellationDistance) {
                        linePositions.push(x1, y1, z1);
                        linePositions.push(x2, y2, z2);
                    }
                }
            }
            
            if (linePositions.length > 0) {
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.2,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                window.particleLines = new THREE.LineSegments(lineGeometry, lineMaterial);
                camera.add(window.particleLines); // Attach to camera like particles
            }
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Camera breathing effect
    breathTime += 0.016 * breathSpeed; // Assuming ~60fps
    const breathOffset = Math.sin(breathTime) * breathIntensity;
    
    // Apply subtle breathing to camera position (up/down)
    if (!keys.r && !keys.f) { // Only when not manually moving up/down
        const breathDelta = breathOffset - (camera.userData.lastBreathOffset || 0);
        camera.position.y += breathDelta;
        camera.userData.lastBreathOffset = breathOffset;
    } else {
        camera.userData.lastBreathOffset = 0;
    }
    
    // Check if 3D data panel is active
    const has3DPanel = scene3DDataPanel && scene3DDataPanel.userData.is3DPanel;
    
    // WASD camera movement (or 3D panel scrolling if active)
    if (keys.w) {
        if (has3DPanel) {
            // Scroll 3D panel up
            if (window.scroll3DPanel) window.scroll3DPanel(-1);
        } else {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            camera.position.add(forward.multiplyScalar(moveSpeed));
        }
    }
    if (keys.s) {
        if (has3DPanel) {
            // Scroll 3D panel down
            if (window.scroll3DPanel) window.scroll3DPanel(1);
        } else {
            const backward = new THREE.Vector3(0, 0, 1);
            backward.applyQuaternion(camera.quaternion);
            camera.position.add(backward.multiplyScalar(moveSpeed));
        }
    }
    if (keys.a) {
        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(camera.quaternion);
        camera.position.add(left.multiplyScalar(moveSpeed));
    }
    if (keys.d) {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(camera.quaternion);
        camera.position.add(right.multiplyScalar(moveSpeed));
    }
    if (keys.r) {
        camera.position.y += moveSpeed;
    }
    if (keys.f) {
        camera.position.y -= moveSpeed;
    }
    
    // Update inspector panel in real-time if object is selected
    if (selectedObject && document.getElementById('inspector-panel').classList.contains('visible')) {
        document.getElementById('object-position').textContent = 
            `X: ${selectedObject.position.x.toFixed(2)} | Y: ${selectedObject.position.y.toFixed(2)} | Z: ${selectedObject.position.z.toFixed(2)}`;
        document.getElementById('object-rotation').textContent = 
            `X: ${(selectedObject.rotation.x * 180 / Math.PI).toFixed(2)}° | Y: ${(selectedObject.rotation.y * 180 / Math.PI).toFixed(2)}° | Z: ${(selectedObject.rotation.z * 180 / Math.PI).toFixed(2)}°`;
        document.getElementById('object-scale').textContent = 
            `X: ${selectedObject.scale.x.toFixed(2)} | Y: ${selectedObject.scale.y.toFixed(2)} | Z: ${selectedObject.scale.z.toFixed(2)}`;
    }
    
    // Update coordinate guide in navbar
    document.getElementById('coord-pos-x').textContent = `X: ${camera.position.x.toFixed(2)}`;
    document.getElementById('coord-pos-y').textContent = `Y: ${camera.position.y.toFixed(2)}`;
    document.getElementById('coord-pos-z').textContent = `Z: ${camera.position.z.toFixed(2)}`;
    
    const rotX = (camera.rotation.x * 180 / Math.PI).toFixed(2);
    const rotY = (camera.rotation.y * 180 / Math.PI).toFixed(2);
    const rotZ = (camera.rotation.z * 180 / Math.PI).toFixed(2);
    document.getElementById('coord-rot-x').textContent = `X: ${rotX}°`;
    document.getElementById('coord-rot-y').textContent = `Y: ${rotY}°`;
    document.getElementById('coord-rot-z').textContent = `Z: ${rotZ}°`;
    
    document.getElementById('coord-sca-x').textContent = `X: ${camera.scale.x.toFixed(2)}`;
    document.getElementById('coord-sca-y').textContent = `Y: ${camera.scale.y.toFixed(2)}`;
    document.getElementById('coord-sca-z').textContent = `Z: ${camera.scale.z.toFixed(2)}`;
    
    // Update ruler markers
    const xMarker = document.getElementById('x-marker');
    const yMarker = document.getElementById('y-marker');
    const zMarker = document.getElementById('z-marker');
    if (xMarker && yMarker && zMarker) {
        // Map camera position (-50 to +50) to ruler position (0% to 100%)
        const xPercent = ((camera.position.x + 50) / 100) * 100;
        const yPercent = ((camera.position.y + 50) / 100) * 100;
        const zPercent = ((camera.position.z + 50) / 100) * 100;
        xMarker.style.left = Math.max(0, Math.min(100, xPercent)) + '%';
        yMarker.style.top = Math.max(0, Math.min(100, 100 - yPercent)) + '%'; // Inverted for visual consistency
        zMarker.style.top = Math.max(0, Math.min(100, 100 - zPercent)) + '%'; // Inverted for visual consistency
    }
    
    renderer.render(scene, camera);
}

// Start
init();

// Make functions globally accessible for inline handlers
window.showWisdomPrompt = showWisdomPrompt;
