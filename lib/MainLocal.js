import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
import Nextor from './Nextor';

const socket = io();


const md = markdownIt({
  breaks: true,
  typographer: true
});

let gameRoomUUID;
let univers;
let univer;

Nextor.addStep( ( univers, results, winner ) => {

  univer = winner;

  Object.keys(univers[univer].themes).forEach(t => {
    const button = document.createElement('button');
    button.id = t;
    button.innerHTML = univers[univer].themes[t].title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';
    const pitch = md.render(univers[univer].themes[t].pitch).replace(/%\d/gi, '____________');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML += pitch;
    button.append(tooltip);
    document.querySelector('#themes fieldset').append(button);
  });

  document.getElementById('univers').style.display = 'none';
  document.getElementById('themes').style.display = 'block';

  document.querySelectorAll('#themes fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({'election':'themes', 'candidate':button.id}));
    });
  });

});







socket.on('connect', function () {
  console.log('Ⓛ Socket is connected.');
});

socket.on('disconnect', function () {
  console.log('Ⓛ Socket is disconnected.');
  window.location.reload();
});





socket.on('home', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nA user is connected');
  console.log('├ random pseudo : ', gameData.pseudo);
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  Nextor.please( 'home', gameData );

});

Nextor.addAction( 'home', ( gameData ) => {

  document.querySelector('#home fieldset button').addEventListener('click', () => {
    socket.emit('new player', JSON.stringify({
      'gameRoomUUID': document.getElementById('sendGameUUID').value,
      'pseudo': document.getElementById('sendPseudo').value
    }));
  });

  document.getElementById('sendPseudo').value = gameData.pseudo;
  document.getElementById('sendGameUUID').value = gameData.gameRoomUUID;
  document.getElementById('home').style.display = 'block';

});







socket.on('gameRoom private', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nGameRoom private');
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  Nextor.please( 'gameRoomPrivate', gameData );

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







socket.on('update game data', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nupdate game data');
  console.log('├ add player : ' + gameData.newPlayer?.pseudo);
  console.log('└ remove player : ' + gameData.removePlayer?.pseudo);

  Nextor.please( 'updateGameData', gameData );

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





socket.on('switch to wait room', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.log('\nswitch to wait room');
  console.log('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  console.log('\nVotation en cour !');
  console.log('├ election : start');
  console.log('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch to wait room', gameData );

});

Nextor.addAction( 'switch to wait room', ( gameData ) => {

  document.querySelector('#startGame').replaceChildren();

  gameData.candidates.forEach( candidate => {
    const button = document.createElement('button');
    button.id = candidate.name;
    button.innerHTML = candidate.title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';
    document.querySelector('#startGame').append(button);
  });

  document.querySelectorAll('#startGame button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({ election:'start', candidate:button.id }));
    });
  });

  document.getElementById('gameRoomUUID').innerText = gameData.gameRoomUUID;
  document.getElementById('home').style.display = 'none';
  document.getElementById('wait').style.display = 'block';

});







socket.on('start vote', function ( results ) {

  console.log('\nPlayer as voted !');
  console.log('├ election : start');
  console.log('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'start vote update', results );

});

Nextor.addAction( 'start vote update', ( results ) => {

  results.forEach( result => 
    document.querySelector('#startGame button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

});







socket.on('switch univers vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.log('\nswitch univers vote');
  console.log('└ winner is : ', gameData.winner);

  console.log('\nVotation en cour !');
  console.log('├ election : univers');
  console.log('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch univers vote', gameData );

});

Nextor.addAction( 'switch univers vote', ( gameData ) => {

  document.querySelector('#univers fieldset').replaceChildren();

  gameData.candidates.forEach( candidate => {
    const button = document.createElement('button');
    button.id = candidate.name;
    button.innerHTML = candidate.title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';
    document.querySelector('#univers fieldset').append(button);
  });

  document.querySelectorAll('#univers fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({ election:'univers', candidate:button.id }));
    });
  });

  document.getElementById('startGame').style.display = 'none';
  document.getElementById('univers').style.display = 'block';

});






socket.on('univers vote', function ( results ) {

  console.log('\nPlayer as voted !');
  console.log('├ election : univers');
  console.log('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'univers vote update', results );

});

Nextor.addAction( 'univers vote update', ( results ) => {

  results.forEach( result => 
    document.querySelector('#univers button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

});








socket.on('switch themes vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.log('\nswitch themes vote');
  console.log('└ winner is : ', gameData.winner);

  console.log('\nVotation en cour !');
  console.log('├ election : themes');
  console.log('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch themes vote', gameData );

});

Nextor.addAction( 'switch themes vote', ( gameData ) => {

  document.querySelector('#themes fieldset').replaceChildren();

  gameData.candidates.forEach( candidate => {
    const button = document.createElement('button');
    button.id = candidate.name;
    button.innerHTML = candidate.title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';
    document.querySelector('#themes fieldset').append(button);
  });

  document.querySelectorAll('#themes fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({ election:'themes', candidate:button.id }));
    });
  });

  document.getElementById('univers').style.display = 'none';
  document.getElementById('themes').style.display = 'block';

});







socket.on('themes vote', function ( results ) {

  console.log('\nPlayer as voted !');
  console.log('├ election : themes');
  console.log('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'themes vote update', results );

});

Nextor.addAction( 'themes vote update', ( results ) => {

  results.forEach( result => 
    document.querySelector('#themes button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

});







socket.on('switch pitch vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.log('\nswitch themes vote');
  console.log('└ winner is : ', gameData.winner);

  /*console.log('\nVotation en cour !');
  console.log('├ election : themes');
  console.log('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch themes vote', gameData );*/

});