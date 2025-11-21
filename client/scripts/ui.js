document.addEventListener('DOMContentLoaded', () => {
    const scoreDisplay = document.getElementById('score');
    const playerActionButtons = document.querySelectorAll('.action-button');
    const gameField = document.getElementById('game-field');
    
    function updateScore(playerScore) {
        scoreDisplay.textContent = `Score: ${playerScore}`;
    }

    function showActionMessage(message) {
        const actionMessage = document.getElementById('action-message');
        actionMessage.textContent = message;
        actionMessage.classList.add('visible');
        setTimeout(() => {
            actionMessage.classList.remove('visible');
        }, 3000);
    }

    playerActionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            showActionMessage(`You chose to ${action}!`);
            // Additional logic to handle player actions can be added here
        });
    });

    // Example of updating the score
    // This function can be called from the game logic when a player scores
    // updateScore(1);
});