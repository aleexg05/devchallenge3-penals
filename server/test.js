const GameManager = require('./gameManager');
const gm = new GameManager();
const roomId = gm.createRoom();
const s1 = 'a'; const s2 = 'b';
gm.joinRoom(roomId, s1);
gm.joinRoom(roomId, s2);
const r1 = gm.submitMove(roomId, s1, { shot: { height: 'alta', direction: 'dreta' }, save: { height: 'baixa', direction: 'esquerra' } });
const r2 = gm.submitMove(roomId, s2, { shot: { height: 'baixa', direction: 'esquerra' }, save: { height: 'alta', direction: 'dreta' } });
console.log(r2); // completed true, result { score1: 2, score2: 0, winner: 1 } o similar segons moviments
