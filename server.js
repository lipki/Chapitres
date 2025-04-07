import express from 'express';
import _http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const app = express();
const port = 3000;

const server = _http.createServer(app);
const io = new Server(server);

import {GameRoom, Player} from './backend/lib/GameRoom.js';
GameRoom.io = io;

// Obtenir le chemin absolu vers le dossier dist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Servir les fichiers statiques
app.use(express.static(path.join(__dirname, './frontend/dist')));

// 2. Catch-all route pour SPA (Single Page App)
//app.all('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

server.listen(port, () => {
    console.log(`Ⓢ Server running on ${port}`);
})

io.on('connection', socket => {

  console.log('Ⓢ socket connection : ', socket.id);

  socket.emit('home', GameRoom.makeFakePlayer());

  socket.on('disconnect', () => {
    console.log('Ⓢ socket disconnect : ', socket.id);
    GameRoom.removePlayer(socket.id);
  });

  socket.on('new player', _newPlayerData => {
    GameRoom.makePlayer ( _newPlayerData, socket );
  });

  socket.on('vote', _vote => {
    Player.list.get(socket.id).gameRoom.generalVote( socket.id, _vote );
  });
})