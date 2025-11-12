function initializeFocusQuest() {
    const GAME_DURATION = 30; // seconds

    let score = 0;
    let timeLeft = GAME_DURATION;
    let gameInterval;
    let targetMoveInterval;

    const scoreEl = document.getElementById('focus-score');
    const timerEl = document.getElementById('focus-timer');
    const startBtn = document.getElementById('start-focus-quest-btn');
    const focusArea = document.getElementById('focus-area');
    const target = document.getElementById('focus-target');

    function startGame() {
        score = 0;
        timeLeft = GAME_DURATION;
        scoreEl.textContent = score;
        timerEl.textContent = `${timeLeft}s`;
        startBtn.style.display = 'none';

        target.addEventListener('click', handleTargetClick);

        clearInterval(gameInterval);
        gameInterval = setInterval(updateTimer, 1000);

        clearInterval(targetMoveInterval);
        targetMoveInterval = setInterval(moveTarget, 1000); // Move target every second

        moveTarget(); // Initial position
    }

    function updateTimer() {
        timeLeft--;
        timerEl.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(targetMoveInterval);
        target.removeEventListener('click', handleTargetClick);
        startBtn.textContent = 'Play Again';
        startBtn.style.display = 'block';
        alert(`Game Over! Your final score is ${score}.`);
    }

    function handleTargetClick() {
        score++;
        scoreEl.textContent = score;
        moveTarget(); // Move target immediately after a successful click
    }

    function moveTarget() {
        const areaWidth = focusArea.clientWidth;
        const areaHeight = focusArea.clientHeight;
        const targetSize = target.clientWidth;

        const randomX = Math.random() * (areaWidth - targetSize);
        const randomY = Math.random() * (areaHeight - targetSize);

        target.style.left = `${randomX}px`;
        target.style.top = `${randomY}px`;
    }

    startBtn.addEventListener('click', startGame);
}