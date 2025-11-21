// filepath: c:\Projectes\projecteDevChallenge3\devchallenge3-penals\client\scripts\game.js
let gameState = {
    currentRound: 1,
    playerScores: [0, 0],
    currentPlayer: 0,
    totalRounds: 5,
};

function startGame() {
    resetGame();
    updateScoreboard();
    // Additional initialization logic
}

function resetGame() {
    gameState.currentRound = 1;
    gameState.playerScores = [0, 0];
    gameState.currentPlayer = 0;
    // Reset other game elements
}

function playerAction(action) {
    // Handle player action (kick/save)
    if (action.type === 'kick') {
        handleKick(action);
    } else if (action.type === 'save') {
        handleSave(action);
    }
    updateScoreboard();
}

function handleKick(action) {
    // Logic for handling a kick
    const score = calculateScore(action);
    gameState.playerScores[gameState.currentPlayer] += score;
    // Switch to the next player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 2;
    gameState.currentRound++;
}

function handleSave(action) {
    // Logic for handling a save
    // Update game state based on save
}

function calculateScore(action) {
    // Logic to calculate score based on kick direction and height
    return Math.random() > 0.5 ? 1 : 0; // Placeholder scoring logic
}

function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerText = `Player 1: ${gameState.playerScores[0]} - Player 2: ${gameState.playerScores[1]}`;
}

function endGame() {
    // Logic to end the game and display results
}

// Event listeners for player actions
document.getElementById('kickButton').addEventListener('click', () => {
    const action = { type: 'kick', direction: 'left', height: 'high' }; // Example action
    playerAction(action);
});

document.getElementById('saveButton').addEventListener('click', () => {
    const action = { type: 'save', direction: 'left', height: 'high' }; // Example action
    playerAction(action);
});

// Start the game when the page loads
window.onload = startGame;