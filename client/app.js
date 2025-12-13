let roundsPlayed = 0;

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
const copyBtn = document.getElementById('copyRoom');
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
 if (type === 'ROUND_ACK') {
  console.log("ACK rebut, ronda completada:", payload.round);
}
    if (type === 'MOVE_STORED') {
      roundsPlayed = payload.submitted;
      const remaining = payload.remaining;
      const opponentSubmitted = payload.opponentSubmitted;

      if (payload.playerDone) {
        setStatus(`Has enviat les 2 tirades. Esperant el rival (porta ${opponentSubmitted}/2).`);
        submitBtn.disabled = true;
        disableButtons();
      } else {
        setStatus(`Tirada guardada. Et resten ${remaining} tirades. El rival porta ${opponentSubmitted}/2.`);
      }

      return;
    }
    if (type === 'ROOM_CREATED') {
      roomId = payload.roomId;
      player = payload.player;
      ready = payload.ready || false;
      roomInput.value = roomId;
      copyBtn.style.display = 'inline-block';
      roundsPlayed = 0;
      enableButtons();
      resetSelections();
      resultEl.innerHTML = '';
      setStatus(`Sala creada: ${roomId}. Comparteix l'ID amb el teu rival.`);
      showGameSections();
      updateSubmitButton();
    }

    if (type === 'JOINED') {
      player = payload.player;
      ready = payload.ready;
      roundsPlayed = 0;
      enableButtons();
      resetSelections();
      resultEl.innerHTML = '';
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
      const { round, tuScore, rivalScore, tuPunts, rivalPunts, outcome } = payload;

      const msgWinner = outcome === 'draw' ? 'Empat' : (outcome === 'win' ? 'Has guanyat!' : 'Has perdut');
      resultEl.textContent = `Ronda ${round} → Tu: ${tuScore} (Punts ronda: ${tuPunts}) | Rival: ${rivalScore} (Punts ronda: ${rivalPunts}) → ${msgWinner}`;
      setStatus('Ronda finalitzada. Envia una nova tirada quan vulguis.');
      resetSelections();
      enableButtons();
      console.log("PUNTS RONDA:", payload.puntsP1, payload.puntsP2);
    }

    if (type === 'GAME_OVER') {
      const { finalScore, finalOutcome, history, you } = payload;

      // Si per qualsevol motiu 'player' no estava establert, fem servir 'you' del servidor
      if (!player) player = you;

      console.log('GAME_OVER rebut:', { finalScore, finalOutcome, history, player });

      renderFinalResults(finalOutcome, finalScore, history);
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

function formatMoveLabel(move) {
  if (!move || !move.height || !move.direction) return 'Sense dades';
  return `${capitalize(move.height)} - ${capitalize(move.direction)}`;
}

function renderFinalResults(finalOutcome, finalScore, history) {
  console.log('renderFinalResults cridat amb:', { player, finalOutcome, finalScore, history });

  const outcomeText = finalOutcome === 'draw'
    ? 'Empat final'
    : finalOutcome === 'win'
      ? 'Has guanyat la partida!'
      : 'Has perdut la partida';

  const outcomeClass = finalOutcome === 'draw' ? 'badge-neutral' : finalOutcome === 'win' ? 'badge-win' : 'badge-lose';

  // Determinar quin jugador és el local
  const isPlayer1 = player === 1;
  const myPlayerKey = isPlayer1 ? 'p1' : 'p2';
  const rivalPlayerKey = isPlayer1 ? 'p2' : 'p1';
  const myPlayerNum = player;
  const rivalPlayerNum = player === 1 ? 2 : 1;

  console.log('Claus calculades:', { myPlayerKey, rivalPlayerKey, myPlayerNum, rivalPlayerNum });

  const roundsHtml = history.map((r) => {
    const rivalShot = r[rivalPlayerKey].shot;
    const mySave = r[myPlayerKey].save;
    const myPoints = r[myPlayerKey].punts;

    console.log(`Ronda ${r.round}:`, { rivalShot, mySave, myPoints });

    return `
      <div class="round-card">
        <div class="round-header">
          <span class="round-pill">Ronda ${r.round}</span>
          <span class="round-points">Punts: ${myPoints}</span>
        </div>
        <div class="round-body-simple">
          <div class="move-line"><span class="label">Xut del rival</span><span class="value">${formatMoveLabel(rivalShot)}</span></div>
          <div class="move-line"><span class="label">La teva aturada</span><span class="value">${formatMoveLabel(mySave)}</span></div>
        </div>
      </div>
    `;
  }).join('');

  console.log('Puntuacions finals mostrades:', {
    meva: finalScore[myPlayerNum],
    rival: finalScore[rivalPlayerNum]
  });

  resultEl.innerHTML = `
    <div class="results-card">
      <div class="results-header">
        <h3>🏁 Resultat final</h3>
        <span class="badge ${outcomeClass}">${outcomeText}</span>
      </div>
      <div class="scoreboard">
        <div class="score-box">
          <div class="score-label">Tu</div>
          <div class="score-value">${finalScore[myPlayerNum] || 0}</div>
        </div>
        <div class="score-box">
          <div class="score-label">Rival</div>
          <div class="score-value">${finalScore[rivalPlayerNum] || 0}</div>
        </div>
      </div>
      <div class="rounds-grid">
        ${roundsHtml}
      </div>
    </div>
  `;
}

createBtn.addEventListener('click', () => {
  ensureConnection();
  safeSend({ type: 'ROOM_CREATE' });
});

copyBtn.addEventListener('click', async () => {
  const code = roomInput.value.trim();
  if (!code) return;
  
  try {
    await navigator.clipboard.writeText(code);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copiat!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert('No s\'ha pogut copiar el codi');
  }
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

  console.log("CLIENT ENVIA:", {
    shot: selectedShot,
    save: selectedSave
  });

  safeSend({
    type: 'SUBMIT_MOVE',
    payload: {
      shot: selectedShot,
      save: selectedSave
    }
  });

  // ✅ Desmarca seleccions immediatament
  resetSelections();

  // ✅ Desactiva el botó fins que torni a seleccionar
  submitBtn.disabled = true;

  // ✅ Comptador de rondes del jugador
  roundsPlayed++;

  // ✅ Si ja ha fet les 2 rondes → bloquejar definitivament
  if (roundsPlayed >= 2) {
    submitBtn.disabled = true;
    disableButtons();
  }
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

// --- Reinici sense animació ---
const params = new URLSearchParams(window.location.search);
const isRestart = params.get('restart') === '1';

if (isRestart) {
  penaltyAnimation.style.display = 'none';
  introScreen.style.display = 'flex';
  introScreen.style.justifyContent = 'center';
  introScreen.style.alignItems = 'center';
  introContent.classList.add('show');

  document.querySelector('.intro-title').textContent = 'Torna a jugar';
  document.querySelector('.intro-subtitle').textContent = 'Preparat per un altre duel?';

  gameMain.style.display = 'none';
}
