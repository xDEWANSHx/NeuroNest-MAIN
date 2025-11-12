function initializeMemoryMatch() {
    const ICONS = ['🌟', '🍎', '🚀', '🧠', '🎨', '🧭', '❤️', '💡'];
    const GRID_SIZE = 16;

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval;

    const grid = document.getElementById('memory-grid');
    const movesEl = document.getElementById('memory-moves');
    const timerEl = document.getElementById('memory-timer');
    const restartBtn = document.getElementById('restart-memory-btn');

    function startGame() {
        // Reset all game variables
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        timer = 0;
        clearInterval(timerInterval);

        // Update UI
        movesEl.textContent = moves;
        timerEl.textContent = `${timer}s`;
        grid.innerHTML = '';

        // Create card pairs
        const cardIcons = [...ICONS, ...ICONS];
        cardIcons.sort(() => 0.5 - Math.random()); // Shuffle icons

        // Create and append card elements
        for (let i = 0; i < GRID_SIZE; i++) {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.icon = cardIcons[i];

            card.innerHTML = `
                <div class="card-face card-back">?</div>
                <div class="card-face card-front">${cardIcons[i]}</div>
            `;

            card.addEventListener('click', () => flipCard(card));
            grid.appendChild(card);
            cards.push(card);
        }

        // Start the timer
        timerInterval = setInterval(() => {
            timer++;
            timerEl.textContent = `${timer}s`;
        }, 1000);
    }

    function flipCard(card) {
        // Prevent flipping more than 2 cards, or flipping an already matched/flipped card
        if (flippedCards.length >= 2 || card.classList.contains('flipped')) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesEl.textContent = moves;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.icon === card2.dataset.icon) {
            // It's a match!
            matchedPairs++;
            flippedCards = []; // Reset flipped cards array

            if (matchedPairs === ICONS.length) {
                // Game over
                clearInterval(timerInterval);
                setTimeout(() => alert(`You won in ${moves} moves and ${timer} seconds!`), 500);
            }
        } else {
            // Not a match, flip them back after a short delay
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    restartBtn.addEventListener('click', startGame);

    // Initial game start
    startGame();
}