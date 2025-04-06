const app = require('express')();
const https = require('https');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const [GameRoom, Player] = require('./lib/GameRoom');

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
            GameRoom.makeFakePlayer( JSON.parse(data).results[0].name.first_name ))));
    });

    socket.on('disconnect', () => {
      console.log('Ⓢ socket disconnect');
      GameRoom.removePlayer(socket.id);
    });

    socket.on('new player', _newPlayerData => {
      GameRoom.makePlayer ( JSON.parse(_newPlayerData), socket );
    });

    socket.on('vote', _vote => {
      Player.list.get(socket.id).gameRoom.generalVote( socket.id, JSON.parse(_vote) );
    });
})

http.listen(3000, () => {
    console.log("Server running on 3000");
})
