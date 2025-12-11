class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> { players, moves, scores, rounds, maxPlayers }
  }

  createRoom() {
    const roomId = Math.random().toString(36).slice(2, 8);
    this.rooms.set(roomId, {
      players: [],
      moves: {},          // socketId -> { shot, save }
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

  // Lògica de punts: compara xut vs aturada
  compare(shoot, defend) {
    if (!shoot || !defend) return 0;

    let points = 0;
    if (shoot.height === defend.height) points++;
    if (shoot.direction === defend.direction) points++;

    return points; // 0, 1 o 2 punts
  }

  submitMove(roomId, socketId, move) {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: 'ROOM_NOT_FOUND' };

    // Guardem la jugada d'aquest socket
    room.moves[socketId] = move.payload || move;

    // Només continuem si tots han enviat
    if (Object.keys(room.moves).length === room.players.length) {
      room.rounds++;

      const [p1, p2] = room.players;
      const m1 = room.moves[p1]; // { shot, save }
      const m2 = room.moves[p2]; // { shot, save }

      // Jugador 1: compara el seu TIRO amb la PARADA del jugador 2
      const puntsP1 = this.compare(m1.shot, m2.save);
      
      // Jugador 2: compara el seu TIRO amb la PARADA del jugador 1
      const puntsP2 = this.compare(m2.shot, m1.save);

      // Actualitzem marcadors
      room.scores[1] += puntsP1;
      room.scores[2] += puntsP2;

      // Determinar guanyador de la ronda
      let winner = 0; // 0 = empat
      if (room.scores[1] > room.scores[2]) winner = 1;
      else if (room.scores[2] > room.scores[1]) winner = 2;
      
      const result = {
        score1: room.scores[1],
        score2: room.scores[2],
        round: room.rounds,
        puntsP1,
        puntsP2,
        winner
      };

      // Netejem les jugades per la següent ronda
      room.moves = {};

      // Condició de fi de partida (2 rondes de moment)
      if (room.rounds >= 2) {
        // Determinar guanyador final
        let finalWinner = 0;
        if (room.scores[1] > room.scores[2]) finalWinner = 1;
        else if (room.scores[2] > room.scores[1]) finalWinner = 2;

        return {
          ok: true,
          completed: true,
          result,
          finished: true,
          finalScore: room.scores,
          finalWinner
        };
      }

      return {
        ok: true,
        completed: true,
        result,
        finished: false
      };
    }

    // Encara falta algun jugador per enviar la jugada
    return { ok: true, completed: false };
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter(p => p !== socketId);
  }
}

module.exports = GameManager;