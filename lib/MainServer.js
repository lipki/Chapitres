const Urne = require('./Urne');

const univers = require('../assets/univers');

urne = new Urne();

class Main {

  static io;
  static playerList = new Map();
  static electorActions = new Map();

  static getUUID () {
    return (Date.now()+Math.floor(Math.random()*10)).toString(36);
  }

  constructor ( _io ) {
    Main.io = _io;
  }

  makeFakePlayer ( randomPseudo ) {

    const gameRoomUUID = 'game-'+Main.getUUID();
    
    console.log('\nA potentiel user is connected');
    console.log('├ random pseudo : ', randomPseudo);
    console.log('└ gameUUID : ' + gameRoomUUID);

    return { 'gameRoomUUID' : gameRoomUUID, 'pseudo' : randomPseudo }

  }

  makePlayer ( playerdata, uuid ) {

    const player = new Player( uuid, playerdata.pseudo );
    const gameRoom = GameRoom.get( playerdata.gameRoomUUID, Main.io.to(playerdata.gameRoomUUID) );
    gameRoom.addPlayer(player);

    console.log('\nWelcome to new challenger !');
    console.log('├ pseudo : ' + player.pseudo);
    console.log('└ gameRoomUUID : ' + gameRoom.uuid);

    return player;
  }

  removePlayer ( uuid ) {

    const player = Main.playerList.get(uuid);
    if( player === undefined ) return false;

    console.log('\nA user is disconnect');
    console.log('├ removeplayer : ' + player.pseudo);
    console.log('└ gameRoomUUID : ' + player.gameRoom.uuid);

    player.gameRoom.removePlayer(uuid);

    return player.gameRoom;

  }

}

class Player {

  uuid = 0;
  pseudo = '';
  gameRoom;

  constructor ( _uuid, _pseudo ) {
    this.uuid = _uuid;
    this.pseudo = _pseudo;
    Main.playerList.set( _uuid, this );
  }

  addGameRoom( _gameRoom ) {
    this.gameRoom = _gameRoom;
  }

}

class GameRoom {

  static gameRoomList = new Map();

  static NEWPLAYER = 'the last add player';
  static OLDPLAYER = 'the last removed player';
  static UNIVERS = 'data of all univers';
  static PLAYERLIST = 'list of all players';

  static get ( uuid, io ) {
    if( GameRoom.gameRoomList.has(uuid) )
      return GameRoom.gameRoomList.get(uuid);
    else {
      const gameRoom = new GameRoom( uuid, io );
      GameRoom.gameRoomList.set(uuid, gameRoom);
      return gameRoom;
    }
  }

  uuid = 0;
  #io;
  playerList = new Map();
  lastAddPlayer;
  lastRMPlayer;
  electorList = urne.makeList();
  voter;
  private = false;
  univer;
  theme;

  constructor ( _uuid, io ) {
    this.uuid = _uuid;
    this.#io = io;
  }

  addPlayer(player) {

    const { playerList, electorList, lastAddPlayer, voter } = this;
    const io = this.#io;

    playerList.set( player.uuid, player );
    player.addGameRoom( this );
    lastAddPlayer = player.uuid;

    voter = electorList.addVoter( player.pseudo );

    /*electorList.addElection({
      name: 'start',
      candidates: ['yes', 'no'],
      actionVote: (results) => io.emit('start vote', results),
      actionVoted: (results, winner) => {
        player.gameRoom.private = true;
        io.emit('switch univers vote', results, winner.name);
      }
    });

    electorList.addElection({
      name: 'univers',
      candidates: Object.keys(univers).filter(key => univers[key].themes),
      actionVote: results => io.emit('univers vote', results),
      actionVoted: (results, winner) => {
        player.gameRoom.univer = winner.name;
        io.emit('switch themes vote', results, winner.name);
      }
    });

    /*const themes = univers[player.gameRoom.univer].themes;

    electorList.addElection({
      name: 'univers',
      candidates: Object.keys(themes),
      actionVote: results => io.emit('univers vote', results),
      actionVoted: (results, winner) => {
        player.gameRoom.theme = winner.name;
        io.emit('switch themes vote', results, winner.name);
      }
    });*/

  }

  removePlayer ( uuid ) {
    delete this.playerList.delete(uuid);
    this.lastRMPlayer = uuid;

    this.electorList.removeVoter( this.voter );
  }

  generalVote ( uuid, vote ) {
    const electorList = gameRoom.electorList;
    const voter = [...electorList.voterList.values()]
      .find( _voter => _voter.name === player.pseudo );
    const election = [...electorList.electionList.values()]
      .find( _election => _election.name === vote.election );
    const candidate = [...election.candidateList.values()]
      .find( _candidate => _candidate.name === vote.candidate );

    const results = election.submitVote( voter, candidate );

    console.log('\nPlayer as voted !');
    console.log('├ election : ', election.name);
    console.log('├ player : ', voter.name);
    console.log('├ candidate : ', candidate.name);
    console.log('└ results : ', results);

  }

  data( _ ) {
    let data = { 'gameRoomUUID' : this.uuid };
    let args = [...arguments];

    args.forEach( arg => {
      switch (arg) {
        case GameRoom.NEWPLAYER : data.newPlayer = this.lastAddPlayer; break;
        case GameRoom.OLDPLAYER : data.removeplayer = this.lastRMPlayer; break;
        case GameRoom.UNIVERS : data.univers = univers; break;
        case GameRoom.PLAYERLIST : data.playerList = [...this.playerList.values()]; break;
      }
    });

    return data;
  }

}

module.exports = [Main, GameRoom];