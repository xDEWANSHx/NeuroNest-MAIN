// Whack-a-Mole Game Logic

function setupWhackAMole(container) {
    let score = 0;
    let moles = [];
    let gameInterval;
    let timer;
    let timeLeft = 30;

    const gameHTML = `
        <div class="whack-a-mole-game">
            <h3>Whack-a-Mole!</h3>
            <div class="whack-a-mole-stats">
                <div>Score: <span id="whack-a-mole-score">0</span></div>
                <div>Time Left: <span id="whack-a-mole-time">${timeLeft}</span>s</div>
            </div>
            <div class="whack-a-mole-grid">
                ${Array(9).fill('<div class="mole-hole"><div class="mole"></div></div>').join('')}
            </div>
            <button id="start-whack-a-mole-btn">Start Game</button>
        </div>
    `;

    container.innerHTML = gameHTML;

    const scoreDisplay = document.getElementById('whack-a-mole-score');
    const timeDisplay = document.getElementById('whack-a-mole-time');
    const moleHoles = container.querySelectorAll('.mole-hole');
    const startButton = document.getElementById('start-whack-a-mole-btn');

    function getRandomMoleHole() {
        const idx = Math.floor(Math.random() * moleHoles.length);
        return moleHoles[idx];
    }

    function popMole() {
        const hole = getRandomMoleHole();
        const mole = hole.querySelector('.mole');
        mole.classList.add('up');
        setTimeout(() => {
            mole.classList.remove('up');
        }, 1000);
    }

    function whackMole(e) {
        if (!e.target.classList.contains('mole') || !e.target.classList.contains('up')) return;
        score++;
        scoreDisplay.textContent = score;
        e.target.classList.remove('up');
    }

    function startGame() {
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startButton.disabled = true;

        gameInterval = setInterval(popMole, 1200);
        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(timer);
        alert('Game Over! Your score is ' + score);
        startButton.disabled = false;
    }

    moleHoles.forEach(hole => hole.addEventListener('click', whackMole));
    startButton.addEventListener('click', startGame);
}