const socket = new WebSocket('ws://localhost:3000');

socket.onopen = function() {
    console.log('Connected to the WebSocket server');
};

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    handleGameEvent(data);
};

socket.onclose = function() {
    console.log('Disconnected from the WebSocket server');
};

function sendGameAction(action) {
    const message = JSON.stringify(action);
    socket.send(message);
}

function handleGameEvent(data) {
    switch (data.type) {
        case 'scoreUpdate':
            updateScore(data.score);
            break;
        case 'playerAction':
            updatePlayerAction(data.playerId, data.action);
            break;
        // Add more cases as needed for different game events
    }
}

function updateScore(score) {
    // Logic to update the score display
}

function updatePlayerAction(playerId, action) {
    // Logic to update the UI based on player actions
}