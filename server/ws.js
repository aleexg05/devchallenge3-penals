const { WebSocketServer } = require('ws');
const GameManager = require('./gameManager');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const gm = new GameManager();
  const sockets = new Map(); // ws -> { roomId, socketId, playerNumber }
  const creators = new Map(); // roomId -> creatorId

  function send(ws, type, payload) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  function broadcast(roomId, type, payload) {
    wss.clients.forEach((client) => {
      const meta = sockets.get(client);
      if (meta && meta.roomId === roomId && client.readyState === client.OPEN) {
        send(client, type, payload);
      }
    });
  }

  wss.on('connection', (ws) => {
    const socketId = Math.random().toString(36).slice(2, 10);

    ws.on('message', (msg) => {
      let data;
      try { data = JSON.parse(msg); } catch { return; }
      const { type, payload } = data;

      if (type === 'ROOM_CREATE') {
        const roomId = gm.createRoom();
        const res = gm.joinRoom(roomId, socketId);
        if (!res.ok) return send(ws, 'ERROR', res);

        sockets.set(ws, { roomId, socketId, playerNumber: 1 });
        creators.set(roomId, socketId);

        send(ws, 'ROOM_CREATED', { roomId });
      }

      if (type === 'ROOM_JOIN') {
        const { roomId } = payload;
        const creatorId = creators.get(roomId);
        const meta = sockets.get(ws);

        if (creatorId === socketId) {
          return send(ws, 'ERROR', { reason: 'CREATOR_CANNOT_JOIN' });
        }
        if (meta && meta.roomId === roomId) {
          return send(ws, 'ERROR', { reason: 'ALREADY_IN_ROOM' });
        }

        const res = gm.joinRoom(roomId, socketId);
        if (!res.ok) return send(ws, 'ERROR', res);

        sockets.set(ws, { roomId, socketId, playerNumber: res.number });
        send(ws, 'JOINED', { player: res.number, ready: res.ready });
        broadcast(roomId, 'PLAYER_JOINED', { player: res.number, ready: res.ready });
      }

      if (type === 'SUBMIT_MOVE') {
        const meta = sockets.get(ws);
        if (!meta) return send(ws, 'ERROR', { reason: 'NOT_IN_ROOM' });

        const res = gm.submitMove(meta.roomId, meta.socketId, payload);
        if (!res.ok) return send(ws, 'ERROR', res);

        if (res.completed) {
          broadcast(meta.roomId, 'ROUND_RESULT', res.result);
          if (res.finished) {
            broadcast(meta.roomId, 'GAME_OVER', { finalScore: res.finalScore });
          }
        } else {
          broadcast(meta.roomId, 'WAITING_FOR_OPPONENT', { player: meta.playerNumber });
        }
      }
    });

    ws.on('close', () => {
      const meta = sockets.get(ws);
      if (meta) {
        gm.leaveRoom(meta.roomId, meta.socketId);
        sockets.delete(ws);
        broadcast(meta.roomId, 'PLAYER_LEFT', { player: meta.playerNumber });
      }
    });
  });

  return wss;
}
 
module.exports = setupWebSocket;
