// Game state variables
let gameBoard = [];
let pacmanPosition = { x: 1, y: 1 };  // Start at a safe position
let ghostPositions = [
    { x: 9, y: 1, color: 'red' },     // Red ghost
    { x: 17, y: 1, color: 'pink' },   // Pink ghost
    { x: 1, y: 19, color: 'cyan' }    // Cyan ghost
];
let score = 0;
let lives = 3;
let gameRunning = false;
let pacmanDirection = 'right';
let nextDirection = 'right';  // Direction to change to when possible
let pacmanMoveInterval = null;  // Interval for continuous movement
let totalDots = 0;
let dotsEaten = 0;

// Game board layout (0 = wall, 1 = dot, 2 = empty path)
const maze = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,2,0,2,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,2,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,2,2,2,2,2,1,0,1,0,0,0,0],
    [2,2,2,2,1,2,1,2,0,2,0,2,1,2,1,2,2,2,2],
    [0,0,0,0,1,0,1,2,0,0,0,2,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,2,2,2,2,2,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,2,0,0,0,0,0,2,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0],
    [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
];

// Initialize the game
function initGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    gameBoard = [];
    totalDots = 0;
    dotsEaten = 0;
    
    // Create the game board
    for (let y = 0; y < maze.length; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            
            if (maze[y][x] === 0) {
                cell.classList.add('wall');
                gameBoard[y][x] = 'wall';
            } else if (maze[y][x] === 1) {
                cell.classList.add('dot');
                gameBoard[y][x] = 'dot';
                totalDots++;
            } else {
                cell.classList.add('path');
                gameBoard[y][x] = 'path';
            }
            
            board.appendChild(cell);
        }
    }
    
    // Place Pac-Man
    placePacman();
    
    // Place Ghosts
    placeGhosts();
    
    // Update UI
    updateScore();
    updateLives();
}

function placePacman() {
    // Remove previous Pac-Man
    document.querySelectorAll('.pacman').forEach(cell => {
        cell.classList.remove('pacman', 'right', 'left', 'up', 'down', 'chomping');
    });
    
    // Place new Pac-Man
    const cell = document.getElementById(`cell-${pacmanPosition.x}-${pacmanPosition.y}`);
    if (cell) {
        cell.classList.add('pacman', pacmanDirection, 'chomping');
        console.log(`Placed Pac-Man at (${pacmanPosition.x}, ${pacmanPosition.y})`);
    } else {
        console.log(`Could not find cell at (${pacmanPosition.x}, ${pacmanPosition.y})`);
    }
}

function placeGhosts() {
    // Remove previous ghosts
    document.querySelectorAll('.ghost').forEach(cell => {
        cell.classList.remove('ghost', 'ghost-red', 'ghost-pink', 'ghost-cyan');
    });
    
    // Place new ghosts
    ghostPositions.forEach((ghost, index) => {
        const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (cell) {
            cell.classList.add('ghost', `ghost-${ghost.color}`);
            console.log(`Placed ${ghost.color} Ghost at (${ghost.x}, ${ghost.y})`);
        } else {
            console.log(`Could not find cell for ${ghost.color} ghost at (${ghost.x}, ${ghost.y})`);
        }
    });
}

function canMove(direction) {
    let newX = pacmanPosition.x;
    let newY = pacmanPosition.y;
    
    switch (direction) {
        case 'up':
            newY--;
            break;
        case 'down':
            newY++;
            break;
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
    }
    
    // Check boundaries and walls
    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
        return false;
    }
    
    if (maze[newY][newX] === 0) {
        return false; // Hit a wall
    }
    
    return true;
}

function movePacmanContinuous() {
    if (!gameRunning) return;
    
    // Try to change direction if a new direction was requested
    if (nextDirection !== pacmanDirection && canMove(nextDirection)) {
        pacmanDirection = nextDirection;
    }
    
    // Try to move in current direction
    if (!canMove(pacmanDirection)) {
        return; // Can't move in current direction
    }
    
    let newX = pacmanPosition.x;
    let newY = pacmanPosition.y;
    
    switch (pacmanDirection) {
        case 'up':
            newY--;
            break;
        case 'down':
            newY++;
            break;
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
    }
    
    console.log(`Moving ${pacmanDirection} to (${newX}, ${newY})`);
    
    // Update Pac-Man position
    pacmanPosition.x = newX;
    pacmanPosition.y = newY;
    
    // Check if Pac-Man ate a dot
    if (gameBoard[newY][newX] === 'dot') {
        gameBoard[newY][newX] = 'path';
        const cell = document.getElementById(`cell-${newX}-${newY}`);
        cell.classList.remove('dot');
        cell.classList.add('path');
        score += 10;
        dotsEaten++;
        updateScore();
        
        // Check win condition
        if (dotsEaten >= totalDots) {
            winGame();
            return;
        }
    }
    
    placePacman();
    
    // Check collision with any ghost
    for (let ghost of ghostPositions) {
        if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
            loseLife();
            return;
        }
    }
}

function changeDirection(direction) {
    if (!gameRunning) return;
    nextDirection = direction;
    console.log(`Direction change requested: ${direction}`);
}

function moveGhosts() {
    if (!gameRunning) return;
    
    ghostPositions.forEach((ghost, index) => {
        // Simple AI: Move ghost towards Pac-Man with some randomness
        const directions = ['up', 'down', 'left', 'right'];
        let validDirections = [];
        
        // First, find all valid directions (not walls or boundaries)
        for (let direction of directions) {
            let newX = ghost.x;
            let newY = ghost.y;
            
            switch (direction) {
                case 'up':
                    newY--;
                    break;
                case 'down':
                    newY++;
                    break;
                case 'left':
                    newX--;
                    break;
                case 'right':
                    newX++;
                    break;
            }
            
            // Check boundaries and walls
            if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
                if (maze[newY][newX] !== 0) {
                    // Check if another ghost is already at this position
                    let occupied = false;
                    for (let otherGhost of ghostPositions) {
                        if (otherGhost !== ghost && otherGhost.x === newX && otherGhost.y === newY) {
                            occupied = true;
                            break;
                        }
                    }
                    
                    if (!occupied) {
                        validDirections.push({
                            direction: direction,
                            x: newX,
                            y: newY,
                            distance: Math.abs(newX - pacmanPosition.x) + Math.abs(newY - pacmanPosition.y)
                        });
                    }
                }
            }
        }
        
        if (validDirections.length === 0) return;
        
        // Different behavior for each ghost
        let chosenDirection;
        if (index === 0) {
            // Red ghost: 80% aggressive (follows Pac-Man)
            if (Math.random() < 0.8) {
                validDirections.sort((a, b) => a.distance - b.distance);
                chosenDirection = validDirections[0];
            } else {
                chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        } else if (index === 1) {
            // Pink ghost: 60% aggressive
            if (Math.random() < 0.6) {
                validDirections.sort((a, b) => a.distance - b.distance);
                chosenDirection = validDirections[0];
            } else {
                chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        } else {
            // Cyan ghost: 40% aggressive (more random)
            if (Math.random() < 0.4) {
                validDirections.sort((a, b) => a.distance - b.distance);
                chosenDirection = validDirections[0];
            } else {
                chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
        
        // Update ghost position
        ghost.x = chosenDirection.x;
        ghost.y = chosenDirection.y;
    });
    
    placeGhosts();
    
    // Check collision with Pac-Man
    for (let ghost of ghostPositions) {
        if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
            loseLife();
            return;
        }
    }
}

function loseLife() {
    lives--;
    updateLives();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        pacmanPosition = { x: 1, y: 1 };  // Start at a safe position
        ghostPositions = [
            { x: 9, y: 1, color: 'red' },     // Red ghost
            { x: 17, y: 1, color: 'pink' },   // Pink ghost
            { x: 1, y: 19, color: 'cyan' }    // Cyan ghost
        ];
        pacmanDirection = 'right';
        nextDirection = 'right';
        placePacman();
        placeGhosts();
        
        // Pause briefly
        gameRunning = false;
        setTimeout(() => {
            gameRunning = true;
        }, 1000);
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('span');
        life.className = 'life';
        life.textContent = '🎮';
        livesContainer.appendChild(life);
    }
}

function startGame() {
    gameRunning = true;
    console.log('Game started!');
    console.log(`Pac-Man at (${pacmanPosition.x}, ${pacmanPosition.y})`);
    ghostPositions.forEach((ghost, index) => {
        console.log(`${ghost.color} Ghost at (${ghost.x}, ${ghost.y})`);
    });
    
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('restart-button').style.display = 'inline-block';
    
    // Start Pac-Man continuous movement
    pacmanMoveInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(pacmanMoveInterval);
            return;
        }
        movePacmanContinuous();
    }, 200); // Move every 200ms
    
    // Start ghost movement
    const ghostInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(ghostInterval);
            return;
        }
        moveGhosts();
    }, 300);
}

function restartGame() {
    gameRunning = false;
    
    // Clear movement intervals
    if (pacmanMoveInterval) {
        clearInterval(pacmanMoveInterval);
        pacmanMoveInterval = null;
    }
    
    score = 0;
    lives = 3;
    pacmanPosition = { x: 1, y: 1 };  // Start at a safe position
    ghostPositions = [
        { x: 9, y: 1, color: 'red' },     // Red ghost
        { x: 17, y: 1, color: 'pink' },   // Pink ghost
        { x: 1, y: 19, color: 'cyan' }    // Cyan ghost
    ];
    pacmanDirection = 'right';
    nextDirection = 'right';
    
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('you-win').style.display = 'none';
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('restart-button').style.display = 'none';
    
    initGame();
}

function gameOver() {
    gameRunning = false;
    
    // Clear movement intervals
    if (pacmanMoveInterval) {
        clearInterval(pacmanMoveInterval);
        pacmanMoveInterval = null;
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

function winGame() {
    gameRunning = false;
    
    // Clear movement intervals
    if (pacmanMoveInterval) {
        clearInterval(pacmanMoveInterval);
        pacmanMoveInterval = null;
    }
    
    document.getElementById('win-score').textContent = score;
    document.getElementById('you-win').style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            changeDirection('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            changeDirection('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            changeDirection('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            changeDirection('right');
            break;
    }
});

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', restartGame);

// Initialize the game when page loads
window.addEventListener('load', initGame);
