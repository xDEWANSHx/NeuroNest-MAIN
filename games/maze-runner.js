function initializeMazeRunner() {
    const canvas = document.getElementById('maze-canvas');
    const startBtn = document.getElementById('start-maze-btn');
    
    // Critical check: if canvas is not found, stop initialization
    if (!canvas) {
        console.error("Maze canvas element not found.");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context for maze canvas.");
        return;
    }

    const messageEl = document.getElementById('maze-message');
    const movesEl = document.getElementById('maze-moves');
    const statusEl = document.getElementById('maze-status');

    const MAZE_SIZE = 15; // 15x15 grid
    const CELL_SIZE = 30;
    const WALL_COLOR = '#4A4A4A';
    const PATH_COLOR = '#FDF5E6';
    const PLAYER_COLOR = '#89CFF0';
    const EXIT_COLOR = '#FFD700';

    canvas.width = MAZE_SIZE * CELL_SIZE;
    canvas.height = MAZE_SIZE * CELL_SIZE;

    let maze = [];
    let player = { x: 0, y: 0 };
    let moves = 0;
    let gameActive = false;

    // Maze Generation (Recursive Backtracker) - FIX: Ensure deep copy of cell object
    function generateMaze() {
        maze = Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(0).map(() => ({ visited: false, walls: { top: true, right: true, bottom: true, left: true } })));
        
        function carvePassage(cx, cy) {
            const directions = [
                { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
                { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
                { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
                { dx: -1, dy: 0, wall: 'left', opposite: 'right' }
            ].sort(() => Math.random() - 0.5);

            maze[cy][cx].visited = true;

            for (const dir of directions) {
                const nx = cx + dir.dx;
                const ny = cy + dir.dy;

                if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && !maze[ny][nx].visited) {
                    // Knock down walls
                    maze[cy][cx].walls[dir.wall] = false;
                    maze[ny][nx].walls[dir.opposite] = false;
                    carvePassage(nx, ny);
                }
            }
        }
        carvePassage(0, 0);
    }

    function drawMaze() {
        // Determine colors based on dark mode status
        const currentPathColor = document.body.classList.contains('dark-mode') ? '#3c4043' : PATH_COLOR;
        const currentWallColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : WALL_COLOR;

        ctx.fillStyle = currentPathColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentWallColor;
        ctx.lineWidth = 2;

        for (let y = 0; y < MAZE_SIZE; y++) {
            for (let x = 0; x < MAZE_SIZE; x++) {
                const cell = maze[y][x];
                const X = x * CELL_SIZE;
                const Y = y * CELL_SIZE;

                // Draw walls
                if (cell.walls.top) {
                    ctx.beginPath();
                    ctx.moveTo(X, Y);
                    ctx.lineTo(X + CELL_SIZE, Y);
                    ctx.stroke();
                }
                if (cell.walls.right) {
                    ctx.beginPath();
                    ctx.moveTo(X + CELL_SIZE, Y);
                    ctx.lineTo(X + CELL_SIZE, Y + CELL_SIZE);
                    ctx.stroke();
                }
                if (cell.walls.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(X + CELL_SIZE, Y + CELL_SIZE);
                    ctx.lineTo(X, Y + CELL_SIZE);
                    ctx.stroke();
                }
                if (cell.walls.left) {
                    ctx.beginPath();
                    ctx.moveTo(X, Y + CELL_SIZE);
                    ctx.lineTo(X, Y);
                    ctx.stroke();
                }
            }
        }

        // Mark Start (0, 0) and Exit (MAZE_SIZE-1, MAZE_SIZE-1)
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE); // Start area
        
        ctx.fillStyle = EXIT_COLOR;
        ctx.fillRect((MAZE_SIZE - 1) * CELL_SIZE, (MAZE_SIZE - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Exit area
    }

    function drawPlayer() {
        const currentPathColor = document.body.classList.contains('dark-mode') ? '#3c4043' : PATH_COLOR;
        
        // Clear previous player position
        ctx.fillStyle = currentPathColor;
        ctx.fillRect(player.x * CELL_SIZE + 2, player.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        
        // Redraw start/exit if player leaves them
        if (player.x === 0 && player.y === 0) {
            ctx.fillStyle = PLAYER_COLOR;
            ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
        }
        if (player.x === MAZE_SIZE - 1 && player.y === MAZE_SIZE - 1) {
            ctx.fillStyle = EXIT_COLOR;
            ctx.fillRect((MAZE_SIZE - 1) * CELL_SIZE, (MAZE_SIZE - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        // Draw player
        const centerX = player.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = player.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fill();
    }

    function updateStatus(msg, status) {
        if (messageEl) messageEl.textContent = msg;
        if (statusEl) statusEl.textContent = status;
        if (movesEl) movesEl.textContent = moves;
    }

    function handleMove(dx, dy, wall) {
        if (!gameActive) return;

        const currentCell = maze[player.y][player.x];
        
        if (!currentCell.walls[wall]) {
            player.x += dx;
            player.y += dy;
            moves++;
            drawMaze(); // Redraw maze to clear path
            drawPlayer();
            updateStatus('Keep going!', 'In Progress');

            if (player.x === MAZE_SIZE - 1 && player.y === MAZE_SIZE - 1) {
                endGame(true);
            }
        } else {
            updateStatus('Ouch! That\'s a wall.', 'Blocked');
        }
    }

    function handleKeyDown(e) {
        if (!gameActive) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault(); // Prevent scrolling
                handleMove(0, -1, 'top');
                break;
            case 'ArrowDown':
                e.preventDefault(); // Prevent scrolling
                handleMove(0, 1, 'bottom');
                break;
            case 'ArrowLeft':
                e.preventDefault(); // Prevent scrolling
                handleMove(-1, 0, 'left');
                break;
            case 'ArrowRight':
                e.preventDefault(); // Prevent scrolling
                handleMove(1, 0, 'right');
                break;
        }
    }

    function startGame() {
        try {
            generateMaze();
            drawMaze();
            player = { x: 0, y: 0 };
            moves = 0;
            gameActive = true;
            drawPlayer();
            updateStatus('Find the exit!', 'Active');
            
            // Ensure only one listener is active
            document.removeEventListener('keydown', handleKeyDown);
            document.addEventListener('keydown', handleKeyDown);
            
            if (startBtn) startBtn.textContent = 'Restart Maze';
        } catch (e) {
            console.error("Maze startGame error:", e);
            updateStatus(`Error starting game: ${e.message}`, 'Error');
            endGame(false);
        }
    }

    function endGame(win) {
        gameActive = false;
        document.removeEventListener('keydown', handleKeyDown);
        
        if (win) {
            updateStatus(`You solved the maze in ${moves} moves!`, 'Completed');
        } else {
            updateStatus('Game ended.', 'Finished');
        }
        if (startBtn) startBtn.textContent = 'Start New Maze';
    }

    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        console.log("Maze Runner: Start button listener attached.");
    } else {
        console.error("Maze Runner: Start button not found!");
    }
    
    // Initial setup
    generateMaze();
    drawMaze();
    drawPlayer();
    updateStatus('Ready to run the maze!', 'Ready');
}