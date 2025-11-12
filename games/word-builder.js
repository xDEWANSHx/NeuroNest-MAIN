function initializeWordBuilder() {
    const VOWELS = "AEIOU";
    const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";
    const LETTER_COUNT = 7;

    let baseLetters = [];
    let foundWords = new Set();

    const letterTilesContainer = document.getElementById('letter-tiles');
    const wordInput = document.getElementById('word-input');
    const submitBtn = document.getElementById('submit-word-btn');
    const feedbackEl = document.getElementById('word-feedback');
    const foundWordsList = document.getElementById('found-words-list');
    const foundWordsCount = document.getElementById('found-words-count');
    const newGameBtn = document.getElementById('new-word-game-btn');

    function generateLetters() {
        baseLetters = [];
        // Ensure at least 2 vowels and 3 consonants
        for (let i = 0; i < 2; i++) {
            baseLetters.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
        }
        for (let i = 0; i < 3; i++) {
            baseLetters.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
        }
        // Fill the rest with random letters
        while (baseLetters.length < LETTER_COUNT) {
            const allLetters = VOWELS + CONSONANTS;
            baseLetters.push(allLetters[Math.floor(Math.random() * allLetters.length)]);
        }
        
        // Shuffle the final set of letters
        baseLetters.sort(() => 0.5 - Math.random());
    }

    function renderLetters() {
        letterTilesContainer.innerHTML = baseLetters.map(letter => `<div class="letter-tile">${letter}</div>`).join('');
    }

    function canBeFormed(word) {
        let tempLetters = [...baseLetters];
        for (const char of word.toUpperCase()) {
            const index = tempLetters.indexOf(char);
            if (index === -1) {
                return false; // Letter not available
            }
            tempLetters.splice(index, 1); // Use each letter only once
        }
        return true;
    }

    async function isValidWord(word) {
        if (word.length < 3) return false;
        // Using a free dictionary API to check if the word is real
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return response.ok;
        } catch (error) {
            console.error("Dictionary API error:", error);
            // Fallback for network errors: accept any word that can be formed
            return true; 
        }
    }

    async function handleSubmitWord() {
        const word = wordInput.value.trim().toLowerCase();
        wordInput.value = '';
        feedbackEl.textContent = '';

        if (word.length < 3) {
            feedbackEl.textContent = "Word must be at least 3 letters long.";
            feedbackEl.style.color = 'red';
            return;
        }

        if (foundWords.has(word)) {
            feedbackEl.textContent = "You've already found that word!";
            feedbackEl.style.color = 'orange';
            return;
        }

        if (!canBeFormed(word)) {
            feedbackEl.textContent = "You can only use the letters provided.";
            feedbackEl.style.color = 'red';
            return;
        }

        const isValid = await isValidWord(word);
        if (isValid) {
            feedbackEl.textContent = "Great word!";
            feedbackEl.style.color = 'green';
            foundWords.add(word);
            renderFoundWords();
        } else {
            feedbackEl.textContent = "That's not a valid word.";
            feedbackEl.style.color = 'red';
        }
    }

    function renderFoundWords() {
        foundWordsList.innerHTML = [...foundWords].sort().map(word => `<li>${word}</li>`).join('');
        foundWordsCount.textContent = foundWords.size;
    }

    function newGame() {
        foundWords.clear();
        generateLetters();
        renderLetters();
        renderFoundWords();
        feedbackEl.textContent = '';
        wordInput.value = '';
    }

    // Event Listeners
    submitBtn.addEventListener('click', handleSubmitWord);
    wordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSubmitWord();
        }
    });
    newGameBtn.addEventListener('click', newGame);

    // Initial game start
    newGame();
}