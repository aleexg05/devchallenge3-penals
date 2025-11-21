const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const setupWebSocket = require('./ws');

const app = express();
app.use(cors());
app.use(express.json());

// Serveix el client estàtic
app.use('/', express.static(path.join(__dirname, '..', 'client')));

// Endpoint de prova
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
