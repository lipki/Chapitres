import express from 'express';
import _http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { communication } from './backend/lib/socket.js';
import { GameState } from './backend/lib/GameState.js';

const app = express();
const port = 3000;

const server = _http.createServer(app);
const io = new Server(server);

import {GameRoom} from './backend/lib/GameRoom.js';
GameRoom.io = io;

// Obtenir le chemin absolu vers le dossier dist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Servir les fichiers statiques
app.use(express.static(path.join(__dirname, './frontend/dist')));

// 2. Catch-all route pour SPA (Single Page App)
//app.all('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

server.listen(port, () => {
    GameState.logBlock(`🔌 Server running on ${port}`);
})

communication(io);