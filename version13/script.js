        // Global variables
        let scene, camera, renderer;
        let interactiveObjects = [];
        let journalPages = [];
        let gridObjects = [];
        let mySpaceGroup;  // Group to hold all MySpace grid panels
        let sphereRotateX = false;
        let sphereRotateY = false;
        let sphereRotateZ = false;
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
            c: false,
            b: false,
            shift: false
        };

        // Mouse look controls - only active when holding C
        let lastMouseX = window.innerWidth / 2;
        let lastMouseY = window.innerHeight / 2;

        // Camera breathing effect (Metroid Prime style)
        let breathTime = 0;
        const breathSpeed = 0.8;
        const breathIntensity = 0.08; // Increased from 0.02 for more pronounced effect

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
        let gridHelper = null;
        let skyboxMesh = null;
        
        // Particle Control Settings
        let particleSize = 1.0;
        let particleColor = 0xffffff;
        let particleXRange = 100;
        let particleYRange = 100;
        let particleZRange = 100;
        let particleSpeed = 1.0;
        let particleOpacity = 0.8;
        
        // User Control Settings
        let moveSpeed = 0.2;
        let jumpSpeed = 1.0;
        let sprintMultiplier = 2.0;
        let userGravity = 0.5;
        let lookSensitivity = 0.002;
        let invertY = false;
        let godMode = false;
        
        // Particle Behavior State
        let particleBehaviorMode = 'calm'; // 'calm', 'forward', 'backward', 'connected', 'glitch', 'constellation'
        let forwardFlowSpeed = 0.2; // 0-1 range (default 20)
        let backwardFlowSpeed = 0.2; // 0-1 range (default 20)
        let upwardFlowSpeed = 0.2; // 0-1 range (default 20)
        let downwardFlowSpeed = 0.2; // 0-1 range (default 20)
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

        // OmniSense Mode & Cube System
        let omniSenseMode = false;
        let omniSenseCube = null;
        let cubeEdges = null;
        let cubeFaces = [];
        let cubeRotating = false;
        let cubeRotationSpeed = 0.001;
        let cubePulseSpeed = 1.0;
        let cubeClickedFace = null;
        let normalCameraPosition = null;
        let normalCameraTarget = null;
        let omniSenseCameraHeight = 200;
        const cubeSize = 65;
        
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

        // ⟐mniKeyboard System
        let omniKeyboardVisible = false;
        let omniKeyboardGroup = null; // Group to hold all keyboard cubes
        let omniKeyboardCubes = []; // Array of cube meshes
        let omniKeyboardScale = 1.0; // Scale multiplier for accessibility
        let omniKeyboardCurrentRow = 0; // Current focused row (0-4 now with ESC/F-keys)
        let omniKeyboardCurrentCol = 0; // Current focused column
        let omniKeyboardDragging = false;
        let omniKeyboardDragStart = new THREE.Vector3();
        let omniKeyboardDragOffset = new THREE.Vector3();
        let omniKeyboardStillMode = false; // Still Mode: keyboard becomes typable
        const omniKeyboardRows = [
            { name: 'ESC/FN', keys: ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'] },
            { name: 'NUMBERS', keys: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='] },
            { name: 'QWERTY', keys: ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'] },
            { name: 'ASDFGH', keys: ['⇪', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '↵'] },
            { name: 'ZXCVBN', keys: ['LSH', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'RSH'] },
            { name: 'ARROWS', keys: ['SPC', '⟐', '←', '↓', '↑', '→'] }
        ];
        
        // OmniKeyboard transform state (relative to camera)
        let omniKeyboardOffsetX = 0;
        let omniKeyboardOffsetY = -1.50;
        let omniKeyboardOffsetZ = -8.60;
        let omniKeyboardRotationX = 0.90;
        let omniKeyboardRotationY = 0;
        let omniKeyboardRotationZ = 0;
        let omniKeyboardScaleUniform = 0.20;
        let omniKeyboardSpacing = 2.60; // Distance between keys
        let omniKeyboardRowSpacing = 3.20; // Distance between rows

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
            const lhOptions = ['Move', 'Shift', 'Focus', 'Look', 'Feel', 
                              'Change', 'Zoom', 'Choose', 'Pace', 'Stretch'];
            createRadialMenu(lhRadial, lhOptions, 'lh');

            // Create radial menu items for Right Hand
            const rhRadial = document.getElementById('rh-radial');
            const rhOptions = ['Body', 'Mind', 'Voice', 'Power', 'Build', 
                              'Heal', 'Info', 'Assist', 'Protect', 'Story'];
            createRadialMenu(rhRadial, rhOptions, 'rh');

            // Create radial menu items for Conscious Hand
            const chRadial = document.getElementById('ch-radial');
            const chOptions = ['Form', 'Flow', 'Charge', 'Tone', 'Self', 
                              'Bond', 'Mood', 'Code', 'Web', 'Beyond'];
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

            const btnTray = document.getElementById('btn-tray');
            if (btnTray) {
                btnTray.addEventListener('click', () => {
                    const sideTray = document.getElementById('side-tray');
                    const topTray = document.getElementById('top-tray');
                    
                    const isHidden = sideTray.style.display === 'none';
                    
                    if (sideTray) {
                        sideTray.style.display = isHidden ? 'block' : 'none';
                    }
                    if (topTray) {
                        topTray.style.display = isHidden ? 'flex' : 'none';
                    }
                    
                    btnTray.classList.toggle('active');
                    playSound('passive');
                });
            }

            const btnChat = document.getElementById('btn-chat');
            if (btnChat) {
                btnChat.addEventListener('click', () => {
                    const chatPanel = document.getElementById('chat-panel');
                    
                    if (chatPanel) {
                        const isHidden = chatPanel.style.display === 'none';
                        chatPanel.style.display = isHidden ? 'block' : 'none';
                        
                        btnChat.classList.toggle('active');
                        playSound('passive');
                    }
                });
            }

            const btnOrbit = document.getElementById('btn-orbit');
            if (btnOrbit) {
                btnOrbit.addEventListener('click', () => {
                    const orbitPanel = document.getElementById('orbit-controls-panel');
                    
                    if (orbitPanel) {
                        orbitPanel.style.display = 'block';
                        orbitPanel.classList.remove('minimized');
                        const content = document.getElementById('orbit-panel-content');
                        if (content) {
                            content.classList.remove('hidden');
                        }
                        document.getElementById('orbit-minimize-btn').textContent = '_';
                        
                        btnOrbit.classList.toggle('active');
                        playSound('passive');
                    }
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

            const btnMax = document.getElementById('btn-max');
            if (btnMax) {
                btnMax.addEventListener('click', () => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(err => {
                            console.log('Fullscreen error:', err);
                        });
                    } else {
                        document.exitFullscreen();
                    }
                    playSound('active');
                });
            }

            const btnSense = document.getElementById('btn-sense');
            if (btnSense) {
                btnSense.addEventListener('click', () => {
                    toggleOmniSenseMode();
                    playSound('active');
                });
            }

            const btnKeys = document.getElementById('btn-keys');
            if (btnKeys) {
                btnKeys.addEventListener('click', () => {
                    toggleOmniKeyboard();
                    playSound('active');
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

            // Handle RH options - all open the tool menu
            if (handType === 'rh') {
                if (!rhToolMenuVisible) {
                    toggleRHToolMenu();
                }
                return;
            }

            // Handle LH options - all open the tool menu
            if (handType === 'lh') {
                // Special handling for Move tool - open User Controls panel
                if (option === 'Move') {
                    const userPanel = document.getElementById('user-controls-panel');
                    if (userPanel) {
                        userPanel.style.display = 'block';
                        userPanel.classList.remove('minimized');
                        const content = document.getElementById('user-panel-content');
                        if (content) {
                            content.classList.remove('hidden');
                        }
                        document.getElementById('user-minimize-btn').textContent = '_';
                    }
                    playSound('active');
                    return;
                }
                
                if (!lhToolMenuVisible) {
                    toggleLHToolMenu();
                }
                return;
            }

            // Handle special CH options
            if (handType === 'ch') {
                if (option === 'Pause Menu') {
                    document.getElementById('pause-overlay').classList.add('visible');
                    return;
                }
                
                if (option === 'MySpace') {
                    toggleMySpace();
                    return;
                }
                
                if (option === 'User Pocket') {
                    togglePocket();
                    return;
                }
                
                // All other CH options open the tool menu
                if (!chToolMenuVisible) {
                    toggleCHToolMenu();
                }
            }

            // Add more functionality here for each option
        }

        function toggleLeftHand() {
            leftHandVisible = !leftHandVisible;
            const leftHand = document.getElementById('left-hand');
            
            if (leftHandVisible) {
                leftHand.classList.add('visible');
            } else {
                leftHand.classList.remove('visible');
                // Hide LH tool menu when hand is hidden
                if (lhToolMenuVisible) {
                    toggleLHToolMenu();
                }
            }
            playSound('passive');
        }

        function toggleRightHand() {
            rightHandVisible = !rightHandVisible;
            const rightHand = document.getElementById('right-hand');
            const rhMovementControl = document.getElementById('rh-movement-control');
            
            if (rightHandVisible) {
                rightHand.classList.add('visible');
                rhMovementControl.style.display = 'block';
            } else {
                rightHand.classList.remove('visible');
                rhMovementControl.style.display = 'none';
                // Hide tool menu when RH is hidden
                if (rhToolMenuVisible) {
                    toggleRHToolMenu();
                }
            }
            playSound('passive');
        }

        function toggleConsciousHand() {
            consciousHandVisible = !consciousHandVisible;
            const consciousHand = document.getElementById('conscious-hand');
            const chMovementControl = document.getElementById('ch-movement-control');
            
            if (consciousHandVisible) {
                consciousHand.classList.add('visible');
                chMovementControl.style.display = 'block';
            } else {
                consciousHand.classList.remove('visible');
                chMovementControl.style.display = 'none';
                // Hide CH tool menu when hand is hidden
                if (chToolMenuVisible) {
                    toggleCHToolMenu();
                }
            }
            playSound('passive');
        }

        // Tool Menu System for all hands
        let rhToolMenuVisible = false;
        let lhToolMenuVisible = false;
        let chToolMenuVisible = false;

        const rhToolData = [];
        const lhToolData = [];
        const chToolData = [];

        // Create 11 tools for each hand
        for (let i = 0; i < 11; i++) {
            rhToolData.push({
                name: `TOOL${String(i).padStart(2, '0')}`,
                description: `RH Tool ${i}. Different settings and interface will appear in the RH movement pad when selected.`,
                id: `rh-tool${i}`
            });
            lhToolData.push({
                name: `TOOL${String(i).padStart(2, '0')}`,
                description: `LH Tool ${i}. Additional details and functionality will be added later.`,
                id: `lh-tool${i}`
            });
            chToolData.push({
                name: `TOOL${String(i).padStart(2, '0')}`,
                description: `CH Tool ${i}. Additional details and functionality will be added later.`,
                id: `ch-tool${i}`
            });
        }

        function initializeToolMenu() {
            // Initialize RH tool menu
            populateToolMenu('rh', rhToolData);
            // Initialize LH tool menu
            populateToolMenu('lh', lhToolData);
            // Initialize CH tool menu
            populateToolMenu('ch', chToolData);
            
            // Make all tool menus draggable
            makeDraggable('rh-tool-menu');
            makeDraggable('lh-tool-menu');
            makeDraggable('ch-tool-menu');
        }

        function populateToolMenu(handType, toolData) {
            const toolMenuItems = document.getElementById(`${handType}-tool-menu-items`);
            const toolDescription = document.getElementById(`${handType}-tool-description`);
            
            toolData.forEach((tool, index) => {
                const toolItem = document.createElement('div');
                toolItem.className = 'tool-item';
                toolItem.textContent = tool.name;
                toolItem.dataset.toolId = tool.id;
                toolItem.dataset.handType = handType;
                
                toolItem.addEventListener('click', () => {
                    // Remove previous selection from this hand's menu
                    toolMenuItems.querySelectorAll('.tool-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    // Select current
                    toolItem.classList.add('selected');
                    // Update description
                    toolDescription.textContent = tool.description;
                    
                    // If RH tool selected, update the RH movement pad to show tool interface
                    if (handType === 'rh') {
                        updateRHToolInterface(tool.id);
                    }
                    
                    playSound('passive');
                });
                
                toolMenuItems.appendChild(toolItem);
            });
        }

        function makeDraggable(elementId) {
            const element = document.getElementById(elementId);
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            
            const header = element.querySelector('.tool-menu-header');
            if (header) {
                header.style.cursor = 'move';
                header.onmousedown = dragMouseDown;
            }
            
            function dragMouseDown(e) {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
            
            function elementDrag(e) {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                element.style.top = (element.offsetTop - pos2) + 'px';
                element.style.left = (element.offsetLeft - pos1) + 'px';
                element.style.right = 'auto';
                element.style.transform = 'none';
            }
            
            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        function updateRHToolInterface(toolId) {
            // This function will update the RH movement pad to show
            // the appropriate interface for the selected tool
            // For now, just console log - we'll implement specific tool UIs later
            console.log('RH Tool selected:', toolId);
            // TODO: Show different interface in RH movement pad based on toolId
        }

        function toggleRHToolMenu() {
            rhToolMenuVisible = !rhToolMenuVisible;
            const toolMenu = document.getElementById('rh-tool-menu');
            
            if (rhToolMenuVisible) {
                toolMenu.style.display = 'block';
                playSound('active');
            } else {
                toolMenu.style.display = 'none';
                // Clear selection
                document.querySelectorAll('#rh-tool-menu-items .tool-item').forEach(item => {
                    item.classList.remove('selected');
                });
                document.getElementById('rh-tool-description').textContent = 'Select a tool to view details';
                playSound('passive');
            }
        }

        function toggleLHToolMenu() {
            lhToolMenuVisible = !lhToolMenuVisible;
            const toolMenu = document.getElementById('lh-tool-menu');
            
            if (lhToolMenuVisible) {
                toolMenu.style.display = 'block';
                playSound('active');
            } else {
                toolMenu.style.display = 'none';
                // Clear selection
                document.querySelectorAll('#lh-tool-menu-items .tool-item').forEach(item => {
                    item.classList.remove('selected');
                });
                document.getElementById('lh-tool-description').textContent = 'Select a tool to view details';
                playSound('passive');
            }
        }

        function toggleCHToolMenu() {
            chToolMenuVisible = !chToolMenuVisible;
            const toolMenu = document.getElementById('ch-tool-menu');
            
            if (chToolMenuVisible) {
                toolMenu.style.display = 'block';
                playSound('active');
            } else {
                toolMenu.style.display = 'none';
                // Clear selection
                document.querySelectorAll('#ch-tool-menu-items .tool-item').forEach(item => {
                    item.classList.remove('selected');
                });
                document.getElementById('ch-tool-description').textContent = 'Select a tool to view details';
                playSound('passive');
            }
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

        function toggleOmniSenseMode() {
            omniSenseMode = !omniSenseMode;
            
            if (omniSenseMode) {
                // Entering OmniSense Mode
                console.log('Entering OmniSense Mode');
                
                // Save current camera position
                normalCameraPosition = camera.position.clone();
                normalCameraTarget = new THREE.Vector3(0, 0, 0);
                
                // Show cube
                if (omniSenseCube) {
                    omniSenseCube.visible = true;
                }
                
                // Brighten floor grid
                if (gridHelper) {
                    gridHelper.material.opacity = 0.6;
                }
                
                // Move camera to top-down view
                gsap.to(camera.position, {
                    duration: 1.5,
                    x: 0,
                    y: omniSenseCameraHeight,
                    z: 0,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        camera.lookAt(0, 0, 0);
                    }
                });
                
                // Highlight SENSE button
                const btnSense = document.getElementById('btn-sense');
                if (btnSense) {
                    btnSense.classList.add('active');
                }
                
                // Show OmniSense Controls Panel (minimized)
                const omniSensePanel = document.getElementById('omnisense-panel');
                if (omniSensePanel) {
                    omniSensePanel.style.display = 'block';
                    omniSensePanel.classList.add('minimized');
                }
                
            } else {
                // Exiting OmniSense Mode
                console.log('Exiting OmniSense Mode');
                
                // Hide cube
                if (omniSenseCube) {
                    omniSenseCube.visible = false;
                }
                
                // Reset floor grid opacity
                if (gridHelper) {
                    gridHelper.material.opacity = 0.3;
                }
                
                // Return camera to normal position
                if (normalCameraPosition) {
                    gsap.to(camera.position, {
                        duration: 1.5,
                        x: normalCameraPosition.x,
                        y: normalCameraPosition.y,
                        z: normalCameraPosition.z,
                        ease: 'power2.inOut'
                    });
                }
                
                // Remove highlight from SENSE button
                const btnSense = document.getElementById('btn-sense');
                if (btnSense) {
                    btnSense.classList.remove('active');
                }
                
                // Hide OmniSense Controls Panel
                const omniSensePanel = document.getElementById('omnisense-panel');
                if (omniSensePanel) {
                    omniSensePanel.style.display = 'none';
                }
            }
        }

        function toggleOmniKeyboard() {
            omniKeyboardVisible = !omniKeyboardVisible;
            
            if (omniKeyboardVisible) {
                console.log('⟐mniKeyboard: Opening');
                
                // Create keyboard if it doesn't exist
                if (!omniKeyboardGroup) {
                    createOmniKeyboard();
                }
                
                // Show keyboard (no position animation since it's attached to camera)
                if (omniKeyboardGroup) {
                    omniKeyboardGroup.visible = true;
                }
                
                // Highlight KEYS button
                const btnKeys = document.getElementById('btn-keys');
                if (btnKeys) {
                    btnKeys.classList.add('active');
                }
                
                // Show OmniKeys Control Panel
                const omnikeysPanel = document.getElementById('omnikeys-panel');
                if (omnikeysPanel) {
                    omnikeysPanel.style.display = 'block';
                }
                
                // Setup control panel listeners if not already done
                setupOmniKeysControlPanel();
                
            } else {
                console.log('⟐mniKeyboard: Closing');
                
                // Hide keyboard
                if (omniKeyboardGroup) {
                    omniKeyboardGroup.visible = false;
                }
                
                // Remove highlight from KEYS button
                const btnKeys = document.getElementById('btn-keys');
                if (btnKeys) {
                    btnKeys.classList.remove('active');
                }
                
                // Hide OmniKeys Control Panel
                const omnikeysPanel = document.getElementById('omnikeys-panel');
                if (omnikeysPanel) {
                    omnikeysPanel.style.display = 'none';
                }
            }
        }

        function createOmniKeyboard() {
            console.log('⟐mniKeyboard: Creating keyboard structure');
            
            // Create group to hold all keyboard elements
            omniKeyboardGroup = new THREE.Group();
            omniKeyboardGroup.position.set(omniKeyboardOffsetX, omniKeyboardOffsetY, omniKeyboardOffsetZ);
            omniKeyboardGroup.rotation.set(omniKeyboardRotationX, omniKeyboardRotationY, omniKeyboardRotationZ);
            omniKeyboardGroup.scale.set(omniKeyboardScaleUniform, omniKeyboardScaleUniform, omniKeyboardScaleUniform);
            omniKeyboardGroup.visible = false;
            
            // Attach to camera instead of scene
            camera.add(omniKeyboardGroup);
            
            const cubeSize = 2.5 * omniKeyboardScale;
            const spacing = omniKeyboardSpacing * omniKeyboardScale;
            const rowSpacing = omniKeyboardRowSpacing * omniKeyboardScale;
            
            // Mac Dock incline: additional rotation on top of base rotation
            // (Base rotation is controlled by omniKeyboardRotationX)
            
            // Create each row of keys
            omniKeyboardRows.forEach((row, rowIndex) => {
                const rowGroup = new THREE.Group();
                const numKeys = row.keys.length;
                const rowWidth = (numKeys - 1) * spacing;
                const startX = -rowWidth / 2;
                
                // Create row label (left side)
                const labelCanvas = document.createElement('canvas');
                labelCanvas.width = 256;
                labelCanvas.height = 64;
                const labelCtx = labelCanvas.getContext('2d');
                labelCtx.fillStyle = 'rgba(128, 128, 128, 0.8)';
                labelCtx.fillRect(0, 0, 256, 64);
                labelCtx.fillStyle = '#ffffff';
                labelCtx.font = 'bold 20px Orbitron';
                labelCtx.textAlign = 'center';
                labelCtx.textBaseline = 'middle';
                labelCtx.fillText(row.name, 128, 32);
                
                const labelTexture = new THREE.CanvasTexture(labelCanvas);
                const labelGeometry = new THREE.PlaneGeometry(4, 1);
                const labelMaterial = new THREE.MeshBasicMaterial({ 
                    map: labelTexture, 
                    transparent: true,
                    opacity: 0.7
                });
                const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
                labelMesh.position.set(startX - 5, 0, 0);
                rowGroup.add(labelMesh);
                
                // Create keys in this row
                row.keys.forEach((keyLabel, keyIndex) => {
                    const keyCube = createKeyCube(keyLabel, rowIndex, keyIndex);
                    keyCube.position.x = startX + (keyIndex * spacing);
                    rowGroup.add(keyCube);
                    omniKeyboardCubes.push(keyCube);
                });
                
                // Position row
                rowGroup.position.z = rowIndex * rowSpacing;
                omniKeyboardGroup.add(rowGroup);
            });
            
            console.log(`⟐mniKeyboard: Created ${omniKeyboardCubes.length} keys`);
        }

        function createKeyCube(label, rowIndex, colIndex) {
            const cubeSize = 2.0 * omniKeyboardScale;
            
            // Create cube geometry
            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            
            // Create canvas texture for top face (with label)
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = 'rgba(60, 60, 70, 0.9)';
            ctx.fillRect(0, 0, 128, 128);
            
            // Border
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.6)';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, 128, 128);
            
            // Label text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            
            // Create materials for each face (top gets label, others get placeholders)
            const materials = [];
            for (let i = 0; i < 6; i++) {
                if (i === 2) { // Top face (+Y)
                    materials.push(new THREE.MeshStandardMaterial({ 
                        map: texture,
                        transparent: true,
                        opacity: 0.3,
                        emissive: new THREE.Color(0x808080),
                        emissiveIntensity: 0.15
                    }));
                } else {
                    // Placeholder faces - lighter grey and transparent
                    const placeholderMaterial = new THREE.MeshStandardMaterial({
                        color: 0xb0b0b0, // Lighter grey
                        transparent: true,
                        opacity: 0.3,
                        emissive: new THREE.Color(0x707070),
                        emissiveIntensity: 0.1
                    });
                    materials.push(placeholderMaterial);
                }
            }
            
            const cube = new THREE.Mesh(geometry, materials);
            
            // Add levitation glow plane underneath
            const glowGeometry = new THREE.PlaneGeometry(cubeSize * 1.5, cubeSize * 1.5);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff, // White glow
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
            glowPlane.rotation.x = -Math.PI / 2;
            glowPlane.position.y = -cubeSize * 0.6;
            cube.add(glowPlane);
            
            cube.userData = {
                type: 'omniKey',
                label: label,
                rowIndex: rowIndex,
                colIndex: colIndex,
                faces: {
                    front: label,
                    back: `⟐${label}`,
                    left: `◀${label}`,
                    right: `▶${label}`,
                    top: `▲${label}`,
                    bottom: `▼${label}`
                }
            };
            
            // Create billboard sprite label that always faces camera
            const spriteCanvas = document.createElement('canvas');
            spriteCanvas.width = 256;
            spriteCanvas.height = 256;
            const spriteCtx = spriteCanvas.getContext('2d');
            
            // Clear background (transparent)
            spriteCtx.clearRect(0, 0, 256, 256);
            
            // Add glow effect for bright characters
            spriteCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            spriteCtx.shadowBlur = 20;
            spriteCtx.fillStyle = '#ffffff';
            spriteCtx.font = 'bold 96px Orbitron';
            spriteCtx.textAlign = 'center';
            spriteCtx.textBaseline = 'middle';
            spriteCtx.fillText(label, 128, 128);
            
            // Draw text again for extra brightness
            spriteCtx.shadowBlur = 10;
            spriteCtx.fillText(label, 128, 128);
            
            const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: spriteTexture,
                transparent: true,
                depthTest: false
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(cubeSize * 1.2, cubeSize * 1.2, 1);
            sprite.position.y = cubeSize * 0.55; // Position above cube
            cube.add(sprite);
            
            // Store sprite reference for updates
            cube.userData.labelSprite = sprite;
            
            // Add to interactive objects for raycasting
            interactiveObjects.push(cube);
            
            return cube;
        }

        function updateInspectorForKeyboard() {
            const inspectorPanel = document.getElementById('inspector-panel');
            if (!inspectorPanel) return;
            
            // Show inspector if hidden
            if (!inspectorPanel.classList.contains('visible')) {
                inspectorPanel.classList.add('visible');
            }
            
            // Update inspector content
            const titleElement = inspectorPanel.querySelector('.panel-title');
            if (titleElement) {
                titleElement.textContent = '⟐MNIKEYS';
            }
        }

        function navigateOmniKeyboard(direction) {
            if (!omniKeyboardVisible) return;
            
            // Handle arrow key navigation
            const maxRows = omniKeyboardRows.length - 1;
            const currentRowKeys = omniKeyboardRows[omniKeyboardCurrentRow].keys;
            const maxCol = currentRowKeys.length - 1;
            
            switch(direction) {
                case 'up':
                    if (omniKeyboardCurrentRow > 0) {
                        omniKeyboardCurrentRow--;
                        // Adjust column if new row has fewer keys
                        const newRowMaxCol = omniKeyboardRows[omniKeyboardCurrentRow].keys.length - 1;
                        omniKeyboardCurrentCol = Math.min(omniKeyboardCurrentCol, newRowMaxCol);
                    }
                    break;
                case 'down':
                    if (omniKeyboardCurrentRow < maxRows) {
                        omniKeyboardCurrentRow++;
                        // Adjust column if new row has fewer keys
                        const newRowMaxCol = omniKeyboardRows[omniKeyboardCurrentRow].keys.length - 1;
                        omniKeyboardCurrentCol = Math.min(omniKeyboardCurrentCol, newRowMaxCol);
                    }
                    break;
                case 'left':
                    omniKeyboardCurrentCol = Math.max(0, omniKeyboardCurrentCol - 1);
                    break;
                case 'right':
                    omniKeyboardCurrentCol = Math.min(maxCol, omniKeyboardCurrentCol + 1);
                    break;
            }
            
            // Highlight current key
            highlightCurrentKey();
        }

        function highlightCurrentKey() {
            // Remove highlight from all keys
            omniKeyboardCubes.forEach(cube => {
                if (cube.material && Array.isArray(cube.material)) {
                    cube.material.forEach(mat => {
                        if (mat.emissiveIntensity !== undefined) {
                            mat.emissiveIntensity = 0.2;
                        }
                    });
                }
            });
            
            // Find and highlight current key
            const currentKey = omniKeyboardCubes.find(cube => 
                cube.userData.rowIndex === omniKeyboardCurrentRow &&
                cube.userData.colIndex === omniKeyboardCurrentCol
            );
            
            if (currentKey && currentKey.material && Array.isArray(currentKey.material)) {
                currentKey.material.forEach(mat => {
                    if (mat.emissiveIntensity !== undefined) {
                        mat.emissiveIntensity = 0.8;
                    }
                });
                
                // Update inspector with key info
                updateInspectorWithKeyInfo(currentKey);
            }
        }

        function getCurrentKey() {
            return omniKeyboardCubes.find(cube => 
                cube.userData.rowIndex === omniKeyboardCurrentRow &&
                cube.userData.colIndex === omniKeyboardCurrentCol
            );
        }

        function makeKeyJump(pressedKey) {
            // Find the cube that matches the pressed key
            const keyCube = omniKeyboardCubes.find(cube => {
                const label = cube.userData.label;
                // Match key (handle special cases)
                if (pressedKey.toUpperCase() === label || 
                    pressedKey === label ||
                    (pressedKey === ' ' && label === 'SPC') ||
                    (pressedKey === 'Enter' && label === '↵') ||
                    (pressedKey === 'Tab' && label === 'TAB') ||
                    (pressedKey === 'CapsLock' && label === '⇪') ||
                    (pressedKey === 'Shift' && (label === 'LSH' || label === 'RSH')) ||
                    (pressedKey === 'Escape' && label === 'ESC')) {
                    return true;
                }
                return false;
            });
            
            if (keyCube) {
                // Animate jump using GSAP
                const originalY = keyCube.position.y;
                gsap.to(keyCube.position, {
                    y: originalY + 0.3,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power1.out'
                });
                
                // Flash emissive
                if (keyCube.material && Array.isArray(keyCube.material)) {
                    keyCube.material.forEach(mat => {
                        if (mat.emissiveIntensity !== undefined) {
                            const originalIntensity = mat.emissiveIntensity;
                            gsap.to(mat, {
                                emissiveIntensity: 1.0,
                                duration: 0.1,
                                yoyo: true,
                                repeat: 1,
                                onComplete: () => {
                                    mat.emissiveIntensity = originalIntensity;
                                }
                            });
                        }
                    });
                }
            }
        }

        function rotateKeyCube(keyCube, axis, angle) {
            if (!keyCube) return;
            
            // Smooth rotation animation with GSAP
            const duration = 0.3;
            if (axis === 'x') {
                gsap.to(keyCube.rotation, {
                    x: keyCube.rotation.x + angle,
                    duration: duration,
                    ease: 'power2.out'
                });
            } else if (axis === 'y') {
                gsap.to(keyCube.rotation, {
                    y: keyCube.rotation.y + angle,
                    duration: duration,
                    ease: 'power2.out'
                });
            } else if (axis === 'z') {
                gsap.to(keyCube.rotation, {
                    z: keyCube.rotation.z + angle,
                    duration: duration,
                    ease: 'power2.out'
                });
            }
        }

        function updateInspectorWithKeyInfo(keyCube) {
            const inspectorPanel = document.getElementById('inspector-panel');
            if (!inspectorPanel) return;
            
            const titleElement = inspectorPanel.querySelector('.panel-title');
            if (titleElement) {
                const label = keyCube.userData.label;
                titleElement.textContent = `⟐MNIKEY: ${label}`;
            }
        }

        function rebuildOmniKeyboard() {
            if (!omniKeyboardGroup) return;
            
            console.log('⟐mniKeyboard: Rebuilding with new spacing');
            
            // Remove old keyboard from camera
            camera.remove(omniKeyboardGroup);
            
            // Clear cubes array
            omniKeyboardCubes.forEach(cube => {
                // Remove from interactive objects
                const index = interactiveObjects.indexOf(cube);
                if (index > -1) {
                    interactiveObjects.splice(index, 1);
                }
            });
            omniKeyboardCubes = [];
            
            // Dispose of old group
            omniKeyboardGroup.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            omniKeyboardGroup = null;
            
            // Create new keyboard with current settings
            createOmniKeyboard();
            
            // Make it visible if it was visible before
            if (omniKeyboardVisible && omniKeyboardGroup) {
                omniKeyboardGroup.visible = true;
            }
        }

        let omniKeysControlsInitialized = false;
        function setupOmniKeysControlPanel() {
            if (omniKeysControlsInitialized) return;
            omniKeysControlsInitialized = true;
            
            console.log('⟐mniKeyboard: Setting up control panel');
            
            // Position controls
            const posX = document.getElementById('kb-pos-x');
            const posY = document.getElementById('kb-pos-y');
            const posZ = document.getElementById('kb-pos-z');
            const posXValue = document.getElementById('kb-pos-x-value');
            const posYValue = document.getElementById('kb-pos-y-value');
            const posZValue = document.getElementById('kb-pos-z-value');
            
            if (posX) {
                posX.addEventListener('input', (e) => {
                    omniKeyboardOffsetX = parseFloat(e.target.value);
                    posXValue.textContent = omniKeyboardOffsetX.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.position.x = omniKeyboardOffsetX;
                    }
                });
            }
            
            if (posY) {
                posY.addEventListener('input', (e) => {
                    omniKeyboardOffsetY = parseFloat(e.target.value);
                    posYValue.textContent = omniKeyboardOffsetY.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.position.y = omniKeyboardOffsetY;
                    }
                });
            }
            
            if (posZ) {
                posZ.addEventListener('input', (e) => {
                    omniKeyboardOffsetZ = parseFloat(e.target.value);
                    posZValue.textContent = omniKeyboardOffsetZ.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.position.z = omniKeyboardOffsetZ;
                    }
                });
            }
            
            // Rotation controls
            const rotX = document.getElementById('kb-rot-x');
            const rotY = document.getElementById('kb-rot-y');
            const rotZ = document.getElementById('kb-rot-z');
            const rotXValue = document.getElementById('kb-rot-x-value');
            const rotYValue = document.getElementById('kb-rot-y-value');
            const rotZValue = document.getElementById('kb-rot-z-value');
            
            if (rotX) {
                rotX.addEventListener('input', (e) => {
                    omniKeyboardRotationX = parseFloat(e.target.value);
                    rotXValue.textContent = omniKeyboardRotationX.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.rotation.x = omniKeyboardRotationX;
                    }
                });
            }
            
            if (rotY) {
                rotY.addEventListener('input', (e) => {
                    omniKeyboardRotationY = parseFloat(e.target.value);
                    rotYValue.textContent = omniKeyboardRotationY.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.rotation.y = omniKeyboardRotationY;
                    }
                });
            }
            
            if (rotZ) {
                rotZ.addEventListener('input', (e) => {
                    omniKeyboardRotationZ = parseFloat(e.target.value);
                    rotZValue.textContent = omniKeyboardRotationZ.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.rotation.z = omniKeyboardRotationZ;
                    }
                });
            }
            
            // Scale control
            const scale = document.getElementById('kb-scale');
            const scaleValue = document.getElementById('kb-scale-value');
            
            if (scale) {
                scale.addEventListener('input', (e) => {
                    omniKeyboardScaleUniform = parseFloat(e.target.value);
                    scaleValue.textContent = omniKeyboardScaleUniform.toFixed(2);
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.scale.set(omniKeyboardScaleUniform, omniKeyboardScaleUniform, omniKeyboardScaleUniform);
                    }
                });
            }
            
            // Spacing controls
            const spacing = document.getElementById('kb-spacing');
            const spacingValue = document.getElementById('kb-spacing-value');
            const rowSpacing = document.getElementById('kb-row-spacing');
            const rowSpacingValue = document.getElementById('kb-row-spacing-value');
            
            if (spacing) {
                spacing.addEventListener('input', (e) => {
                    omniKeyboardSpacing = parseFloat(e.target.value);
                    spacingValue.textContent = omniKeyboardSpacing.toFixed(2);
                    // Rebuild keyboard with new spacing
                    rebuildOmniKeyboard();
                });
            }
            
            if (rowSpacing) {
                rowSpacing.addEventListener('input', (e) => {
                    omniKeyboardRowSpacing = parseFloat(e.target.value);
                    rowSpacingValue.textContent = omniKeyboardRowSpacing.toFixed(2);
                    // Rebuild keyboard with new spacing
                    rebuildOmniKeyboard();
                });
            }
            
            // Reset buttons
            const resetPosition = document.getElementById('kb-reset-position');
            const resetRotation = document.getElementById('kb-reset-rotation');
            const resetAll = document.getElementById('kb-reset-all');
            
            if (resetPosition) {
                resetPosition.addEventListener('click', () => {
                    omniKeyboardOffsetX = 0;
                    omniKeyboardOffsetY = -1.50;
                    omniKeyboardOffsetZ = -8.60;
                    
                    posX.value = 0;
                    posY.value = -1.5;
                    posZ.value = -8.6;
                    posXValue.textContent = '0.00';
                    posYValue.textContent = '-1.50';
                    posZValue.textContent = '-8.60';
                    
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.position.set(0, -1.50, -8.60);
                    }
                    playSound('active');
                });
            }
            
            if (resetRotation) {
                resetRotation.addEventListener('click', () => {
                    omniKeyboardRotationX = 0.90;
                    omniKeyboardRotationY = 0;
                    omniKeyboardRotationZ = 0;
                    
                    rotX.value = 0.9;
                    rotY.value = 0;
                    rotZ.value = 0;
                    rotXValue.textContent = '0.90';
                    rotYValue.textContent = '0.00';
                    rotZValue.textContent = '0.00';
                    
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.rotation.set(0.90, 0, 0);
                    }
                    playSound('active');
                });
            }
            
            if (resetAll) {
                resetAll.addEventListener('click', () => {
                    // Reset position
                    omniKeyboardOffsetX = 0;
                    omniKeyboardOffsetY = -1.50;
                    omniKeyboardOffsetZ = -8.60;
                    posX.value = 0;
                    posY.value = -1.5;
                    posZ.value = -8.6;
                    posXValue.textContent = '0.00';
                    posYValue.textContent = '-1.50';
                    posZValue.textContent = '-8.60';
                    
                    // Reset rotation
                    omniKeyboardRotationX = 0.90;
                    omniKeyboardRotationY = 0;
                    omniKeyboardRotationZ = 0;
                    rotX.value = 0.9;
                    rotY.value = 0;
                    rotZ.value = 0;
                    rotXValue.textContent = '0.90';
                    rotYValue.textContent = '0.00';
                    rotZValue.textContent = '0.00';
                    
                    // Reset scale
                    omniKeyboardScaleUniform = 0.20;
                    scale.value = 0.2;
                    scaleValue.textContent = '0.20';
                    
                    // Reset spacing
                    omniKeyboardSpacing = 2.60;
                    omniKeyboardRowSpacing = 3.20;
                    spacing.value = 2.6;
                    rowSpacing.value = 3.2;
                    spacingValue.textContent = '2.60';
                    rowSpacingValue.textContent = '3.20';
                    
                    if (omniKeyboardGroup) {
                        omniKeyboardGroup.position.set(0, -1.50, -8.60);
                        omniKeyboardGroup.rotation.set(0.90, 0, 0);
                        omniKeyboardGroup.scale.set(0.20, 0.20, 0.20);
                    }
                    
                    // Rebuild keyboard with default spacing
                    rebuildOmniKeyboard();
                    
                    playSound('active');
                });
            }
            
            // Still Mode checkbox
            const stillModeCheckbox = document.getElementById('kb-still-mode');
            if (stillModeCheckbox) {
                stillModeCheckbox.addEventListener('change', (e) => {
                    omniKeyboardStillMode = e.target.checked;
                    console.log('Still Mode:', omniKeyboardStillMode ? 'ON' : 'OFF');
                    playSound('passive');
                });
            }
            
            // Submit button for Entity and Function
            const submitBtn = document.getElementById('key-submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    const currentKey = getCurrentKey();
                    if (!currentKey) {
                        console.log('No key selected');
                        playSound('passive');
                        return;
                    }
                    
                    const entityField = document.getElementById('key-entity');
                    const functionField = document.getElementById('key-function');
                    
                    if (entityField && functionField) {
                        // Save to cube userData
                        currentKey.userData.entity = entityField.value;
                        currentKey.userData.function = functionField.value;
                        
                        console.log(`Updated key ${currentKey.userData.label}:`);
                        console.log('  Entity:', currentKey.userData.entity);
                        console.log('  Function:', currentKey.userData.function);
                        
                        // Visual feedback - flash the cube
                        if (currentKey.material && Array.isArray(currentKey.material)) {
                            currentKey.material.forEach(mat => {
                                if (mat.emissiveIntensity !== undefined) {
                                    const originalIntensity = mat.emissiveIntensity;
                                    gsap.to(mat, {
                                        emissiveIntensity: 1.5,
                                        duration: 0.15,
                                        yoyo: true,
                                        repeat: 1,
                                        onComplete: () => {
                                            mat.emissiveIntensity = originalIntensity;
                                        }
                                    });
                                }
                            });
                        }
                        
                        playSound('active');
                    }
                });
            }
            
            // Panel controls
            const minimizeBtn = document.getElementById('omnikeys-minimize-btn');
            const closeBtn = document.getElementById('omnikeys-close-btn');
            const panelHeader = document.getElementById('omnikeys-panel-header');
            const panelContent = document.getElementById('omnikeys-panel-content');
            const panel = document.getElementById('omnikeys-panel');
            
            if (minimizeBtn && panelContent && panel) {
                minimizeBtn.addEventListener('click', () => {
                    panel.classList.toggle('minimized');
                    panelContent.classList.toggle('hidden');
                    playSound('passive');
                });
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    toggleOmniKeyboard();
                    playSound('passive');
                });
            }
            
            // Make panel header draggable
            if (panelHeader && panel) {
                let isDragging = false;
                let currentX;
                let currentY;
                let initialX;
                let initialY;
                
                panelHeader.addEventListener('mousedown', (e) => {
                    if (e.target.classList.contains('panel-btn')) return;
                    isDragging = true;
                    initialX = e.clientX - panel.offsetLeft;
                    initialY = e.clientY - panel.offsetTop;
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
            
            // Resize handle
            const resizeHandle = document.getElementById('omnikeys-resize-handle');
            if (resizeHandle && panel) {
                let isResizing = false;
                let startWidth, startHeight, startX, startY;
                
                resizeHandle.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(window.getComputedStyle(panel).width, 10);
                    startHeight = parseInt(window.getComputedStyle(panel).height, 10);
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (isResizing) {
                        const width = startWidth + (e.clientX - startX);
                        const height = startHeight + (e.clientY - startY);
                        panel.style.width = Math.max(250, width) + 'px';
                        panel.style.height = Math.max(200, height) + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    isResizing = false;
                });
            }
        }

        function handleCubeFaceClick(face) {
            const faceName = face.userData.faceName;
            cubeClickedFace = faceName;
            
            console.log('Clicked cube face:', faceName);
            
            // Make edges pulse faster and brighter
            cubePulseSpeed = 3.0; // Faster pulsing
            
            // Brighten clicked face edges
            if (cubeEdges) {
                cubeEdges.children.forEach((edge) => {
                    edge.material.opacity = 1.0;
                });
            }
            
            // Show panel with face content
            const panel = document.getElementById('cube-face-panel');
            const title = document.getElementById('cube-face-title');
            const content = document.getElementById('cube-face-content');
            
            // Set title based on face
            const faceTitles = {
                'top': 'MYSPACE GRID CONTROLS',
                'front': 'MYSPACE BEHAVIOR CONTROLS',
                'right': 'MYSPACE ROTATION CONTROLS',
                'left': 'MANUAL TRANSFORM CONTROLS',
                'bottom': 'CUBE FACE (BLANK)',
                'back': 'CUBE FACE (BLANK)'
            };
            
            title.textContent = faceTitles[faceName] || 'CUBE FACE';
            
            // Load face-specific content
            content.innerHTML = getCubeFaceContent(faceName);
            
            // Show panel
            panel.style.display = 'block';
            panel.classList.remove('minimized');
            
            // Attach event listeners for new content
            attachCubeFaceHandlers(faceName);
        }
        
        function getCubeFaceContent(faceName) {
            switch(faceName) {
                case 'top':
                    return `
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-bottom: 16px;">
                            Control MySpace grid configuration and layout
                        </div>
                        
                        <!-- Grid Type -->
                        <div style="margin-bottom: 16px;">
                            <div style="font-weight: 600; margin-bottom: 8px; font-size: 12px;">Grid Type</div>
                            <select id="cube-grid-type" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(128, 128, 128, 0.5); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif;">
                                <option value="spherical">Spherical</option>
                                <option value="cube">Cube</option>
                                <option value="cylinder">Cylinder</option>
                                <option value="grid">Flat Grid</option>
                            </select>
                        </div>
                        
                        <!-- Segments -->
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; font-size: 12px;">Segments</span>
                                <span id="cube-segments-value" style="font-family: 'Courier New', monospace; color: rgba(255, 255, 255, 0.7);">8</span>
                            </div>
                            <input type="range" id="cube-segments" min="4" max="16" value="8" step="1" style="width: 100%;">
                        </div>
                        
                        <!-- Radius -->
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; font-size: 12px;">Radius</span>
                                <span id="cube-radius-value" style="font-family: 'Courier New', monospace; color: rgba(255, 255, 255, 0.7);">25</span>
                            </div>
                            <input type="range" id="cube-radius" min="10" max="50" value="25" step="1" style="width: 100%;">
                        </div>
                        
                        <button id="cube-apply-grid" class="update-btn" style="width: 100%; padding: 12px; margin-top: 12px;">⟐ APPLY GRID</button>
                    `;
                    
                case 'front':
                    return `
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-bottom: 16px;">
                            Control MySpace sphere behavior and visibility
                        </div>
                        
                        <!-- Expand/Collapse -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-toggle-myspace" class="active" style="width: 100%; padding: 12px; background: rgba(0, 255, 0, 0.3); border: 1px solid rgba(0, 255, 0, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ✓ EXPANDED
                            </button>
                        </div>
                        
                        <!-- Visibility Toggle -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-toggle-visibility" class="active" style="width: 100%; padding: 12px; background: rgba(0, 255, 0, 0.3); border: 1px solid rgba(0, 255, 0, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ✓ VISIBLE
                            </button>
                        </div>
                        
                        <!-- Grid Visibility -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-toggle-grid-visibility" class="active" style="width: 100%; padding: 12px; background: rgba(0, 255, 0, 0.3); border: 1px solid rgba(0, 255, 0, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ✓ GRID VISIBLE
                            </button>
                        </div>
                    `;
                    
                case 'right':
                    return `
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-bottom: 16px;">
                            Control MySpace sphere rotation on each axis
                        </div>
                        
                        <!-- X Axis Rotation -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-rotate-x" style="width: 100%; padding: 12px; background: rgba(128, 128, 128, 0.3); border: 1px solid rgba(128, 128, 128, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ROTATE X-AXIS
                            </button>
                        </div>
                        
                        <!-- Y Axis Rotation -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-rotate-y" style="width: 100%; padding: 12px; background: rgba(128, 128, 128, 0.3); border: 1px solid rgba(128, 128, 128, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ROTATE Y-AXIS
                            </button>
                        </div>
                        
                        <!-- Z Axis Rotation -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-rotate-z" style="width: 100%; padding: 12px; background: rgba(128, 128, 128, 0.3); border: 1px solid rgba(128, 128, 128, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                ROTATE Z-AXIS
                            </button>
                        </div>
                        
                        <!-- Stop All Rotation -->
                        <div style="margin-bottom: 16px;">
                            <button id="cube-stop-rotation" style="width: 100%; padding: 12px; background: rgba(255, 0, 0, 0.3); border: 1px solid rgba(255, 0, 0, 0.5); border-radius: 8px; color: #fff; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 600;">
                                STOP ALL ROTATION
                            </button>
                        </div>
                    `;
                    
                case 'left':
                    return `
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-bottom: 16px;">
                            Manually adjust MySpace position, rotation, and scale
                        </div>
                        
                        <!-- Position Controls -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: 600; margin-bottom: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.9);">Position</div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">X</span>
                                    <span id="cube-pos-x-value" style="font-family: 'Courier New', monospace; font-size: 11px;">0</span>
                                </div>
                                <input type="range" id="cube-pos-x" min="-100" max="100" value="0" step="1" style="width: 100%;">
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">Y</span>
                                    <span id="cube-pos-y-value" style="font-family: 'Courier New', monospace; font-size: 11px;">30</span>
                                </div>
                                <input type="range" id="cube-pos-y" min="0" max="200" value="30" step="1" style="width: 100%;">
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">Z</span>
                                    <span id="cube-pos-z-value" style="font-family: 'Courier New', monospace; font-size: 11px;">0</span>
                                </div>
                                <input type="range" id="cube-pos-z" min="-100" max="100" value="0" step="1" style="width: 100%;">
                            </div>
                        </div>
                        
                        <!-- Rotation Controls -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: 600; margin-bottom: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.9);">Rotation (degrees)</div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">X</span>
                                    <span id="cube-rot-x-value" style="font-family: 'Courier New', monospace; font-size: 11px;">0°</span>
                                </div>
                                <input type="range" id="cube-rot-x" min="0" max="360" value="0" step="1" style="width: 100%;">
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">Y</span>
                                    <span id="cube-rot-y-value" style="font-family: 'Courier New', monospace; font-size: 11px;">0°</span>
                                </div>
                                <input type="range" id="cube-rot-y" min="0" max="360" value="0" step="1" style="width: 100%;">
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">Z</span>
                                    <span id="cube-rot-z-value" style="font-family: 'Courier New', monospace; font-size: 11px;">0°</span>
                                </div>
                                <input type="range" id="cube-rot-z" min="0" max="360" value="0" step="1" style="width: 100%;">
                            </div>
                        </div>
                        
                        <!-- Scale Controls -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: 600; margin-bottom: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.9);">Scale</div>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px;">Uniform</span>
                                    <span id="cube-scale-value" style="font-family: 'Courier New', monospace; font-size: 11px;">1.0</span>
                                </div>
                                <input type="range" id="cube-scale" min="0.1" max="3" value="1" step="0.1" style="width: 100%;">
                            </div>
                        </div>
                        
                        <button id="cube-apply-transform" class="update-btn" style="width: 100%; padding: 12px;">⟐ APPLY TRANSFORM</button>
                    `;
                    
                default:
                    return `
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5); text-align: center; padding: 40px 20px;">
                            This face is currently blank.<br>
                            Reserved for future features.
                        </div>
                    `;
            }
        }
        
        function attachCubeFaceHandlers(faceName) {
            // Rotation toggle button (always present)
            const rotationToggle = document.getElementById('cube-rotation-toggle');
            if (rotationToggle) {
                rotationToggle.addEventListener('click', () => {
                    cubeRotating = !cubeRotating;
                    rotationToggle.classList.toggle('active');
                    rotationToggle.textContent = cubeRotating ? '✓ ROTATING' : 'PAUSED';
                    rotationToggle.style.background = cubeRotating ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
                    rotationToggle.style.borderColor = cubeRotating ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
                    playSound('active');
                });
            }
            
            // Face-specific handlers
            switch(faceName) {
                case 'top':
                    // Grid controls handlers
                    const gridTypeSelect = document.getElementById('cube-grid-type');
                    const segmentsSlider = document.getElementById('cube-segments');
                    const radiusSlider = document.getElementById('cube-radius');
                    const applyGridBtn = document.getElementById('cube-apply-grid');
                    
                    if (segmentsSlider) {
                        segmentsSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-segments-value').textContent = e.target.value;
                        });
                    }
                    
                    if (radiusSlider) {
                        radiusSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-radius-value').textContent = e.target.value;
                        });
                    }
                    
                    if (applyGridBtn) {
                        applyGridBtn.addEventListener('click', () => {
                            const gridType = gridTypeSelect?.value || 'spherical';
                            const segments = parseInt(segmentsSlider?.value || 8);
                            const radius = parseInt(radiusSlider?.value || 25);
                            
                            // Call existing createMySpaceGrid function
                            if (typeof createMySpaceGrid === 'function') {
                                createMySpaceGrid(gridType, segments, radius);
                            }
                            
                            playSound('active');
                            console.log('Grid applied:', { gridType, segments, radius });
                        });
                    }
                    break;
                    
                case 'front':
                    // Behavior controls handlers (already handled by existing functions)
                    const toggleMySpaceBtn = document.getElementById('cube-toggle-myspace');
                    const toggleVisibilityBtn = document.getElementById('cube-toggle-visibility');
                    const toggleGridVisBtn = document.getElementById('cube-toggle-grid-visibility');
                    
                    if (toggleMySpaceBtn) {
                        toggleMySpaceBtn.addEventListener('click', () => {
                            if (typeof toggleMySpace === 'function') {
                                toggleMySpace();
                            }
                            playSound('active');
                        });
                    }
                    break;
                    
                case 'right':
                    // Rotation axis controls
                    const rotateXBtn = document.getElementById('cube-rotate-x');
                    const rotateYBtn = document.getElementById('cube-rotate-y');
                    const rotateZBtn = document.getElementById('cube-rotate-z');
                    const stopRotationBtn = document.getElementById('cube-stop-rotation');
                    
                    if (rotateXBtn) {
                        rotateXBtn.addEventListener('click', () => {
                            window.sphereRotateX = !window.sphereRotateX;
                            rotateXBtn.classList.toggle('active');
                            rotateXBtn.textContent = window.sphereRotateX ? '✓ ROTATE X-AXIS' : 'ROTATE X-AXIS';
                            playSound('active');
                        });
                    }
                    
                    if (rotateYBtn) {
                        rotateYBtn.addEventListener('click', () => {
                            window.sphereRotateY = !window.sphereRotateY;
                            rotateYBtn.classList.toggle('active');
                            rotateYBtn.textContent = window.sphereRotateY ? '✓ ROTATE Y-AXIS' : 'ROTATE Y-AXIS';
                            playSound('active');
                        });
                    }
                    
                    if (rotateZBtn) {
                        rotateZBtn.addEventListener('click', () => {
                            window.sphereRotateZ = !window.sphereRotateZ;
                            rotateZBtn.classList.toggle('active');
                            rotateZBtn.textContent = window.sphereRotateZ ? '✓ ROTATE Z-AXIS' : 'ROTATE Z-AXIS';
                            playSound('active');
                        });
                    }
                    
                    if (stopRotationBtn) {
                        stopRotationBtn.addEventListener('click', () => {
                            window.sphereRotateX = false;
                            window.sphereRotateY = false;
                            window.sphereRotateZ = false;
                            if (rotateXBtn) rotateXBtn.classList.remove('active');
                            if (rotateYBtn) rotateYBtn.classList.remove('active');
                            if (rotateZBtn) rotateZBtn.classList.remove('active');
                            playSound('active');
                        });
                    }
                    break;
                    
                case 'left':
                    // Manual transform controls
                    const posXSlider = document.getElementById('cube-pos-x');
                    const posYSlider = document.getElementById('cube-pos-y');
                    const posZSlider = document.getElementById('cube-pos-z');
                    const rotXSlider = document.getElementById('cube-rot-x');
                    const rotYSlider = document.getElementById('cube-rot-y');
                    const rotZSlider = document.getElementById('cube-rot-z');
                    const scaleSlider = document.getElementById('cube-scale');
                    const applyTransformBtn = document.getElementById('cube-apply-transform');
                    
                    // Position sliders
                    if (posXSlider) {
                        posXSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-pos-x-value').textContent = e.target.value;
                        });
                    }
                    if (posYSlider) {
                        posYSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-pos-y-value').textContent = e.target.value;
                        });
                    }
                    if (posZSlider) {
                        posZSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-pos-z-value').textContent = e.target.value;
                        });
                    }
                    
                    // Rotation sliders
                    if (rotXSlider) {
                        rotXSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-rot-x-value').textContent = e.target.value + '°';
                        });
                    }
                    if (rotYSlider) {
                        rotYSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-rot-y-value').textContent = e.target.value + '°';
                        });
                    }
                    if (rotZSlider) {
                        rotZSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-rot-z-value').textContent = e.target.value + '°';
                        });
                    }
                    
                    // Scale slider
                    if (scaleSlider) {
                        scaleSlider.addEventListener('input', (e) => {
                            document.getElementById('cube-scale-value').textContent = parseFloat(e.target.value).toFixed(1);
                        });
                    }
                    
                    // Apply transform button
                    if (applyTransformBtn) {
                        applyTransformBtn.addEventListener('click', () => {
                            const posX = parseFloat(posXSlider?.value || 0);
                            const posY = parseFloat(posYSlider?.value || 30);
                            const posZ = parseFloat(posZSlider?.value || 0);
                            const rotX = parseFloat(rotXSlider?.value || 0) * Math.PI / 180;
                            const rotY = parseFloat(rotYSlider?.value || 0) * Math.PI / 180;
                            const rotZ = parseFloat(rotZSlider?.value || 0) * Math.PI / 180;
                            const scale = parseFloat(scaleSlider?.value || 1);
                            
                            if (mySpaceGroup) {
                                mySpaceGroup.position.set(posX, posY, posZ);
                                mySpaceGroup.rotation.set(rotX, rotY, rotZ);
                                mySpaceGroup.scale.set(scale, scale, scale);
                            }
                            
                            playSound('active');
                            console.log('Transform applied:', { position: [posX, posY, posZ], rotation: [rotX, rotY, rotZ], scale });
                        });
                    }
                    break;
            }
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
            const upwardControls = document.getElementById('upward-controls');
            const downwardControls = document.getElementById('downward-controls');
            const connectedControls = document.getElementById('connected-controls');
            const glitchControls = document.getElementById('glitch-controls');
            const constellationControls = document.getElementById('constellation-controls');
            const forwardSpeedSlider = document.getElementById('forward-speed-slider');
            const backwardSpeedSlider = document.getElementById('backward-speed-slider');
            const upwardSpeedSlider = document.getElementById('upward-speed-slider');
            const downwardSpeedSlider = document.getElementById('downward-speed-slider');
            const connectedFrequencySlider = document.getElementById('connected-frequency-slider');
            const glitchIntensitySlider = document.getElementById('glitch-intensity-slider');
            const constellationDistanceSlider = document.getElementById('constellation-distance-slider');
            const particleCountSlider = document.getElementById('particle-count-slider');
            const forwardSpeedValue = document.getElementById('forward-speed-value');
            const backwardSpeedValue = document.getElementById('backward-speed-value');
            const upwardSpeedValue = document.getElementById('upward-speed-value');
            const downwardSpeedValue = document.getElementById('downward-speed-value');
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
                    upwardControls.style.display = mode === 'upward' ? 'block' : 'none';
                    downwardControls.style.display = mode === 'downward' ? 'block' : 'none';
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
            
            // Upward speed slider
            if (upwardSpeedSlider) {
                upwardSpeedSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    upwardSpeedValue.textContent = value;
                    upwardFlowSpeed = value / 100;
                    playSound('passive');
                });
            }
            
            // Downward speed slider
            if (downwardSpeedSlider) {
                downwardSpeedSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    downwardSpeedValue.textContent = value;
                    downwardFlowSpeed = value / 100;
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
        // Entrance sequence variables
        let entranceTunnel = null;
        let entranceWireframe = null;
        let entranceRings = [];
        let descentCylinder = null; // Bright cylinder that descends 1.5x faster
        let isEntranceActive = false;
        let entranceProgress = 0;
        let landingCylinder = null;

        function setupJoystickDirectionalButtons() {
            const joyNorth = document.getElementById('joy-btn-north');
            const joySouth = document.getElementById('joy-btn-south');
            const joyWest = document.getElementById('joy-btn-west');
            const joyEast = document.getElementById('joy-btn-east');
            
            if (joyNorth) {
                // Move forward
                joyNorth.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys.w = true;
                });
                joyNorth.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    keys.w = false;
                });
                joyNorth.addEventListener('mousedown', () => { keys.w = true; });
                joyNorth.addEventListener('mouseup', () => { keys.w = false; });
            }
            
            if (joySouth) {
                // Move backward
                joySouth.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys.s = true;
                });
                joySouth.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    keys.s = false;
                });
                joySouth.addEventListener('mousedown', () => { keys.s = true; });
                joySouth.addEventListener('mouseup', () => { keys.s = false; });
            }
            
            if (joyWest) {
                // Move left
                joyWest.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys.a = true;
                });
                joyWest.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    keys.a = false;
                });
                joyWest.addEventListener('mousedown', () => { keys.a = true; });
                joyWest.addEventListener('mouseup', () => { keys.a = false; });
            }
            
            if (joyEast) {
                // Move right
                joyEast.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys.d = true;
                });
                joyEast.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    keys.d = false;
                });
                joyEast.addEventListener('mousedown', () => { keys.d = true; });
                joyEast.addEventListener('mouseup', () => { keys.d = false; });
            }
        }

        function setup3DObjectInteractions() {
            // Hover effect
            window.addEventListener('mousemove', (event) => {
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(interactiveObjects, false);
                
                if (intersects.length > 0) {
                    const object = intersects[0].object;
                    
                    // Update inspector with hovered object
                    if (object !== hoveredObject) {
                        hoveredObject = object;
                        updateInspectorWithObject(object);
                        
                        // Change cursor to pointer
                        document.body.style.cursor = 'pointer';
                    }
                } else {
                    if (hoveredObject) {
                        hoveredObject = null;
                        document.body.style.cursor = 'default';
                    }
                }
            });
            
            // Click handler for cubes
            window.addEventListener('click', (event) => {
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(interactiveObjects, false);
                
                if (intersects.length > 0) {
                    const object = intersects[0].object;
                    
                    // Handle keyboard cube clicks
                    if (object.userData && object.userData.type === 'omniKey') {
                        handleKeyboardCubeClick(object);
                        playSound('active');
                    }
                    // Handle other interactive objects
                    else if (object.userData && object.userData.type === 'mySpaceObject') {
                        // Existing MySpace object handling
                        selectedObject = object;
                        updateInspector();
                        playSound('passive');
                    }
                }
            });
        }

        function updateInspectorWithObject(object) {
            const inspectorPanel = document.getElementById('inspector-panel');
            if (!inspectorPanel) return;
            
            // Show inspector if hidden
            if (!inspectorPanel.classList.contains('visible')) {
                inspectorPanel.style.display = 'block';
            }
            
            const titleElement = inspectorPanel.querySelector('.panel-title');
            const selectedName = document.getElementById('selected-name');
            
            if (object.userData && object.userData.type === 'omniKey') {
                if (titleElement) titleElement.textContent = '⟐MNIKEY';
                if (selectedName) selectedName.textContent = object.userData.label || 'Key';
            } else if (object.userData && object.userData.type === 'mySpaceObject') {
                if (titleElement) titleElement.textContent = '⟐ INSPECTOR';
                if (selectedName) selectedName.textContent = object.userData.dataHeader || 'Object';
            } else {
                if (titleElement) titleElement.textContent = '⟐ INSPECTOR';
                if (selectedName) selectedName.textContent = object.name || 'Object';
            }
        }

        function handleKeyboardCubeClick(keyCube) {
            // Set as current key
            omniKeyboardCurrentRow = keyCube.userData.rowIndex;
            omniKeyboardCurrentCol = keyCube.userData.colIndex;
            highlightCurrentKey();
            
            // Update selected key display
            const selectedKeyName = document.getElementById('selected-key-name');
            if (selectedKeyName) {
                selectedKeyName.textContent = keyCube.userData.label || 'Unknown';
            }
            
            // Populate entity and function fields if data exists
            const entityField = document.getElementById('key-entity');
            const functionField = document.getElementById('key-function');
            
            if (entityField) {
                entityField.value = keyCube.userData.entity || '';
            }
            if (functionField) {
                functionField.value = keyCube.userData.function || '';
            }
            
            // Update inspector with full key info
            updateInspectorWithKeyInfo(keyCube);
            
            console.log('Clicked key:', keyCube.userData.label);
        }

        function init() {
            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xa1a1a1); // Default grey background

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 15);
            scene.add(camera); // Add camera to scene so children render

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.domElement.style.opacity = '0'; // Hide initially until entrance starts
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            // Outer sphere with gradient - Part of MySpace
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
            sphere.position.set(0, 0, 0); // Centered in group, group will be positioned at y=30
            sphere.userData.type = 'myspace-sphere'; // Tag for identification
            window.mySpaceSphere = sphere; // Store global reference
            scene.add(sphere); // Add to scene for now, will add to group later

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
            const gridSize = 2500; // Expanded 50x from 50 to 2500
            const gridDivisions = 100; // Increased divisions for better detail
            gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0xffffff);
            gridHelper.position.set(0, -5, 0);
            gridHelper.material.opacity = 0.3;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);

            // Create OmniSense Cube System
            function createOmniSenseCube() {
                omniSenseCube = new THREE.Group();
                omniSenseCube.position.set(0, 30, 0); // Same position as MySpace
                
                // Create 6 face planes with grid patterns
                const faceGeometry = new THREE.PlaneGeometry(cubeSize, cubeSize, 10, 10);
                
                const facePositions = [
                    { name: 'top', pos: [0, cubeSize/2, 0], rot: [-Math.PI/2, 0, 0], color: 0x4488ff, icon: '⊞' },
                    { name: 'bottom', pos: [0, -cubeSize/2, 0], rot: [Math.PI/2, 0, 0], color: 0x4488ff, icon: '□' },
                    { name: 'front', pos: [0, 0, cubeSize/2], rot: [0, 0, 0], color: 0x4488ff, icon: '⚙' },
                    { name: 'back', pos: [0, 0, -cubeSize/2], rot: [0, Math.PI, 0], color: 0x4488ff, icon: '□' },
                    { name: 'right', pos: [cubeSize/2, 0, 0], rot: [0, Math.PI/2, 0], color: 0x4488ff, icon: '↻' },
                    { name: 'left', pos: [-cubeSize/2, 0, 0], rot: [0, -Math.PI/2, 0], color: 0x4488ff, icon: '⇅' }
                ];
                
                facePositions.forEach(face => {
                    const faceMaterial = new THREE.MeshBasicMaterial({
                        color: face.color,
                        transparent: true,
                        opacity: 0.05,
                        side: THREE.DoubleSide,
                        wireframe: false
                    });
                    
                    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
                    faceMesh.position.set(...face.pos);
                    faceMesh.rotation.set(...face.rot);
                    faceMesh.userData = {
                        type: 'cube-face',
                        faceName: face.name,
                        originalOpacity: 0.05,
                        isClickable: true
                    };
                    
                    omniSenseCube.add(faceMesh);
                    cubeFaces.push(faceMesh);
                    
                    // Add grid lines to face
                    const wireframe = new THREE.WireframeGeometry(faceGeometry);
                    const wireframeMaterial = new THREE.LineBasicMaterial({
                        color: 0x888888,
                        transparent: true,
                        opacity: 0.2
                    });
                    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
                    faceMesh.add(wireframeMesh);
                    
                    // Add icon to face (larger and brighter)
                    const iconSize = cubeSize * 0.5; // 50% of cube size for visibility
                    const iconCanvas = document.createElement('canvas');
                    iconCanvas.width = 256;
                    iconCanvas.height = 256;
                    const iconCtx = iconCanvas.getContext('2d');
                    
                    // Draw bright icon
                    iconCtx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Bright white
                    iconCtx.font = 'bold 180px Arial';
                    iconCtx.textAlign = 'center';
                    iconCtx.textBaseline = 'middle';
                    iconCtx.fillText(face.icon, 128, 128);
                    
                    const iconTexture = new THREE.CanvasTexture(iconCanvas);
                    const iconMaterial = new THREE.MeshBasicMaterial({
                        map: iconTexture,
                        transparent: true,
                        opacity: 0.95, // Very bright
                        side: THREE.DoubleSide
                    });
                    
                    const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
                    const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
                    iconMesh.position.set(0, 0, 0.1); // Slightly in front of face
                    faceMesh.add(iconMesh);
                });
                
                // Create 12 edges with pulsing animation
                const edgePoints = [
                    // Bottom square
                    [[-cubeSize/2, -cubeSize/2, -cubeSize/2], [cubeSize/2, -cubeSize/2, -cubeSize/2]],
                    [[cubeSize/2, -cubeSize/2, -cubeSize/2], [cubeSize/2, -cubeSize/2, cubeSize/2]],
                    [[cubeSize/2, -cubeSize/2, cubeSize/2], [-cubeSize/2, -cubeSize/2, cubeSize/2]],
                    [[-cubeSize/2, -cubeSize/2, cubeSize/2], [-cubeSize/2, -cubeSize/2, -cubeSize/2]],
                    // Top square
                    [[-cubeSize/2, cubeSize/2, -cubeSize/2], [cubeSize/2, cubeSize/2, -cubeSize/2]],
                    [[cubeSize/2, cubeSize/2, -cubeSize/2], [cubeSize/2, cubeSize/2, cubeSize/2]],
                    [[cubeSize/2, cubeSize/2, cubeSize/2], [-cubeSize/2, cubeSize/2, cubeSize/2]],
                    [[-cubeSize/2, cubeSize/2, cubeSize/2], [-cubeSize/2, cubeSize/2, -cubeSize/2]],
                    // Vertical edges
                    [[-cubeSize/2, -cubeSize/2, -cubeSize/2], [-cubeSize/2, cubeSize/2, -cubeSize/2]],
                    [[cubeSize/2, -cubeSize/2, -cubeSize/2], [cubeSize/2, cubeSize/2, -cubeSize/2]],
                    [[cubeSize/2, -cubeSize/2, cubeSize/2], [cubeSize/2, cubeSize/2, cubeSize/2]],
                    [[-cubeSize/2, -cubeSize/2, cubeSize/2], [-cubeSize/2, cubeSize/2, cubeSize/2]]
                ];
                
                const edgesGroup = new THREE.Group();
                edgePoints.forEach((edge, index) => {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(...edge[0]),
                        new THREE.Vector3(...edge[1])
                    ]);
                    
                    const material = new THREE.LineBasicMaterial({
                        color: 0x0066ff,
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    line.userData = {
                        type: 'cube-edge',
                        edgeIndex: index,
                        baseColor: new THREE.Color(0x0066ff),
                        pulsePhase: (index / 12) * Math.PI * 2
                    };
                    edgesGroup.add(line);
                });
                
                omniSenseCube.add(edgesGroup);
                cubeEdges = edgesGroup;
                omniSenseCube.visible = false; // Hidden by default
                scene.add(omniSenseCube);
                
                console.log('OmniSense Cube created');
            }
            
            createOmniSenseCube();

            // Initialize MySpace grid with default spherical configuration
            window.gridPanelObjects = [];
            createMySpaceGrid('spherical', 8, 25);
            
            function createMySpaceGrid(gridType, segments, radius) {
                // Initialize mySpaceGroup if it doesn't exist
                if (!mySpaceGroup) {
                    mySpaceGroup = new THREE.Group();
                    mySpaceGroup.position.set(0, 30, 0); // Position so sphere bottom is at y=0
                    scene.add(mySpaceGroup);
                    
                    // Add the gradient sphere to MySpace group if it exists
                    if (window.mySpaceSphere && window.mySpaceSphere.parent === scene) {
                        scene.remove(window.mySpaceSphere);
                        mySpaceGroup.add(window.mySpaceSphere);
                    }
                }
                
                // Clear existing grid panels
                if (window.gridPanelObjects && window.gridPanelObjects.length > 0) {
                    window.gridPanelObjects.forEach(panel => {
                        mySpaceGroup.remove(panel);
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
                    
                    mySpaceGroup.add(gridPanel);  // Add to group instead of scene
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
                
                // Auto-disconnect keyboard in Still Mode when text field is focused
                if (isTextField && omniKeyboardStillMode && omniKeyboardVisible) {
                    console.log('Auto-disconnecting keyboard: text field focused');
                    toggleOmniKeyboard();
                    playSound('passive');
                    return;
                }
                
                if (isTextField) {
                    return; // Don't process keyboard shortcuts
                }
                
                const key = e.key.toLowerCase();
                
                // Track shift key
                if (e.shiftKey) {
                    keys.shift = true;
                }
                
                // If Still Mode is ON, disable movement keys but allow keyboard typing
                if (!omniKeyboardStillMode || !omniKeyboardVisible) {
                    if (key in keys) {
                        keys[key] = true;
                        // Add visual feedback for C key (FPS mode)
                        if (key === 'c') {
                            document.body.classList.add('fps-mode');
                        }
                    }
                } else {
                    // Still Mode is ON - make keyboard typable
                    // Find and animate the key that was pressed
                    makeKeyJump(e.key);
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
                // OmniSense Mode toggle
                if (key === 'l') {
                    toggleOmniSenseMode();
                    playSound('active');
                }
                // ⟐mniKeyboard toggle
                if (key === 'n') {
                    toggleOmniKeyboard();
                    playSound('active');
                }
                
                // Arrow keys ALWAYS rotate current cube when keyboard visible
                if (omniKeyboardVisible && !isTextField) {
                    const currentKey = getCurrentKey();
                    if (currentKey) {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            rotateKeyCube(currentKey, 'x', -Math.PI / 4);
                            playSound('active');
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            rotateKeyCube(currentKey, 'x', Math.PI / 4);
                            playSound('active');
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            rotateKeyCube(currentKey, 'y', -Math.PI / 4);
                            playSound('active');
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            rotateKeyCube(currentKey, 'y', Math.PI / 4);
                            playSound('active');
                        }
                    }
                }
                
                // Balance camera rotation (B key)
                if (key === 'b') {
                    // Smoothly reset camera rotation to normal axis
                    gsap.to(camera.rotation, {
                        duration: 0.8,
                        x: 0,
                        y: 0,
                        z: 0,
                        ease: 'power2.out'
                    });
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
                // Side Tray toggle (T key)
                if (e.key === 't' || e.key === 'T') {
                    e.preventDefault();
                    const sideTray = document.getElementById('side-tray');
                    const topTray = document.getElementById('top-tray');
                    
                    const isHidden = sideTray.style.display === 'none';
                    
                    if (sideTray) {
                        sideTray.style.display = isHidden ? 'block' : 'none';
                    }
                    if (topTray) {
                        topTray.style.display = isHidden ? 'flex' : 'none';
                    }
                    
                    playSound('passive');
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
                
                // Track shift key release
                if (!e.shiftKey) {
                    keys.shift = false;
                }
                
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
            initializeToolMenu();
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
            
            // Setup joystick directional buttons
            setupJoystickDirectionalButtons();
            
            // Setup 3D object hover and click interactions
            setup3DObjectInteractions();

            // Apply default theme
            applyTheme('silver');

            // Start animation
            animate();
            
            // Show welcome screen
            showWelcomeScreen();
            
            // Setup left menu toggle button (OPN/CLS)
            setupLeftMenuButton();
        }
        
        function setupLeftMenuButton() {
            const menuBtn = document.getElementById('btn-menu');
            const leftMenu = document.getElementById('left-menu');
            const leftHamburger = document.getElementById('left-hamburger');
            
            if (menuBtn && leftMenu) {
                menuBtn.addEventListener('click', () => {
                    // Toggle menu
                    leftMenu.classList.toggle('open');
                    if (leftHamburger) {
                        leftHamburger.classList.toggle('menu-open');
                    }
                    
                    // Keep ☰ symbol, just toggle active state
                    if (leftMenu.classList.contains('open')) {
                        menuBtn.classList.add('active');
                    } else {
                        menuBtn.classList.remove('active');
                    }
                    
                    playSound('passive');
                });
            }
        }
        
        function showWelcomeScreen() {
            // Create welcome panel overlay
            const welcomePanel = document.createElement('div');
            welcomePanel.id = 'welcome-panel';
            welcomePanel.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, 
                    rgba(200, 200, 210, 0.95), 
                    rgba(240, 240, 245, 0.95), 
                    rgba(220, 220, 230, 0.95),
                    rgba(250, 250, 255, 0.95));
                background-size: 400% 400%;
                animation: cloudFlow 15s ease infinite;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(20px);
            `;
            
            welcomePanel.innerHTML = `
                <!-- Central ⟐ Symbol -->
                <div id="central-symbol" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Orbitron', sans-serif;
                    font-size: 120px;
                    color: rgba(80, 80, 90, 1);
                    cursor: pointer;
                    text-shadow: 0 0 40px rgba(255, 255, 255, 0.9), 0 0 80px rgba(200, 200, 210, 0.6);
                    transition: all 0.3s;
                    z-index: 100;
                ">⟐</div>
                
                <!-- Branches Container - lines stemming from ⟐ -->
                <svg id="branches-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 90;">
                    <!-- Radiating lines from center -->
                    <line id="branch-1" x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-2" x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-3" x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-4" x1="50%" y1="50%" x2="20%" y2="80%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-5" x1="50%" y1="50%" x2="10%" y2="50%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-6" x1="50%" y1="50%" x2="90%" y2="50%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-7" x1="50%" y1="50%" x2="50%" y2="10%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                    <line id="branch-8" x1="50%" y1="50%" x2="50%" y2="90%" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-dasharray="5,5" style="opacity: 0;"/>
                </svg>
                
                <!-- Questions Container -->
                <div id="questions-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50;"></div>
                
                <!-- Floating Symbols Container -->
                <div id="symbols-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 40;"></div>
                
                <!-- Letter Reveal Container -->
                <div id="letter-reveal" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Orbitron', sans-serif;
                    font-size: 48px;
                    font-weight: 900;
                    color: rgba(80, 80, 90, 1);
                    text-shadow: 0 0 30px rgba(255, 255, 255, 0.9);
                    display: none;
                    z-index: 150;
                "></div>
                
                <style>
                    @keyframes cloudFlow {
                        0% { background-position: 0% 50%; }
                        25% { background-position: 50% 60%; }
                        50% { background-position: 100% 50%; }
                        75% { background-position: 50% 40%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    @keyframes fadeToBack {
                        0% { 
                            opacity: 1; 
                            transform: translate(-50%, -50%) scale(1); 
                            filter: blur(0px);
                        }
                        100% { 
                            opacity: 0; 
                            transform: translate(-50%, -50%) scale(1.5); 
                            filter: blur(5px);
                        }
                    }
                    
                    @keyframes floatAway {
                        0% { 
                            opacity: 1; 
                            transform: scale(1); 
                            filter: blur(0px);
                        }
                        100% { 
                            opacity: 0; 
                            transform: scale(2); 
                            filter: blur(3px);
                        }
                    }
                    
                    @keyframes diamondShake {
                        0% { 
                            transform: translate(-50%, -50%) rotate(0deg) scale(1.1);
                        }
                        10% { 
                            transform: translate(calc(-50% + 1px), calc(-50% + 0.5px)) rotate(0.5deg) scale(1.1);
                        }
                        20% { 
                            transform: translate(calc(-50% - 1px), calc(-50% + 1px)) rotate(-0.5deg) scale(1.1);
                        }
                        30% { 
                            transform: translate(calc(-50% + 1.5px), calc(-50% - 0.5px)) rotate(0.8deg) scale(1.1);
                        }
                        40% { 
                            transform: translate(calc(-50% - 1.5px), calc(-50% + 1.5px)) rotate(-0.8deg) scale(1.1);
                        }
                        50% { 
                            transform: translate(calc(-50% + 2px), calc(-50% - 1px)) rotate(1deg) scale(1.1);
                        }
                        60% { 
                            transform: translate(calc(-50% - 1.5px), calc(-50% + 0.5px)) rotate(-0.8deg) scale(1.1);
                        }
                        70% { 
                            transform: translate(calc(-50% + 1px), calc(-50% - 1.5px)) rotate(0.5deg) scale(1.1);
                        }
                        80% { 
                            transform: translate(calc(-50% - 0.5px), calc(-50% + 1px)) rotate(-0.3deg) scale(1.1);
                        }
                        90% { 
                            transform: translate(calc(-50% + 0.5px), calc(-50% - 0.5px)) rotate(0.2deg) scale(1.1);
                        }
                        100% { 
                            transform: translate(-50%, -50%) rotate(0deg) scale(1.1);
                        }
                    }
                    
                    #central-symbol:hover {
                        transform: translate(-50%, -50%) scale(1.1);
                        text-shadow: 0 0 60px rgba(255, 255, 255, 1), 0 0 100px rgba(200, 200, 210, 0.8);
                    }
                </style>
            `;
            
            document.body.appendChild(welcomePanel);
            
            // Get branch references for hover animation
            const branches = [];
            for (let i = 1; i <= 8; i++) {
                branches.push(document.getElementById(`branch-${i}`));
            }
            
            const centralSymbol = document.getElementById('central-symbol');
            const questionsContainer = document.getElementById('questions-container');
            const symbolsContainer = document.getElementById('symbols-container');
            const letterReveal = document.getElementById('letter-reveal');
            
            const questions = [
                "What is this?",
                "What is this for?",
                "Is this safe?",
                "Why a diamond?",
                "Does this go anywhere?",
                "Why does this exist?",
                "Why am I questioning this?"
            ];
            
            let hovering = false;
            let questionInterval;
            let symbolInterval;
            
            // Hover to spawn questions and symbols
            centralSymbol.addEventListener('mouseenter', () => {
                hovering = true;
                
                // Animate branches on hover with staggered timing
                branches.forEach((branch, index) => {
                    if (branch) {
                        setTimeout(() => {
                            branch.style.transition = 'opacity 0.8s ease-in-out';
                            branch.style.opacity = '1';
                            
                            // Pulse animation
                            const pulseInterval = setInterval(() => {
                                if (!hovering) {
                                    clearInterval(pulseInterval);
                                    branch.style.opacity = '0';
                                } else {
                                    branch.style.opacity = Math.random() * 0.5 + 0.5; // Random between 0.5 and 1
                                }
                            }, 2000 + index * 200);
                        }, index * 100);
                    }
                });
                
                // Add shake animation to symbol
                centralSymbol.style.animation = 'diamondShake 2s ease-in-out infinite';
                
                // Spawn questions every 800ms
                questionInterval = setInterval(() => {
                    if (!hovering) return;
                    
                    const question = questions[Math.floor(Math.random() * questions.length)];
                    const questionDiv = document.createElement('div');
                    
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 150 + Math.random() * 200;
                    const x = 50 + Math.cos(angle) * distance / window.innerWidth * 100;
                    const y = 50 + Math.sin(angle) * distance / window.innerHeight * 100;
                    
                    questionDiv.style.cssText = `
                        position: absolute;
                        top: ${y}%;
                        left: ${x}%;
                        transform: translate(-50%, -50%);
                        padding: 12px 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 2px solid rgba(255, 255, 255, 0.9);
                        border-radius: 8px;
                        color: rgba(80, 80, 90, 1);
                        font-family: 'Orbitron', sans-serif;
                        font-size: 14px;
                        font-weight: 600;
                        white-space: nowrap;
                        box-shadow: 0 0 30px rgba(255, 255, 255, 0.9), 0 0 50px rgba(255, 255, 255, 0.6);
                        animation: fadeToBack 3s ease-out forwards;
                    `;
                    questionDiv.textContent = question;
                    questionsContainer.appendChild(questionDiv);
                    
                    setTimeout(() => questionDiv.remove(), 3000);
                }, 800);
                
                // Spawn symbols every 600ms
                symbolInterval = setInterval(() => {
                    if (!hovering) return;
                    
                    const symbolDiv = document.createElement('div');
                    
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 100 + Math.random() * 150;
                    const x = 50 + Math.cos(angle) * distance / window.innerWidth * 100;
                    const y = 50 + Math.sin(angle) * distance / window.innerHeight * 100;
                    
                    symbolDiv.style.cssText = `
                        position: absolute;
                        top: ${y}%;
                        left: ${x}%;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 40px;
                        color: rgba(80, 80, 90, 1);
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        border-radius: 50%;
                        padding: 10px;
                        box-shadow: 0 0 25px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6);
                        animation: floatAway 2.5s ease-out forwards;
                    `;
                    symbolDiv.textContent = '⟐';
                    symbolsContainer.appendChild(symbolDiv);
                    
                    setTimeout(() => symbolDiv.remove(), 2500);
                }, 600);
            });
            
            centralSymbol.addEventListener('mouseleave', () => {
                hovering = false;
                clearInterval(questionInterval);
                clearInterval(symbolInterval);
                
                // Stop shake animation
                centralSymbol.style.animation = '';
                
                // Fade out branches
                branches.forEach(branch => {
                    if (branch) {
                        branch.style.transition = 'opacity 0.5s ease-out';
                        branch.style.opacity = '0';
                    }
                });
            });
            
            // Click to reveal text letter by letter
            let clicked = false;
            centralSymbol.addEventListener('click', () => {
                if (clicked) return;
                clicked = true;
                
                playSound('active');
                hovering = false;
                clearInterval(questionInterval);
                clearInterval(symbolInterval);
                
                // Hide central symbol
                centralSymbol.style.opacity = '0';
                
                // Hide branches
                branches.forEach(branch => {
                    if (branch) {
                        branch.style.opacity = '0';
                    }
                });
                
                // Show letter reveal
                letterReveal.style.display = 'block';
                
                const fullText = "Welcome to ⟐mniExp";
                let currentText = "";
                let index = 0;
                
                const letterInterval = setInterval(() => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        letterReveal.textContent = currentText;
                        playSound('passive');
                        index++;
                    } else {
                        clearInterval(letterInterval);
                        
                        // Wait 1 second then start tunnel
                        setTimeout(() => {
                            welcomePanel.style.transition = 'opacity 0.5s';
                            welcomePanel.style.opacity = '0';
                            setTimeout(() => {
                                welcomePanel.remove();
                                startEntranceSequence();
                            }, 500);
                        }, 1000);
                    }
                }, 80);
            });
        }
        
        function startEntranceSequence() {
            isEntranceActive = true;
            entranceProgress = 0;
            
            // Fade in the canvas smoothly
            renderer.domElement.style.transition = 'opacity 0.5s';
            renderer.domElement.style.opacity = '1';
            
            // Move camera way above
            camera.position.set(0, 100000, 0);
            camera.lookAt(0, 0, 0);
            
            // Create primary tunnel cylinder (50% transparent white)
            const tunnelGeometry = new THREE.CylinderGeometry(15, 15, 200000, 32, 1, true);
            const tunnelMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            entranceTunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
            entranceTunnel.position.y = 50000;
            scene.add(entranceTunnel);
            
            // Create wireframe cylinder inside
            const wireframeGeometry = new THREE.CylinderGeometry(14, 14, 200000, 16, 1, true);
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            entranceWireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
            entranceWireframe.position.y = 50000;
            scene.add(entranceWireframe);
            
            // Create ring geometries that come towards user
            for (let i = 0; i < 20; i++) {
                const ringGeometry = new THREE.TorusGeometry(12, 0.5, 16, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                ring.position.y = i * 10000;
                ring.userData.initialY = ring.position.y;
                entranceRings.push(ring);
                scene.add(ring);
            }
            
            // Create bright descent cylinder (1.5x faster than camera)
            const descentGeometry = new THREE.CylinderGeometry(2, 2, 80, 32);
            const descentMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1.0
            });
            descentCylinder = new THREE.Mesh(descentGeometry, descentMaterial);
            descentCylinder.position.set(0, 100000 + 50, -30); // Start ahead of camera
            scene.add(descentCylinder);
            
            // Create entrance particles for mystical effect
            const entranceParticleCount = 500;
            const entranceParticleGeometry = new THREE.BufferGeometry();
            const entranceParticlePositions = new Float32Array(entranceParticleCount * 3);
            
            for (let i = 0; i < entranceParticleCount; i++) {
                const i3 = i * 3;
                // Particles distributed in a sphere around the tunnel
                const radius = 20 + Math.random() * 30;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                entranceParticlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                entranceParticlePositions[i3 + 1] = 100000 + (Math.random() * 20000 - 10000);
                entranceParticlePositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            }
            
            entranceParticleGeometry.setAttribute('position', new THREE.BufferAttribute(entranceParticlePositions, 3));
            const entranceParticleMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.5,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            entranceParticles = new THREE.Points(entranceParticleGeometry, entranceParticleMaterial);
            scene.add(entranceParticles);
            
            // Disable controls during entrance
            controlsEnabled = false;
        }
        
        function updateEntranceSequence(delta) {
            if (!isEntranceActive) return;
            
            // 8 second descent with easing
            entranceProgress += delta / 8;
            
            if (entranceProgress < 1) {
                // Smooth easing function (ease-in-out cubic)
                const easeInOutCubic = (t) => {
                    return t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                };
                
                const easedProgress = easeInOutCubic(entranceProgress);
                
                // Descend with easing
                const startY = 100000;
                const endY = 15;
                camera.position.y = startY - (startY - endY) * easedProgress;
                
                // Move bright descent cylinder 1.5x faster than camera
                if (descentCylinder) {
                    descentCylinder.position.y = (startY + 50) - (startY - endY) * easedProgress * 1.5;
                    descentCylinder.position.z = camera.position.z - 30; // Stay in front of camera
                }
                
                // Add gentle camera rotation during descent for dynamic feel
                camera.rotation.z = Math.sin(entranceProgress * Math.PI * 2) * 0.05;
                
                // Rotate tunnel - speed varies with progress
                const rotationSpeed = 1 + Math.sin(entranceProgress * Math.PI) * 0.5;
                if (entranceTunnel) entranceTunnel.rotation.y += delta * 2 * rotationSpeed;
                if (entranceWireframe) entranceWireframe.rotation.y -= delta * 3 * rotationSpeed;
                
                // Move rings towards user - speed up near end
                const ringSpeed = 20000 * (1 + easedProgress);
                entranceRings.forEach((ring, i) => {
                    ring.position.y -= delta * ringSpeed;
                    if (ring.position.y < camera.position.y - 1000) {
                        ring.position.y = camera.position.y + 20000;
                    }
                    ring.rotation.z += delta * (2 + easedProgress);
                    
                    // Fade rings in and out
                    const fadeIn = Math.min(1, entranceProgress * 3);
                    const fadeOut = entranceProgress > 0.7 ? (1 - (entranceProgress - 0.7) / 0.3) : 1;
                    ring.material.opacity = 0.3 * fadeIn * fadeOut;
                });
                
                // Pulse the tunnel opacity
                if (entranceTunnel) {
                    entranceTunnel.material.opacity = 0.15 + Math.sin(entranceProgress * Math.PI * 4) * 0.05;
                }
            } else {
                // Landing sequence
                endEntranceSequence();
            }
        }
        
        function endEntranceSequence() {
            isEntranceActive = false;
            
            // Reset camera rotation
            gsap.to(camera.rotation, {
                duration: 0.5,
                z: 0,
                ease: 'power2.out'
            });
            
            // Remove tunnel and rings
            if (entranceTunnel) {
                scene.remove(entranceTunnel);
                entranceTunnel = null;
            }
            if (entranceWireframe) {
                scene.remove(entranceWireframe);
                entranceWireframe = null;
            }
            entranceRings.forEach(ring => scene.remove(ring));
            entranceRings = [];
            
            // Remove the descent cylinder - it will be replaced by landing cylinder
            if (descentCylinder) {
                scene.remove(descentCylinder);
                descentCylinder = null;
            }
            
            // Create landing cylinder effect (Megaman style)
            const landingGeometry = new THREE.CylinderGeometry(6, 6, 40, 32, 1, true);
            const landingMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide
            });
            landingCylinder = new THREE.Mesh(landingGeometry, landingMaterial);
            landingCylinder.position.set(camera.position.x, camera.position.y, camera.position.z - 30);
            scene.add(landingCylinder);
            
            // Megaman-style landing animation: shrink then shoot up
            let landingProgress = 0;
            const landingAnimation = setInterval(() => {
                landingProgress += 0.03; // Speed of animation
                
                if (landingProgress < 0.5) {
                    // Phase 1: Cylinder shrinks and gets thinner (0 to 0.5)
                    const shrinkProgress = landingProgress / 0.5;
                    const scale = 1 - shrinkProgress * 0.7; // Shrink to 30% size
                    landingCylinder.scale.set(scale, 1, scale);
                    landingCylinder.material.opacity = 1.0;
                } else if (landingProgress < 1) {
                    // Phase 2: Cylinder shoots straight up rapidly (0.5 to 1)
                    const shootProgress = (landingProgress - 0.5) / 0.5;
                    const shootSpeed = shootProgress * shootProgress * 150; // Accelerating upward
                    landingCylinder.position.y += shootSpeed;
                    landingCylinder.material.opacity = 1 - shootProgress;
                    // Keep it thin
                    landingCylinder.scale.set(0.3, 1, 0.3);
                } else {
                    // Animation complete
                    scene.remove(landingCylinder);
                    landingCylinder = null;
                    clearInterval(landingAnimation);
                    controlsEnabled = true;
                }
            }, 16);
            
            // Smooth camera transition to final position with better easing
            gsap.to(camera.position, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 15,
                ease: 'power3.out',
                onUpdate: () => {
                    // During transition, gradually face forward
                    camera.lookAt(0, 0, 0);
                },
                onComplete: () => {
                    // Once at final position, face forward towards horizon
                    camera.lookAt(0, 0, -100);
                }
            });
            
            playSound('active');
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
                
                // Check for cube face clicks (higher priority in OmniSense mode)
                if (omniSenseMode && omniSenseCube) {
                    const cubeIntersects = raycaster.intersectObjects(cubeFaces, false);
                    if (cubeIntersects.length > 0) {
                        const clickedFace = cubeIntersects[0].object;
                        if (clickedFace.userData.type === 'cube-face') {
                            handleCubeFaceClick(clickedFace);
                            playSound('active');
                            return; // Don't process other clicks
                        }
                    }
                }

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
            
            // Info Section Toggle
            const infoToggle = document.getElementById('info-toggle');
            const infoContent = document.getElementById('info-content');
            const infoArrow = document.getElementById('info-arrow');
            
            if (infoToggle && infoContent && infoArrow) {
                infoToggle.addEventListener('click', () => {
                    const isExpanded = infoContent.style.display !== 'none';
                    
                    if (isExpanded) {
                        // Collapse
                        infoContent.style.display = 'none';
                        infoArrow.style.transform = 'rotate(0deg)';
                        infoArrow.textContent = '▶';
                        infoToggle.querySelector('span:last-child').textContent = 'Click to expand';
                    } else {
                        // Expand
                        infoContent.style.display = 'block';
                        infoArrow.style.transform = 'rotate(90deg)';
                        infoArrow.textContent = '▼';
                        infoToggle.querySelector('span:last-child').textContent = 'Click to collapse';
                    }
                    playSound('passive');
                });
            }
            
            // MySpace Panel Setup
            const myspacePanel = document.getElementById('myspace-panel');
            const myspaceHeader = document.getElementById('myspace-panel-header');
            const myspaceMinimizeBtn = document.getElementById('myspace-minimize-btn');
            const myspaceCloseBtn = document.getElementById('myspace-close-btn');
            
            if (myspacePanel && myspaceHeader && myspaceMinimizeBtn && myspaceCloseBtn) {
                // Minimize
                myspaceMinimizeBtn.addEventListener('click', () => {
                    myspacePanel.classList.toggle('minimized');
                    const content = document.getElementById('myspace-panel-content');
                    if (content) {
                        content.classList.toggle('hidden');
                    }
                    myspaceMinimizeBtn.textContent = myspacePanel.classList.contains('minimized') ? '□' : '_';
                });
                
                // Close
                myspaceCloseBtn.addEventListener('click', () => {
                    myspacePanel.style.display = 'none';
                    playSound('passive');
                });
                
                // Drag
                let myspaceDragging = false;
                let myspaceDragStartX, myspaceDragStartY;
                
                myspaceHeader.addEventListener('mousedown', (e) => {
                    myspaceDragging = true;
                    myspaceDragStartX = e.clientX - myspacePanel.offsetLeft;
                    myspaceDragStartY = e.clientY - myspacePanel.offsetTop;
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (myspaceDragging) {
                        myspacePanel.style.left = (e.clientX - myspaceDragStartX) + 'px';
                        myspacePanel.style.top = (e.clientY - myspaceDragStartY) + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    myspaceDragging = false;
                    myspaceResizing = false;
                });
                
                // Resize
                const myspaceResizeHandle = document.getElementById('myspace-resize-handle');
                let myspaceResizing = false;
                let myspaceResizeStartX, myspaceResizeStartY, myspaceResizeStartWidth, myspaceResizeStartHeight;
                
                if (myspaceResizeHandle) {
                    myspaceResizeHandle.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        myspaceResizing = true;
                        myspaceResizeStartX = e.clientX;
                        myspaceResizeStartY = e.clientY;
                        myspaceResizeStartWidth = myspacePanel.offsetWidth;
                        myspaceResizeStartHeight = myspacePanel.offsetHeight;
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (myspaceResizing) {
                            const newWidth = myspaceResizeStartWidth + (e.clientX - myspaceResizeStartX);
                            const newHeight = myspaceResizeStartHeight + (e.clientY - myspaceResizeStartY);
                            myspacePanel.style.width = Math.max(320, newWidth) + 'px';
                            myspacePanel.style.maxHeight = Math.max(200, newHeight) + 'px';
                        }
                    });
                }
                
                // Summon/DeSummon Toggle
                const summonBtn = document.getElementById('summon-toggle-btn');
                let myspaceSummoned = true;
                
                if (summonBtn) {
                    summonBtn.addEventListener('click', () => {
                        myspaceSummoned = !myspaceSummoned;
                        summonBtn.classList.toggle('active');
                        summonBtn.textContent = myspaceSummoned ? '✓ SUMMONED' : '✗ DESUMMONED';
                        
                        // Toggle MySpace grid visibility
                        if (mySpaceGroup) {
                            mySpaceGroup.visible = myspaceSummoned;
                        }
                        playSound('active');
                    });
                }
                
                // MyZone Toggle
                const myzoneBtn = document.getElementById('myzone-toggle-btn');
                let myzoneActive = false;
                
                if (myzoneBtn) {
                    myzoneBtn.addEventListener('click', () => {
                        myzoneActive = !myzoneActive;
                        myzoneBtn.classList.toggle('active');
                        myzoneBtn.textContent = myzoneActive ? '🔒 LOCKED' : 'LOCK TO VIEW';
                        
                        window.myzoneLocked = myzoneActive;
                        playSound('active');
                    });
                }
                
                // Orbit Controls Panel Handlers
                const orbitPanel = document.getElementById('orbit-controls-panel');
                const orbitHeader = document.getElementById('orbit-panel-header');
                const orbitMinimizeBtn = document.getElementById('orbit-minimize-btn');
                const orbitCloseBtn = document.getElementById('orbit-close-btn');
                
                if (orbitPanel && orbitHeader && orbitMinimizeBtn && orbitCloseBtn) {
                    // Minimize
                    orbitMinimizeBtn.addEventListener('click', () => {
                        orbitPanel.classList.toggle('minimized');
                        const content = document.getElementById('orbit-panel-content');
                        if (content) {
                            content.classList.toggle('hidden');
                        }
                        orbitMinimizeBtn.textContent = orbitPanel.classList.contains('minimized') ? '□' : '_';
                    });
                    
                    // Close
                    orbitCloseBtn.addEventListener('click', () => {
                        orbitPanel.style.display = 'none';
                        playSound('passive');
                    });
                    
                    // Drag
                    let orbitDragging = false;
                    let orbitDragStartX, orbitDragStartY;
                    
                    orbitHeader.addEventListener('mousedown', (e) => {
                        orbitDragging = true;
                        orbitDragStartX = e.clientX - orbitPanel.offsetLeft;
                        orbitDragStartY = e.clientY - orbitPanel.offsetTop;
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (orbitDragging) {
                            orbitPanel.style.left = (e.clientX - orbitDragStartX) + 'px';
                            orbitPanel.style.top = (e.clientY - orbitDragStartY) + 'px';
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        orbitDragging = false;
                        orbitResizing = false;
                    });
                    
                    // Resize
                    const orbitResizeHandle = orbitPanel.querySelector('.resize-handle');
                    let orbitResizing = false;
                    let orbitResizeStartX, orbitResizeStartY, orbitResizeStartWidth, orbitResizeStartHeight;
                    
                    if (orbitResizeHandle) {
                        orbitResizeHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            orbitResizing = true;
                            orbitResizeStartX = e.clientX;
                            orbitResizeStartY = e.clientY;
                            orbitResizeStartWidth = orbitPanel.offsetWidth;
                            orbitResizeStartHeight = orbitPanel.offsetHeight;
                        });
                        
                        document.addEventListener('mousemove', (e) => {
                            if (orbitResizing) {
                                const newWidth = orbitResizeStartWidth + (e.clientX - orbitResizeStartX);
                                const newHeight = orbitResizeStartHeight + (e.clientY - orbitResizeStartY);
                                orbitPanel.style.width = Math.max(320, newWidth) + 'px';
                                orbitPanel.style.maxHeight = Math.max(200, newHeight) + 'px';
                            }
                        });
                    }
                }
                
                // Particle Behavior Panel Handlers
                const particlePanel = document.getElementById('particle-behavior-panel');
                const particleHeader = document.getElementById('particle-behavior-header');
                const particleMinimizeBtn = document.getElementById('particle-minimize-btn');
                const particleCloseBtn = document.getElementById('particle-close-btn');
                
                if (particlePanel && particleHeader && particleMinimizeBtn && particleCloseBtn) {
                    // Minimize
                    particleMinimizeBtn.addEventListener('click', () => {
                        particlePanel.classList.toggle('minimized');
                        const content = document.getElementById('particle-panel-content');
                        if (content) {
                            content.classList.toggle('hidden');
                        }
                        particleMinimizeBtn.textContent = particlePanel.classList.contains('minimized') ? '□' : '_';
                    });
                    
                    // Close
                    particleCloseBtn.addEventListener('click', () => {
                        particlePanel.style.display = 'none';
                        playSound('passive');
                    });
                    
                    // Drag
                    let particleDragging = false;
                    let particleDragStartX, particleDragStartY;
                    
                    particleHeader.addEventListener('mousedown', (e) => {
                        particleDragging = true;
                        particleDragStartX = e.clientX - particlePanel.offsetLeft;
                        particleDragStartY = e.clientY - particlePanel.offsetTop;
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (particleDragging) {
                            particlePanel.style.left = (e.clientX - particleDragStartX) + 'px';
                            particlePanel.style.top = (e.clientY - particleDragStartY) + 'px';
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        particleDragging = false;
                        particleResizing = false;
                    });
                    
                    // Resize
                    const particleResizeHandle = particlePanel.querySelector('.resize-handle');
                    let particleResizing = false;
                    let particleResizeStartX, particleResizeStartY, particleResizeStartWidth, particleResizeStartHeight;
                    
                    if (particleResizeHandle) {
                        particleResizeHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            particleResizing = true;
                            particleResizeStartX = e.clientX;
                            particleResizeStartY = e.clientY;
                            particleResizeStartWidth = particlePanel.offsetWidth;
                            particleResizeStartHeight = particlePanel.offsetHeight;
                        });
                        
                        document.addEventListener('mousemove', (e) => {
                            if (particleResizing) {
                                const newWidth = particleResizeStartWidth + (e.clientX - particleResizeStartX);
                                const newHeight = particleResizeStartHeight + (e.clientY - particleResizeStartY);
                                particlePanel.style.width = Math.max(320, newWidth) + 'px';
                                particlePanel.style.maxHeight = Math.max(200, newHeight) + 'px';
                            }
                        });
                    }
                }
                
                // User Controls Panel Handlers
                const userPanel = document.getElementById('user-controls-panel');
                const userHeader = document.getElementById('user-panel-header');
                const userMinimizeBtn = document.getElementById('user-minimize-btn');
                const userCloseBtn = document.getElementById('user-close-btn');
                
                if (userPanel && userHeader && userMinimizeBtn && userCloseBtn) {
                    // Minimize
                    userMinimizeBtn.addEventListener('click', () => {
                        userPanel.classList.toggle('minimized');
                        const content = document.getElementById('user-panel-content');
                        if (content) {
                            content.classList.toggle('hidden');
                        }
                        userMinimizeBtn.textContent = userPanel.classList.contains('minimized') ? '□' : '_';
                    });
                    
                    // Close
                    userCloseBtn.addEventListener('click', () => {
                        userPanel.style.display = 'none';
                        playSound('passive');
                    });
                    
                    // Drag
                    let userDragging = false;
                    let userDragStartX, userDragStartY;
                    
                    userHeader.addEventListener('mousedown', (e) => {
                        userDragging = true;
                        userDragStartX = e.clientX - userPanel.offsetLeft;
                        userDragStartY = e.clientY - userPanel.offsetTop;
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (userDragging) {
                            userPanel.style.left = (e.clientX - userDragStartX) + 'px';
                            userPanel.style.top = (e.clientY - userDragStartY) + 'px';
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        userDragging = false;
                        userResizing = false;
                    });
                    
                    // Resize
                    const userResizeHandle = userPanel.querySelector('.resize-handle');
                    let userResizing = false;
                    let userResizeStartX, userResizeStartY, userResizeStartWidth, userResizeStartHeight;
                    
                    if (userResizeHandle) {
                        userResizeHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            userResizing = true;
                            userResizeStartX = e.clientX;
                            userResizeStartY = e.clientY;
                            userResizeStartWidth = userPanel.offsetWidth;
                            userResizeStartHeight = userPanel.offsetHeight;
                        });
                        
                        document.addEventListener('mousemove', (e) => {
                            if (userResizing) {
                                const newWidth = userResizeStartWidth + (e.clientX - userResizeStartX);
                                const newHeight = userResizeStartHeight + (e.clientY - userResizeStartY);
                                userPanel.style.width = Math.max(320, newWidth) + 'px';
                                userPanel.style.maxHeight = Math.max(200, newHeight) + 'px';
                            }
                        });
                    }
                }
                
                // Default Space Panel Handlers
                const defaultSpacePanel = document.getElementById('default-space-panel');
                const defaultSpaceHeader = document.getElementById('default-space-header');
                const defaultSpaceMinimizeBtn = document.getElementById('default-space-minimize-btn');
                const defaultSpaceCloseBtn = document.getElementById('default-space-close-btn');
                
                if (defaultSpacePanel && defaultSpaceHeader && defaultSpaceMinimizeBtn && defaultSpaceCloseBtn) {
                    // Minimize
                    defaultSpaceMinimizeBtn.addEventListener('click', () => {
                        defaultSpacePanel.classList.toggle('minimized');
                        const content = document.getElementById('default-space-content');
                        if (content) {
                            content.classList.toggle('hidden');
                        }
                        defaultSpaceMinimizeBtn.textContent = defaultSpacePanel.classList.contains('minimized') ? '□' : '_';
                    });
                    
                    // Close
                    defaultSpaceCloseBtn.addEventListener('click', () => {
                        defaultSpacePanel.style.display = 'none';
                        playSound('passive');
                    });
                    
                    // Drag
                    let defaultSpaceDragging = false;
                    let defaultSpaceDragStartX, defaultSpaceDragStartY;
                    
                    defaultSpaceHeader.addEventListener('mousedown', (e) => {
                        defaultSpaceDragging = true;
                        defaultSpaceDragStartX = e.clientX - defaultSpacePanel.offsetLeft;
                        defaultSpaceDragStartY = e.clientY - defaultSpacePanel.offsetTop;
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (defaultSpaceDragging) {
                            defaultSpacePanel.style.left = (e.clientX - defaultSpaceDragStartX) + 'px';
                            defaultSpacePanel.style.top = (e.clientY - defaultSpaceDragStartY) + 'px';
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        defaultSpaceDragging = false;
                        defaultSpaceResizing = false;
                    });
                    
                    // Resize
                    const defaultSpaceResizeHandle = defaultSpacePanel.querySelector('.resize-handle');
                    let defaultSpaceResizing = false;
                    let defaultSpaceResizeStartX, defaultSpaceResizeStartY, defaultSpaceResizeStartWidth, defaultSpaceResizeStartHeight;
                    
                    if (defaultSpaceResizeHandle) {
                        defaultSpaceResizeHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            defaultSpaceResizing = true;
                            defaultSpaceResizeStartX = e.clientX;
                            defaultSpaceResizeStartY = e.clientY;
                            defaultSpaceResizeStartWidth = defaultSpacePanel.offsetWidth;
                            defaultSpaceResizeStartHeight = defaultSpacePanel.offsetHeight;
                        });
                        
                        document.addEventListener('mousemove', (e) => {
                            if (defaultSpaceResizing) {
                                const newWidth = defaultSpaceResizeStartWidth + (e.clientX - defaultSpaceResizeStartX);
                                const newHeight = defaultSpaceResizeStartHeight + (e.clientY - defaultSpaceResizeStartY);
                                defaultSpacePanel.style.width = Math.max(320, newWidth) + 'px';
                                defaultSpacePanel.style.maxHeight = Math.max(200, newHeight) + 'px';
                            }
                        });
                    }
                    
                    // Dark/Light Mode Checkboxes
                    const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
                    const lightModeCheckbox = document.getElementById('light-mode-checkbox');
                    
                    if (darkModeCheckbox && lightModeCheckbox) {
                        darkModeCheckbox.addEventListener('change', () => {
                            if (darkModeCheckbox.checked) {
                                lightModeCheckbox.checked = false;
                            }
                        });
                        
                        lightModeCheckbox.addEventListener('change', () => {
                            if (lightModeCheckbox.checked) {
                                darkModeCheckbox.checked = false;
                            }
                        });
                    }
                    
                    // Skybox file input
                    const skyboxFileInput = document.getElementById('skybox-file-input');
                    const skyboxFilename = document.getElementById('skybox-filename');
                    
                    if (skyboxFileInput && skyboxFilename) {
                        skyboxFileInput.addEventListener('change', (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                skyboxFilename.textContent = file.name;
                            } else {
                                skyboxFilename.textContent = 'No file selected';
                            }
                        });
                    }
                    
                    // Remove skybox button
                    const removeSkyboxBtn = document.getElementById('remove-skybox-btn');
                    if (removeSkyboxBtn) {
                        removeSkyboxBtn.addEventListener('click', () => {
                            if (skyboxFileInput) {
                                skyboxFileInput.value = '';
                                skyboxFilename.textContent = 'No file selected';
                            }
                            // Remove skybox from scene
                            if (skyboxMesh && scene) {
                                scene.remove(skyboxMesh);
                                if (skyboxMesh.geometry) skyboxMesh.geometry.dispose();
                                if (skyboxMesh.material) {
                                    if (skyboxMesh.material.map) skyboxMesh.material.map.dispose();
                                    skyboxMesh.material.dispose();
                                }
                                skyboxMesh = null;
                                console.log('Skybox removed');
                            }
                            playSound('passive');
                        });
                    }
                }
                
                // UPDATE BUTTON HANDLERS
                
                // Slider value update handlers
                const sliderHandlers = [
                    { slider: 'particle-count-slider', display: 'particle-count-value' },
                    { slider: 'particle-size-slider', display: 'particle-size-value', decimals: 1 },
                    { slider: 'particle-x-range', display: 'particle-x-range-value' },
                    { slider: 'particle-y-range', display: 'particle-y-range-value' },
                    { slider: 'particle-z-range', display: 'particle-z-range-value' },
                    { slider: 'particle-speed-slider', display: 'particle-speed-value', decimals: 1 },
                    { slider: 'particle-opacity-slider', display: 'particle-opacity-value', isPercent: true },
                    { slider: 'user-move-speed', display: 'user-move-speed-value', decimals: 1 },
                    { slider: 'user-jump-speed', display: 'user-jump-speed-value', decimals: 1 },
                    { slider: 'user-sprint-mult', display: 'user-sprint-mult-value', decimals: 1, suffix: 'x' },
                    { slider: 'user-gravity', display: 'user-gravity-value', decimals: 1 },
                    { slider: 'user-look-sens', display: 'user-look-sens-value', decimals: 4 }
                ];
                
                sliderHandlers.forEach(({ slider, display, decimals = 0, isPercent = false, suffix = '' }) => {
                    const sliderEl = document.getElementById(slider);
                    const displayEl = document.getElementById(display);
                    if (sliderEl && displayEl) {
                        sliderEl.addEventListener('input', (e) => {
                            let value = parseFloat(e.target.value);
                            if (isPercent) {
                                displayEl.textContent = Math.round(value * 100) + '%';
                            } else {
                                displayEl.textContent = value.toFixed(decimals) + suffix;
                            }
                        });
                    }
                });
                
                // Particle Behavior Update Button
                const particleUpdateBtn = document.getElementById('particle-update-btn');
                if (particleUpdateBtn) {
                    particleUpdateBtn.addEventListener('click', () => {
                        // Get all particle settings
                        const count = parseInt(document.getElementById('particle-count-slider')?.value || 5000);
                        const size = parseFloat(document.getElementById('particle-size-slider')?.value || 1);
                        const color = document.getElementById('particle-color-picker')?.value || '#ffffff';
                        const xRange = parseInt(document.getElementById('particle-x-range')?.value || 100);
                        const yRange = parseInt(document.getElementById('particle-y-range')?.value || 100);
                        const zRange = parseInt(document.getElementById('particle-z-range')?.value || 100);
                        const speed = parseFloat(document.getElementById('particle-speed-slider')?.value || 1);
                        const opacity = parseFloat(document.getElementById('particle-opacity-slider')?.value || 0.8);
                        
                        console.log('Updating particles:', { count, size, color, xRange, yRange, zRange, speed, opacity });
                        
                        // Update global variables
                        particleSize = size;
                        particleColor = parseInt(color.replace('#', '0x'));
                        particleXRange = xRange;
                        particleYRange = yRange;
                        particleZRange = zRange;
                        particleSpeed = speed;
                        particleOpacity = opacity;
                        
                        // Update particle material color, size, and opacity
                        if (particleSystem && particleSystem.material) {
                            particleSystem.material.color.setStyle(color);
                            particleSystem.material.size = size * 0.05;
                            particleSystem.material.opacity = opacity;
                            particleSystem.material.needsUpdate = true;
                        }
                        
                        // Update particle velocities based on axis ranges and speed
                        if (particleVelocities) {
                            const speedFactor = speed * 0.02;
                            for (let i = 0; i < particleVelocities.length; i += 3) {
                                particleVelocities[i] = (Math.random() - 0.5) * (xRange / 100) * speedFactor;
                                particleVelocities[i + 1] = (Math.random() - 0.5) * (yRange / 100) * speedFactor;
                                particleVelocities[i + 2] = (Math.random() - 0.5) * (zRange / 100) * speedFactor;
                            }
                        }
                        
                        playSound('active');
                    });
                }
                
                // Orbit Controls Update Button
                const orbitUpdateBtn = document.getElementById('orbit-update-btn');
                if (orbitUpdateBtn) {
                    orbitUpdateBtn.addEventListener('click', () => {
                        console.log('Updating orbit controls...');
                        
                        // Apply updates (implement actual orbit controls updates here)
                        playSound('active');
                        alert('Orbit controls updated!');
                    });
                }
                
                // User Controls Update Button
                const userUpdateBtn = document.getElementById('user-update-btn');
                if (userUpdateBtn) {
                    userUpdateBtn.addEventListener('click', () => {
                        moveSpeed = parseFloat(document.getElementById('user-move-speed')?.value || 0.2);
                        jumpSpeed = parseFloat(document.getElementById('user-jump-speed')?.value || 1);
                        sprintMultiplier = parseFloat(document.getElementById('user-sprint-mult')?.value || 2);
                        userGravity = parseFloat(document.getElementById('user-gravity')?.value || 0.5);
                        lookSensitivity = parseFloat(document.getElementById('user-look-sens')?.value || 0.002);
                        
                        console.log('User controls updated:', { moveSpeed, jumpSpeed, sprintMultiplier, userGravity, lookSensitivity });
                        
                        playSound('active');
                    });
                }
                
                // God Mode Toggle
                const godmodeBtn = document.getElementById('user-godmode-btn');
                if (godmodeBtn) {
                    godmodeBtn.addEventListener('click', () => {
                        godMode = !godMode;
                        godmodeBtn.classList.toggle('active');
                        godmodeBtn.textContent = godMode ? '✓ GOD MODE ON' : 'GOD MODE OFF';
                        
                        if (godMode) {
                            // Apply God Mode settings
                            moveSpeed = 10;
                            userGravity = 0;
                            document.getElementById('user-move-speed').value = '10';
                            document.getElementById('user-move-speed-value').textContent = '10.0';
                            document.getElementById('user-gravity').value = '0';
                            document.getElementById('user-gravity-value').textContent = '0';
                            console.log('God Mode ON - moveSpeed:', moveSpeed, 'gravity:', userGravity);
                        } else {
                            // Reset to defaults
                            moveSpeed = 0.2;
                            userGravity = 0.5;
                            document.getElementById('user-move-speed').value = '0.2';
                            document.getElementById('user-move-speed-value').textContent = '0.2';
                            document.getElementById('user-gravity').value = '0.5';
                            document.getElementById('user-gravity-value').textContent = '0.5';
                            console.log('God Mode OFF - moveSpeed:', moveSpeed, 'gravity:', userGravity);
                        }
                        
                        playSound('active');
                    });
                }
                
                // Default Space Update Button
                const defaultSpaceUpdateBtn = document.getElementById('default-space-update-btn');
                if (defaultSpaceUpdateBtn) {
                    defaultSpaceUpdateBtn.addEventListener('click', () => {
                        const darkMode = document.getElementById('dark-mode-checkbox')?.checked;
                        const lightMode = document.getElementById('light-mode-checkbox')?.checked;
                        const bgColor = document.getElementById('default-bg-color-picker')?.value || '#a1a1a1';
                        const gridColor = document.getElementById('grid-color-picker')?.value || '#ffffff';
                        const skyboxFile = document.getElementById('skybox-file-input')?.files[0];
                        
                        console.log('Updating default space:', { darkMode, lightMode, bgColor, gridColor, skyboxFile });
                        
                        // Apply background color
                        if (scene) {
                            scene.background = new THREE.Color(bgColor);
                        }
                        
                        // Apply grid color
                        if (gridHelper) {
                            gridHelper.material.color.setStyle(gridColor);
                        }
                        
                        // Handle skybox if file is selected
                        if (skyboxFile) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                const isVideo = skyboxFile.type.startsWith('video/');
                                
                                if (isVideo) {
                                    // Create video texture
                                    const video = document.createElement('video');
                                    video.src = e.target.result;
                                    video.loop = true;
                                    video.muted = true;
                                    video.play();
                                    
                                    const videoTexture = new THREE.VideoTexture(video);
                                    videoTexture.minFilter = THREE.LinearFilter;
                                    videoTexture.magFilter = THREE.LinearFilter;
                                    
                                    // Remove old skybox if exists
                                    if (skyboxMesh) {
                                        scene.remove(skyboxMesh);
                                    }
                                    
                                    // Create sphere for video skybox
                                    const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);
                                    const skyboxMaterial = new THREE.MeshBasicMaterial({
                                        map: videoTexture,
                                        side: THREE.BackSide
                                    });
                                    skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
                                    scene.add(skyboxMesh);
                                    
                                    console.log('Video skybox loaded:', skyboxFile.name);
                                } else {
                                    // Create image texture
                                    const textureLoader = new THREE.TextureLoader();
                                    textureLoader.load(e.target.result, (texture) => {
                                        // Remove old skybox if exists
                                        if (skyboxMesh) {
                                            scene.remove(skyboxMesh);
                                        }
                                        
                                        // Create sphere for image skybox
                                        const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);
                                        const skyboxMaterial = new THREE.MeshBasicMaterial({
                                            map: texture,
                                            side: THREE.BackSide
                                        });
                                        skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
                                        scene.add(skyboxMesh);
                                        
                                        console.log('Image skybox loaded:', skyboxFile.name);
                                    });
                                }
                            };
                            reader.readAsDataURL(skyboxFile);
                        }
                        
                        playSound('active');
                    });
                }
                
                // Rotation Controls
                const rotateUpBtn = document.getElementById('rotate-up-btn');
                const rotateDownBtn = document.getElementById('rotate-down-btn');
                const rotateLeftBtn = document.getElementById('rotate-left-btn');
                const rotateRightBtn = document.getElementById('rotate-right-btn');
                
                if (rotateUpBtn) {
                    rotateUpBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            gsap.to(mySpaceGroup.rotation, {
                                duration: 0.6,
                                x: mySpaceGroup.rotation.x + Math.PI / 4,
                                ease: 'power2.inOut'
                            });
                        }
                        playSound('passive');
                    });
                }
                
                if (rotateDownBtn) {
                    rotateDownBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            gsap.to(mySpaceGroup.rotation, {
                                duration: 0.6,
                                x: mySpaceGroup.rotation.x - Math.PI / 4,
                                ease: 'power2.inOut'
                            });
                        }
                        playSound('passive');
                    });
                }
                
                if (rotateLeftBtn) {
                    rotateLeftBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            gsap.to(mySpaceGroup.rotation, {
                                duration: 0.6,
                                y: mySpaceGroup.rotation.y - Math.PI / 4,
                                ease: 'power2.inOut'
                            });
                        }
                        playSound('passive');
                    });
                }
                
                if (rotateRightBtn) {
                    rotateRightBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            gsap.to(mySpaceGroup.rotation, {
                                duration: 0.6,
                                y: mySpaceGroup.rotation.y + Math.PI / 4,
                                ease: 'power2.inOut'
                            });
                        }
                        playSound('passive');
                    });
                }
                
                // Center Sphere Button
                const centerSphereBtn = document.getElementById('center-sphere-btn');
                
                if (centerSphereBtn) {
                    centerSphereBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            // Animate rotation back to zero (centered)
                            gsap.to(mySpaceGroup.rotation, {
                                duration: 0.8,
                                x: 0,
                                y: 0,
                                z: 0,
                                ease: 'power2.inOut'
                            });
                        }
                        playSound('active');
                    });
                }
                
                // Reset MySpace Button
                const resetMyspaceBtn = document.getElementById('reset-myspace-btn');
                
                if (resetMyspaceBtn) {
                    resetMyspaceBtn.addEventListener('click', () => {
                        if (mySpaceGroup) {
                            // Reset position and rotation
                            mySpaceGroup.position.set(0, 30, 0); // Position so sphere bottom is at y=0
                            mySpaceGroup.rotation.set(0, 0, 0);
                            
                            // Turn off MyZone lock if active
                            if (window.myzoneLocked) {
                                window.myzoneLocked = false;
                                const myzoneBtn = document.getElementById('myzone-toggle-btn');
                                if (myzoneBtn) {
                                    myzoneBtn.classList.remove('active');
                                    myzoneBtn.textContent = 'LOCK TO VIEW';
                                }
                            }
                        }
                        playSound('active');
                    });
                }
                
                // Sphere Auto-Rotation Checkboxes
                const sphereRotateXCheckbox = document.getElementById('sphere-rotate-x');
                const sphereRotateYCheckbox = document.getElementById('sphere-rotate-y');
                const sphereRotateZCheckbox = document.getElementById('sphere-rotate-z');
                
                if (sphereRotateXCheckbox) {
                    sphereRotateXCheckbox.addEventListener('change', (e) => {
                        sphereRotateX = e.target.checked;
                        playSound('passive');
                    });
                }
                
                if (sphereRotateYCheckbox) {
                    sphereRotateYCheckbox.addEventListener('change', (e) => {
                        sphereRotateY = e.target.checked;
                        playSound('passive');
                    });
                }
                
                if (sphereRotateZCheckbox) {
                    sphereRotateZCheckbox.addEventListener('change', (e) => {
                        sphereRotateZ = e.target.checked;
                        playSound('passive');
                    });
                }
                
                // Wallpaper Controls
                const wallpaperImageBtn = document.getElementById('wallpaper-image-btn');
                const wallpaperVideoBtn = document.getElementById('wallpaper-video-btn');
                const wallpaperDefaultBtn = document.getElementById('wallpaper-default-btn');
                const wallpaperUpload = document.getElementById('wallpaper-upload');
                const wallpaperUploadTrigger = document.getElementById('wallpaper-upload-trigger');
                const wallpaperPreview = document.getElementById('wallpaper-preview');
                
                let currentWallpaperMode = 'default';
                
                if (wallpaperImageBtn && wallpaperVideoBtn && wallpaperDefaultBtn) {
                    wallpaperImageBtn.addEventListener('click', () => {
                        currentWallpaperMode = 'image';
                        wallpaperImageBtn.classList.add('active');
                        wallpaperVideoBtn.classList.remove('active');
                        wallpaperDefaultBtn.classList.remove('active');
                        playSound('passive');
                    });
                    
                    wallpaperVideoBtn.addEventListener('click', () => {
                        currentWallpaperMode = 'video';
                        wallpaperVideoBtn.classList.add('active');
                        wallpaperImageBtn.classList.remove('active');
                        wallpaperDefaultBtn.classList.remove('active');
                        playSound('passive');
                    });
                    
                    wallpaperDefaultBtn.addEventListener('click', () => {
                        currentWallpaperMode = 'default';
                        wallpaperDefaultBtn.classList.add('active');
                        wallpaperImageBtn.classList.remove('active');
                        wallpaperVideoBtn.classList.remove('active');
                        
                        // Restore default gradient for panels
                        if (mySpaceGroup) {
                            mySpaceGroup.children.forEach(panel => {
                                if (panel.userData.type === 'myspace-sphere') {
                                    // Restore sphere's original gradient shader
                                    if (panel.material && panel.material.type !== 'ShaderMaterial') {
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
                                        panel.material = sphereMaterial;
                                    }
                                } else if (panel.material && panel.material.map) {
                                    panel.material.map = null;
                                    panel.material.needsUpdate = true;
                                }
                            });
                        }
                        wallpaperPreview.textContent = 'Current: Default Gradient';
                        playSound('passive');
                    });
                }
                
                if (wallpaperUploadTrigger && wallpaperUpload) {
                    wallpaperUploadTrigger.addEventListener('click', () => {
                        wallpaperUpload.click();
                    });
                    
                    wallpaperUpload.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            if (currentWallpaperMode === 'image') {
                                const texture = new THREE.TextureLoader().load(event.target.result);
                                texture.wrapS = THREE.RepeatWrapping;
                                texture.wrapT = THREE.RepeatWrapping;
                                
                                if (mySpaceGroup) {
                                    mySpaceGroup.children.forEach(panel => {
                                        if (panel.userData.type === 'myspace-sphere') {
                                            // Replace sphere shader with textured material
                                            panel.material = new THREE.MeshBasicMaterial({
                                                map: texture,
                                                side: THREE.BackSide
                                            });
                                        } else if (panel.material) {
                                            panel.material.map = texture;
                                            panel.material.needsUpdate = true;
                                        }
                                    });
                                }
                                wallpaperPreview.textContent = `Current: ${file.name}`;
                            } else if (currentWallpaperMode === 'video') {
                                const video = document.createElement('video');
                                video.src = event.target.result;
                                video.loop = true;
                                video.muted = true;
                                video.play();
                                
                                const videoTexture = new THREE.VideoTexture(video);
                                videoTexture.wrapS = THREE.RepeatWrapping;
                                videoTexture.wrapT = THREE.RepeatWrapping;
                                
                                if (mySpaceGroup) {
                                    mySpaceGroup.children.forEach(panel => {
                                        if (panel.userData.type === 'myspace-sphere') {
                                            // Replace sphere shader with video texture material
                                            panel.material = new THREE.MeshBasicMaterial({
                                                map: videoTexture,
                                                side: THREE.BackSide
                                            });
                                        } else if (panel.material) {
                                            panel.material.map = videoTexture;
                                            panel.material.needsUpdate = true;
                                        }
                                    });
                                }
                                wallpaperPreview.textContent = `Current: ${file.name} (Video)`;
                            }
                            playSound('active');
                        };
                        reader.readAsDataURL(file);
                    });
                }
            }
            
            // Help Panel Setup
            const helpPanel = document.getElementById('help-panel');
            const helpHeader = document.getElementById('help-panel-header');
            const helpMinimizeBtn = document.getElementById('help-minimize-btn');
            const helpCloseBtn = document.getElementById('help-close-btn');
            
            if (helpPanel && helpHeader && helpMinimizeBtn && helpCloseBtn) {
                // Minimize/Expand
                helpMinimizeBtn.addEventListener('click', () => {
                    helpPanel.classList.toggle('minimized');
                    const content = document.getElementById('help-panel-content');
                    if (content) {
                        content.classList.toggle('hidden');
                    }
                    helpMinimizeBtn.textContent = helpPanel.classList.contains('minimized') ? '□' : '_';
                    playSound('passive');
                });
                
                // Close
                helpCloseBtn.addEventListener('click', () => {
                    helpPanel.style.display = 'none';
                    playSound('passive');
                });
                
                // Drag
                let helpDragging = false;
                let helpDragStartX, helpDragStartY;
                
                helpHeader.addEventListener('mousedown', (e) => {
                    helpDragging = true;
                    helpDragStartX = e.clientX - helpPanel.offsetLeft;
                    helpDragStartY = e.clientY - helpPanel.offsetTop;
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (helpDragging) {
                        helpPanel.style.left = (e.clientX - helpDragStartX) + 'px';
                        helpPanel.style.top = (e.clientY - helpDragStartY) + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    helpDragging = false;
                });
            }
            
            // Cube Face Panel Setup
            const cubeFacePanel = document.getElementById('cube-face-panel');
            const cubeFaceHeader = document.getElementById('cube-face-panel-header');
            const cubeFaceMinimizeBtn = document.getElementById('cube-face-minimize-btn');
            const cubeFaceCloseBtn = document.getElementById('cube-face-close-btn');
            
            if (cubeFacePanel && cubeFaceHeader && cubeFaceMinimizeBtn && cubeFaceCloseBtn) {
                // Minimize/Expand
                cubeFaceMinimizeBtn.addEventListener('click', () => {
                    cubeFacePanel.classList.toggle('minimized');
                    const content = document.getElementById('cube-face-panel-content');
                    if (content) {
                        content.classList.toggle('hidden');
                    }
                    cubeFaceMinimizeBtn.textContent = cubeFacePanel.classList.contains('minimized') ? '□' : '_';
                    playSound('passive');
                });
                
                // Close
                cubeFaceCloseBtn.addEventListener('click', () => {
                    cubeFacePanel.style.display = 'none';
                    // Reset edge pulse speed
                    cubePulseSpeed = 1.0;
                    playSound('passive');
                });
                
                // Drag
                let cubeFaceDragging = false;
                let cubeFaceDragStartX, cubeFaceDragStartY;
                
                cubeFaceHeader.addEventListener('mousedown', (e) => {
                    cubeFaceDragging = true;
                    cubeFaceDragStartX = e.clientX - cubeFacePanel.offsetLeft;
                    cubeFaceDragStartY = e.clientY - cubeFacePanel.offsetTop;
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (cubeFaceDragging) {
                        cubeFacePanel.style.left = (e.clientX - cubeFaceDragStartX) + 'px';
                        cubeFacePanel.style.top = (e.clientY - cubeFaceDragStartY) + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    cubeFaceDragging = false;
                });
            }
            
            // Dock and Panel Drag System
            function initDockDragSystem() {
                const docks = ['dock-bottom', 'dock-top', 'dock-left', 'dock-right'];
                let draggedPanel = null;
                let draggedCube = null;
                let dockDropZones = [];
                
                // Get all panels that can be minimized
                const draggablePanels = [
                    'inspector-panel',
                    'help-panel',
                    'cube-face-panel',
                    'omnisense-panel',
                    'orbit-panel',
                    'particle-panel',
                    'user-panel',
                    'default-space-panel'
                ];
                
                // Make minimized panels draggable
                draggablePanels.forEach(panelId => {
                    const panel = document.getElementById(panelId);
                    const minimizeBtn = document.getElementById(panelId.replace('-panel', '-minimize-btn'));
                    
                    if (panel && minimizeBtn) {
                        // When minimized, make panel draggable
                        minimizeBtn.addEventListener('click', () => {
                            setTimeout(() => {
                                if (panel.classList.contains('minimized')) {
                                    enablePanelDragging(panel);
                                } else {
                                    disablePanelDragging(panel);
                                }
                            }, 100);
                        });
                    }
                });
                
                function enablePanelDragging(panel) {
                    const header = panel.querySelector('.panel-header');
                    if (!header) return;
                    
                    // Visual feedback
                    panel.style.cursor = 'grab';
                    panel.style.border = '2px dashed rgba(0, 102, 255, 0.5)';
                    
                    // Make it absolute positioned for dragging
                    if (panel.style.position !== 'fixed') {
                        panel.style.position = 'fixed';
                    }
                    
                    header.draggable = true;
                    
                    header.addEventListener('dragstart', (e) => {
                        draggedPanel = panel;
                        panel.style.opacity = '0.5';
                        panel.style.cursor = 'grabbing';
                        
                        // Store panel info
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/html', panel.innerHTML);
                        
                        // Highlight drop zones (docks that are visible)
                        highlightDropZones();
                    });
                    
                    header.addEventListener('dragend', (e) => {
                        panel.style.opacity = '1';
                        panel.style.cursor = 'grab';
                        draggedPanel = null;
                        
                        // Remove highlights
                        removeDropZoneHighlights();
                    });
                }
                
                function disablePanelDragging(panel) {
                    const header = panel.querySelector('.panel-header');
                    if (!header) return;
                    
                    panel.style.cursor = 'default';
                    panel.style.border = '2px solid rgba(0, 102, 255, 0.5)';
                    header.draggable = false;
                }
                
                function highlightDropZones() {
                    docks.forEach(dockId => {
                        const dock = document.getElementById(dockId);
                        if (dock && !dock.classList.contains('hidden')) {
                            dock.style.background = 'rgba(0, 102, 255, 0.3)';
                            dock.style.border = '2px solid rgba(0, 255, 0, 0.8)';
                            dock.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
                        }
                    });
                }
                
                function removeDropZoneHighlights() {
                    docks.forEach(dockId => {
                        const dock = document.getElementById(dockId);
                        if (dock) {
                            dock.style.background = '';
                            dock.style.border = '';
                            dock.style.boxShadow = '';
                        }
                    });
                }
                
                // Set up drop zones on docks
                docks.forEach(dockId => {
                    const dock = document.getElementById(dockId);
                    if (!dock) return;
                    
                    dock.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        
                        // Extra highlight on hover
                        dock.style.background = 'rgba(0, 255, 0, 0.4)';
                    });
                    
                    dock.addEventListener('dragleave', (e) => {
                        // Restore normal highlight
                        dock.style.background = 'rgba(0, 102, 255, 0.3)';
                    });
                    
                    dock.addEventListener('drop', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (draggedPanel) {
                            // Create dock cube from panel
                            createDockCube(draggedPanel, dock);
                            
                            // Hide the original panel
                            draggedPanel.style.display = 'none';
                            
                            playSound('active');
                        }
                        
                        removeDropZoneHighlights();
                    });
                });
                
                function createDockCube(panel, dock) {
                    // Get panel name
                    const panelTitle = panel.querySelector('.panel-header span')?.textContent || 'PANEL';
                    const panelId = panel.id;
                    
                    // Create cube element
                    const cube = document.createElement('div');
                    cube.className = 'dock-item dock-cube';
                    cube.setAttribute('data-panel-id', panelId);
                    cube.draggable = true; // Make cube draggable
                    cube.style.cssText = `
                        width: 50px;
                        height: 50px;
                        background: rgba(25, 25, 30, 0.95);
                        border: 1px solid rgba(0, 102, 255, 0.5);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: grab;
                        position: relative;
                        transition: all 0.3s;
                        margin: 4px;
                    `;
                    
                    // Add diagonal text
                    const text = document.createElement('div');
                    text.textContent = panelTitle.replace('⟐ ', '').substring(0, 8);
                    text.style.cssText = `
                        transform: rotate(-45deg);
                        font-size: 8px;
                        font-weight: 700;
                        color: rgba(255, 255, 255, 0.9);
                        letter-spacing: 0.5px;
                        font-family: 'Orbitron', sans-serif;
                        text-align: center;
                        line-height: 1.2;
                        word-break: break-word;
                        max-width: 40px;
                        pointer-events: none;
                    `;
                    
                    cube.appendChild(text);
                    
                    // Hover effect
                    cube.addEventListener('mouseenter', () => {
                        cube.style.transform = 'scale(1.1) rotate(5deg)';
                        cube.style.background = 'rgba(0, 102, 255, 0.3)';
                        cube.style.borderColor = 'rgba(0, 255, 0, 0.8)';
                    });
                    
                    cube.addEventListener('mouseleave', () => {
                        cube.style.transform = 'scale(1) rotate(0deg)';
                        cube.style.background = 'rgba(25, 25, 30, 0.95)';
                        cube.style.borderColor = 'rgba(0, 102, 255, 0.5)';
                    });
                    
                    // Double-click to restore panel (click is now reserved for dragging)
                    cube.addEventListener('dblclick', () => {
                        const restoredPanel = document.getElementById(panelId);
                        if (restoredPanel) {
                            restoredPanel.style.display = 'block';
                            restoredPanel.classList.remove('minimized');
                            const content = restoredPanel.querySelector('.panel-content');
                            if (content) {
                                content.style.display = 'block';
                            }
                            const minimizeBtn = restoredPanel.querySelector('.panel-btn');
                            if (minimizeBtn) {
                                minimizeBtn.textContent = '_';
                            }
                        }
                        
                        // Remove cube from dock
                        cube.remove();
                        
                        // Save state
                        saveDockState();
                        
                        playSound('active');
                    });
                    
                    // Add to dock
                    dock.appendChild(cube);
                    
                    // Save to localStorage
                    saveDockState();
                }
                
                function saveDockState() {
                    const dockState = {};
                    
                    docks.forEach(dockId => {
                        const dock = document.getElementById(dockId);
                        if (dock) {
                            const cubes = dock.querySelectorAll('.dock-cube');
                            dockState[dockId] = Array.from(cubes).map(cube => ({
                                panelId: cube.getAttribute('data-panel-id'),
                                text: cube.querySelector('div').textContent
                            }));
                        }
                    });
                    
                    localStorage.setItem('dockState', JSON.stringify(dockState));
                }
                
                function loadDockState() {
                    const savedState = localStorage.getItem('dockState');
                    if (!savedState) return;
                    
                    try {
                        const dockState = JSON.parse(savedState);
                        
                        Object.keys(dockState).forEach(dockId => {
                            const dock = document.getElementById(dockId);
                            const panelConfigs = dockState[dockId];
                            
                            panelConfigs.forEach(config => {
                                const panel = document.getElementById(config.panelId);
                                if (panel && dock) {
                                    createDockCube(panel, dock);
                                    panel.style.display = 'none';
                                }
                            });
                        });
                    } catch (e) {
                        console.error('Error loading dock state:', e);
                    }
                }
                
                // Load saved dock state on init
                loadDockState();
                
                // Auto-populate all panels into docks randomly (left and bottom only)
                function autoPopulatePanelsInDocks() {
                    // DISABLED: Manual cubes are now in HTML, auto-dock buttons handle docking
                    // No auto-population needed
                    return;
                }
                
                // Make dock cubes draggable OUT of docks
                function enableDockCubeDragging() {
                    // Use event delegation for dynamically created cubes
                    docks.forEach(dockId => {
                        const dock = document.getElementById(dockId);
                        if (!dock) return;
                        
                        dock.addEventListener('dragstart', (e) => {
                            if (e.target.classList.contains('dock-cube')) {
                                draggedCube = e.target;
                                e.target.style.opacity = '0.5';
                                e.dataTransfer.effectAllowed = 'move';
                                
                                // Allow dropping on document body (anywhere outside docks)
                                document.body.style.outline = '3px dashed rgba(0, 255, 0, 0.5)';
                            }
                        });
                        
                        dock.addEventListener('dragend', (e) => {
                            if (e.target.classList.contains('dock-cube')) {
                                e.target.style.opacity = '1';
                                document.body.style.outline = '';
                            }
                        });
                    });
                    
                    // Allow dropping cubes anywhere on the page
                    document.body.addEventListener('dragover', (e) => {
                        // Only allow if dragging a cube
                        if (draggedCube) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }
                    });
                    
                    document.body.addEventListener('drop', (e) => {
                        if (draggedCube) {
                            e.preventDefault();
                            
                            // Get panel ID from cube
                            const panelId = draggedCube.getAttribute('data-panel-id');
                            const panel = document.getElementById(panelId);
                            
                            if (panel) {
                                // Restore panel at drop position
                                panel.style.display = 'block';
                                panel.classList.remove('minimized');
                                panel.style.left = (e.clientX - 200) + 'px'; // Center on cursor
                                panel.style.top = (e.clientY - 30) + 'px';
                                
                                // Expand panel content
                                const content = panel.querySelector('.panel-content');
                                if (content) {
                                    content.style.display = 'block';
                                }
                                
                                // Update minimize button
                                const minimizeBtn = panel.querySelector('.panel-btn');
                                if (minimizeBtn && minimizeBtn.textContent === '□') {
                                    minimizeBtn.textContent = '_';
                                }
                            }
                            
                            // Remove cube from dock
                            draggedCube.remove();
                            draggedCube = null;
                            
                            // Save updated dock state
                            saveDockState();
                            
                            playSound('active');
                            document.body.style.outline = '';
                        }
                    });
                }
                
                // Initialize auto-population
                setTimeout(() => {
                    autoPopulatePanelsInDocks();
                    enableDockCubeDragging();
                }, 100);
            }
            
            // Initialize dock drag system
            initDockDragSystem();
            
            // Auto-Dock Button Handlers
            function setupAutoDockButton(panelId, dockBtnId, targetDockId) {
                const dockBtn = document.getElementById(dockBtnId);
                const panel = document.getElementById(panelId);
                
                if (dockBtn && panel) {
                    dockBtn.addEventListener('click', () => {
                        // Get target dock (default to bottom if not specified)
                        const dockId = targetDockId || 'dock-bottom';
                        const dock = document.getElementById(dockId);
                        
                        if (dock) {
                            // Check if dock is visible, if not open it
                            if (dock.classList.contains('hidden')) {
                                dock.classList.remove('hidden');
                            }
                            
                            // Create dock cube for this panel
                            const panelTitle = panel.querySelector('.panel-title')?.textContent || 'PANEL';
                            
                            const cube = document.createElement('div');
                            cube.className = 'dock-item dock-cube';
                            cube.setAttribute('data-panel-id', panelId);
                            cube.draggable = true;
                            cube.style.cssText = `
                                width: 50px;
                                height: 50px;
                                background: rgba(25, 25, 30, 0.95);
                                border: 1px solid rgba(0, 102, 255, 0.5);
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: grab;
                                position: relative;
                                transition: all 0.3s;
                                margin: 4px;
                            `;
                            
                            const text = document.createElement('div');
                            text.textContent = panelTitle.replace('⟐ ', '').replace('⟐?-', '').replace('⟐', '').substring(0, 8);
                            text.style.cssText = `
                                transform: rotate(-45deg);
                                font-size: 8px;
                                font-weight: 700;
                                color: rgba(255, 255, 255, 0.9);
                                letter-spacing: 0.5px;
                                font-family: 'Orbitron', sans-serif;
                                text-align: center;
                                line-height: 1.2;
                                word-break: break-word;
                                max-width: 40px;
                                pointer-events: none;
                            `;
                            
                            cube.appendChild(text);
                            
                            // Hover effects
                            cube.addEventListener('mouseenter', () => {
                                cube.style.transform = 'scale(1.1) rotate(5deg)';
                                cube.style.background = 'rgba(0, 102, 255, 0.3)';
                                cube.style.borderColor = 'rgba(0, 255, 0, 0.8)';
                            });
                            
                            cube.addEventListener('mouseleave', () => {
                                cube.style.transform = 'scale(1) rotate(0deg)';
                                cube.style.background = 'rgba(25, 25, 30, 0.95)';
                                cube.style.borderColor = 'rgba(0, 102, 255, 0.5)';
                            });
                            
                            // Double-click to restore
                            cube.addEventListener('dblclick', () => {
                                panel.style.display = 'block';
                                panel.classList.remove('minimized');
                                const content = panel.querySelector('.panel-content');
                                if (content) {
                                    content.style.display = 'block';
                                }
                                cube.remove();
                                playSound('active');
                            });
                            
                            // Add to dock
                            dock.appendChild(cube);
                            
                            // Hide panel
                            panel.style.display = 'none';
                            panel.classList.add('minimized');
                            
                            playSound('active');
                        }
                    });
                }
            }
            
            // Setup all auto-dock buttons
            setupAutoDockButton('inspector-panel', 'inspector-dock-btn', 'dock-left');
            setupAutoDockButton('help-panel', 'help-dock-btn', 'dock-right');
            setupAutoDockButton('particle-behavior-panel', 'particle-dock-btn', 'dock-bottom');
            setupAutoDockButton('orbit-controls-panel', 'orbit-dock-btn', 'dock-left');
            setupAutoDockButton('user-controls-panel', 'user-dock-btn', 'dock-left');
            setupAutoDockButton('default-space-panel', 'default-space-dock-btn', 'dock-left');
            setupAutoDockButton('cube-face-panel', 'cube-face-dock-btn', 'dock-bottom');
            setupAutoDockButton('omnisense-panel', 'omnisense-dock-btn', 'dock-bottom');
            
            // OmniSense Panel Setup
            const omniSensePanel = document.getElementById('omnisense-panel');
            const omniSenseHeader = document.getElementById('omnisense-panel-header');
            const omniSenseMinimizeBtn = document.getElementById('omnisense-minimize-btn');
            const omniSenseCloseBtn = document.getElementById('omnisense-close-btn');
            
            if (omniSensePanel && omniSenseHeader && omniSenseMinimizeBtn && omniSenseCloseBtn) {
                // Minimize/Expand
                omniSenseMinimizeBtn.addEventListener('click', () => {
                    omniSensePanel.classList.toggle('minimized');
                    const content = document.getElementById('omnisense-panel-content');
                    if (content) {
                        if (omniSensePanel.classList.contains('minimized')) {
                            content.style.display = 'none';
                            omniSensePanel.style.height = '60px';
                            omniSenseMinimizeBtn.textContent = '□';
                        } else {
                            content.style.display = 'block';
                            omniSensePanel.style.height = 'auto';
                            omniSenseMinimizeBtn.textContent = '_';
                        }
                    }
                    playSound('passive');
                });
                
                // Close
                omniSenseCloseBtn.addEventListener('click', () => {
                    omniSensePanel.style.display = 'none';
                    playSound('passive');
                });
                
                // Drag
                let omniSenseDragging = false;
                let omniSenseDragStartX, omniSenseDragStartY;
                
                omniSenseHeader.addEventListener('mousedown', (e) => {
                    // Only drag if not minimized or if dragging from non-button area
                    if (!e.target.classList.contains('panel-btn')) {
                        omniSenseDragging = true;
                        omniSenseDragStartX = e.clientX - omniSensePanel.offsetLeft;
                        omniSenseDragStartY = e.clientY - omniSensePanel.offsetTop;
                    }
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (omniSenseDragging) {
                        omniSensePanel.style.left = (e.clientX - omniSenseDragStartX) + 'px';
                        omniSensePanel.style.top = (e.clientY - omniSenseDragStartY) + 'px';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    omniSenseDragging = false;
                });
                
                // Camera Height Slider
                const heightSlider = document.getElementById('omnisense-height-slider');
                const heightValue = document.getElementById('omnisense-height-value');
                
                if (heightSlider && heightValue) {
                    heightSlider.addEventListener('input', (e) => {
                        const newHeight = parseInt(e.target.value);
                        heightValue.textContent = newHeight;
                        omniSenseCameraHeight = newHeight;
                        
                        // If in OmniSense mode, move camera
                        if (omniSenseMode) {
                            gsap.to(camera.position, {
                                duration: 0.5,
                                y: newHeight,
                                ease: 'power2.out'
                            });
                        }
                    });
                }
                
                // Grid Opacity Slider
                const gridOpacitySlider = document.getElementById('omnisense-grid-opacity-slider');
                const gridOpacityValue = document.getElementById('omnisense-grid-opacity-value');
                
                if (gridOpacitySlider && gridOpacityValue) {
                    gridOpacitySlider.addEventListener('input', (e) => {
                        const opacity = parseInt(e.target.value) / 100;
                        gridOpacityValue.textContent = e.target.value + '%';
                        
                        if (gridHelper) {
                            gridHelper.material.opacity = opacity;
                        }
                    });
                }
                
                // Rotation Speed Slider
                const rotationSpeedSlider = document.getElementById('omnisense-rotation-speed-slider');
                const rotationSpeedValue = document.getElementById('omnisense-rotation-speed-value');
                
                if (rotationSpeedSlider && rotationSpeedValue) {
                    rotationSpeedSlider.addEventListener('input', (e) => {
                        const speed = parseFloat(e.target.value);
                        rotationSpeedValue.textContent = speed.toFixed(1);
                        cubeRotationSpeed = speed * 0.001;
                    });
                }
                
                // Save State Button
                const saveStateBtn = document.getElementById('omnisense-save-state');
                if (saveStateBtn) {
                    saveStateBtn.addEventListener('click', () => {
                        const state = {
                            cameraHeight: omniSenseCameraHeight,
                            gridOpacity: gridHelper?.material.opacity || 0.6,
                            cubeRotationSpeed: cubeRotationSpeed,
                            cubeRotating: cubeRotating,
                            timestamp: Date.now()
                        };
                        
                        localStorage.setItem('omniSenseState', JSON.stringify(state));
                        playSound('active');
                        console.log('OmniSense state saved');
                    });
                }
                
                // Load State Button
                const loadStateBtn = document.getElementById('omnisense-load-state');
                if (loadStateBtn) {
                    loadStateBtn.addEventListener('click', () => {
                        const savedState = localStorage.getItem('omniSenseState');
                        if (savedState) {
                            try {
                                const state = JSON.parse(savedState);
                                
                                omniSenseCameraHeight = state.cameraHeight || 200;
                                cubeRotationSpeed = state.cubeRotationSpeed || 0.001;
                                cubeRotating = state.cubeRotating !== undefined ? state.cubeRotating : true;
                                
                                // Update UI
                                if (heightSlider) heightSlider.value = omniSenseCameraHeight;
                                if (heightValue) heightValue.textContent = omniSenseCameraHeight;
                                if (gridOpacitySlider) gridOpacitySlider.value = (state.gridOpacity || 0.6) * 100;
                                if (gridOpacityValue) gridOpacityValue.textContent = Math.round((state.gridOpacity || 0.6) * 100) + '%';
                                if (rotationSpeedSlider) rotationSpeedSlider.value = (cubeRotationSpeed * 1000).toFixed(1);
                                if (rotationSpeedValue) rotationSpeedValue.textContent = (cubeRotationSpeed * 1000).toFixed(1);
                                
                                // Apply to scene if in OmniSense mode
                                if (omniSenseMode) {
                                    gsap.to(camera.position, { duration: 1, y: omniSenseCameraHeight });
                                    if (gridHelper) gridHelper.material.opacity = state.gridOpacity || 0.6;
                                }
                                
                                playSound('active');
                                console.log('OmniSense state loaded');
                            } catch (e) {
                                console.error('Error loading OmniSense state:', e);
                            }
                        }
                    });
                }
                
                // Reset Button
                const resetBtn = document.getElementById('omnisense-reset');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        omniSenseCameraHeight = 200;
                        cubeRotationSpeed = 0.001;
                        cubeRotating = true;
                        
                        // Update UI
                        if (heightSlider) heightSlider.value = 200;
                        if (heightValue) heightValue.textContent = '200';
                        if (gridOpacitySlider) gridOpacitySlider.value = 60;
                        if (gridOpacityValue) gridOpacityValue.textContent = '60%';
                        if (rotationSpeedSlider) rotationSpeedSlider.value = 1;
                        if (rotationSpeedValue) rotationSpeedValue.textContent = '1.0';
                        
                        // Apply to scene
                        if (omniSenseMode) {
                            gsap.to(camera.position, { duration: 1, y: 200 });
                        }
                        if (gridHelper) gridHelper.material.opacity = 0.6;
                        
                        playSound('active');
                        console.log('OmniSense reset to defaults');
                    });
                }
            }
            
            // Chat Panel
            const chatPanel = document.getElementById('chat-panel');
            const chatClose = document.getElementById('chat-close');
            
            if (chatClose && chatPanel) {
                chatClose.addEventListener('click', () => {
                    chatPanel.style.display = 'none';
                    const btnChat = document.getElementById('btn-chat');
                    if (btnChat) {
                        btnChat.classList.remove('active');
                    }
                    playSound('passive');
                });
            }
            
            // Chat Panel Drag
            const chatPanelHeader = document.getElementById('chat-panel-header');
            if (chatPanelHeader && chatPanel) {
                let chatDragging = false;
                let chatDragStartX, chatDragStartY;
                
                chatPanelHeader.addEventListener('mousedown', (e) => {
                    chatDragging = true;
                    chatDragStartX = e.clientX - chatPanel.offsetLeft;
                    chatDragStartY = e.clientY - chatPanel.offsetTop;
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (chatDragging) {
                        chatPanel.style.left = (e.clientX - chatDragStartX) + 'px';
                        chatPanel.style.top = (e.clientY - chatDragStartY) + 'px';
                        chatPanel.style.bottom = 'auto';
                        chatPanel.style.right = 'auto';
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    chatDragging = false;
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
            
            // Performance optimization for mobile
            let lastJoystickUpdate = 0;
            const joystickThrottle = 16; // ~60fps max

            // Joystick touch/mouse controls
            joystickStick.addEventListener('mousedown', startJoystick);
            joystickStick.addEventListener('touchstart', startJoystick, { passive: false });

            function startJoystick(e) {
                e.preventDefault();
                joystickActive = true;
                const rect = joystickBase.getBoundingClientRect();
                joystickStartPos = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                document.addEventListener('mousemove', moveJoystick);
                document.addEventListener('touchmove', moveJoystick, { passive: false });
                document.addEventListener('mouseup', stopJoystick);
                document.addEventListener('touchend', stopJoystick);
            }

            function moveJoystick(e) {
                if (!joystickActive) return;
                
                // Throttle updates for performance on mobile
                const now = performance.now();
                if (now - lastJoystickUpdate < joystickThrottle) {
                    return;
                }
                lastJoystickUpdate = now;
                
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
            let lastTouchUpdate = 0;
            const touchThrottle = 16; // ~60fps max

            canvas.addEventListener('touchstart', (e) => {
                // Only handle single finger touch for camera look
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    touchStartX = touch.clientX;
                    touchStartY = touch.clientY;
                    isTouchLooking = true;
                }
            }, { passive: true });

            canvas.addEventListener('touchmove', (e) => {
                if (isTouchLooking && e.touches.length === 1) {
                    // Throttle for performance
                    const now = performance.now();
                    if (now - lastTouchUpdate < touchThrottle) {
                        return;
                    }
                    lastTouchUpdate = now;
                    
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

            // Setup RH Joystick
            const rhJoystickStick = document.getElementById('rh-joystick-stick');
            const rhJoystickBase = rhJoystickStick.parentElement;
            let rhJoystickActive = false;
            let rhJoystickStartPos = { x: 0, y: 0 };

            rhJoystickStick.addEventListener('mousedown', startRHJoystick);
            rhJoystickStick.addEventListener('touchstart', startRHJoystick, { passive: false });

            function startRHJoystick(e) {
                e.preventDefault();
                rhJoystickActive = true;
                const rect = rhJoystickBase.getBoundingClientRect();
                rhJoystickStartPos = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                document.addEventListener('mousemove', moveRHJoystick);
                document.addEventListener('touchmove', moveRHJoystick, { passive: false });
                document.addEventListener('mouseup', stopRHJoystick);
                document.addEventListener('touchend', stopRHJoystick);
            }

            function moveRHJoystick(e) {
                if (!rhJoystickActive) return;
                
                const now = performance.now();
                if (now - lastJoystickUpdate < joystickThrottle) {
                    return;
                }
                lastJoystickUpdate = now;
                
                e.preventDefault();
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                const deltaX = clientX - rhJoystickStartPos.x;
                const deltaY = clientY - rhJoystickStartPos.y;

                const distance = Math.min(45, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
                const angle = Math.atan2(deltaY, deltaX);

                const maxOffset = 45;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;

                rhJoystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

                // Move camera based on joystick
                const moveX = (offsetX / maxOffset) * moveSpeed;
                const moveZ = (offsetY / maxOffset) * moveSpeed;

                camera.position.x += moveX;
                camera.position.z += moveZ;
                cameraTarget.x += moveX;
                cameraTarget.z += moveZ;
            }

            function stopRHJoystick() {
                rhJoystickActive = false;
                rhJoystickStick.style.transform = 'translate(-50%, -50%)';
                document.removeEventListener('mousemove', moveRHJoystick);
                document.removeEventListener('touchmove', moveRHJoystick);
                document.removeEventListener('mouseup', stopRHJoystick);
                document.removeEventListener('touchend', stopRHJoystick);
            }

            // Setup CH Joystick
            const chJoystickStick = document.getElementById('ch-joystick-stick');
            const chJoystickBase = chJoystickStick.parentElement;
            let chJoystickActive = false;
            let chJoystickStartPos = { x: 0, y: 0 };

            chJoystickStick.addEventListener('mousedown', startCHJoystick);
            chJoystickStick.addEventListener('touchstart', startCHJoystick, { passive: false });

            function startCHJoystick(e) {
                e.preventDefault();
                chJoystickActive = true;
                const rect = chJoystickBase.getBoundingClientRect();
                chJoystickStartPos = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                document.addEventListener('mousemove', moveCHJoystick);
                document.addEventListener('touchmove', moveCHJoystick, { passive: false });
                document.addEventListener('mouseup', stopCHJoystick);
                document.addEventListener('touchend', stopCHJoystick);
            }

            function moveCHJoystick(e) {
                if (!chJoystickActive) return;
                
                const now = performance.now();
                if (now - lastJoystickUpdate < joystickThrottle) {
                    return;
                }
                lastJoystickUpdate = now;
                
                e.preventDefault();
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                const deltaX = clientX - chJoystickStartPos.x;
                const deltaY = clientY - chJoystickStartPos.y;

                const distance = Math.min(45, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
                const angle = Math.atan2(deltaY, deltaX);

                const maxOffset = 45;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;

                chJoystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

                // Move camera based on joystick
                const moveX = (offsetX / maxOffset) * moveSpeed;
                const moveZ = (offsetY / maxOffset) * moveSpeed;

                camera.position.x += moveX;
                camera.position.z += moveZ;
                cameraTarget.x += moveX;
                cameraTarget.z += moveZ;
            }

            function stopCHJoystick() {
                chJoystickActive = false;
                chJoystickStick.style.transform = 'translate(-50%, -50%)';
                document.removeEventListener('mousemove', moveCHJoystick);
                document.removeEventListener('touchmove', moveCHJoystick);
                document.removeEventListener('mouseup', stopCHJoystick);
                document.removeEventListener('touchend', stopCHJoystick);
            }
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

                // Update values based on selected object OR camera
                if (selectedObject) {
                    // Object is selected - show object transforms
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
                } else {
                    // Nothing selected - show camera transforms
                    if (mode === 'position') {
                        transformX.value = camera.position.x.toFixed(2);
                        transformY.value = camera.position.y.toFixed(2);
                        transformZ.value = camera.position.z.toFixed(2);
                    } else if (mode === 'rotation') {
                        transformX.value = (camera.rotation.x * 180 / Math.PI).toFixed(2);
                        transformY.value = (camera.rotation.y * 180 / Math.PI).toFixed(2);
                        transformZ.value = (camera.rotation.z * 180 / Math.PI).toFixed(2);
                    } else if (mode === 'scale') {
                        // Camera doesn't have scale, show 1.0
                        transformX.value = '1.00';
                        transformY.value = '1.00';
                        transformZ.value = '1.00';
                    }
                }
            }

            // Apply transform changes
            function applyTransform() {
                if (!currentTransformMode) return;

                const x = parseFloat(transformX.value) || 0;
                const y = parseFloat(transformY.value) || 0;
                const z = parseFloat(transformZ.value) || 0;

                if (selectedObject) {
                    // Apply to selected object
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
                } else {
                    // Apply to camera (user)
                    if (currentTransformMode === 'position') {
                        camera.position.set(x, y, z);
                    } else if (currentTransformMode === 'rotation') {
                        camera.rotation.set(
                            x * Math.PI / 180,
                            y * Math.PI / 180,
                            z * Math.PI / 180
                        );
                    }
                    // Scale doesn't apply to camera
                }

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
                
                // Also toggle control buttons
                const controlButtons = document.querySelector('.control-buttons');
                if (controlButtons) {
                    controlButtons.classList.toggle('hidden');
                }
                
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
                    
                    if (submenuId === 'admin-particle') {
                        const particlePanel = document.getElementById('particle-behavior-panel');
                        if (particlePanel) {
                            particlePanel.style.display = 'block';
                            particlePanel.classList.remove('minimized');
                            const content = document.getElementById('particle-panel-content');
                            if (content) {
                                content.classList.remove('hidden');
                            }
                            document.getElementById('particle-minimize-btn').textContent = '_';
                        }
                        playSound('active');
                        return;
                    }
                    
                    if (submenuId === 'systems-controllers') {
                        const orbitPanel = document.getElementById('orbit-controls-panel');
                        if (orbitPanel) {
                            orbitPanel.style.display = 'block';
                            orbitPanel.classList.remove('minimized');
                            const content = document.getElementById('orbit-panel-content');
                            if (content) {
                                content.classList.remove('hidden');
                            }
                            document.getElementById('orbit-minimize-btn').textContent = '_';
                        }
                        playSound('active');
                        return;
                    }
                    
                    if (submenuId === 'spaces-default') {
                        const defaultSpacePanel = document.getElementById('default-space-panel');
                        if (defaultSpacePanel) {
                            defaultSpacePanel.style.display = 'block';
                            defaultSpacePanel.classList.remove('minimized');
                            const content = document.getElementById('default-space-content');
                            if (content) {
                                content.classList.remove('hidden');
                            }
                            document.getElementById('default-space-minimize-btn').textContent = '_';
                        }
                        playSound('active');
                        return;
                    }
                    
                    if (submenuId === 'myspace' || submenuId === 'spaces-myspace' || submenuId === 'systems-myspace') {
                        // Open MySpace Control Panel
                        const myspacePanel = document.getElementById('myspace-panel');
                        if (myspacePanel) {
                            myspacePanel.style.display = 'block';
                            myspacePanel.classList.remove('minimized');
                            const content = document.getElementById('myspace-panel-content');
                            if (content) {
                                content.classList.remove('hidden');
                            }
                            document.getElementById('myspace-minimize-btn').textContent = '_';
                        }
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
                    
                    // Handle nested submenus (has-children)
                    if (subitem.classList.contains('has-children')) {
                        e.stopPropagation();
                        
                        // Find the corresponding nested content
                        const nestedContent = document.getElementById(`submenu-content-${submenuId}`);
                        
                        if (nestedContent) {
                            const isVisible = nestedContent.style.display !== 'none';
                            
                            // Hide all nested submenus first
                            document.querySelectorAll('.nested-submenu').forEach(ns => {
                                ns.style.display = 'none';
                            });
                            
                            // Toggle the clicked one
                            if (!isVisible) {
                                nestedContent.style.display = 'block';
                                
                                // Position it next to the parent submenu item
                                const rect = subitem.getBoundingClientRect();
                                nestedContent.style.position = 'fixed';
                                nestedContent.style.left = rect.right + 'px';
                                nestedContent.style.top = rect.top + 'px';
                                nestedContent.style.background = 'rgba(25, 25, 30, 0.95)';
                                nestedContent.style.border = '1px solid rgba(128, 128, 128, 0.5)';
                                nestedContent.style.borderRadius = '8px';
                                nestedContent.style.padding = '8px';
                                nestedContent.style.minWidth = '200px';
                                nestedContent.style.zIndex = '10002';
                                nestedContent.style.backdropFilter = 'blur(20px)';
                            }
                            
                            playSound('passive');
                        }
                        return;
                    }
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
            
            // Update performance metrics every frame
            const frameTimeMs = Math.round(delta * 10) / 10; // Round to 1 decimal
            document.getElementById('frame-time').textContent = `${frameTimeMs}ms`;
            
            const particleCountDisplay = particleSystem ? particleSystem.geometry.attributes.position.count : 0;
            document.getElementById('particle-count').textContent = `${particleCountDisplay}p`;
            
            const camX = Math.round(camera.position.x);
            const camY = Math.round(camera.position.y);
            const camZ = Math.round(camera.position.z);
            document.getElementById('cam-pos').textContent = `${camX},${camY},${camZ}`;
            
            // Update entrance sequence
            if (isEntranceActive) {
                updateEntranceSequence(delta / 1000);
                renderer.render(scene, camera);
                return; // Skip other updates during entrance
            }
            
            // Levitation animation for keyboard
            if (omniKeyboardGroup && omniKeyboardVisible) {
                const time = currentTime * 0.001; // Convert to seconds
                const floatOffset = Math.sin(time * 1.5) * 0.05; // Subtle float up/down
                omniKeyboardGroup.position.y = omniKeyboardOffsetY + floatOffset;
                
                // Pulse the glow planes underneath each cube
                omniKeyboardCubes.forEach(cube => {
                    cube.children.forEach(child => {
                        if (child.geometry && child.geometry.type === 'PlaneGeometry' && child.material.color.getHex() === 0xffffff) {
                            child.material.opacity = 0.15 + Math.sin(time * 2) * 0.1; // Pulse between 0.05 and 0.25
                        }
                    });
                });
            }
            
            // Performance optimization for mobile/iPad
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                // Reduce particle system updates on mobile
                if (Math.random() > 0.5) {
                    // Skip half the particle updates for better performance
                    renderer.render(scene, camera);
                    return;
                }
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
                    
                } else if (particleBehaviorMode === 'upward') {
                    // UPWARD MODE: Particles rise upward
                    const flowSpeed = upwardFlowSpeed * 2;
                    
                    for (let i = 0; i < particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Move particles upward (positive Y)
                        positions[i3 + 1] += flowSpeed;
                        
                        // Reset particles that go too far
                        if (positions[i3 + 1] > 30) {
                            // Respawn at bottom in XZ plane
                            positions[i3] = (Math.random() - 0.5) * 50; // X position
                            positions[i3 + 1] = -30; // Bottom Y edge
                            positions[i3 + 2] = (Math.random() - 0.5) * 50; // Z position
                        }
                    }
                    
                } else if (particleBehaviorMode === 'downward') {
                    // DOWNWARD MODE: Particles fall downward
                    const flowSpeed = downwardFlowSpeed * 2;
                    
                    for (let i = 0; i < particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Move particles downward (negative Y)
                        positions[i3 + 1] -= flowSpeed;
                        
                        // Reset particles that go too far
                        if (positions[i3 + 1] < -30) {
                            // Respawn at top in XZ plane
                            positions[i3] = (Math.random() - 0.5) * 50; // X position
                            positions[i3 + 1] = 30; // Top Y edge
                            positions[i3 + 2] = (Math.random() - 0.5) * 50; // Z position
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
            
            // Camera breathing effect - enhanced for more pronounced feel
            breathTime += 0.016 * breathSpeed; // Assuming ~60fps
            const breathOffset = Math.sin(breathTime) * breathIntensity;
            const breathRotation = Math.sin(breathTime * 1.3) * 0.003; // Slight tilt
            
            // Apply breathing to camera position (up/down)
            if (!keys.r && !keys.f) { // Only when not manually moving up/down
                const breathDelta = breathOffset - (camera.userData.lastBreathOffset || 0);
                camera.position.y += breathDelta;
                camera.userData.lastBreathOffset = breathOffset;
            } else {
                camera.userData.lastBreathOffset = 0;
            }
            
            // Apply subtle rotation breathing (slight tilt)
            if (!keys.c) { // Only when not using mouse look
                camera.rotation.z = breathRotation;
            }
            
            // Check if 3D data panel is active
            const has3DPanel = scene3DDataPanel && scene3DDataPanel.userData.is3DPanel;
            
            // Calculate current movement speed (with sprint multiplier if shift is held)
            const currentSpeed = keys.shift ? moveSpeed * sprintMultiplier : moveSpeed;
            
            // WASD camera movement (or 3D panel scrolling if active)
            if (keys.w) {
                if (has3DPanel) {
                    // Scroll 3D panel up
                    if (window.scroll3DPanel) window.scroll3DPanel(-1);
                } else {
                    const forward = new THREE.Vector3(0, 0, -1);
                    forward.applyQuaternion(camera.quaternion);
                    camera.position.add(forward.multiplyScalar(currentSpeed));
                }
            }
            if (keys.s) {
                if (has3DPanel) {
                    // Scroll 3D panel down
                    if (window.scroll3DPanel) window.scroll3DPanel(1);
                } else {
                    const backward = new THREE.Vector3(0, 0, 1);
                    backward.applyQuaternion(camera.quaternion);
                    camera.position.add(backward.multiplyScalar(currentSpeed));
                }
            }
            if (keys.a) {
                const left = new THREE.Vector3(-1, 0, 0);
                left.applyQuaternion(camera.quaternion);
                camera.position.add(left.multiplyScalar(currentSpeed));
            }
            if (keys.d) {
                const right = new THREE.Vector3(1, 0, 0);
                right.applyQuaternion(camera.quaternion);
                camera.position.add(right.multiplyScalar(currentSpeed));
            }
            if (keys.r) {
                camera.position.y += currentSpeed;
            }
            if (keys.f) {
                camera.position.y -= currentSpeed;
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
            
            // MyZone: Lock grid to camera view
            if (window.myzoneLocked && mySpaceGroup) {
                mySpaceGroup.position.copy(camera.position);
                mySpaceGroup.position.z -= 30; // 30 units in front of camera
                mySpaceGroup.quaternion.copy(camera.quaternion);
            }
            
            // Sphere Auto-Rotation
            if (window.mySpaceSphere) {
                const rotationSpeed = 0.005; // Slow continuous rotation
                
                if (sphereRotateX) {
                    window.mySpaceSphere.rotation.x += rotationSpeed;
                }
                if (sphereRotateY) {
                    window.mySpaceSphere.rotation.y += rotationSpeed;
                }
                if (sphereRotateZ) {
                    window.mySpaceSphere.rotation.z += rotationSpeed;
                }
            }
            
            // OmniSense Cube Animation
            if (omniSenseCube && omniSenseCube.visible) {
                // Rotate cube
                if (cubeRotating) {
                    omniSenseCube.rotation.y += cubeRotationSpeed;
                }
                
                // Pulse edges
                if (cubeEdges) {
                    const time = Date.now() * 0.001;
                    cubeEdges.children.forEach((edge) => {
                        if (edge.userData.type === 'cube-edge') {
                            const phase = edge.userData.pulsePhase;
                            const pulse = Math.sin(time * cubePulseSpeed + phase) * 0.5 + 0.5;
                            
                            // Interpolate between blue and white
                            const color = new THREE.Color();
                            color.lerpColors(
                                new THREE.Color(0x0066ff), // Blue
                                new THREE.Color(0xffffff), // White
                                pulse
                            );
                            edge.material.color.copy(color);
                            edge.material.opacity = 0.5 + pulse * 0.5;
                        }
                    });
                }
            }
            
            renderer.render(scene, camera);
        }

        // Start
        init();
        
        // Populate tray with minimized panels
        const sideTrayContent = document.getElementById('side-tray-content');
        if (sideTrayContent) {
            const panels = [
                { id: 'orbit-controls-panel', icon: '🎮', label: 'ORBT' },
                { id: 'particle-behavior-panel', icon: '✨', label: 'PRTCL' },
                { id: 'user-controls-panel', icon: '👤', label: 'USER' },
                { id: 'default-space-panel', icon: '🌌', label: 'SPACE' },
                { id: 'myspace-panel', icon: '⟐', label: 'MYSP' },
                { id: 'inspector-panel', icon: '🔍', label: 'INSPCT' },
                { id: 'help-panel', icon: '❓', label: 'HELP' }
            ];
            
            panels.forEach(panel => {
                const icon = document.createElement('div');
                icon.style.cssText = `
                    width: 44px;
                    height: 44px;
                    background: rgba(128, 128, 128, 0.3);
                    border: 1px solid rgba(128, 128, 128, 0.5);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.3s;
                    position: relative;
                `;
                icon.innerHTML = panel.icon;
                icon.title = panel.label;
                
                icon.addEventListener('mouseenter', () => {
                    icon.style.background = 'rgba(128, 128, 128, 0.5)';
                    icon.style.transform = 'scale(1.1)';
                });
                
                icon.addEventListener('mouseleave', () => {
                    icon.style.background = 'rgba(128, 128, 128, 0.3)';
                    icon.style.transform = 'scale(1)';
                });
                
                icon.addEventListener('click', () => {
                    const panelEl = document.getElementById(panel.id);
                    if (panelEl) {
                        panelEl.style.display = 'block';
                        panelEl.classList.remove('minimized');
                        const content = panelEl.querySelector('.panel-content');
                        if (content) {
                            content.classList.remove('hidden');
                        }
                        const minimizeBtn = panelEl.querySelector('.panel-btn:not(.close-btn)');
                        if (minimizeBtn) {
                            minimizeBtn.textContent = '_';
                        }
                        playSound('active');
                    }
                });
                
                sideTrayContent.appendChild(icon);
            });
        }
        
        // Initialize particles.js with custom ⟐ symbols emanating from center
        setTimeout(() => {
            if (typeof particlesJS !== 'undefined') {
                particlesJS('particles-js', {
                    particles: {
                        number: {
                            value: 150,
                            density: {
                                enable: false
                            }
                        },
                        color: {
                            value: ['#0066ff', '#ffffff', '#888888', '#00ffff']
                        },
                        shape: {
                            type: ['circle', 'text'],
                            text: {
                                value: '⟐',
                                font: 'Orbitron',
                                style: '',
                                weight: '400'
                            }
                        },
                        opacity: {
                            value: 0.7,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 1,
                                opacity_min: 0.2,
                                sync: false
                            }
                        },
                        size: {
                            value: 4,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 3,
                                size_min: 1,
                                sync: false
                            }
                        },
                        line_linked: {
                            enable: true,
                            distance: 120,
                            color: '#0066ff',
                            opacity: 0.2,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 3,
                            direction: 'none',
                            random: false,
                            straight: false,
                            out_mode: 'out',
                            bounce: false,
                            attract: {
                                enable: false,
                                rotateX: 600,
                                rotateY: 1200
                            }
                        }
                    },
                    interactivity: {
                        detect_on: 'canvas',
                        events: {
                            onhover: {
                                enable: true,
                                mode: 'repulse'
                            },
                            onclick: {
                                enable: true,
                                mode: 'push'
                            },
                            resize: true
                        },
                        modes: {
                            repulse: {
                                distance: 200,
                                duration: 0.4
                            },
                            push: {
                                particles_nb: 4
                            }
                        }
                    },
                    retina_detect: true
                });
                
                // Custom script to make particles emanate from center
                setTimeout(() => {
                    if (window.pJSDom && window.pJSDom[0]) {
                        const pJS = window.pJSDom[0].pJS;
                        const canvas = pJS.canvas.el;
                        const centerX = canvas.width / 2;
                        const centerY = canvas.height / 2;
                        
                        // Position all particles at center initially
                        pJS.particles.array.forEach((particle, index) => {
                            // Start from center
                            particle.x = centerX;
                            particle.y = centerY;
                            
                            // Give each particle an outward velocity
                            const angle = (Math.PI * 2 * index) / pJS.particles.array.length;
                            const speed = 1 + Math.random() * 2;
                            particle.vx = Math.cos(angle) * speed;
                            particle.vy = Math.sin(angle) * speed;
                        });
                    }
                }, 100);
                
                console.log('Particles.js initialized with custom ⟐ symbols');
                
                // Keep particles visible permanently
            }
            // Silently skip if particles.js not loaded
        }, 500);

        // Make functions globally accessible for inline handlers
        window.showWisdomPrompt = showWisdomPrompt;
