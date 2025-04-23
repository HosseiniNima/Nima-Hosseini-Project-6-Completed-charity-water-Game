// Game state variables
let gameActive = false;  // Tracks if game is currently running
let gameInterval;        // Stores the interval that creates drops
let score = 0;           // Initialize score
let timerInterval;       // Stores the interval for the countdown timer
let timeLeft = 30;       // Initialize timer to 30 seconds
let level = 1;           // Initialize level
let badges = [];         // Track earned badges
let totalScore = 0;      // Track total score for level progression

// Event listener for the start button
document.getElementById('start-btn').addEventListener('click', startGame);

// Open and close the store modal
const storeBtn = document.getElementById('store-btn');
const storeModal = document.getElementById('store-modal');
const closeStore = document.getElementById('close-store');

storeBtn.addEventListener('click', () => {
    document.getElementById('total-currency').textContent = score; // Update total currency
    storeModal.style.display = 'flex'; // Show the modal
});

closeStore.addEventListener('click', () => {
    storeModal.style.display = 'none'; // Hide the modal
});

// Close the store modal when clicking outside the modal content
storeModal.addEventListener('click', (event) => {
    if (event.target === storeModal) {
        storeModal.style.display = 'none'; // Hide the modal
    }
});

// Game initialization function
function startGame() {
    if (gameActive) return; // Prevent multiple game instances

    // Set up initial game state
    gameActive = true;
    document.getElementById('start-btn').disabled = true;

    // Reset game variables, but keep level and totalScore
    score = 0; // Reset score for the current round
    badges = []; // Reset badges for the current round
    updateLevelDisplay();
    updateBadgeDisplay();

    // Ensure the timer does not reset to 30 seconds if "+5 Seconds" was used
    if (timeLeft <= 0) {
        timeLeft = 30; // Reset only if the timer has expired
    }

    // Start creating drops every 1000ms (1 second)
    startDropInterval(1000);

    // Reset timer bar to full width
    const timerBar = document.querySelector('.timer-bar');
    timerBar.style.width = '100%';

    // Start countdown timer
    timerInterval = setInterval(updateTimer, 1000);
}

function startDropInterval(interval) {
    clearInterval(gameInterval); // Clear any existing interval
    gameInterval = setInterval(createDrop, interval);
}

function updateTimer() {
    timeLeft--;
    document.getElementById('time-left').textContent = timeLeft;

    // Update timer bar width
    const timerBar = document.querySelector('.timer-bar');
    const percentage = (timeLeft / 30) * 100; // Calculate remaining percentage
    timerBar.style.width = `${percentage}%`;

    if (timeLeft <= 0) {
        endGame(); // End the game when the timer reaches 0
    }
}

function endGame() {
    gameActive = false; // Stop the game
    clearInterval(gameInterval); // Stop creating drops
    clearInterval(timerInterval); // Stop the timer
    document.getElementById('start-btn').disabled = false; // Re-enable start button

    // Remove all remaining drops
    const drops = document.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());

    // Show all earned badges as a popup
    if (badges.length > 0) {
        alert(`🎉 Game Over! You earned the following badges:\n\n${badges.join('\n')}`);
    }
}

function updateScore(isBadDrop) {
    if (!gameActive) return; // Prevent score updates after the game ends
    const feedbackMessage = document.getElementById('feedback-message');

    if (isBadDrop) {
        score -= 5; // Deduct points for bad drops
        feedbackMessage.textContent = '😢 Bad Drop! -5';
        feedbackMessage.style.color = '#F5402C'; // Red for bad drops
    } else {
        score += 10; // Add points for good drops
        totalScore += 10; // Track total score for level progression
        feedbackMessage.textContent = '😊 Good Drop! +10';
        feedbackMessage.style.color = '#4FCB53'; // Green for good drops
    }

    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('total-score').textContent = totalScore; // Update total score display

    // Check for level up
    checkLevelUp();

    // Show feedback message briefly
    feedbackMessage.classList.add('show');
    setTimeout(() => feedbackMessage.classList.remove('show'), 1000);
}

function checkLevelUp() {
    const levelUpScore = level * 100; // Level up every 100 points
    if (score >= levelUpScore) {
        level++;
        updateLevelDisplay();

        // Update difficulty based on level
        updateDifficultyDisplay();

        // Add a badge for the new level
        const badgeName = `Level ${level} Achieved!`;
        if (!badges.includes(badgeName)) {
            badges.push(badgeName);
        }
        updateBadgeDisplay();

        // Increase drop speed
        const newInterval = Math.max(500, 1000 - level * 50); // Minimum interval of 500ms
        startDropInterval(newInterval);

        // Add obstacles at higher levels
        if (level >= 5) {
            addObstacles();
        }
    }
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
        levelDisplay.textContent = level; // Update only the number
    }
}

function updateDifficultyDisplay() {
    const difficultyDisplay = document.getElementById('difficulty-display');
    if (level <= 5) {
        difficultyDisplay.textContent = 'Difficulty: Easy';
    } else if (level <= 10) {
        difficultyDisplay.textContent = 'Difficulty: Medium';
    } else {
        difficultyDisplay.textContent = 'Difficulty: Hard';
    }
}
