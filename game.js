// Game variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Difficulty settings
const DIFFICULTY = {
    EASY: {
        pipeGap: 120,
        pipeSpeed: 2 * (60 / 60),
        spawnInterval: 100
    },
    MEDIUM: {
        pipeGap: 90,
        pipeSpeed: 2.5 * (60 / 60),
        spawnInterval: 90
    },
    HARD: {
        pipeGap: 70,
        pipeSpeed: 2 * (60 / 60),
        spawnInterval: 110
    }
};

// Current difficulty
let currentDifficulty = DIFFICULTY.EASY;

// Difficulty buttons
const easyButton = document.getElementById('easy-button');
const mediumButton = document.getElementById('medium-button');
const hardButton = document.getElementById('hard-button');

// Add event listeners for difficulty buttons
easyButton.addEventListener('click', () => {
    setDifficulty('EASY');
});

mediumButton.addEventListener('click', () => {
    setDifficulty('MEDIUM');
});

hardButton.addEventListener('click', () => {
    setDifficulty('HARD');
});

// Function to set difficulty
function setDifficulty(level) {
    // Remove selected class from all buttons
    easyButton.classList.remove('selected');
    mediumButton.classList.remove('selected');
    hardButton.classList.remove('selected');
    
    // Set current difficulty
    currentDifficulty = DIFFICULTY[level];
    
    // Update pipe settings
    pipes.gap = currentDifficulty.pipeGap;
    pipes.dx = currentDifficulty.pipeSpeed;
    pipes.spawnInterval = currentDifficulty.spawnInterval;
    
    // Add selected class to the chosen button
    if (level === 'EASY') {
        easyButton.classList.add('selected');
    } else if (level === 'MEDIUM') {
        mediumButton.classList.add('selected');
    } else if (level === 'HARD') {
        hardButton.classList.add('selected');
    }
    
    console.log(`Difficulty set to ${level}: gap=${pipes.gap}, speed=${pipes.dx}, spawn=${pipes.spawnInterval}`);
}

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let frames = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let gameOverTimeoutId = null;

// Time-based animation variables
let lastTime = 0;
const FPS = 60;
const timeStep = 1000 / FPS; // Time step in milliseconds (16.67ms for 60fps)
let deltaTime = 0;
let accumulator = 0;

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 20,
    gravity: 0.25 * (60 / FPS), // Scale gravity to the target FPS
    jump: 4.6 * (60 / FPS),     // Scale jump to the target FPS
    velocity: 0,
    rotation: 0,
    currentFrame: 0,
    period: 5,
    animation: [
        { sprite: new Image(), sX: 0, sY: 0 },
        { sprite: new Image(), sX: 0, sY: 0 },
        { sprite: new Image(), sX: 0, sY: 0 }
    ]
};

// Load bird sprites
bird.animation[0].sprite.src = 'sprites/yellowbird-upflap.png';
bird.animation[1].sprite.src = 'sprites/yellowbird-midflap.png';
bird.animation[2].sprite.src = 'sprites/yellowbird-downflap.png';

// Background and foreground
const bg = {
    sprite: new Image(),
    x: 0,
    y: 0,
    width: 320,
    height: 480,
    dx: 0.5 * (60 / FPS)  // Scale speed to the target FPS
};
bg.sprite.src = 'sprites/background-day.png';

const fg = {
    sprite: new Image(),
    x: 0,
    y: canvas.height - 112,
    width: 320,
    height: 112,
    dx: 2 * (60 / FPS)  // Scale speed to the target FPS
};
fg.sprite.src = 'sprites/base.png';

// Pipes
const pipes = {
    position: [],
    top: {
        sprite: new Image()
    },
    bottom: {
        sprite: new Image()
    },
    width: 52,
    height: 320,
    gap: 120,
    dx: 2 * (60 / FPS),  // Scale speed to the target FPS
    spawnInterval: 100 * (FPS / 60)  // Scale spawn interval to the target FPS
};
pipes.top.sprite.src = 'sprites/pipe-green.png';
pipes.bottom.sprite.src = 'sprites/pipe-green.png';

// Game sounds
const sounds = {
    score: new Audio(),
    flap: new Audio(),
    hit: new Audio(),
    die: new Audio(),
    swoosh: new Audio()
};

// Preload sounds to avoid delay
sounds.score.src = 'audio/point.ogg';
sounds.flap.src = 'audio/wing.ogg';
sounds.hit.src = 'audio/hit.ogg';
sounds.die.src = 'audio/die.ogg';
sounds.swoosh.src = 'audio/swoosh.ogg';

// Set volume for each sound
sounds.score.volume = 1.0;
sounds.flap.volume = 0.7;
sounds.hit.volume = 1.0;
sounds.die.volume = 1.0;
sounds.swoosh.volume = 0.5;

// Preload all sounds
function preloadSounds() {
    for (const sound in sounds) {
        sounds[sound].load();
    }
}

// Game digits for score display
const digits = [];
for (let i = 0; i <= 9; i++) {
    const digit = new Image();
    digit.src = `sprites/${i}.png`;
    digits.push(digit);
}

// Game over sprite
const gameOverSprite = new Image();
gameOverSprite.src = 'sprites/gameover.png';

// Event listeners
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!gameStarted && !gameOver) {
            startGame();
        } else if (gameStarted && !gameOver) {
            flap();
        } else if (gameOver && gameOverScreen.style.display === 'flex') {
            resetGame();
        }
        e.preventDefault(); // Prevent page scrolling when pressing space
    }
});

// Add touch event listeners for mobile
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent scrolling when touching the canvas
    if (!gameStarted && !gameOver) {
        startGame();
    } else if (gameStarted && !gameOver) {
        flap();
    }
}, { passive: false });

// Keep the click event for desktop
canvas.addEventListener('click', function() {
    if (!gameStarted && !gameOver) {
        startGame();
    } else if (gameStarted && !gameOver) {
        flap();
    }
});

// Add touch events for buttons
startButton.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startGame();
}, { passive: false });

restartButton.addEventListener('touchstart', function(e) {
    e.preventDefault();
    resetGame();
}, { passive: false });

// Keep the click events for desktop
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

// Handle window resize
window.addEventListener('resize', resizeGame);

// Function to handle game resizing
function resizeGame() {
    // Get the dimensions of the viewport
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Get the game container
    const gameContainer = document.querySelector('.game-container');
    
    // Determine the game size while maintaining aspect ratio
    let gameWidth = 320;
    let gameHeight = 480;
    
    // Calculate the maximum dimensions that fit in the viewport
    const maxWidth = Math.min(viewport.width, viewport.height * (320/480));
    const maxHeight = Math.min(viewport.height, viewport.width * (480/320));
    
    // Set the game dimensions
    if (maxWidth / maxHeight > 320 / 480) {
        gameWidth = maxHeight * (320/480);
        gameHeight = maxHeight;
    } else {
        gameWidth = maxWidth;
        gameHeight = maxWidth * (480/320);
    }
    
    // Apply the new dimensions
    gameContainer.style.width = `${gameWidth}px`;
    gameContainer.style.height = `${gameHeight}px`;
}

// Game functions
function startGame() {
    console.log("Starting game with difficulty:", 
                easyButton.classList.contains('selected') ? "EASY" : 
                mediumButton.classList.contains('selected') ? "MEDIUM" : "HARD");
    
    gameStarted = true;
    gameOver = false;
    startScreen.style.display = 'none';
    lastTime = performance.now();
    loop(lastTime);
}

function resetGame() {
    // Clear any pending game over timeout
    if (gameOverTimeoutId) {
        clearTimeout(gameOverTimeoutId);
        gameOverTimeoutId = null;
    }
    
    // Reset bird position and velocity
    bird.y = 150;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.position = [];
    
    // Reset score
    score = 0;
    
    // Reset game state
    gameOver = false;
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex'; // Show start screen again
    frames = 0;
    gameStarted = false;
    
    // Reset time variables
    lastTime = performance.now();
    accumulator = 0;
}

function flap() {
    bird.velocity = -bird.jump;
    
    // Reset sound and play it
    sounds.flap.pause();
    sounds.flap.currentTime = 0;
    sounds.flap.play().catch(e => console.log("Error playing flap sound:", e));
}

function update(dt) {
    if (gameOver) return;
    
    // Increment frames counter (scaled to time)
    frames++;
    
    // Bird movement
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Bird rotation
    if (bird.velocity >= bird.jump) {
        bird.rotation = 90 * Math.PI / 180;
    } else {
        bird.rotation = -25 * Math.PI / 180;
    }
    
    // Check for collision with ground
    if (bird.y + bird.height >= canvas.height - fg.height) {
        gameOver = true;
        
        // Play hit sound
        sounds.hit.pause();
        sounds.hit.currentTime = 0;
        sounds.hit.play().catch(e => console.log("Error playing hit sound:", e));
        
        gameOverTimeoutId = setTimeout(() => {
            // Play die sound
            sounds.die.pause();
            sounds.die.currentTime = 0;
            sounds.die.play().catch(e => console.log("Error playing die sound:", e));
            
            // Show the game over screen with the current score
            document.getElementById('current-score').textContent = score;
            document.getElementById('best-score').textContent = bestScore;
            gameOverScreen.style.display = 'flex';
        }, 500);
        return;
    }
    
    // Check for collision with top of screen
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    // Move foreground
    fg.x = (fg.x - fg.dx) % (fg.width / 2);
    
    // Move background slightly slower
    bg.x = (bg.x - bg.dx) % (bg.width / 2);
    
    // Add new pipes every spawnInterval frames
    if (frames % pipes.spawnInterval === 0) {
        // Calculate the gap position (centered in the canvas height minus foreground)
        const gapPosition = Math.floor(Math.random() * (canvas.height - fg.height - pipes.gap - 120)) + 60;
        
        pipes.position.push({
            x: canvas.width,
            y: gapPosition,
            counted: false
        });
    }
    
    // Move pipes and check for collision
    for (let i = 0; i < pipes.position.length; i++) {
        const p = pipes.position[i];
        
        // Move pipe
        p.x -= pipes.dx;
        
        // Remove pipes that are off screen
        if (p.x + pipes.width <= 0) {
            pipes.position.shift();
            continue;
        }
        
        // Check for collision with pipe
        const bottomPipeY = p.y + pipes.gap;
        
        // Collision with top pipe
        if (
            bird.x + bird.width > p.x &&
            bird.x < p.x + pipes.width &&
            bird.y < p.y
        ) {
            gameOver = true;
            
            // Play hit sound
            sounds.hit.pause();
            sounds.hit.currentTime = 0;
            sounds.hit.play().catch(e => console.log("Error playing hit sound:", e));
            
            gameOverTimeoutId = setTimeout(() => {
                // Play die sound
                sounds.die.pause();
                sounds.die.currentTime = 0;
                sounds.die.play().catch(e => console.log("Error playing die sound:", e));
                
                // Show the game over screen with the current score
                document.getElementById('current-score').textContent = score;
                document.getElementById('best-score').textContent = bestScore;
                gameOverScreen.style.display = 'flex';
            }, 500);
            return;
        }
        
        // Collision with bottom pipe
        if (
            bird.x + bird.width > p.x &&
            bird.x < p.x + pipes.width &&
            bird.y + bird.height > bottomPipeY
        ) {
            gameOver = true;
            
            // Play hit sound
            sounds.hit.pause();
            sounds.hit.currentTime = 0;
            sounds.hit.play().catch(e => console.log("Error playing hit sound:", e));
            
            gameOverTimeoutId = setTimeout(() => {
                // Play die sound
                sounds.die.pause();
                sounds.die.currentTime = 0;
                sounds.die.play().catch(e => console.log("Error playing die sound:", e));
                
                // Show the game over screen with the current score
                document.getElementById('current-score').textContent = score;
                document.getElementById('best-score').textContent = bestScore;
                gameOverScreen.style.display = 'flex';
            }, 500);
            return;
        }
        
        // Score point when passing pipe
        if (p.x + pipes.width < bird.x && !p.counted) {
            score++;
            
            // Reset sound and play it
            sounds.score.pause();
            sounds.score.currentTime = 0;
            sounds.score.play().catch(e => console.log("Error playing score sound:", e));
            
            p.counted = true;
            
            // Update best score
            bestScore = Math.max(score, bestScore);
            localStorage.setItem('bestScore', bestScore);
        }
    }
    
    // Update bird animation frame
    if (frames % bird.period === 0) {
        bird.currentFrame = (bird.currentFrame + 1) % bird.animation.length;
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (repeated to cover the canvas)
    ctx.drawImage(bg.sprite, bg.x, bg.y, bg.width, bg.height);
    ctx.drawImage(bg.sprite, bg.x + bg.width - 1, bg.y, bg.width, bg.height);
    
    // Draw pipes
    for (let i = 0; i < pipes.position.length; i++) {
        const p = pipes.position[i];
        
        // Top pipe (flipped)
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(pipes.top.sprite, p.x, -p.y, pipes.width, pipes.height);
        ctx.restore();
        
        // Bottom pipe
        const bottomPipeY = p.y + pipes.gap;
        ctx.drawImage(pipes.bottom.sprite, p.x, bottomPipeY, pipes.width, pipes.height);
    }
    
    // Draw foreground (repeated to cover the canvas)
    ctx.drawImage(fg.sprite, fg.x, fg.y, fg.width, fg.height);
    ctx.drawImage(fg.sprite, fg.x + fg.width - 1, fg.y, fg.width, fg.height);
    
    // Draw bird
    const birdSprite = bird.animation[bird.currentFrame].sprite;
    
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(
        birdSprite,
        -bird.width / 2,
        -bird.height / 2,
        bird.width,
        bird.height
    );
    ctx.restore();
    
    // Draw score
    drawScore();
}

function drawScore() {
    const scoreStr = score.toString();
    const width = 24; // Width of each digit
    const x = canvas.width / 2 - (scoreStr.length * width) / 2;
    
    // Always draw current score at the top during gameplay
    if (!gameOver && gameStarted) {
        for (let i = 0; i < scoreStr.length; i++) {
            const digit = parseInt(scoreStr[i]);
            ctx.drawImage(digits[digit], x + i * width, 50, width, 36);
        }
    }
}

function loop(currentTime) {
    // Calculate time elapsed since last frame
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Prevent spiral of death with large deltaTime (e.g., when tab is inactive)
    if (deltaTime > 200) {
        deltaTime = timeStep;
    }
    
    // Accumulate time since last update
    accumulator += deltaTime;
    
    // Update game logic in fixed time steps
    while (accumulator >= timeStep) {
        update(timeStep);
        accumulator -= timeStep;
    }
    
    // Draw the game
    draw();
    
    // Continue the game loop if not game over
    if (!gameOver && gameStarted) {
        requestAnimationFrame(loop);
    }
}

// Initialize the game when the window loads
window.onload = function() {
    // Set initial difficulty
    setDifficulty('EASY');
    
    // Preload sounds
    preloadSounds();
    
    // Make sure all images are loaded
    const allImages = [
        bg.sprite, fg.sprite,
        pipes.top.sprite, pipes.bottom.sprite,
        ...bird.animation.map(a => a.sprite),
        ...digits,
        gameOverSprite
    ];
    
    let loadedImages = 0;
    allImages.forEach(img => {
        img.onload = () => {
            loadedImages++;
            if (loadedImages === allImages.length) {
                // Initial resize
                resizeGame();
                
                // Draw initial screen
                draw();
                
                // Play swoosh sound when game is ready
                sounds.swoosh.play().catch(e => console.log("Error playing swoosh sound:", e));
            }
        };
    });
    
    // Add console logs for debugging
    console.log("Game initialized");
    console.log("Canvas:", canvas);
    console.log("Start button:", startButton);
    console.log("Difficulty buttons:", easyButton, mediumButton, hardButton);
};
