const app = require('express')();
const https = require('https');
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/style.css', function(req, res) {
  res.set('Content-Type', 'text/js');
  res.sendFile(__dirname + '/assets/index-CxtJFQC8.js');
});
 
app.get('/style.css', function(req, res) {
  res.set('Content-Type', 'text/css');
  res.sendFile(__dirname + '/assets/index-yJpzg09Q.css ');
});
 
app.get('/style.css', function(req, res) {
  res.set('Content-Type', 'text/css');
  res.sendFile(__dirname + '/style.css');
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let gamesList = {};

io.on('connection', function (socket) {

    console.log('A user is connected');

    let socketId = socket.id;

    https.get("https://www.cjglitter.com/rand_name/api", (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const playerPseudo = JSON.parse(data).results[0].name.first_name;
        console.log('├ random pseudo : ', playerPseudo);

        const gameUUID = 'game-'+Math.floor(Date.now() / 1000).toString(36);
        console.log('└ gameUUID : ' + gameUUID);

        let playerData = {'gameUUID':gameUUID, 'playerPseudo':playerPseudo};

        const gameData = {
          'gameUUID' : gameUUID,
          'playerPseudo' : playerPseudo
        };

        socket.emit('home', JSON.stringify(gameData));
      });
    });

    socket.on('disconnect', function() {

      let gameUUID, pseudo = '';

      Object.entries(gamesList).forEach(([key, value]) => {
        let newPlayerList = [];
        value.forEach(v => {
          if( v.uuid != socketId )
            newPlayerList.push(v);
          else {
            gameUUID = key;
            pseudo = v.pseudo;
          }
        });
        if(newPlayerList.length === 0)
             gamesList[key] = null;
        else gamesList[key] = newPlayerList;
      });

      console.log('A user is disconnect');
      console.log('├ removeplayer : ' + pseudo);
      console.log('└ gameUUID : ' + gameUUID);

      const gameData = {
        'gameUUID' : gameUUID,
        'removeplayer' : pseudo,
        'playerList' : gamesList[gameUUID]
      };
      
      io.emit('update player list', JSON.stringify(gameData));
    });

    socket.on('new player', function (newPlayerData) {

      let playerData = JSON.parse(newPlayerData);

      console.log('Welcome to new challenger !');
      console.log('├ pseudo : ' + playerData.playerPseudo);
      console.log('└ gameUUID : ' + playerData.gameUUID);

      if( gamesList[playerData.gameUUID] === undefined )
        gamesList[playerData.gameUUID] = [];
      gamesList[playerData.gameUUID].push({'pseudo':playerData.playerPseudo, 'uuid':socketId});

      console.log('player list : ', gamesList);

      const gameData = {
        'gameUUID' : playerData.gameUUID,
        'newplayer' : playerData.playerPseudo,
        'playerList' : gamesList[playerData.gameUUID]
      };

      socket.emit('switch to wait room', JSON.stringify(gameData));
      io.emit('update player list', JSON.stringify(gameData));
    })
})

http.listen(3000, function () {
    console.log("Server running on 3000");
})
