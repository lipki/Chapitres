import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
import Nextor from './Nextor';

const socket = io();
const md = markdownIt({
  breaks: true,
  typographer: true
});

let gameRoomUUID = '';
let univers = '';

Nextor.addStep( ( gameData ) => {

  document.getElementById('sendPseudo').value = gameData.pseudo;
  document.getElementById('sendGameUUID').value = gameData.gameRoomUUID;

  document.querySelector('#home fieldset button').addEventListener('click', () => {
    socket.emit('new player', JSON.stringify({
      'gameRoomUUID': document.getElementById('sendGameUUID').value,
      'pseudo': document.getElementById('sendPseudo').value
    }));
  });

  return true;

}, ( gameData ) => {

  document.getElementById('gameRoomUUID').innerText = gameData.gameRoomUUID;
  document.getElementById('home').style.display = 'none';
  document.getElementById('wait').style.display = 'block';
  
  document.querySelector('#startGame button').addEventListener('click', () => {
    socket.emit('vote', JSON.stringify({'election':'start', 'candidate':'yes'}));
  });

  return true;

}, ( univers, results ) => {

  //document.querySelector('#startGame button .voted').value = progress;
  console.log(results)

  if( progress !== 1 ) return false;

  Object.keys(univers).filter(n => n != 'neutre').forEach(u => {
    const button = document.createElement('button');
    button.id = u;
    button.innerHTML = univers[u].title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';
    document.querySelector('#univers fieldset').append(button);
  });

  document.getElementById('startGame').style.display = 'none';
  document.getElementById('univers').style.display = 'block';

  document.querySelectorAll('#univers fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({'election':'univers', 'candidate':button.id}));
    });
  });

  return true;

  /*Object.keys(univers).filter(n => n != 'neutre').forEach(u => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = univers[u].title;
    fieldset.append(legend);
    document.querySelector('#univers').append(fieldset);

    Object.keys(univers[u].themes).forEach(t => {
      const button = document.createElement('button');
      button.id = t;
      button.innerHTML = univers[u].themes[t].title;
      button.innerHTML += ' <progress class="voted" max="0" value="0"></progress>';
      const pitch = md.render(univers[u].themes[t].pitch).replace(/%\d/gi, '____________');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerHTML += pitch;
      button.append(tooltip);
      fieldset.append(button);
    });
  });

  document.getElementById('startGame').style.display = 'none';
  document.getElementById('univers').style.display = 'block';

  document.querySelectorAll('#univers fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({'type':'themes', 'theme':button.id}));
    });
  });*/

});


Nextor.addAction( 'updateGameData', ( gameData ) => {

  document.getElementById('playerlist').replaceChildren();
  
  if( gameData.playerList ) 
    gameData.playerList.forEach(player => {
      console.log(' └ ' + player.pseudo);
      let li = document.createElement('li');
      li.innerText = player.pseudo;
      document.getElementById('playerlist').append(li);
    });

});

Nextor.addAction( 'gameRoomPrivate', ( gameData ) => {

  const error = document.querySelector('#error');
  error.replaceChildren();
  error.style.display = 'block';
  error.innerHTML = md.render(
    'Désolé ! La Partie identifier **' + gameData.gameRoomUUID + '** est déjà en cours et n\'accepte plus de joueur !'
  );

  setTimeout( () => error.style.display = 'none', 5000);

});


socket.on('home', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nA user is connected');
  console.log('├ random pseudo : ', gameData.pseudo);
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  Nextor.start( gameData );

});


socket.on('gameRoom private', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nGameRoom private');
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  Nextor.please( 'gameRoomPrivate', gameData );

});

socket.on('switch to wait room', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nswitch to wait room');
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  gameRoomUUID = gameData.gameRoomUUID;
  univers = gameData.univers;

  Nextor.next( gameData );

});

socket.on('update game data', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nupdate game data');
  console.log('├ add player : ' + gameData.newplayer);
  console.log('└ remove player : ' + gameData.removeplayer);

  Nextor.please( 'updateGameData', gameData );

});

socket.on('start vote', function ( results ) {

  console.log('\nPlayer as voted !');
  console.log('├ election : start');
  console.log('└ progress : ', Math.max(...Object.values(results))*100, '%');

  Nextor.next( univers, results );

});

socket.on('univers vote', function ( results ) {

  console.log('\nPlayer as voted !');
  console.log('├ election : univers');
  console.log('└ progress : ', Math.max(...Object.values(results))*100, '%');

  Nextor.next( univers, results );

});

socket.on('switch themes vote', function ( progress ) {

  console.log('\nswitch themes vote');

  //Nextor.next( univers, progress );

});

