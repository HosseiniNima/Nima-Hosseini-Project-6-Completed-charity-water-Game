console.log('script.js is loaded');

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
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("start-btn").addEventListener("click", () => {
        console.log('Start Game button clicked'); // Debugging log
        startGame();
    });

    // Inventory button
    document.getElementById('inventory-button').addEventListener('click', () => {
        console.log('Inventory button clicked');
        toggleInventory();
    });

    document.getElementById('store-btn').addEventListener('click', openStore);
});
function openStore() {
    const storeModal = document.getElementById('store-modal');
    storeModal.style.display = 'flex'; // Show the store modal
    console.log('Store opened');
}
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

function updateTotalCost() {
  const addTimeQty = parseInt(document.getElementById('addTime-qty').value) || 0;
  const noRedsQty = parseInt(document.getElementById('noReds-qty').value) || 0;
  const doublePointsQty = parseInt(document.getElementById('doublePoints-qty').value) || 0;
  const clearDropsQty = parseInt(document.getElementById('clearDrops-qty').value) || 0;
  const slowDropsQty = parseInt(document.getElementById('slowDrops-qty').value) || 0;

  // Define the cost of each power-up
  const addTimeCost = 50;
  const noRedsCost = 100;
  const doublePointsCost = 150;
  const clearDropsCost = 200;
  const slowDropsCost = 250;

  // Calculate the total cost
  const totalCost =
      addTimeQty * addTimeCost +
      noRedsQty * noRedsCost +
      doublePointsQty * doublePointsCost +
      clearDropsQty * clearDropsCost +
      slowDropsQty * slowDropsCost;

  // Update the total cost display
  document.getElementById('total-cost').textContent = totalCost;
}

document.getElementById('buy-btn').addEventListener('click', () => {
    const totalCost = parseInt(document.getElementById('total-cost').textContent) || 0;

    if (score < totalCost) {
        alert('Not enough points to make this purchase!');
        return;
    }

    // Deduct the total cost from the player's score
    score -= totalCost;
    document.getElementById('score').textContent = score;

    // Add purchased items to the inventory
    const addTimeQty = parseInt(document.getElementById('addTime-qty').value) || 0;
    const noRedsQty = parseInt(document.getElementById('noReds-qty').value) || 0;
    const doublePointsQty = parseInt(document.getElementById('doublePoints-qty').value) || 0;
    const clearDropsQty = parseInt(document.getElementById('clearDrops-qty').value) || 0;
    const slowDropsQty = parseInt(document.getElementById('slowDrops-qty').value) || 0;

    const inventoryItems = document.getElementById('inventory-items');

    if (addTimeQty > 0) {
        addToInventory('Add Time', addTimeQty, inventoryItems);
    }
    if (noRedsQty > 0) {
        addToInventory('No Reds', noRedsQty, inventoryItems);
    }
    if (doublePointsQty > 0) {
        addToInventory('Double Points', doublePointsQty, inventoryItems);
    }
    if (clearDropsQty > 0) {
        addToInventory('Clear Drops', clearDropsQty, inventoryItems);
    }
    if (slowDropsQty > 0) {
        addToInventory('Slow Drops', slowDropsQty, inventoryItems);
    }

    // Reset the quantities and total cost
    document.querySelectorAll('.store-item input[type="number"]').forEach(input => {
        input.value = 0;
    });
    document.getElementById('total-cost').textContent = 0;

    alert('Purchase successful!');
});

function addToInventory(itemName, quantity, inventoryContainer) {
    const existingItem = Array.from(inventoryContainer.children).find(
        item => item.dataset.itemName === itemName
    );

    if (existingItem) {
        // Update the quantity if the item already exists
        const quantityElement = existingItem.querySelector('.quantity');
        const currentQuantity = parseInt(quantityElement.textContent) || 0;
        quantityElement.textContent = currentQuantity + quantity;
    } else {
        // Create a new inventory item
        const inventoryItem = document.createElement('div');
        inventoryItem.className = 'inventory-item';
        inventoryItem.dataset.itemName = itemName;

        inventoryItem.innerHTML = `
            <span>${itemName}</span>
            <span class="quantity">${quantity}</span>
        `;

        inventoryContainer.appendChild(inventoryItem);
    }
}

// Game initialization function
function startGame() {
    console.log('Start Game button clicked'); // Debugging log
    if (gameActive) {
        console.log('Game is already active');
        return; // Prevent multiple game instances
    }

    // Set up initial game state
    gameActive = true;
    document.getElementById('start-btn').disabled = true;
    console.log('Game started');

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
function createDrop() {
    const gameContainer = document.getElementById('game-container');
    const drop = document.createElement('div');
    drop.className = 'water-drop';

    // Randomize the drop's position
    const randomX = Math.random() * (gameContainer.offsetWidth - 50); // Ensure it stays within bounds
    drop.style.left = `${randomX}px`;

    // Add animation for the drop falling
    drop.style.animation = 'dropFall 3s linear';

    // Append the drop to the game container
    gameContainer.appendChild(drop);

    // Remove the drop after the animation ends
    drop.addEventListener('animationend', () => {
        drop.remove();
    });

    // Add click event to the drop
    drop.addEventListener('click', () => {
        updateScore(false); // Good drop
        drop.remove();
    });
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

function updateBadgeDisplay() {
    const badgeList = document.getElementById('badge-list');
    if (!badgeList) return; // Ensure the badge list element exists

    // Clear the current badge list
    badgeList.innerHTML = '';

    // Add each badge to the badge list
    badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.textContent = badge;
        badgeElement.className = 'badge'; // Add a class for styling
        badgeList.appendChild(badgeElement);
    });
}

// Toggle Inventory Dropdown
function toggleInventory() {
    const inventoryDropdown = document.getElementById('inventory-dropdown');
    inventoryDropdown.style.display =
        inventoryDropdown.style.display === 'block' ? 'none' : 'block';
}

function addObstacles() {
    const gameContainer = document.getElementById('game-container');
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    // Randomize obstacle position
    const randomX = Math.random() * (gameContainer.offsetWidth - 50); // Ensure it stays within bounds
    obstacle.style.left = `${randomX}px`;

    // Add animation for movement
    obstacle.style.animation = 'moveObstacle 4s linear infinite';

    // Append obstacle to the game container
    gameContainer.appendChild(obstacle);

    // Remove obstacle after animation ends
    obstacle.addEventListener('animationend', () => {
        obstacle.remove();
    });
}
