const wsUrl = `${location.origin.replace('http', 'ws')}`;
let ws;
let player;
let roomId;
let ready = false;

// Seleccions del jugador
let selectedShot = { height: null, direction: null };
let selectedSave = { height: null, direction: null };

const statusEl = document.getElementById('status');
const createBtn = document.getElementById('createRoom');
const joinBtn = document.getElementById('joinRoom');
const roomInput = document.getElementById('roomId');
const submitBtn = document.getElementById('submitMove');
const resultEl = document.getElementById('result');
const selectedShotEl = document.getElementById('selected-shot');
const selectedSaveEl = document.getElementById('selected-save');

// Botons de xut i aturada
const shootButtons = document.querySelectorAll('.shoot-btn');
const saveButtons = document.querySelectorAll('.save-btn');

// Referències per mostrar/amagar seccions
const gameSectionEl = document.getElementById('game-section');
const submitSectionEl = document.getElementById('submit-section');
const resultSectionEl = document.getElementById('result-section');

// Gestió de l'animació d'inici
const introScreen = document.getElementById('intro-screen');
const penaltyAnimation = document.querySelector('.penalty-animation');
const introContent = document.querySelector('.intro-content');
const gameMain = document.getElementById('game-main');
const startBtn = document.getElementById('start-game');

// Mostra el contingut després de l'animació del penal (4.5 segons)
setTimeout(() => {
  penaltyAnimation.classList.add('hide');
  setTimeout(() => {
    penaltyAnimation.style.display = 'none';
    introContent.classList.add('show');
  }, 500);
}, 4500);

// Event del botó començar
startBtn.addEventListener('click', () => {
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    gameMain.style.display = 'block';
  }, 500);
});

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
      showGameSections();
    }

    if (type === 'JOINED') {
      player = payload.player;
      ready = payload.ready;
      setStatus(`Ets el jugador ${player}.` + (ready ? ' Tots a punt.' : ' Esperant rival...'));
      showGameSections();
      updateSubmitButton();
    }

    if (type === 'PLAYER_JOINED') {
      ready = payload.ready;
      if (ready) {
        setStatus(`Rival connectat. Podeu enviar la tirada.`);
        updateSubmitButton();
      }
    }

    if (type === 'MOVE_ACK') {
      setStatus('Tirada enviada. Esperant la del rival...');
      disableButtons();
    }

    if (type === 'ROUND_RESULT') {
      const { score1, score2, winner, round } = payload;
      const you = player === 1 ? score1 : score2;
      const opp = player === 1 ? score2 : score1;
      const msgWinner = winner === 0 ? 'Empat' : (winner === player ? 'Has guanyat!' : 'Has perdut');
      resultEl.textContent = `Ronda ${round} → Tu: ${you} | Rival: ${opp} → ${msgWinner}`;
      setStatus('Ronda finalitzada. Envia una nova tirada quan vulguis.');
      resetSelections();
      enableButtons();
    }

    if (type === 'GAME_OVER') {
      const { finalScore } = payload;
      resultEl.textContent = `🏁 Partida acabada! Puntuació final → J1: ${finalScore[1]} | J2: ${finalScore[2]}`;
      setStatus('Partida finalitzada.');
      submitBtn.disabled = true;
      disableButtons();
      document.querySelector('.restart-btn').style.display = 'block';
    }

    if (type === 'ERROR') {
      setStatus(`Error: ${payload.reason}`);
    }
  });
}

function showGameSections() {
  if (gameSectionEl) gameSectionEl.style.display = 'block';
  if (submitSectionEl) submitSectionEl.style.display = 'block';
  if (resultSectionEl) resultSectionEl.style.display = 'block';
}

function setStatus(text) {
  statusEl.textContent = text;
}

function safeSend(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    console.warn('⚠️ Socket encara no està obert, reintentant...', msg);
    ws.addEventListener('open', () => ws.send(JSON.stringify(msg)), { once: true });
  }
}

// Gestió dels botons de xut
shootButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const height = btn.dataset.height;
    const direction = btn.dataset.direction;

    shootButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedShot = { height, direction };
    selectedShotEl.textContent = `Xut seleccionat: ${capitalize(height)} - ${capitalize(direction)}`;
    updateSubmitButton();
  });
});

// Gestió dels botons d'aturada
saveButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const height = btn.dataset.height;
    const direction = btn.dataset.direction;

    saveButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSave = { height, direction };
    selectedSaveEl.textContent = `Aturada seleccionada: ${capitalize(height)} - ${capitalize(direction)}`;
    updateSubmitButton();
  });
});

function updateSubmitButton() {
  submitBtn.disabled = !ready || !selectedShot.height || !selectedSave.height;
}

function resetSelections() {
  selectedShot = { height: null, direction: null };
  selectedSave = { height: null, direction: null };
  shootButtons.forEach(b => b.classList.remove('selected'));
  saveButtons.forEach(b => b.classList.remove('selected'));
  selectedShotEl.textContent = '';
  selectedSaveEl.textContent = '';
  updateSubmitButton();
}

function disableButtons() {
  shootButtons.forEach(b => b.disabled = true);
  saveButtons.forEach(b => b.disabled = true);
}

function enableButtons() {
  shootButtons.forEach(b => b.disabled = false);
  saveButtons.forEach(b => b.disabled = false);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

submitBtn.addEventListener('click', () => {
  if (!ready) return alert('Encara no esteu tots a punt');
  if (!selectedShot.height || !selectedSave.height) {
    return alert('Has de seleccionar tant el xut com l\'aturada');
  }

  safeSend({
    type: 'SUBMIT_MOVE',
    payload: {
      shot: selectedShot,
      save: selectedSave
    }
  });

  submitBtn.disabled = true;
});

function ensureConnection() {
  if (!ws || ws.readyState !== WebSocket.OPEN) connect();
}

setStatus('Crea o uneix-te a una sala per començar.');

// Ejemplo: al finalizar la partida
// function endGame() {
//   document.getElementById("result-section").style.display = "block";
//   document.getElementById("restart-btn").style.display = "block";
// }
