class GameManager {
constructor() {
this.rooms = new Map();
}

createRoom() {
const roomId = Math.random().toString(36).slice(2, 8);
this.rooms.set(roomId, {
  players: [],
  moves: {},          // socketId -> [move, move]
  scores: { 1: 0, 2: 0 },
  rounds: 0,
  finished: false,
  maxPlayers: 2,
  history: []   
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

compare(shoot, defend) {
if (!shoot || !defend) return 0;
let points = 0;
if (shoot.height === defend.height) points++;
if (shoot.direction === defend.direction) points++;
return points; // 0, 1 o 2
}

submitMove(roomId, socketId, move) {
const room = this.rooms.get(roomId);
if (!room) return { ok: false, reason: 'ROOM_NOT_FOUND' };
if (room.finished) return { ok: false, reason: 'GAME_FINISHED' };

// Player must be part of the room
const playerIdx = room.players.indexOf(socketId);
if (playerIdx === -1) return { ok: false, reason: 'NOT_IN_ROOM' };

// Init container for this player's moves
if (!room.moves[socketId]) room.moves[socketId] = [];
const playerMoves = room.moves[socketId];

// Max 2 moves per player
if (playerMoves.length >= 2) return { ok: false, reason: 'NO_MOVES_LEFT' };

// Store move
playerMoves.push(move);

const opponentId = room.players.find((id) => id !== socketId);
const opponentMoves = opponentId ? room.moves[opponentId] || [] : [];

const playerDone = playerMoves.length >= 2;
const opponentDone = opponentMoves.length >= 2;

// If both players completed their two moves, resolve both rounds at once
if (playerDone && opponentDone) {
  const [p1, p2] = room.players;
  const m1 = room.moves[p1];
  const m2 = room.moves[p2];

  room.history = [];
  room.scores = { 1: 0, 2: 0 };
  room.rounds = 0;

  for (let i = 0; i < 2; i++) {
    room.rounds += 1;
    // P1 guanya punts per parar el xut de P2
    const puntsP1 = this.compare(m2[i].shot, m1[i].save);
    // P2 guanya punts per parar el xut de P1
    const puntsP2 = this.compare(m1[i].shot, m2[i].save);

    console.log(`Ronda ${room.rounds}:`, {
      p1Shot: m1[i].shot, p1Save: m1[i].save, puntsP1,
      p2Shot: m2[i].shot, p2Save: m2[i].save, puntsP2
    });

    room.history.push({
      round: room.rounds,
      p1: { shot: m1[i].shot, save: m1[i].save, punts: puntsP1 },
      p2: { shot: m2[i].shot, save: m2[i].save, punts: puntsP2 }
    });

    room.scores[1] += puntsP1;
    room.scores[2] += puntsP2;
  }

  console.log('Puntuacions finals:', room.scores);

  let finalWinner = 0;
  if (room.scores[1] > room.scores[2]) finalWinner = 1;
  else if (room.scores[2] > room.scores[1]) finalWinner = 2;

  room.finished = true;

  return {
    ok: true,
    completed: true,
    finished: true,
    finalScore: room.scores,
    finalWinner,
    history: room.history,
    result: { round: room.rounds }
  };
}

return {
  ok: true,
  completed: false,
  playerNumber: playerIdx + 1,
  playerMoves: playerMoves.length,
  remaining: 2 - playerMoves.length,
  opponentMoves: opponentMoves.length,
  playerDone,
  opponentDone
};
}

leaveRoom(roomId, socketId) {
const room = this.rooms.get(roomId);
if (!room) return;
room.players = room.players.filter(p => p !== socketId);
}

}

module.exports = GameManager;