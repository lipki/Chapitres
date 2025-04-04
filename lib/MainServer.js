const Urne = require('./Urne');

const univers = require('../assets/univers');

urne = new Urne();

class Main {

  static playerList = new Map();
  static electorActions = new Map();

  static getUUID () {
    return (Date.now()+Math.floor(Math.random()*10)).toString(36);
  }

  static addVoteCallback ( election, actionVote, actionVoted ) {
    Main.electorActions.set( election, {'actionVote': actionVote, 'actionVoted': actionVoted} );
  }

  constructor () {}

  makeFakePlayer ( randomPseudo ) {

    const gameRoomUUID = 'game-'+Main.getUUID();
    
    console.log('\nA potentiel user is connected');
    console.log('├ random pseudo : ', randomPseudo);
    console.log('└ gameUUID : ' + gameRoomUUID);

    return { 'gameRoomUUID' : gameRoomUUID, 'pseudo' : randomPseudo }

  }

  makePlayer ( playerdata, uuid ) {

    const player = new Player( uuid, playerdata.pseudo );
    const gameRoom = GameRoom.get( playerdata.gameRoomUUID );
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

  generalVote ( uuid, vote ) {
    const player = Main.playerList.get(uuid);
    const gameRoom = player.gameRoom;
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

  static get ( uuid ) {
    if( GameRoom.gameRoomList.has(uuid) )
      return GameRoom.gameRoomList.get(uuid);
    else {
      const gameRoom = new GameRoom( uuid );
      GameRoom.gameRoomList.set(uuid, gameRoom);
      return gameRoom;
    }
  }

  uuid = 0;
  playerList = new Map();
  lastAddPlayer;
  lastRMPlayer;
  electorList = urne.makeList();
  voter;
  private = false;
  univers;

  constructor ( _uuid ) {
    this.uuid = _uuid;
  }

  addPlayer(player) {

    this.playerList.set( player.uuid, player );
    player.addGameRoom( this );
    this.lastAddPlayer = player.uuid;

    const eaStart = Main.electorActions.get( 'start' );

    this.electorList.addElection({
      name: 'start',
      candidates: ['yes', 'no'],
      actionVote: progress =>  eaStart.actionVote(player.gameRoom.uuid, progress),
      actionVoted: (progress, winner) => player.gameRoom.private = true
    });

    const eaUnivers = Main.electorActions.get( 'start' );

    this.electorList.addElection({
      name: 'univers',
      candidates: Object.keys(univers).filter(key => univers[key].themes),
      actionVote: progress => eaUnivers.actionVote(player.gameRoom.uuid, progress),
      actionVoted: (progress, winner) => {
        player.gameRoom.univers = winner.name;
        eaStart.actionVoted(player.gameRoom.uuid, progress, winner.name);
      }
    });

    this.voter = this.electorList.addVoter( player.pseudo );

  }

  removePlayer ( uuid ) {
    delete this.playerList.delete(uuid);
    this.lastRMPlayer = uuid;

    this.electorList.removeVoter( this.voter );
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