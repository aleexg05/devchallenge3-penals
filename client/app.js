const wsUrl = `${location.origin.replace('http', 'ws')}`;
let ws;
let player;
let roomId;
let ready = false;

const statusEl = document.getElementById('status');
const createBtn = document.getElementById('createRoom');
const joinBtn = document.getElementById('joinRoom');
const roomInput = document.getElementById('roomId');
const moveForm = document.getElementById('moveForm');
const submitBtn = document.getElementById('submitMove');
const resultEl = document.getElementById('result');

function connect() {
  ws = new WebSocket(wsUrl);

  ws.addEventListener('open', () => setStatus('✅ Connectat'));
  ws.addEventListener('close', () => setStatus('❌ Desconnectat'));
  ws.addEventListener('message', (ev) => {
    const { type, payload } = JSON.parse(ev.data);

    if (type === 'ROOM_CREATED') {
      roomId = payload.roomId;
      roomInput.value = roomId;
      setStatus(`Sala creada: ${roomId}. Comparteix l'ID amb el teu rival.`);
    }

    if (type === 'JOINED') {
      player = payload.player;
      ready = payload.ready;
      setStatus(`Ets el jugador ${player}.` + (ready ? ' Tots a punt.' : ' Esperant rival...'));
      submitBtn.disabled = !ready;
    }

    if (type === 'PLAYER_JOINED') {
      ready = payload.ready;
      if (ready) {
        setStatus(`Rival connectat. Podeu enviar la tirada.`);
        submitBtn.disabled = false;
      }
    }

    if (type === 'MOVE_ACK') {
      setStatus('Tirada enviada. Esperant la del rival...');
    }

    if (type === 'ROUND_RESULT') {
      // ✅ Ara el servidor envia score1, score2 i winner
      const { score1, score2, winner, round } = payload;
      const you = player === 1 ? score1 : score2;
      const opp = player === 1 ? score2 : score1;
      const msgWinner = winner === 0 ? 'Empat' : (winner === player ? 'Has guanyat!' : 'Has perdut');
      resultEl.textContent = `Ronda ${round} → Tu: ${you} | Rival: ${opp} → ${msgWinner}`;
      setStatus('Ronda finalitzada. Envia una nova tirada quan vulguis.');
      submitBtn.disabled = false;
    }

    if (type === 'GAME_OVER') {
      const { finalScore } = payload;
      resultEl.textContent = `🏁 Partida acabada! Puntuació final → J1: ${finalScore[1]} | J2: ${finalScore[2]}`;
      setStatus('Partida finalitzada.');
      submitBtn.disabled = true;
    }

    if (type === 'ERROR') {
      setStatus(`Error: ${payload.reason}`);
    }
  });
}

function setStatus(text) {
  statusEl.textContent = text;
}

// Funció segura per enviar
function safeSend(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    console.warn('⚠️ Socket encara no està obert, reintentant...', msg);
    ws.addEventListener('open', () => ws.send(JSON.stringify(msg)), { once: true });
  }
}

createBtn.addEventListener('click', () => {
  ensureConnection();
  safeSend({ type: 'ROOM_CREATE' });
});

joinBtn.addEventListener('click', () => {
  ensureConnection();
  const id = roomInput.value.trim();
  if (!id) return alert('Introdueix un ID de sala');
  safeSend({ type: 'ROOM_JOIN', payload: { roomId: id } });
});

moveForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!ready) return alert('Encara no esteu tots a punt');
  const shot = {
    height: document.getElementById('shotHeight').value,
    direction: document.getElementById('shotDirection').value
  };
  const save = {
    height: document.getElementById('saveHeight').value,
    direction: document.getElementById('saveDirection').value
  };
  safeSend({ type: 'SUBMIT_MOVE', payload: { shot, save } });
  submitBtn.disabled = true;
});

function ensureConnection() {
  if (!ws || ws.readyState !== WebSocket.OPEN) connect();
}

// arrenca connexió perezosa
setStatus('No connectat. Crea o uneix-te a una sala per començar.');
