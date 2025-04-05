const Urne = require('./Urne');
const Univers = require('./Univers');
const U = new Univers();
/*console.log(u.getUniversList()); // [ 'postapocalyptic', 'Superpowers' ]
console.log(u.getThemesFor('postapocalyptic')); // [ 'undead', 'cataclysm', ... ]
console.log(u.getTitle('postapocalyptic')); // "Environnements Post-Apocalyptiques"
console.log(u.getTitle('cataclysm')); // "Un cataclysme naturel"
console.log(u.getRandomWord('postapocalyptic')); // e.g., "chaos"*/

const GAMESTAT = {
  init: 'after create',
  waitPlayer: 'after first player',
  voteUnivers: 'vote for univers',
  voteThemes: 'vote for themes',
  votePitch: 'pitch composition'
}

const DATA = {
  NEWPLAYER: 'the last add player',
  OLDPLAYER: 'the last removed player',
  PLAYERLIST: 'list of all players',
  VOTESTART: 'the first vote data',
  VOTEUNIVERS: 'data for univers vote',
  VOTETHEMES: 'data for themes vote'
}

class GameRoom {

  static io;
  static playerList = new Map();
  static gameRoomList = new Map();

  static getUUID () {
    return (Date.now()+Math.floor(Math.random()*10)).toString(36);
  }

  static makeFakePlayer ( randomPseudo ) {

    const gameRoomUUID = 'game-'+GameRoom.getUUID();
    
    console.log('\nA potentiel user is connected');
    console.log('├ random pseudo : ', randomPseudo);
    console.log('└ gameUUID : ' + gameRoomUUID);

    return { 'gameRoomUUID' : gameRoomUUID, 'pseudo' : randomPseudo }

  }

  static makePlayer ( playerdata, socket ) {

    const gameRoom = GameRoom.get( playerdata.gameRoomUUID, GameRoom.io.to(playerdata.gameRoomUUID) );

    if( gameRoom.private ) {
      socket.emit('gameRoom private', JSON.stringify(gameRoom.data()));
      return ;
    }
    
    const player = new Player( socket, playerdata.pseudo );
    GameRoom.playerList.set( player.uuid, player );
    gameRoom.addPlayer( player );

  }

  static removePlayer ( uuid ) {

    const player = GameRoom.playerList.get(uuid);
    if( player === undefined ) return false;

    player.remove(uuid);

  }

  static get ( uuid, ioRoom ) {
    if( GameRoom.gameRoomList.has(uuid) )
      return GameRoom.gameRoomList.get(uuid);
    else {
      const gameRoom = new GameRoom( uuid, ioRoom );
      GameRoom.gameRoomList.set(uuid, gameRoom);
      return gameRoom;
    }
  }


  stat = GAMESTAT.init;

  uuid;
  #ioRoom;
  playerList = new Map();
  lastAddPlayer;
  lastRMPlayer;
  private = false;

  univer;

  electorList = Urne.makeList();

  constructor ( _uuid, ioRoom ) {
    this.uuid = _uuid;
    this.#ioRoom = GameRoom.io;

    this.stepOne();
  }

  addPlayer(player) {

    player.addGameRoom( this );
    this.playerList.set( player.uuid, player );
    this.lastAddPlayer = player.uuid;

    this.electorList.addVoter( player.pseudo );

    console.log('\nWelcome to new challenger !');
    console.log('├ pseudo : ' + player.pseudo);
    console.log('└ gameRoomUUID : ' + this.uuid);

    player.join( this.uuid );

    player.emit('switch to wait room',
      JSON.stringify(this.data(
        DATA.VOTESTART
      )));

    this.#ioRoom.emit('update game data',
      JSON.stringify(this.data(
        DATA.NEWPLAYER,
        DATA.PLAYERLIST
      )));

  }

  removePlayer ( uuid ) {

    const player = this.playerList.get( uuid );
    this.lastRMPlayer = uuid;

    this.electorList.removeVoter( player.pseudo );
    console.log( this.electorList.voterList )

    console.log('\nA user is disconnect');
    console.log('├ removeplayer : ' + player.pseudo);
    console.log('└ gameRoomUUID : ' + this.uuid);

    delete this.playerList.delete(uuid);

    this.#ioRoom.emit('update game data',
      JSON.stringify(this.data(
        DATA.OLDPLAYER,
        DATA.PLAYERLIST
      )));
  }

  data( _ ) {
    let data = { 'gameRoomUUID' : this.uuid };
    let args = [...arguments];

    args.forEach( arg => {
      switch (arg) {
        case DATA.NEWPLAYER :
          data.newPlayer = this.playerList.get(this.lastAddPlayer);
        break;
        case DATA.OLDPLAYER :
          data.removeplayer = this.playerList.get(this.lastRMPlayer);
        break;
        case DATA.PLAYERLIST :
          data.playerList = [...this.playerList.values()];
        break;
        case DATA.VOTESTART:
          data.candidates = [{name: 'yes', title: 'Aller, on joue, là !'}];
        break;
        case DATA.VOTEUNIVERS:
          data.candidates = U.getUniversTitles();
        break;
        case DATA.VOTETHEMES:
          data.candidates = U.getThemesTitles( this.univer );
        break;
        default :
          data = { ...data, ...arg };
      }
    });

    return data;
  }

  generalVote ( playerUUID, vote ) {
    console.log(vote);
    const player = this.playerList.get( playerUUID );
    const voter = this.electorList.getVoter( player.pseudo );
    const election = this.electorList.getElection ( vote.election );
    const candidate = election.getCandidate ( vote.candidate );
    const results = election.submitVote( voter, candidate );

    console.log('\nPlayer as voted !');
    console.log('├ election : ', election.name);
    console.log('├ player : ', voter.name);
    console.log('├ candidate : ', candidate.name);
    console.log('└ results : ', results);
  }






  stepOne() {

    console.log('\nGAMESTAT : ', this.stat);
    
    this.electorList.addElection({
      name: 'start',
      candidates: ['yes'],
      actionVote: (results) => this.#ioRoom.emit('start vote', results),
      actionVoted: (results, winner) => this.stepUniversVote( results, winner )
    });

    this.stat = GAMESTAT.waitPlayer;
    console.log('\nGAMESTAT : ', this.stat);


  }

  stepUniversVote( results, winner ) {

    this.private = true;
    this.#ioRoom.emit('switch univers vote',
      JSON.stringify(this.data(
        {winner: winner.name},
        DATA.VOTEUNIVERS
      )));

    this.electorList.addElection({
      name: 'univers',
      candidates: U.getUniversList(),
      actionVote: (results) => this.#ioRoom.emit('univers vote', results),
      actionVoted: (results, winner) => this.stepThemesVote( results, winner )
    });

    this.stat = GAMESTAT.voteUnivers;
    console.log('\nGAMESTAT : ', this.stat);

  }

  stepThemesVote( results, winner ) {

    this.univer = winner.name;

    this.#ioRoom.emit('switch themes vote',
      JSON.stringify(this.data(
        {winner: winner.name},
        DATA.VOTETHEMES
      )));
    
    this.electorList.addElection({
      name: 'themes',
      candidates: U.getThemesFor( this.univer ),
      actionVote: (results) => this.#ioRoom.emit('themes vote', results),
      actionVoted: (results, winner) => this.stepPitchVote( results, winner )
    });

    this.stat = GAMESTAT.voteThemes;
    console.log('\nGAMESTAT : ', this.stat);

  }

  stepPitchVote( results, winner ) {

    this.theme = winner.name;

    this.#ioRoom.emit('switch pitch vote',
      JSON.stringify(this.data(
        {winner: winner.name}/*,
        DATA.VOTETHEMES*/
      )));
    
    /*this.electorList.addElection({
      name: 'themes',
      candidates: U.getThemesFor( this.univer ),
      actionVote: (results) => this.#ioRoom.emit('themes vote', results),
      actionVoted: (results, winner) => this.stepUniverVote( results, winner )
        //this.univer = winner.name;
        //this.stepTwo( results, winner );
        //this.#ioRoom.emit('switch themes vote', results, winner.name);
    });*/

    this.stat = GAMESTAT.votePitch;
    console.log('\nGAMESTAT : ', this.stat);

  }

}

class Player {

  #socket;
  uuid;
  pseudo;
  #gameRoom;

  constructor ( _socket, _pseudo ) {
    this.#socket = _socket;
    this.uuid = _socket.id;
    this.pseudo = _pseudo;
  }

  addGameRoom( _gameRoom ) {
    this.#gameRoom = _gameRoom;
  }

  join( _ ) { this.#socket.join(...arguments) }

  emit( _ ) { this.#socket.emit(...arguments) }

  remove( uuid ) {
    this.#gameRoom.removePlayer(uuid);
  }

  get gameRoom() {
    return this.#gameRoom;
  }

}

module.exports = GameRoom;