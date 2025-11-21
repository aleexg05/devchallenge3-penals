const GameManager = (() => {
    let players = {};
    let scores = { player1: 0, player2: 0 };
    let currentRound = 1;
    const maxRounds = 5;

    const addPlayer = (id, name) => {
        players[id] = { name: name, action: null, save: null };
    };

    const setPlayerAction = (id, action) => {
        if (players[id]) {
            players[id].action = action;
        }
    };

    const setPlayerSave = (id, save) => {
        if (players[id]) {
            players[id].save = save;
        }
    };

    const calculateScore = () => {
        if (players.player1 && players.player2) {
            const player1Action = players.player1.action;
            const player2Action = players.player2.action;
            const player2Save = players.player2.save;

            if (player1Action !== player2Save) {
                scores.player1 += 1;
            }

            const player1Save = players.player1.save;
            if (player2Action !== player1Save) {
                scores.player2 += 1;
            }
        }
    };

    const nextRound = () => {
        calculateScore();
        currentRound++;
        if (currentRound > maxRounds) {
            endGame();
        }
    };

    const endGame = () => {
        const winner = scores.player1 > scores.player2 ? 'Player 1' : 'Player 2';
        console.log(`Game Over! Winner: ${winner}`);
        resetGame();
    };

    const resetGame = () => {
        players = {};
        scores = { player1: 0, player2: 0 };
        currentRound = 1;
    };

    return {
        addPlayer,
        setPlayerAction,
        setPlayerSave,
        nextRound,
        resetGame,
        scores,
        currentRound,
    };
})();

module.exports = GameManager;