function initializeQuickMatch() {
    const SYMBOLS = ['⭐', '🌈', '💡', '🚀', '🐢', '🌳', '💧', '🍎'];
    const GAME_DURATION = 30; // seconds

    let score = 0;
    let timeLeft = GAME_DURATION;
    let gameInterval;
    let currentTargetSymbol;

    const startBtn = document.getElementById('start-match-btn');
    const targetEl = document.getElementById('target-symbol');
    const optionsEl = document.getElementById('match-options');
    const feedbackEl = document.getElementById('match-feedback');
    const scoreEl = document.getElementById('match-score');
    const timerEl = document.getElementById('match-timer');

    function resetGame() {
        score = 0;
        timeLeft = GAME_DURATION;
        scoreEl.textContent = score;
        timerEl.textContent = timeLeft;
        feedbackEl.textContent = '';
        targetEl.textContent = '?';
        optionsEl.innerHTML = '';
        startBtn.style.display = 'block';
        optionsEl.removeEventListener('click', handleOptionClick);
    }

    function startGame() {
        startBtn.style.display = 'none';
        feedbackEl.textContent = '';
        score = 0;
        timeLeft = GAME_DURATION;
        scoreEl.textContent = score;
        timerEl.textContent = timeLeft;
        
        optionsEl.addEventListener('click', handleOptionClick);
        
        generateNewRound();
        
        clearInterval(gameInterval);
        gameInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        feedbackEl.textContent = `Game Over! Final Score: ${score}`;
        targetEl.textContent = '🎉';
        startBtn.textContent = 'Play Again';
        startBtn.style.display = 'block';
        optionsEl.innerHTML = '';
        optionsEl.removeEventListener('click', handleOptionClick);
    }

    function generateNewRound() {
        // 1. Select 4 unique symbols for options
        const shuffledSymbols = [...SYMBOLS].sort(() => 0.5 - Math.random());
        const options = shuffledSymbols.slice(0, 4);

        // 2. Select one of the options as the target
        currentTargetSymbol = options[Math.floor(Math.random() * options.length)];

        // 3. Display target
        targetEl.textContent = currentTargetSymbol;

        // 4. Render options
        optionsEl.innerHTML = options.map(symbol =>
            `<button class="match-option-btn" data-symbol="${symbol}">${symbol}</button>`
        ).join('');
    }

    function handleOptionClick(e) {
        if (e.target.classList.contains('match-option-btn')) {
            const selectedSymbol = e.target.dataset.symbol;
            
            if (selectedSymbol === currentTargetSymbol) {
                score++;
                feedbackEl.textContent = 'Correct!';
                scoreEl.textContent = score;
                generateNewRound();
            } else {
                feedbackEl.textContent = 'Oops! Try again.';
                // Optional: penalize time or score
            }
        }
    }

    startBtn.addEventListener('click', startGame);
    resetGame(); // Initialize display
}