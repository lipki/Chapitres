import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
import Nextor from './Nextor';

const socket = io();
const md = markdownIt({
  breaks: true,
  typographer: true
});







socket.on('connect', function () {
  console.info('Ⓛ Socket is connected.');
});

socket.on('disconnect', function () {
  console.info('Ⓛ Socket is disconnected.');
  window.location.reload();
});





socket.on('home', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.info('\nA user is connected');
  console.info('├ random pseudo : ', gameData.pseudo);
  console.info('└ gameRoomUUID : ' + gameData.gameRoomUUID);

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

  document.querySelector('.waiting-dots').style.display = 'none';
  document.getElementById('home').style.display = 'block';

});







socket.on('gameRoom private', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.info('\nGameRoom private');
  console.info('└ gameRoomUUID : ' + gameData.gameRoomUUID);

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

  console.info('\nupdate game data');
  console.info('├ add player : ' + gameData.newPlayer?.pseudo);
  console.info('└ remove player : ' + gameData.removePlayer?.pseudo);

  Nextor.please( 'updateGameData', gameData );

});

Nextor.addAction( 'updateGameData', ( gameData ) => {
  
  if( gameData.playerList ) {

    document.getElementById('playerlist').replaceChildren();

    gameData.playerList.forEach(player => {
      console.info(' └ ' + player.pseudo);
      let li = document.createElement('li');
      li.dataset.pseudo = player.pseudo;
      li.dataset.uuid = player.uuid;
      li.className = 'player';
      li.innerText = player.pseudo;
      document.getElementById('playerlist').append(li);
    });
  }

  if( gameData.editor ) {
    const editor = document.querySelector("[data-uuid='"+gameData.editor.uuid+"']");
    editor.classList.add('editor');
  }

  if( gameData.voterStatus ) {
    document.querySelectorAll("#playerlist li").forEach( li => li.classList.remove('voted') );
    gameData.voterStatus.filter(voter => voter.hasVoted).forEach( _voter => 
      document.querySelector("[data-uuid='"+_voter.uuid+"']").classList.add('voted'));
  }

});





socket.on('switch to wait room', function (_gameData) {

  const gameData = JSON.parse(_gameData);

  console.info('\nswitch to wait room');
  console.info('└ gameRoomUUID : ' + gameData.gameRoomUUID);

  console.info('\nVotation en cour !');
  console.info('├ election : start');
  console.info('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch to wait room', gameData );

});

Nextor.addAction( 'switch to wait room', ( gameData ) => {

  document.querySelectorAll('#playerlist li')?.forEach( li => li.classList.remove('voted'));

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







socket.on('start vote', function ( results, voterStatus ) {

  console.info('\nPlayer as voted !');
  console.info('├ election : start');
  console.info('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'start vote update', results, voterStatus );

});

Nextor.addAction( 'start vote update', ( results, voterStatus ) => {

  results.forEach( result => 
    document.querySelector('#startGame button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

    document.querySelectorAll("#playerlist li").forEach( li => li.classList.remove('voted') );
    voterStatus.filter(voter => voter.hasVoted).forEach( _voter => 
      document.querySelector("[data-uuid='"+_voter.uuid+"']").classList.add('voted'));

});







socket.on('switch univers vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.info('\nswitch univers vote');
  console.info('└ winner is : ', gameData.winner);

  console.info('\nVotation en cour !');
  console.info('├ election : univers');
  console.info('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch univers vote', gameData );

});

Nextor.addAction( 'switch univers vote', ( gameData ) => {

  document.querySelectorAll('#playerlist li').forEach( li => li.classList.remove('voted'));

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

  const legend = document.createElement('legend');
  legend.innerText = "Choisissez un univers";
  document.querySelector('#univers fieldset').append(legend);

  document.getElementById('startGame').style.display = 'none';
  document.getElementById('univers').style.display = 'block';

});






socket.on('univers vote', function ( results, voterStatus ) {

  console.info('\nPlayer as voted !');
  console.info('├ election : univers');
  console.info('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'univers vote update', results, voterStatus );

});

Nextor.addAction( 'univers vote update', ( results, voterStatus ) => {

  results.forEach( result => 
    document.querySelector('#univers button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

  document.querySelectorAll("#playerlist li").forEach( li => li.classList.remove('voted') );
  voterStatus.filter(voter => voter.hasVoted).forEach( _voter => 
    document.querySelector("[data-uuid='"+_voter.uuid+"']").classList.add('voted'));

});








socket.on('switch themes vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.info('\nswitch themes vote');
  console.info('└ winner is : ', gameData.winner);

  console.info('\nVotation en cour !');
  console.info('├ election : themes');
  console.info('└ candidates : ', JSON.stringify(gameData.candidates));

  Nextor.please( 'switch themes vote', gameData );

});

Nextor.addAction( 'switch themes vote', ( gameData ) => {

  document.querySelectorAll('#playerlist li').forEach( li => li.classList.remove('voted'));

  document.querySelector('#themes fieldset').replaceChildren();

  gameData.candidates.forEach( candidate => {
    const button = document.createElement('button');
    button.id = candidate.name;
    button.innerHTML = candidate.title;
    button.innerHTML += ' <progress class="voted" max="1" value="0"></progress>';

    const pitch = md.render(candidate.pitch).replace(/%\d/gi, '____________');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML += pitch;
    button.append(tooltip);

    document.querySelector('#themes fieldset').append(button);
  });

  document.querySelectorAll('#themes fieldset button').forEach( button => {
    button.addEventListener('click', (element) => {
      socket.emit('vote', JSON.stringify({ election:'themes', candidate:button.id }));
    });
  });

  const legend = document.createElement('legend');
  legend.innerText = "Choisissez un theme";
  document.querySelector('#themes fieldset').append(legend);

  document.getElementById('univers').style.display = 'none';
  document.getElementById('themes').style.display = 'block';

});








socket.on('themes vote', function ( results, voterStatus ) {

  console.info('\nPlayer as voted !');
  console.info('├ election : themes');
  console.info('└ results : ', results.reduce((a, b) => a.percentage > b.percentage ? a : b).percentage*100, '%');

  Nextor.please( 'themes vote update', results, voterStatus );

});

Nextor.addAction( 'themes vote update', ( results, voterStatus ) => {

  results.forEach( result => 
    document.querySelector('#themes button#' + result.name + ' .voted')
      ?.setAttribute("value", result.percentage));

  document.querySelectorAll("#playerlist li").forEach( li => li.classList.remove('voted') );
  voterStatus.filter(voter => voter.hasVoted).forEach( _voter => 
    document.querySelector("[data-uuid='"+_voter.uuid+"']").classList.add('voted'));

});







socket.on('switch pitch vote', function ( _gameData ) {

  const gameData = JSON.parse(_gameData);

  console.info('\nswitch pitch vote');
  console.info('└ winner is : ', gameData.winner);

  Nextor.please( 'switch pitch vote', gameData );

});

Nextor.addAction( 'switch pitch vote', ( gameData ) => {

  document.querySelectorAll('#playerlist li').forEach( li => li.classList.remove('voted'));

  document.querySelector('#pitch fieldset').replaceChildren();

  const pitchText = md.render(gameData.pitch).replace(
    /%\d/gi,
    (match) => '<input id="ph'+match.slice(1)+'" disabled />'
  );
  const pitch = document.createElement('div');
  pitch.innerHTML += pitchText;
  document.querySelector('#pitch fieldset').append(pitch);

  const legend = document.createElement('legend');
  legend.innerText = "Completer le Pitch de '"+gameData.title+"'";
  document.querySelector('#pitch fieldset').append(legend);
  
  document.getElementById('themes').style.display = 'none';
  document.getElementById('pitch').style.display = 'block';

});



socket.on('Editor is you', function () {

  console.info('\nEditor is you');

  document.querySelectorAll('#pitch input').forEach( input => input.disabled = false );

});