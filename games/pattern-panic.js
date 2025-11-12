// Pattern Panic Game Logic

function setupPatternPanic(container) {
    let level = 1;
    const maxLevel = 20;
    let sequence = [];
    let playerSequence = [];
    let canClick = false;
    let speed = 1000;

    const gameHTML = `
        <div class="pattern-panic-game">
            <h3>Pattern Panic - Level <span id="pattern-level">1</span></h3>
            <p id="pattern-message">Watch the pattern carefully!</p>
            <div class="pattern-grid">
                <div class="pattern-tile" data-tile="1"></div>
                <div class="pattern-tile" data-tile="2"></div>
                <div class="pattern-tile" data-tile="3"></div>
                <div class="pattern-tile" data-tile="4"></div>
            </div>
            <button id="start-pattern-btn">Start Game</button>
        </div>
    `;
    container.innerHTML = gameHTML;

    const levelDisplay = document.getElementById('pattern-level');
    const messageDisplay = document.getElementById('pattern-message');
    const tiles = document.querySelectorAll('.pattern-tile');
    const startButton = document.getElementById('start-pattern-btn');

    function nextLevel() {
        levelDisplay.textContent = level;
        playerSequence = [];
        canClick = false;
        messageDisplay.textContent = "Watch the pattern!";
        
        // Add a new random step to the sequence
        sequence.push(Math.floor(Math.random() * 4) + 1);
        
        playSequence();
    }

    function playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                canClick = true;
                messageDisplay.textContent = "Your turn!";
                return;
            }
            lightUpTile(sequence[i]);
            i++;
        }, speed);
    }

    function lightUpTile(tileNumber) {
        const tile = document.querySelector(`.pattern-tile[data-tile="${tileNumber}"]`);
        tile.classList.add('active');
        setTimeout(() => {
            tile.classList.remove('active');
        }, speed / 2);
    }

    function handleTileClick(e) {
        if (!canClick) return;

        const clickedTile = parseInt(e.target.dataset.tile);
        playerSequence.push(clickedTile);
        lightUpTile(clickedTile);

        // Check if the player's move is correct
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            endGame(false);
            return;
        }

        // Check if the player has completed the sequence for this level
        if (playerSequence.length === sequence.length) {
            if (level === maxLevel) {
                endGame(true);
            } else {
                level++;
                speed *= 0.9; // Increase speed for next level
                setTimeout(nextLevel, 1000);
            }
        }
    }

    function startGame() {
        level = 1;
        speed = 1000;
        sequence = [];
        startButton.disabled = true;
        nextLevel();
    }

    function endGame(isWin) {
        if (isWin) {
            messageDisplay.textContent = `Congratulations! You've beaten all ${maxLevel} levels!`;
        } else {
            messageDisplay.textContent = `Game Over! You reached level ${level}.`;
        }
        startButton.disabled = false;
    }

    tiles.forEach(tile => tile.addEventListener('click', handleTileClick));
    startButton.addEventListener('click', startGame);
}