class GameManager {
constructor() {
this.rooms = new Map();
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

compare(shoot, defend) {
if (!shoot || !defend) return 0;
let points = 0;
if (shoot.height === defend.height) points++;
if (shoot.direction === defend.direction) points++;
<<<<<<< HEAD
return points; // 0, 1 o 2
=======
return points; // 0, 1, 2
>>>>>>> 67a1c34ae3b262902559561c99c5a793df9a77fd
}

submitMove(roomId, socketId, move) {
const room = this.rooms.get(roomId);
if (!room) return { ok: false, reason: 'ROOM_NOT_FOUND' };

// Guarda el moviment directament (sense payload envoltat)
room.moves[socketId] = move;

// Quan tots han enviat
if (Object.keys(room.moves).length === room.players.length) {
room.rounds++;

const [p1, p2] = room.players;
const m1 = room.moves[p1];
const m2 = room.moves[p2];

<<<<<<< HEAD
// Punts del porter segons encert d'alçada i/o direcció del xut contrari
const puntsP1 = this.compare(m2.shot, m1.save); // Punts per P1 aturant xut de P2
const puntsP2 = this.compare(m1.shot, m2.save); // Punts per P2 aturant xut de P1
=======
// Punts per al PORTER que defensa cada xut
const puntsP1 = this.compare(m2.shot, m1.save); // J1 para xut de J2
const puntsP2 = this.compare(m1.shot, m2.save); // J2 para xut de J1
>>>>>>> 67a1c34ae3b262902559561c99c5a793df9a77fd

room.scores[1] += puntsP1;
room.scores[2] += puntsP2;

let winner = 0;
if (room.scores[1] > room.scores[2]) winner = 1;
else if (room.scores[2] > room.scores[1]) winner = 2;

// Neteja per la següent ronda
room.moves = {};

if (room.rounds >= 2) {
let finalWinner = 0;
if (room.scores[1] > room.scores[2]) finalWinner = 1;
else if (room.scores[2] > room.scores[1]) finalWinner = 2;

return {
ok: true,
completed: true,
result: {
score1: room.scores[1],
score2: room.scores[2],
round: room.rounds,
puntsP1,
puntsP2,
winner
},
finished: true,
finalScore: room.scores,
finalWinner
};
}

return {
ok: true,
completed: true,
result: {
score1: room.scores[1],
score2: room.scores[2],
round: room.rounds,
puntsP1,
puntsP2,
winner
},
finished: false
};
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