class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> { players, moves, scores, rounds, maxPlayers }
  }

  createRoom() {
    const roomId = Math.random().toString(36).slice(2, 8);
    this.rooms.set(roomId, {
      players: [],
      moves: {},
      scores: { 1: 0, 2: 0 },
      rounds: 0,
      maxPlayers: 2
    });
    return roomId;
  }

  joinRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: 'ROOM_NOT_FOUND' };
    if (room.players.includes(socketId)) return { ok: false, reason: 'ALREADY_IN_ROOM' };
    if (room.players.length >= room.maxPlayers) return { ok: false, reason: 'ROOM_FULL' };

    room.players.push(socketId);
    const number = room.players.length;
    return { ok: true, number, ready: room.players.length === room.maxPlayers };
  }

  submitMove(roomId, socketId, move) {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: 'ROOM_NOT_FOUND' };

    room.moves[socketId] = move;

    if (Object.keys(room.moves).length === room.players.length) {
      room.rounds++;

      // Lògica simple: jugador 1 guanya cada ronda
      room.scores[1]++;

      const result = {
        winner: 1,
        scores: room.scores,
        round: room.rounds
      };

      room.moves = {};

      if (room.rounds >= 2) {
        return { ok: true, completed: true, result, finished: true, finalScore: room.scores };
      }

      return { ok: true, completed: true, result, finished: false };
    }

    return { ok: true, completed: false };
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter(p => p !== socketId);
  }
}

module.exports = GameManager;
