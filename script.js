document.addEventListener('DOMContentLoaded', () => {
    let isAuthenticated = false;
    let currentUsername = null;

    const navLinks = document.querySelectorAll('.nav-link');
    const mainContent = document.getElementById('main-content');
    const modalContainer = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    const chatbotBtn = document.getElementById('chatbot-btn');
    const supportBtn = document.getElementById('support-btn');

    const suggestedActivities = {
        1: { // Anxious
            exercises: ["Try a 2-minute deep breathing exercise.", "Let's do a quick guided meditation for calm."],
            games: ["Play the 'Zen Garden' game to relax.", "Try a slow-paced puzzle game."],
            content: ["Read a short, calming story.", "Listen to some soothing nature sounds."]
        },
        2: { // Sad
            exercises: ["A gentle stretching exercise might help.", "Let's try a mindful listening activity."],
            games: ["How about a creative coloring game?", "Let's build something in the 'Block Builder' game."],
            content: ["Watch a funny, short animation.", "Listen to an uplifting song."]
        },
        3: { // Neutral
            exercises: ["A great time to try a new yoga pose!", "Let's do a quick focus exercise."],
            games: ["Challenge yourself with a memory game.", "Try to beat your high score in 'Task Runner'."],
            content: ["Learn a fun new fact of the day.", "Explore a new topic in the learning center."]
        },
        4: { // Happy
            exercises: ["Let's do a fun dance-along video!", "Channel that energy with a quick workout."],
            games: ["Try a fast-paced action game!", "Let's play a collaborative game with a friend."],
            content: ["Create your own story in the story builder.", "Share your happiness with a friend or family member."]
        },
        5: { // Excited
            exercises: ["A high-energy workout is perfect right now!", "Let's try some jumping jacks to celebrate!"],
            games: ["Set a new record in our fastest game!", "Compete in the daily challenge!"],
            content: ["Write down what you're excited about!", "Listen to some energetic, happy music."]
        }
    };

    // --- Progress and Badge Logic ---
    const BADGE_CRITERIA = {
        'Early Bird': { description: 'Completed 5 tasks before 9 AM.', check: (progress) => progress.tasksCompletedEarly >= 5 },
        'Task Master': { description: 'Completed 10 tasks successfully.', check: (progress) => progress.tasksCompletedTotal >= 10 },
        'Zen Seeker': { description: 'Completed 5 Deep Breathing exercises.', check: (progress) => progress.deepBreathingCount >= 5 },
        'Daily User': { description: 'Used the app 7 days in a row.', check: (progress) => progress.consecutiveDays >= 7 },
        'Game Changer': { description: 'Played 3 games.', check: (progress) => progress.gamesPlayed >= 3 },
        'Quick Thinker': { description: 'Achieved a score of 10 in Quick Match.', check: (progress) => progress.highScores.quickMatch >= 10 },
        'Sequence Master': { description: 'Reached level 5 in Simon Says.', check: (progress) => progress.highScores.simonSays >= 5 },
        'Focus Champion': { description: 'Achieved a score of 50 in Focus Quest.', check: (progress) => progress.highScores.focusQuest >= 50 },
        'Sound Explorer': { description: 'Completed a Mindful Listening session.', check: (progress) => progress.mindfulListeningCount >= 1 },
        'Body Harmonizer': { description: 'Completed a Body Scan session.', check: (progress) => progress.bodyScanCount >= 1 },
        'Calm Tapper': { description: 'Completed a Tapping Techniques sequence.', check: (progress) => progress.tappingCount >= 1 }
    };

    function getOrCreateProgress() {
        const defaultProgress = {
            tasksCompletedTotal: 0,
            tasksCompletedEarly: 0, // For 'Early Bird' badge
            deepBreathingCount: 0,
            meditationCount: 0,
            mindfulListeningCount: 0,
            bodyScanCount: 0,
            tappingCount: 0,
            gamesPlayed: 0,
            badges: [],
            lastLogin: null,
            consecutiveDays: 0,
            usageHistory: [], // [{ date: 'YYYY-MM-DD', tasks: 5, completed: 3 }]
            highScores: {
                quickMatch: 0,
                simonSays: 0,
                mazeRunner: 0,
                memoryMatch: 0,
                wordBuilder: 0,
                focusQuest: 0,
                whackAMole: 0,
                patternPanic: 0
            },
            unlockedContent: {
                music: ['soft_tune.mp3', 'nature_sounds.mp3'], // Default tracks
                games: ['soothing', 'neuron', 'simon', 'maze', 'memory', 'wordBuilder', 'focusQuest', 'whackAMole', 'patternPanic'] // All games are unlocked by default for now
            }
        };
        let progress = JSON.parse(localStorage.getItem('neuroNestProgress')) || defaultProgress;
        
        // Ensure all default properties exist for backward compatibility
        progress = { ...defaultProgress, ...progress,
            highScores: { ...defaultProgress.highScores, ...(progress.highScores || {}) },
            unlockedContent: { ...defaultProgress.unlockedContent, ...(progress.unlockedContent || {}) }
        };

        // Update usage history and consecutive days
        const today = new Date().toISOString().split('T')[0];
        if (progress.lastLogin !== today) {
            if (progress.lastLogin) {
                const lastLoginDate = new Date(progress.lastLogin);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];

                if (progress.lastLogin === yesterdayString) {
                    progress.consecutiveDays += 1;
                } else {
                    progress.consecutiveDays = 1;
                }
            } else {
                progress.consecutiveDays = 1;
            }
            progress.lastLogin = today;
        }

        // Ensure usageHistory has today's entry
        if (!progress.usageHistory.find(entry => entry.date === today)) {
            progress.usageHistory.push({ date: today, tasks: 0, completed: 0 });
        }
    function updateHighScore(gameKey, newScore) {
        const progress = getOrCreateProgress();
        
        // Ensure highScores object exists and initialize if necessary (handled by getOrCreateProgress now, but good practice to check)
        if (progress.highScores[gameKey] === undefined) {
            progress.highScores[gameKey] = newScore;
        } else if (newScore > progress.highScores[gameKey]) {
            progress.highScores[gameKey] = newScore;
        }
        
        // Increment games played count
        progress.gamesPlayed += 1;

        checkAndAwardBadges(progress);
        saveProgress(progress);
    }

        saveProgress(progress);
        return progress;
    }

    function saveProgress(progress) {
        localStorage.setItem('neuroNestProgress', JSON.stringify(progress));
    }

    function checkAndAwardBadges(progress) {
        let awarded = false;
        for (const badgeName in BADGE_CRITERIA) {
            if (!progress.badges.includes(badgeName) && BADGE_CRITERIA[badgeName].check(progress)) {
                progress.badges.push(badgeName);
                awarded = true;
                console.log(`Badge awarded: ${badgeName}`);
                // Optionally show a notification/modal for the badge
            }
        }
        if (awarded) {
            saveProgress(progress);
        }
    }
    function getBadgeFAQContent() {
        const badgeListHtml = Object.keys(BADGE_CRITERIA).map(badgeName => {
            const criteria = BADGE_CRITERIA[badgeName];
            return `
                <li>
                    <strong>${badgeName}:</strong> ${criteria.description}
                </li>
            `;
        }).join('');

        return `
            <div class="badge-faq-modal-content">
                <h2>NeuroNest Badges FAQ</h2>
                <p>Badges are rewards for achieving milestones in your journey towards better focus and well-being. They track your consistency and encourage you to explore different activities.</p>
                
                <h3>How to Earn Badges:</h3>
                <ul class="badge-criteria-list">
                    ${badgeListHtml}
                </ul>

                <h3>Purpose of Badges:</h3>
                <p>Badges serve as positive reinforcement, celebrating your progress and encouraging the formation of healthy habits, such as daily usage, task completion, and engaging in mindful exercises and focus games.</p>
            </div>
        `;
    }

    // Initialize progress on load
    getOrCreateProgress();


    const tabContent = {
        
        home: (username) => {
            const greetingName = username || 'buddy';
            return `
                <div class="tab-content" id="home">
                    <div class="home-hero">
                        <div class="hero-shapes">
                            <div class="shape shape-1"></div>
                            <div class="shape shape-2"></div>
                            <div class="shape shape-3"></div>
                        </div>
                        <div class="hero-content">
                            <h2>Hi ${greetingName}! Welcome to NeuroNest!</h2>
                            <p>Your safe space to play, learn, and grow.</p>
                        </div>
                    </div>

                    <div class="home-section mood-tracker-section">
                        <h3>How are you feeling today?</h3>
                        <div class="mood-options-new">
                            <div class="mood-emoji" data-mood="1">😢</div>
                            <div class="mood-emoji" data-mood="2">😟</div>
                            <div class="mood-emoji" data-mood="3">😐</div>
                            <div class="mood-emoji" data-mood="4">😊</div>
                            <div class="mood-emoji" data-mood="5">😄</div>
                        </div>
                    </div>

                    <div class="home-grid">
                        <div class="home-card game-of-the-day">
                            <h4>Game of the Day</h4>
                            <div id="game-of-the-day-content">
                                </div>
                        </div>
                        <div class="home-card quick-activities">
                            <h4>Quick Activities</h4>
                            <ul>
                                <li><button class="quick-activity-btn" data-activity="breathing">2-Min Breathing</button></li>
                                <li><button class="quick-activity-btn" data-activity="doodle">Doodle Pad</button></li>
                            </ul>
                        </div>
                    </div>
                    <div id="suggested-activities"></div>
                </div>
            `;
        },
        tasks: `
            <div class="tab-content" id="tasks">
                <h2>Your Daily Adventures!</h2>
                <div class="task-input-area">
                    <input type="text" id="new-task-text" placeholder="What's your next adventure?" required>
                    <input type="time" id="new-task-time" required>
                    <button id="add-task-btn">Add Task</button>
                </div>
                <div class="task-list-container">
                    <h3>Today's Missions:</h3>
                    <ul id="task-list">
                        <!-- Tasks will be rendered here -->
                    </ul>
                </div>
            </div>
        `,
        activities: `
            <div class="tab-content" id="activities">
                <h2>Mindful Activities</h2>
                <p>Choose an activity category below:</p>
                <div class="game-tile-list" id="activity-category-list">
                    <button class="game-tile-card" data-category="music">
                        <span class="game-tile-icon">🎶</span>
                        <h4>Soothing Sounds</h4>
                        <p>Relax and focus with calming audio tracks.</p>
                    </button>
                    <button class="game-tile-card" data-category="exercises">
                        <span class="game-tile-icon">🧘</span>
                        <h4>Mindful Exercises</h4>
                        <p>Practice deep breathing and relaxation techniques.</p>
                    </button>
                    <button class="game-tile-card" data-category="games">
                        <span class="game-tile-icon">🎮</span>
                        <h4>Focus Games</h4>
                        <p>Boost your attention and memory with fun games.</p>
                    </button>
                </div>
            </div>
        `,
        dashboard: `
            <div class="tab-content" id="dashboard">
                <h2>Your Progress Palace!</h2>
                <div class="dashboard-grid">
                    <div class="mascot-area">
                        <div id="mascot-image">
                            <!-- Cute little mascot SVG placeholder (Rabbit) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rabbit">
                                <path d="M10 18a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1z"></path>
                                <path d="M12 2a4 4 0 0 0-4 4v2h8V6a4 4 0 0 0-4-4z"></path>
                                <path d="M18 10a6 6 0 0 0-12 0v4a6 6 0 0 0 12 0z"></path>
                                <path d="M15 14h-6"></path>
                                <path d="M12 18v4"></path>
                            </svg>
                        </div>
                        <p id="mascot-message">Welcome back! Let's check your progress.</p>
                    </div>
                    
                    <div class="progress-summary">
                        <h3>Overall Stats</h3>
                        <div id="progress-stats">
                            <!-- Stats will be rendered here -->
                        </div>
                    </div>

                    <div class="progress-chart-area">
                        <h3>Usage History (Last 7 Days)</h3>
                        <canvas id="usage-chart"></canvas>
                    </div>

                    <div class="badge-area">
                        <div class="badge-header">
                            <h3>Badges Won (<span id="badge-count">0</span>)</h3>
                            <button id="badge-faq-btn" class="icon-btn" title="How to earn badges?">❓</button>
                        </div>
                        <div id="badges-container">
                            <!-- Badges will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    // --- Authentication Logic ---
    function updateAuthUI() {
        const authUI = document.getElementById('auth-ui');
        const userProfile = document.getElementById('user-profile');

        if (!authUI || !userProfile) return;

        if (isAuthenticated) {
            authUI.style.display = 'none';
            userProfile.style.display = 'block';
        } else {
            authUI.style.display = 'block';
            userProfile.style.display = 'none';
        }
    }

    function initializeAccountTab() {
        const authToggleModalBtn = document.getElementById('auth-toggle-modal-btn');
        const profileBtn = document.getElementById('profile-btn');
        
        let isRegisterMode = false;
        let isParentLoginMode = false; // New state variable

        const authModalContent = (isInitialPrompt = false) => `
            <div class="auth-modal-content">
                ${isInitialPrompt ? '<h3>Welcome to NeuroNest!</h3><p>Please log in or register to save your progress.</p>' : ''}
                
                <div class="auth-tabs">
                    <button class="auth-tab-btn ${!isParentLoginMode ? 'active' : ''}" data-mode="child">Child's Login</button>
                    <button class="auth-tab-btn ${isParentLoginMode ? 'active' : ''}" data-mode="parent">Parents Login</button>
                </div>

                ${isParentLoginMode ? `
                    <div class="parent-login-area">
                        <h2>Parents Login</h2>
                        <p class="coming-soon-message">
                            Coming Soon! Here's what's next in the Parents App UI:
                        </p>
                        <ul class="parent-features-list">
                            <li>> LOGIN PAGE FOR PARENTS</li>
                            <li>> LINK CHILD'S ACCOUNT</li>
                            <li>> THE ACTIVITY WILL BE DISPLAYED</li>
                            <li>> LOCATION HISTORY</li>
                            <li>> CURRENT LOCATION</li>
                            <li>> USAGE TIME</li>
                        </ul>
                    </div>
                ` : `
                    <div class="child-login-area">
                        <h2>${isRegisterMode ? 'Register' : 'Login'}</h2>
                        <form id="auth-form-modal">
                            <input type="text" id="auth-username-modal" placeholder="Username" required>
                            <input type="password" id="auth-password-modal" placeholder="Password" required>
                            ${!isRegisterMode ? `
                                <div style="display: flex; align-items: center; margin-top: 10px;">
                                    <input type="checkbox" id="remind-me-checkbox" style="margin-right: 5px;">
                                    <label for="remind-me-checkbox" style="font-size: 0.9rem;">Remind me (Keep me logged in)</label>
                                </div>
                            ` : ''}
                            <button type="submit" id="auth-submit-modal-btn" style="margin-top: 15px;">${isRegisterMode ? 'Register' : 'Login'}</button>
                        </form>
                        <p id="auth-message-modal" style="color: red; margin-top: 10px;"></p>
                        <button id="toggle-auth-mode-modal" style="margin-top: 10px; background: none; border: none; color: var(--primary-color); cursor: pointer;">
                            Switch to ${isRegisterMode ? 'Login' : 'Register'}
                        </button>
                    </div>
                `}
            </div>
        `;

        function openAuthModal(isInitialPrompt = false) {
            openModal(authModalContent(isInitialPrompt));
            
            // Add listeners inside the modal
            const authForm = document.getElementById('auth-form-modal');
            const toggleBtn = document.getElementById('toggle-auth-mode-modal');
            const tabBtns = document.querySelectorAll('.auth-tab-btn');
            
            if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
            if (toggleBtn) toggleBtn.addEventListener('click', toggleAuthMode);
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    isParentLoginMode = e.target.dataset.mode === 'parent';
                    openAuthModal(isInitialPrompt); // Re-render modal content
                });
            });
        }

        function toggleAuthMode() {
            isRegisterMode = !isRegisterMode;
            openAuthModal(); // Re-render modal content
        }

        async function handleAuthSubmit(e) {
            e.preventDefault();
            
            // Only proceed if we are in Child Login mode
            if (isParentLoginMode) return;

            const authMessage = document.getElementById('auth-message-modal');
            authMessage.textContent = '';

            const username = document.getElementById('auth-username-modal').value;
            const password = document.getElementById('auth-password-modal').value;
            const endpoint = isRegisterMode ? '/api/register' : '/api/login';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authMessage.style.color = 'green';
                    authMessage.textContent = data.message;
                    
                    if (!isRegisterMode) {
                        // Successful Login
                        isAuthenticated = true;
                        currentUsername = username;
                        
                        const remindMeCheckbox = document.getElementById('remind-me-checkbox');
                        const isPersistent = remindMeCheckbox ? remindMeCheckbox.checked : false;

                        localStorage.setItem('neuroNestUser', JSON.stringify({ username, persistent: isPersistent }));
                        
                        updateAuthUI();
                        closeModal();
                        switchTab('home'); // Redirect to home after login
                    } else {
                        // Successful Registration: switch to login mode
                        isRegisterMode = false;
                        openAuthModal();
                    }
                } else {
                    authMessage.style.color = 'red';
                    authMessage.textContent = data.message || 'An error occurred.';
                }
            } catch (error) {
                authMessage.style.color = 'red';
                authMessage.textContent = 'Network error or server unreachable.';
                console.error('Auth error:', error);
            }
        }

        function handleLogout() {
            isAuthenticated = false;
            currentUsername = null;
            localStorage.removeItem('neuroNestUser');
            updateAuthUI();
            closeModal();
            switchTab('home'); // Redirect to home after logout
        }

        function openProfileModal() {
            const content = `
                <div class="profile-modal-content">
                    <h2>Welcome, ${currentUsername}!</h2>
                    <p>You are currently logged in.</p>
                    <button id="logout-modal-btn" class="stop-activity-btn">Logout</button>
                </div>
            `;
            openModal(content);
            document.getElementById('logout-modal-btn').addEventListener('click', handleLogout);
        }

        if (authToggleModalBtn) authToggleModalBtn.addEventListener('click', () => openAuthModal(false));
        if (profileBtn) profileBtn.addEventListener('click', openProfileModal);

        // Initial UI update
        updateAuthUI();
    }

    function checkAuthStatus() {
        const user = localStorage.getItem('neuroNestUser');
        if (user) {
            const userData = JSON.parse(user);
            // Check if the user explicitly chose persistent login
            if (userData.persistent === true) {
                isAuthenticated = true;
                currentUsername = userData.username;
            } else {
                // If persistent is false or missing (for new logic), treat as logged out on refresh
                localStorage.removeItem('neuroNestUser');
            }
        }
    }

    checkAuthStatus();

    function switchTab(tab) {
        // Always query for the links inside the function to get the current set
        const currentNavLinks = document.querySelectorAll('.nav-link');
        currentNavLinks.forEach(navLink => navLink.classList.remove('active'));
        
        const activeLink = document.querySelector(`.nav-link[data-tab="${tab}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        if (tab === 'home' && typeof tabContent.home === 'function') {
            mainContent.innerHTML = tabContent.home(currentUsername);
        } else {
            mainContent.innerHTML = tabContent[tab];
        }
        
        const newContent = mainContent.querySelector('.tab-content');
        if (newContent) {
            setTimeout(() => {
                newContent.classList.add('active');
            }, 10);
        }
        if (tab === 'home') {
            addMoodTrackerListeners();
        } else if (tab === 'tasks') {
            initializeTaskTracker();
        } else if (tab === 'activities') {
            initializeActivitiesTab();
        } else if (tab === 'dashboard') {
            initializeDashboard();
        }
    }

    // --- Dashboard Logic ---
    function initializeDashboard() {
        const progress = getOrCreateProgress();
        renderProgressStats(progress);
        renderBadges(progress);
        renderUsageChart(progress);
        updateMascotMessage(progress);

        // Add listener for Badge FAQ button
        const faqBtn = document.getElementById('badge-faq-btn');
        if (faqBtn) {
            faqBtn.addEventListener('click', () => {
                openModal(getBadgeFAQContent());
            });
        }
    }

    function updateMascotMessage(progress) {
        const mascotMessageEl = document.getElementById('mascot-message');
        if (!mascotMessageEl) return;

        let message = "Welcome back! Let's check your progress.";
        if (progress.consecutiveDays > 1) {
            message = `You've used NeuroNest for ${progress.consecutiveDays} days in a row! Keep it up!`;
        } else if (progress.badges.length > 0) {
            message = `Wow, you've earned ${progress.badges.length} badges! You're a star!`;
        } else if (progress.tasksCompletedTotal > 0) {
            message = `You've completed ${progress.tasksCompletedTotal} tasks so far. Amazing work!`;
        }
        mascotMessageEl.textContent = message;
    }

    function renderProgressStats(progress) {
        const statsContainer = document.getElementById('progress-stats');
        if (!statsContainer) return;

        const stats = [
            { label: 'Tasks Completed', value: progress.tasksCompletedTotal },
            { label: 'Consecutive Days', value: progress.consecutiveDays },
            { label: 'Deep Breathing', value: progress.deepBreathingCount },
            { label: 'Meditations', value: progress.meditationCount },
        ];

        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    function renderBadges(progress) {
        const badgesContainer = document.getElementById('badges-container');
        const badgeCountEl = document.getElementById('badge-count');
        if (!badgesContainer || !badgeCountEl) return;

        badgeCountEl.textContent = progress.badges.length;

        const allBadges = Object.keys(BADGE_CRITERIA);
        
        badgesContainer.innerHTML = allBadges.map(badgeName => {
            const isWon = progress.badges.includes(badgeName);
            const description = BADGE_CRITERIA[badgeName].description;
            const icon = isWon ? '⭐' : '🔒'; // Simple icons

            return `
                <div class="badge-item ${isWon ? 'won' : ''}" title="${description}">
                    <span class="badge-icon">${icon}</span>
                    <span class="badge-name">${badgeName}</span>
                </div>
            `;
        }).join('');
    }

    function renderUsageChart(progress) {
        const ctx = document.getElementById('usage-chart');
        if (!ctx) return;

        // Prepare data for the last 7 days
        const history = progress.usageHistory.slice(-7);
        const labels = history.map(entry => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = history.map(entry => entry.tasks);
        const completedData = history.map(entry => entry.completed);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tasks Created',
                    data: data,
                    backgroundColor: 'rgba(137, 207, 240, 0.8)', // Primary color
                    borderColor: 'rgba(137, 207, 240, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tasks'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }

    // --- Music Player Logic ---
    let currentAudio = null;
    let isPlaying = false;

    function initializeMusicPlayer() {
        const toggleBtn = document.getElementById('toggle-music-btn');
        const trackSelect = document.getElementById('music-track-select');

        if (!toggleBtn || !trackSelect) return;

        toggleBtn.addEventListener('click', () => {
            if (isPlaying) {
                stopMusic();
            } else {
                playMusic(trackSelect.value);
            }
        });

        trackSelect.addEventListener('change', () => {
            if (isPlaying) {
                playMusic(trackSelect.value); // Automatically switch and play new track
            }
        });

        function playMusic(track) {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            
            // NOTE: Assuming audio files are in the root directory
            currentAudio = new Audio(track);
            currentAudio.loop = true;
            currentAudio.play().then(() => {
                isPlaying = true;
                toggleBtn.textContent = 'Pause';
            }).catch(e => {
                console.error("Music playback failed:", e);
                toggleBtn.textContent = 'Error';
                isPlaying = false;
            });
        }

        function stopMusic() {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            isPlaying = false;
            toggleBtn.textContent = 'Play';
        }
    }

    // --- Activity Modal Content Definitions ---
    const activityModalContent = {
        music: `
            <div class="activity-modal-content music-section">
                <h3>Soothing Sounds</h3>
                <p>Listen to calming music or nature sounds to help you focus or relax.</p>
                <div id="music-player-controls">
                    <select id="music-track-select">
                        <option value="soft_tune.mp3">Soft Tune (Focus)</option>
                        <option value="nature_sounds.mp3">Nature Sounds (Relax)</option>
                    </select>
                    <button id="toggle-music-btn">Play</button>
                </div>
            </div>
        `,
        exercises: `
            <div class="activity-modal-content exercises-section">
                <h3>Mindful Moments</h3>
                <div class="exercise-scroll-controls">
                    <button id="scroll-up-btn" class="scroll-nav-btn up">▲</button>
                    <button id="scroll-down-btn" class="scroll-nav-btn down">▼</button>
                </div>
                <div class="exercise-list-container">
                    <div class="exercise-activity" id="deep-breathing">
                        <h3>2-Minute Deep Breathing</h3>
                        <p>Helps calm hyperactivity and reduce anxiety.</p>
                        <button id="start-breathing-btn">Start Breathing</button>
                    </div>

                    <div class="exercise-activity" id="five-minute-meditation">
                        <h3>5-Minute Guided Meditation</h3>
                        <p>A short session to center your thoughts and reduce stress.</p>
                        <button id="start-meditation-btn">Start Meditation</button>
                    </div>

                    <div class="exercise-activity" id="quick-stretch">
                        <h3>Quick Stretch Break</h3>
                        <p>Release physical tension and reset your body.</p>
                        <button id="start-stretch-btn">View Stretches</button>
                    </div>

                    <div class="exercise-activity" id="mindful-listening">
                        <h3>Mindful Listening / Sound Walk</h3>
                        <p>Intentionally notice and identify sounds around you.</p>
                        <button id="start-listening-btn">Start Sound Walk</button>
                    </div>

                    <div class="exercise-activity" id="body-scan">
                        <h3>Body Scan (Simplified)</h3>
                        <p>Systematically bring attention to different parts of your body.</p>
                        <button id="start-bodyscan-btn">Start Body Scan</button>
                    </div>

                    <div class="exercise-activity" id="tapping-techniques">
                        <h3>Tapping Techniques (EFT)</h3>
                        <p>Gentle tapping on acupressure points for calm.</p>
                        <button id="start-tapping-btn">Start Tapping</button>
                    </div>
                </div>
            </div>
        `,
        games: `
            <div class="activity-modal-content games-section">
                <h3>Game Zone!</h3>
                <p>Select a game to start your mindful adventure.</p>
                <div class="game-tile-list" id="game-tile-list">
                    <button class="game-tile-card" data-game="soothing">
                        <span class="game-tile-icon">✍️</span>
                        <h4>Soothing Doodle Pad</h4>
                        <p>Relax your mind with simple, repetitive drawing.</p>
                    </button>
                    <button class="game-tile-card" data-game="neuron">
                        <span class="game-tile-icon">🧠</span>
                        <h4>Happy Neuron: Quick Match</h4>
                        <p>A quick attention game to boost focus.</p>
                    </button>
                    <button class="game-tile-card" data-game="simon">
                        <span class="game-tile-icon">👂</span>
                        <h4>Simon Says Sequence</h4>
                        <p>Test your listening and impulse control.</p>
                    </button>
                    <button class="game-tile-card" data-game="maze">
                        <span class="game-tile-icon">🧭</span>
                        <h4>Maze Runner</h4>
                        <p>Navigate the maze to boost spatial reasoning.</p>
                    </button>
                    <button class="game-tile-card" data-game="memory">
                        <span class="game-tile-icon">🤔</span>
                        <h4>Memory Match</h4>
                        <p>Flip cards and find the matching pairs.</p>
                    </button>
                    <button class="game-tile-card" data-game="wordBuilder">
                        <span class="game-tile-icon">📝</span>
                        <h4>Word Builder</h4>
                        <p>Create words from the given letters.</p>
                    </button>
                    <button class="game-tile-card" data-game="focusQuest">
                        <span class="game-tile-icon">🎯</span>
                        <h4>Focus Quest</h4>
                        <p>Follow the target and click it!</p>
                    </button>
                    <button class="game-tile-card" data-game="whackAMole">
                        <span class="game-tile-icon">🔨</span>
                        <h4>Whack-a-Mole</h4>
                        <p>Test your reflexes and whack the moles as they pop up!</p>
                    </button>
                    <button class="game-tile-card" data-game="patternPanic">
                        <span class="game-tile-icon">🎨</span>
                        <h4>Pattern Panic</h4>
                        <p>Memorize and repeat the ever-growing color patterns.</p>
                    </button>
                </div>
            </div>
        `
    };

    // --- Activities Tab Logic (Refactored) ---
    function initializeActivitiesTab() {
        const categoryTiles = document.querySelectorAll('#activity-category-list .game-tile-card');
        
        categoryTiles.forEach(tile => {
            tile.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                openModal(activityModalContent[category], false, true); // Open modal with category content

                if (category === 'music') {
                    initializeMusicPlayer();
                } else if (category === 'exercises') {
                    // Initialize exercise listeners inside the modal
                    const startBreathingBtn = modalBody.querySelector('#start-breathing-btn');
                    if (startBreathingBtn) {
                        startBreathingBtn.addEventListener('click', startDeepBreathing);
                    }
                    
                    const startMeditationBtn = modalBody.querySelector('#start-meditation-btn');
                    if (startMeditationBtn) {
                        startMeditationBtn.addEventListener('click', () => startMeditation(5));
                    }

                    const startStretchBtn = modalBody.querySelector('#start-stretch-btn');
                    if (startStretchBtn) {
                        startStretchBtn.addEventListener('click', startQuickStretch);
                    }

                    // New exercise listeners
                    const startListeningBtn = modalBody.querySelector('#start-listening-btn');
                    if (startListeningBtn) {
                        startListeningBtn.addEventListener('click', startMindfulListening);
                    }

                    const startBodyscanBtn = modalBody.querySelector('#start-bodyscan-btn');
                    if (startBodyscanBtn) {
                        startBodyscanBtn.addEventListener('click', startBodyScan);
                    }

                    const startTappingBtn = modalBody.querySelector('#start-tapping-btn');
                    if (startTappingBtn) {
                        startTappingBtn.addEventListener('click', startTapping);
                    }

                    // Vertical Scroll Logic
                    const scrollContainer = modalBody.querySelector('.exercise-list-container');
                    const scrollUpBtn = modalBody.querySelector('#scroll-up-btn');
                    const scrollDownBtn = modalBody.querySelector('#scroll-down-btn');
                    const scrollAmount = 200; // Scroll by 200px

                    if (scrollContainer && scrollUpBtn && scrollDownBtn) {
                        scrollUpBtn.addEventListener('click', () => {
                            scrollContainer.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
                        });
                        scrollDownBtn.addEventListener('click', () => {
                            scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                        });
                    }
                } else if (category === 'games') {
                    // Initialize game tile listeners inside the modal
                    const gameTiles = modalBody.querySelectorAll('.game-tile-list .game-tile-card');
                    gameTiles.forEach(gameTile => {
                        gameTile.addEventListener('click', (e) => {
                            const gameName = e.currentTarget.dataset.game;
                            initializeGameInModal(gameName);
                        });
                    });
                }
            });
        });
    }

    // --- Game Logic Implementations ---
    function initializeGameInModal(gameName) {
        const content = gameContent[gameName];
        
        // Open the modal with the game content, marking it as a game
        openModal(content, false, true);

        // Initialize game logic after content is loaded into modalBody
        if (gameName === 'soothing') {
            initializeDoodlePad();
        } else if (gameName === 'neuron') {
            initializeQuickMatch();
        } else if (gameName === 'simon') {
            initializeSimonSays();
        } else if (gameName === 'maze') {
            initializeMazeRunner();
        } else if (gameName === 'memory') {
            initializeMemoryMatch();
        } else if (gameName === 'wordBuilder') {
            initializeWordBuilder();
        } else if (gameName === 'focusQuest') {
            initializeFocusQuest();
        } else if (gameName === 'whackAMole') {
            setupWhackAMole(modalBody.querySelector('.game-container'));
        } else if (gameName === 'patternPanic') {
            setupPatternPanic(modalBody.querySelector('.game-container'));
        }
    }

    const gameContent = {
        soothing: `
            <div class="game-container soothing-doodle-game">
                <h3>Soothing Doodle Pad</h3>
                <p>Draw simple, repetitive shapes or lines to soothe your mind. Press 'Clear' to start fresh.</p>
                <div class="doodle-controls">
                    <label for="doodle-color">Color:</label>
                    <input type="color" id="doodle-color" value="#89CFF0">
                    <label for="doodle-size">Size:</label>
                    <input type="range" id="doodle-size" min="1" max="20" value="5">
                    <button id="clear-doodle-btn">Clear</button>
                </div>
                <canvas id="doodle-canvas"></canvas>
            </div>
        `,
        neuron: `
            <div class="game-container quick-match-game">
                <h3>Happy Neuron: Quick Match</h3>
                <p>Test your attention and memory! Match the symbol shown in the center.</p>
                <div class="quick-match-area">
                    <div id="target-symbol" class="target-symbol">?</div>
                    <div id="match-options" class="match-options">
                        <!-- Options will be generated here -->
                    </div>
                    <div id="match-feedback" class="match-feedback"></div>
                    <button id="start-match-btn">Start Game</button>
                </div>
                <div class="match-stats">
                    <p>Score: <span id="match-score">0</span></p>
                    <p>Time Left: <span id="match-timer">30</span>s</p>
                </div>
            </div>
        `,
        simon: `
            <div class="game-container simon-says-game">
                <h3>Simon Says Sequence</h3>
                <p>Listen carefully! Only tap the shapes if "Simon Says" the command.</p>
                <div id="simon-says-area">
                    <div id="simon-says-message" class="simon-says-message">Press Start to Begin</div>
                    <div id="simon-says-controls" class="simon-says-controls">
                        <div class="simon-says-shape" data-shape="red"></div>
                        <div class="simon-says-shape" data-shape="blue"></div>
                        <div class="simon-says-shape" data-shape="green"></div>
                        <div class="simon-says-shape" data-shape="yellow"></div>
                    </div>
                    <div id="simon-says-stats" class="match-stats">
                        <p>Score: <span id="simon-score">0</span></p>
                        <p>Level: <span id="simon-level">1</span></p>
                    </div>
                    <button id="start-simon-btn" class="stop-activity-btn">Start Game</button>
                </div>
            </div>
        `,
        maze: `
            <div class="game-container maze-runner-game">
                <h3>Maze Runner</h3>
                <p>Use the arrow keys to navigate the path. Find the exit!</p>
                <div id="maze-area">
                    <canvas id="maze-canvas"></canvas>
                    <div id="maze-message" class="simon-says-message">Press Start to Begin</div>
                </div>
                <div id="maze-controls" class="match-stats">
                    <p>Moves: <span id="maze-moves">0</span></p>
                    <p>Status: <span id="maze-status">Ready</span></p>
                </div>
                <button id="start-maze-btn" class="stop-activity-btn">Start New Maze</button>
            </div>
        `,
        memory: `
            <div class="game-container memory-match-game">
                <h3>Memory Match</h3>
                <p>Find all the matching pairs to win!</p>
                <div class="memory-stats">
                    <p>Moves: <span id="memory-moves">0</span></p>
                    <p>Time: <span id="memory-timer">0s</span></p>
                </div>
                <div id="memory-grid" class="memory-grid">
                    <!-- Game cards will be generated here -->
                </div>
                <button id="restart-memory-btn" class="stop-activity-btn">Restart Game</button>
            </div>
        `,
        wordBuilder: `
            <div class="game-container word-builder-game">
                <h3>Word Builder</h3>
                <p>Form as many words as you can from the letters below.</p>
                <div class="word-builder-main">
                    <div id="letter-tiles" class="letter-tiles"></div>
                    <div class="word-input-area">
                        <input type="text" id="word-input" placeholder="Type your word here...">
                        <button id="submit-word-btn">Submit</button>
                    </div>
                    <div id="word-feedback" class="word-feedback"></div>
                </div>
                <div class="word-builder-sidebar">
                    <h4>Found Words (<span id="found-words-count">0</span>)</h4>
                    <ul id="found-words-list"></ul>
                </div>
                <button id="new-word-game-btn" class="stop-activity-btn">New Game</button>
            </div>
        `,
        focusQuest: `
            <div class="game-container focus-quest-game">
                <h3>Focus Quest</h3>
                <p>Click the moving target as many times as you can before time runs out!</p>
                <div class="focus-quest-stats">
                    <p>Score: <span id="focus-score">0</span></p>
                    <p>Time Left: <span id="focus-timer">30</span>s</p>
                </div>
                <div id="focus-area" class="focus-area">
                    <div id="focus-target" class="focus-target"></div>
                </div>
                <button id="start-focus-quest-btn" class="stop-activity-btn">Start Game</button>
            </div>
        `,
        whackAMole: `
            <div class="game-container whack-a-mole-game">
                <h3>Whack-a-Mole!</h3>
                <div class="whack-a-mole-stats">
                    <div>Score: <span id="whack-a-mole-score">0</span></div>
                    <div>Time Left: <span id="whack-a-mole-time">30</span>s</div>
                </div>
                <div class="whack-a-mole-grid">
                    ${Array(9).fill('<div class="mole-hole"><div class="mole"></div></div>').join('')}
                </div>
                <button id="start-whack-a-mole-btn">Start Game</button>
            </div>
        `,
        patternPanic: `
            <div class="game-container pattern-panic-game">
                <!-- Content will be generated by setupPatternPanic -->
            </div>
        `
    };

    function startDeepBreathing() {
        // NOTE: Audio files 'chime.mp3' and 'soft_tune.mp3' must be present in the root directory for audio to work.
        const chime = new Audio('chime.mp3');
        const softTune = new Audio('soft_tune.mp3');
        softTune.loop = true;
        
        const content = `
            <div class="activity-modal-content">
                <h3>Deep Breathing Exercise</h3>
                <div id="breathing-instructions" class="breathing-instruction">Get Ready...</div>
                <div id="breathing-visual" class="breathing-visual"></div>
                <div id="breathing-timer" class="activity-timer"></div>
                <button id="stop-breathing-btn" class="stop-activity-btn">Stop</button>
            </div>
        `;
        openModal(content);
        
        const instructionsEl = document.getElementById('breathing-instructions');
        const timerEl = document.getElementById('breathing-timer');
        const visualEl = document.getElementById('breathing-visual');
    function startMindfulListening() {
        const content = `
            <div class="activity-modal-content">
                <h3>Mindful Listening / Sound Walk</h3>
                <p>Close your eyes and focus on the sounds around you. Try to identify 5 different sounds.</p>
                <button id="finish-listening-btn" class="stop-activity-btn">Finished Listening</button>
            </div>
        `;
        openModal(content);
        document.getElementById('finish-listening-btn').addEventListener('click', () => {
            const progress = getOrCreateProgress();
            progress.mindfulListeningCount += 1;
            checkAndAwardBadges(progress);
            saveProgress(progress);
            closeModal();
        });
    }

    function startBodyScan() {
        const content = `
            <div class="activity-modal-content">
                <h3>Body Scan (Simplified)</h3>
                <p>Gently bring your attention to each part of your body, starting with your toes and moving up to your head.</p>
                <button id="finish-bodyscan-btn" class="stop-activity-btn">Finished Scan</button>
            </div>
        `;
        openModal(content);
        document.getElementById('finish-bodyscan-btn').addEventListener('click', () => {
            const progress = getOrCreateProgress();
            progress.bodyScanCount += 1;
            checkAndAwardBadges(progress);
            saveProgress(progress);
            closeModal();
        });
    }

    function startTapping() {
        const content = `
            <div class="activity-modal-content">
                <h3>Tapping Techniques (EFT)</h3>
                <p>Follow the guided animation (coming soon) or gently tap the side of your hand, eyebrow, and collarbone while focusing on a feeling of calm.</p>
                <button id="finish-tapping-btn" class="stop-activity-btn">Finished Tapping</button>
            </div>
        `;
        openModal(content);
        document.getElementById('finish-tapping-btn').addEventListener('click', () => {
            const progress = getOrCreateProgress();
            progress.tappingCount += 1;
            checkAndAwardBadges(progress);
            saveProgress(progress);
            closeModal();
        });
    }
    function startQuickStretch() {
        const content = `
            <div class="activity-modal-content">
                <h3>Quick Stretch Break</h3>
                <p>Follow these simple stretches:</p>
                <ol style="text-align: left; max-width: 300px; margin: 20px auto;">
                    <li>Neck Rolls (30s each direction)</li>
                    <li>Shoulder Shrugs (10 reps)</li>
                    <li>Wrist Circles (30s each direction)</li>
                    <li>Arm Cross Stretch (30s each arm)</li>
                </ol>
                <p>Remember to breathe deeply!</p>
                <button id="finish-stretch-btn" class="stop-activity-btn">Finished Stretching</button>
            </div>
        `;
        openModal(content);

        // No progress tracking for stretches yet, just a simple modal.
        document.getElementById('finish-stretch-btn').addEventListener('click', closeModal);
    }
        const stopBtn = document.getElementById('stop-breathing-btn');
        
        let cycle = 0;
        let interval;

        const phases = [
            { instruction: 'Breathe In...', duration: 4000, className: 'inhale' },
            { instruction: 'Hold...', duration: 2000, className: 'hold-inhale' },
            { instruction: 'Breathe Out...', duration: 6000, className: 'exhale' },
            { instruction: 'Hold...', duration: 2000, className: 'hold-exhale' }
        ];

        function runPhase() {
            const currentPhase = phases[cycle % phases.length];
            
            instructionsEl.textContent = currentPhase.instruction;
            visualEl.className = `breathing-visual ${currentPhase.className}`;
            
            // Update timer continuously
            let timeLeft = currentPhase.duration / 1000;
            timerEl.textContent = `${timeLeft} seconds remaining`;
            const timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft >= 0) {
                    timerEl.textContent = `${timeLeft} seconds remaining`;
                }
            }, 1000);

            interval = setTimeout(() => {
                clearInterval(timerInterval);
                cycle++;
                runPhase();
            }, currentPhase.duration);
        }
        
        softTune.play().catch(e => console.log("Soft tune playback failed:", e));
        runPhase();

        stopBtn.addEventListener('click', () => {
            clearInterval(interval);
            softTune.pause();
            softTune.currentTime = 0;
            
            // Track deep breathing completion (assuming stopping means completion for now)
            const progress = getOrCreateProgress();
            progress.deepBreathingCount += 1;
            checkAndAwardBadges(progress);
            saveProgress(progress);

            closeModal();
        });
    }

    function startMeditation(durationMinutes = 5) { // Default to 5 minutes
        if (durationMinutes <= 0) {
            console.error('Invalid meditation duration.');
            return;
        }

        const totalSeconds = durationMinutes * 60;

        const content = `
            <div class="activity-modal-content">
                <h3>${durationMinutes}-Minute Guided Meditation</h3>
                <p>Focus on your breath. Let your thoughts drift by.</p>
                <div id="meditation-timer-display">${durationMinutes}:00</div>
                <button id="stop-meditation-btn" class="stop-activity-btn">Stop</button>
            </div>
        `;
        openModal(content);

        const timerDisplay = document.getElementById('meditation-timer-display');
        const stopBtn = document.getElementById('stop-meditation-btn');
        let secondsRemaining = totalSeconds;
        let interval;

        function formatTime(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }

        function updateMeditationTimer() {
            if (secondsRemaining <= 0) {
                clearInterval(interval);
                timerDisplay.textContent = "Meditation Complete!";
                
                // Track meditation completion
                const progress = getOrCreateProgress();
                progress.meditationCount += 1;
                checkAndAwardBadges(progress);
                saveProgress(progress);

                return;
            }

            secondsRemaining--;
            timerDisplay.textContent = formatTime(secondsRemaining);
        }

        interval = setInterval(updateMeditationTimer, 1000);

        stopBtn.addEventListener('click', () => {
            clearInterval(interval);
            closeModal();
        });
    }

    // --- Task Tracker Logic ---
    function initializeTaskTracker() {
        const addTaskBtn = document.getElementById('add-task-btn');
        addTaskBtn.addEventListener('click', addTask);
        renderTasks();
    }

    function getTasks() {
        return JSON.parse(localStorage.getItem('neuroNestTasks')) || [];
    }

    function saveTasks(tasks) {
        localStorage.setItem('neuroNestTasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        const tasks = getTasks().sort((a, b) => (a.time > b.time) ? 1 : -1);
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No missions scheduled! Add a new adventure above.</li>';
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''} data-index="${index}">
                <label for="task-${index}">
                    <span class="task-time">${task.time}</span>
                    <span class="task-text">${task.text}</span>
                </label>
                <button class="delete-task-btn" data-index="${index}">🗑️</button>
            `;
            taskList.appendChild(li);
        });

        // Add event listeners for check/delete
        taskList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });
        taskList.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
    }

    function addTask() {
        const textInput = document.getElementById('new-task-text');
        const timeInput = document.getElementById('new-task-time');
        const text = textInput.value.trim();
        const time = timeInput.value;

        if (text === '' || time === '') {
            alert('Please enter both a task and a time.');
            return;
        }

        const tasks = getTasks();
        const newTask = { text, time, completed: false };
        tasks.push(newTask);
        saveTasks(tasks);

        scheduleNotification(newTask);

        textInput.value = '';
        timeInput.value = '';
        renderTasks();
    }

    function toggleTaskCompletion(e) {
        const index = e.target.dataset.index;
        const tasks = getTasks();
        const task = tasks[index];
        
        const isCompleted = e.target.checked;
        const wasCompleted = task.completed;
        
        task.completed = isCompleted;
        
        // Update progress tracking
        const progress = getOrCreateProgress();
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = progress.usageHistory.find(entry => entry.date === today);

        if (isCompleted && !wasCompleted) {
            // Task marked as completed
            progress.tasksCompletedTotal += 1;
            if (todayEntry) todayEntry.completed += 1;
            
            // Check for Early Bird (before 9 AM)
            const [hour] = task.time.split(':').map(Number);
            if (hour < 9) {
                progress.tasksCompletedEarly += 1;
            }
        } else if (!isCompleted && wasCompleted) {
            // Task marked as uncompleted
            progress.tasksCompletedTotal -= 1;
            if (todayEntry) todayEntry.completed -= 1;

            const [hour] = task.time.split(':').map(Number);
            if (hour < 9) {
                progress.tasksCompletedEarly -= 1;
            }
        }
        
        checkAndAwardBadges(progress);
        saveProgress(progress); // Save progress updates
        saveTasks(tasks);
        renderTasks();
    }

    function deleteTask(e) {
        const index = e.target.dataset.index;
        let tasks = getTasks();
        tasks.splice(index, 1);
        saveTasks(tasks);
        renderTasks();
    }

    function scheduleNotification(task) {
        if (!("Notification" in window)) {
            console.log("Browser does not support desktop notification.");
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
                console.log("Notification permission denied.");
                return;
            }

            const [hour, minute] = task.time.split(':').map(Number);
            const now = new Date();
            const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
            
            // Set reminder 10 minutes before the task time
            reminderTime.setMinutes(reminderTime.getMinutes() - 10);

            const delay = reminderTime.getTime() - now.getTime();

            if (delay > 0) {
                setTimeout(() => {
                    new Notification('NeuroNest Reminder!', {
                        body: `Your mission "${task.text}" starts in 10 minutes!`,
                        icon: 'https://img.icons8.com/pastel-glyph/64/task--v1.png' // Placeholder icon
                    });
                }, delay);
            }
        });
    }

    // --- Mood Tracker Logic ---
    function addMoodTrackerListeners() {
        const moodOptions = document.querySelectorAll('.mood-emoji');
        const suggestedActivitiesContainer = document.getElementById('suggested-activities');
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                moodOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                const mood = option.getAttribute('data-mood');
                const activities = suggestedActivities[mood];
                
                const exercise = activities.exercises[Math.floor(Math.random() * activities.exercises.length)];
                const game = activities.games[Math.floor(Math.random() * activities.games.length)];
                const content = activities.content[Math.floor(Math.random() * activities.content.length)];

                suggestedActivitiesContainer.innerHTML = `
                    <h4>Here are a few ideas for you:</h4>
                    <div class="recommendation-cards">
                        <div class="rec-card"><strong>Exercise:</strong> ${exercise}</div>
                        <div class="rec-card"><strong>Game:</strong> ${game}</div>
                        <div class="rec-card"><strong>Activity:</strong> ${content}</div>
                    </div>
                `;
            });
        });

        // Game of the Day Logic
        const games = [
            { id: 'memory', name: 'Memory Match', icon: '🤔' },
            { id: 'wordBuilder', name: 'Word Builder', icon: '📝' },
            { id: 'focusQuest', name: 'Focus Quest', icon: '🎯' }
        ];
        const gameOfTheDay = games[Math.floor(Math.random() * games.length)];
        const gameOfTheDayContent = document.getElementById('game-of-the-day-content');
        if (gameOfTheDayContent) {
            gameOfTheDayContent.innerHTML = `
                <div class="game-tile-card" data-game="${gameOfTheDay.id}">
                    <span class="game-tile-icon">${gameOfTheDay.icon}</span>
                    <h5>${gameOfTheDay.name}</h5>
                </div>
            `;
            gameOfTheDayContent.querySelector('.game-tile-card').addEventListener('click', () => {
                initializeGameInModal(gameOfTheDay.id);
            });
        }

        // Quick Activities Logic
        document.querySelectorAll('.quick-activity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activity = e.target.dataset.activity;
                if (activity === 'breathing') {
                    startDeepBreathing();
                } else if (activity === 'doodle') {
                    initializeGameInModal('soothing');
                }
            });
        });
    }

    function openModal(content, isChatbot = false, isGame = false) {
        modalBody.innerHTML = content;
        modalContainer.classList.remove('hidden');
        document.body.classList.add('modal-open'); // Add blur class
        
        // Add specific class for modal styling
        modalContainer.classList.remove('chatbot-active', 'game-active');
        if (isChatbot) {
            modalContainer.classList.add('chatbot-active');
        } else if (isGame) {
            modalContainer.classList.add('game-active');
        }
    }

    function closeModal() {
        modalContainer.classList.add('hidden');
        document.body.classList.remove('modal-open'); // Remove blur class
        modalContainer.classList.remove('chatbot-active', 'game-active'); // Clean up classes
    }

    chatbotBtn.addEventListener('click', initializeChatbot);

    function initializeChatbot() {
        const chatUI = `
            <div class="chatbot-modal-content">
                <h3>NeuroNest AI Support</h3>
                <div id="chat-messages" class="chat-messages">
                    <div class="message bot-message">
                        <p>Hello! I'm NeuroNest AI. I'm here to listen and offer emotional support. How are you feeling today?</p>
                    </div>
                </div>
                <form id="chat-form" class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type your message..." required>
                    <button type="submit" id="send-chat-btn">Send</button>
                </form>
            </div>
        `;
        openModal(chatUI, true, false);
        
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', handleChatSubmit);
        }
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        chatInput.value = ''; // Clear input immediately
        
        if (!message) return;

        displayMessage(message, 'user');
        
        // Show loading indicator
        const loadingMessage = displayMessage('...', 'bot', true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (response.ok) {
                updateMessage(loadingMessage, data.reply);
            } else {
                updateMessage(loadingMessage, `Error: ${data.message || 'Could not connect to AI.'}`);
            }
        } catch (error) {
            console.error('Chat error:', error);
            updateMessage(loadingMessage, 'Network error or server unreachable.');
        }
    }

    function displayMessage(text, sender, isLoading = false) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        
        if (isLoading) {
            messageDiv.classList.add('loading');
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
        return messageDiv;
    }

    function updateMessage(messageElement, newText) {
        if (!messageElement) return;
        messageElement.querySelector('p').textContent = newText;
        messageElement.classList.remove('loading');
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    }

    supportBtn.addEventListener('click', () => {
        openModal(`
            <div class="coming-soon-modal-content">
                <h3>NGO Support</h3>
                <p class="coming-soon-message">
                    Coming Soon! We are compiling a list of helpful resources and support organizations.
                </p>
            </div>
        `);
    });

    closeModalBtn.addEventListener('click', closeModal);
    
    // Initial tab switch
    switchTab('home');

    document.querySelector('.bottom-nav').addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        }
    });

    const contrastToggle = document.getElementById('contrast-toggle');
    contrastToggle.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
    });

    const darkModeToggle = document.getElementById('dark-mode-toggle');

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

    function saveTheme(theme) {
        localStorage.setItem('neuroNestTheme', theme);
    }

    function getTheme() {
        return localStorage.getItem('neuroNestTheme') || 'light';
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = sunIcon;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.innerHTML = moonIcon;
        }
    }

    darkModeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        saveTheme(newTheme);
    });

    // Apply saved theme on initial load
    applyTheme(getTheme());

    // Initialize Account UI (now in header)
    initializeAccountTab();

    // --- Initial Prompt Logic ---
    function handleInitialPrompt() {
        const hasSeenPrompt = localStorage.getItem('neuroNestPromptSeen');
        
        if (!isAuthenticated && !hasSeenPrompt) {
            // Open the modal in initial prompt mode
            openAuthModal(true);
            // Mark prompt as seen so it doesn't pop up again on refresh unless user logs out
            localStorage.setItem('neuroNestPromptSeen', 'true');
        }
    }

    handleInitialPrompt();
});
