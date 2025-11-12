function initializeSimonSays() {
    const SHAPES = ['red', 'blue', 'green', 'yellow'];
    const COMMANDS = ['Tap the Red Square', 'Tap the Blue Circle', 'Tap the Green Triangle', 'Tap the Yellow Star'];
    const SIMON_SAYS = 'Simon Says, ';
    const PLAYER_RESPONSE_TIME = 2000; // 2 seconds for player response

    let score = 0;
    let level = 1;
    let sequence = [];
    let sequenceIndex = 0;
    let playerTurn = false;
    let responseTimer;

    const startBtn = document.getElementById('start-simon-btn');
    const messageEl = document.getElementById('simon-says-message');
    const controlsEl = document.getElementById('simon-says-controls');
    const scoreEl = document.getElementById('simon-score');
    const levelEl = document.getElementById('simon-level');

    function updateStats() {
        if (scoreEl) scoreEl.textContent = score;
        if (levelEl) levelEl.textContent = level;
    }

    function resetGame() {
        score = 0;
        level = 1;
        sequence = [];
        sequenceIndex = 0;
        playerTurn = false;
        clearTimeout(responseTimer);
        if (messageEl) messageEl.textContent = 'Press Start to Begin';
        if (startBtn) startBtn.style.display = 'block';
        updateStats();
        if (controlsEl) controlsEl.removeEventListener('click', handlePlayerClick);
    }

    function startGame() {
        if (startBtn) startBtn.style.display = 'none';
        score = 0;
        level = 1;
        sequence = [];
        updateStats();
        if (controlsEl) controlsEl.addEventListener('click', handlePlayerClick);
        nextRound();
    }

    function endGame(reason = 'Game Over!') {
        playerTurn = false;
        clearTimeout(responseTimer);
        if (messageEl) messageEl.textContent = `${reason} Final Score: ${score}`;
        if (startBtn) {
            startBtn.textContent = 'Play Again';
            startBtn.style.display = 'block';
        }
        if (controlsEl) controlsEl.removeEventListener('click', handlePlayerClick);
    }

    function displayCommand(command, isSimonSays) {
        const fullCommand = isSimonSays ? SIMON_SAYS + command : command;
        if (messageEl) messageEl.textContent = fullCommand;
        
        const shapeName = command.split(' ')[2].toLowerCase();
        const shapeEl = document.querySelector(`.simon-says-shape[data-shape="${shapeName}"]`);
        
        if (shapeEl) {
            shapeEl.classList.add('flash');
            setTimeout(() => shapeEl.classList.remove('flash'), 500);
        }
    }

    function nextRound() {
        playerTurn = false;
        sequenceIndex = 0;
        if (messageEl) messageEl.textContent = 'Watch and Listen...';
        
        // Add a new command
        const isSimonSays = Math.random() < 0.7;
        const commandIndex = Math.floor(Math.random() * COMMANDS.length);
        sequence.push({ command: COMMANDS[commandIndex], isSimonSays });
        
        setTimeout(playSequence, 1000);
    }

    function playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            if (i < sequence.length) {
                const item = sequence[i];
                displayCommand(item.command, item.isSimonSays);
                i++;
            } else {
                clearInterval(interval);
                startPlayerTurn();
            }
        }, 1500);
    }

    function startPlayerTurn() {
        playerTurn = true;
        sequenceIndex = 0;
        if (messageEl) messageEl.textContent = 'Your Turn! Follow the sequence.';
        processCurrentCommand();
    }

    function processCurrentCommand() {
        if (sequenceIndex >= sequence.length) {
            // Sequence completed successfully
            playerTurn = false;
            level++;
            if (messageEl) messageEl.textContent = 'Great job! Next Level!';
            setTimeout(nextRound, 1500);
            return;
        }

        const currentItem = sequence[sequenceIndex];
        const expectedShape = currentItem.command.split(' ')[2].toLowerCase();
        
        if (currentItem.isSimonSays) {
            // Simon Says: Player MUST click the expected shape
            if (messageEl) messageEl.textContent = `Simon Says: Click ${expectedShape.toUpperCase()}`;
        } else {
            // No Simon Says: Player MUST NOT click anything
            if (messageEl) messageEl.textContent = `Wait: ${currentItem.command}`;
        }

        // Set a timer for the player's response
        clearTimeout(responseTimer);
        responseTimer = setTimeout(() => {
            // Time ran out. Check if the player was supposed to click or ignore.
            if (currentItem.isSimonSays) {
                // Failed to click in time
                endGame('Too slow!');
            } else {
                // Correctly ignored the command (Impulse Control Success)
                score++;
                updateStats();
                sequenceIndex++;
                processCurrentCommand(); // Move to the next command in the sequence
            }
        }, PLAYER_RESPONSE_TIME);
    }

    function handlePlayerClick(e) {
        if (!playerTurn || !e.target.classList.contains('simon-says-shape')) return;

        clearTimeout(responseTimer); // Player responded, clear timer

        const clickedShape = e.target.dataset.shape;
        const currentItem = sequence[sequenceIndex];
        const expectedShape = currentItem.command.split(' ')[2].toLowerCase();
        
        let correctAction = false;

        if (currentItem.isSimonSays) {
            // Simon Says: Must click the correct shape
            if (clickedShape === expectedShape) {
                correctAction = true;
            }
        } else {
            // No Simon Says: Clicking is always incorrect
            correctAction = false;
        }

        if (correctAction) {
            score++;
            updateStats();
            sequenceIndex++;
            processCurrentCommand(); // Move to the next command
        } else {
            // Incorrect action (wrong shape or failed impulse control)
            endGame('Wrong action!');
        }
    }

    if (startBtn) startBtn.addEventListener('click', startGame);
    resetGame();
}