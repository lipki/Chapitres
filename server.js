const app = require('express')();
const https = require('https');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const [Main, GR] = require('./lib/MainServer');
const GameRoom = require('./lib/GameRoom');

const main = new Main(io);
GameRoom.io = io;

const routes = [
  {uri:'/lib/markdown-it.js'},
  {uri:'/lib/Nextor', redirect: '/lib/Nextor.js'},
  {uri:'/lib/MainLocal.js'},
  {redirect: '/style.css', mime:'text/css'},
  {uri:'/', redirect: '/index.html'}
]

routes.forEach( route => {
  let redirect = route.redirect ?? route.uri;
  let uri = route.uri ?? route.redirect;
  let mime = route.mime;
  app.get(uri, (req, res) => {
    if( mime ) res.set('Content-Type', mime);
    res.sendFile(__dirname + redirect)
  });
})

io.on('connection', socket => {

    console.log('Ⓢ socket connection');

    https.get("https://www.cjglitter.com/rand_name/api", res => {
      let data = '';
      res.on('data', chunk => data += chunk );

      res.on('end', () => 
        socket.emit('home', 
          JSON.stringify(
            main.makeFakePlayer( JSON.parse(data).results[0].name.first_name ))));
    });

    socket.on('disconnect', () => {
      console.log('Ⓢ socket disconnect');
      const gameRoom = main.removePlayer(socket.id);

      if( gameRoom )
        io.emit('update game data',
          JSON.stringify(gameRoom.data(GR.OLDPLAYER, GR.PLAYERLIST)));
    });

    socket.on('new player', _newPlayerData => {

      const player = main.makePlayer ( JSON.parse(_newPlayerData), socket.id );
      const gameRoom = player.gameRoom;

      if( gameRoom.private ) {
        socket.emit('gameRoom private', JSON.stringify(gameRoom.data()));
        return ;
      }

      socket.join( gameRoom.uuid );

      socket.emit('switch to wait room',
        JSON.stringify(gameRoom.data(GR.NEWPLAYER, GR.UNIVERS)));

      io.to(gameRoom.uuid).emit('update game data',
        JSON.stringify(gameRoom.data(GR.PLAYERLIST)));
    });

    socket.on('vote', _vote => {
      const player = Main.playerList.get(socket.id);
      player.gameRoom.generalVote( JSON.parse(_vote) );
    });
})

http.listen(3000, () => {
    console.log("Server running on 3000");
})
