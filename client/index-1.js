// const socket = new WebSocket(`ws://${location.host}`);

// function enviarEvent(type, payload = {}) {
//   const msg = { type, payload };
//   if (socket.readyState === WebSocket.OPEN) {
//     console.log('👉 Enviant event:', msg);
//     socket.send(JSON.stringify(msg));
//   } else {
//     console.warn('⚠️ Socket encara no està obert, no puc enviar:', msg);
//   }
// }

// socket.onopen = () => {
//   console.log('✅ Connectat al servidor WebSocket');
//   enviarEvent('ROOM_CREATE'); // crea sala automàticament
// };

// socket.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   console.log('📩 Missatge rebut:', data);

//   if (data.type === 'ROOM_CREATED') {
//     console.log('Sala creada amb ID:', data.payload.roomId);
//     // En una segona pestanya: enviarEvent('ROOM_JOIN', { roomId: data.payload.roomId });
//   }

//   if (data.type === 'JOINED') {
//     console.log(`Jugador ${data.payload.player} ha entrat. Ready: ${data.payload.ready}`);
//   }

//   if (data.type === 'PLAYER_JOINED') {
//     console.log('Un altre jugador s’ha unit a la sala');
//   }

//   if (data.type === 'WAITING_FOR_OPPONENT') {
//     console.log('Esperant que l’altre jugador faci la jugada…');
//   }

//   if (data.type === 'ROUND_RESULT') {
//     console.log('Resultat de la ronda:', data.payload);
//   }

//   if (data.type === 'GAME_OVER') {
//     console.log('🏁 Partida acabada! Puntuació final:', data.payload.finalScore);
//   }

//   if (data.type === 'ERROR') {
//     console.error('❌ Error rebut:', data.payload);
//     if (data.payload.reason === 'CREATOR_CANNOT_JOIN') {
//       alert('No pots unir-te a la teva pròpia sala. Espera que un altre jugador entri.');
//     }
//     if (data.payload.reason === 'ALREADY_IN_ROOM') {
//       alert('Ja estàs dins d’aquesta sala.');
//     }
//   }
// };

// // Exemple: enviar jugada
// function enviarJugada(move) {
//   enviarEvent('SUBMIT_MOVE', { move });
// }
