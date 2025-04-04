const app = require('express')();
const https = require('https');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const [Main, GR] = require('./lib/MainServer');

const main = new Main();
 
app.get('/lib/markdown-it', function(req, res) {
  res.sendFile(__dirname + '/lib/markdown-it.js');
});
 
app.get('/lib/Nextor', function(req, res) {
  res.sendFile(__dirname + '/lib/Nextor.js');
});
 
app.get('/lib/MainLocal.js', function(req, res) {
  res.sendFile(__dirname + '/lib/MainLocal.js');
});
 
app.get('/style.css', function(req, res) {
  res.set('Content-Type', 'text/css');
  res.sendFile(__dirname + '/style.css');
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

Main.addVoteCallback( 'start', (gameRoom, results) => {
  io.to(gameRoom).emit('start vote', results);
});

Main.addVoteCallback( 'univers', (gameRoom, results) => {
  io.to(gameRoom).emit('univers vote', results);
}, (gameRoom, results, winner) => {
  io.to(gameRoom).emit('switch themes vote', results, winner);
});

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
      main.generalVote( socket.id, JSON.parse(_vote) )
    });
})

http.listen(3000, () => {
    console.log("Server running on 3000");
})
