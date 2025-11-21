const assert = require('assert');
const { GameManager } = require('./gameManager');

describe('GameManager', () => {
    let gameManager;

    beforeEach(() => {
        gameManager = new GameManager();
    });

    it('should initialize with a score of 0 for both players', () => {
        assert.strictEqual(gameManager.player1Score, 0);
        assert.strictEqual(gameManager.player2Score, 0);
    });

    it('should allow player 1 to score', () => {
        gameManager.scoreGoal(1);
        assert.strictEqual(gameManager.player1Score, 1);
    });

    it('should allow player 2 to score', () => {
        gameManager.scoreGoal(2);
        assert.strictEqual(gameManager.player2Score, 1);
    });

    it('should reset scores after a round', () => {
        gameManager.scoreGoal(1);
        gameManager.resetScores();
        assert.strictEqual(gameManager.player1Score, 0);
        assert.strictEqual(gameManager.player2Score, 0);
    });

    it('should handle invalid player scoring attempts', () => {
        assert.throws(() => {
            gameManager.scoreGoal(3);
        }, /Invalid player/);
    });
});