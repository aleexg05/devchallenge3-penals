# DevChallenge3 – Joc de penals

## Descripció
Joc bàsic de penals per dos jugadors amb comunicació en temps real via WebSockets. Cada jugador tria xut (alçada/direcció) i aturada (alçada/direcció). Puntuacions: 0, 1 o 2. Resultat per ronda i reinici automàtic.

## Stack
- Node.js + Express
- WebSocket (ws)
- HTML/CSS/JS
- Docker + Compose

## Execució
- Local: `cd server && npm install && npm start`, obre `http://localhost:3000`
- Docker: `docker compose up --build`, obre `http://localhost:3000`

## Funcions clau
- Creació i unió a sala
- Assignació automàtica de jugador 1/2
- Tirada simultània, càlcul de punts i notificació resultat
- Accessibilitat bàsica (aria-live, labels, contrast)
