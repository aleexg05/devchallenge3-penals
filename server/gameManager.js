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

      const [p1, p2] = room.players;
      const m1 = room.moves[p1];
      const m2 = room.moves[p2];

      let score1 = 0;
      let score2 = 0;
      let winner = 0;

      // 🔑 Si les jugades són idèntiques → empat, no sumem punts
      if (
        JSON.stringify(m1.shot) === JSON.stringify(m2.shot) &&
        JSON.stringify(m1.save) === JSON.stringify(m2.save)
      ) {
        winner = 0;
      } else {
        // Cada jugador xuta i l’altre intenta parar
        score1 = this.calculateSaveScore(m2.save, m1.shot); // jugador 2 para el xut de jugador 1
        score2 = this.calculateSaveScore(m1.save, m2.shot); // jugador 1 para el xut de jugador 2

        room.scores[1] += score1;
        room.scores[2] += score2;

        if (score1 > score2) winner = 1;
        else if (score2 > score1) winner = 2;
      }

      const result = {
        winner,
        scores: { 1: room.scores[1], 2: room.scores[2] },
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

  // 🔑 Aquesta funció ha d’estar dins de la classe
  calculateSaveScore(save, shot) {
    const matchHeight = save.height === shot.height;
    const matchDirection = save.direction === shot.direction;

    if (matchHeight && matchDirection) return 2;
    if (matchHeight || matchDirection) return 1;
    return 0;
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter(p => p !== socketId);
  }
}

module.exports = GameManager;
