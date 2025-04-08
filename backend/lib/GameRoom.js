import Urne from './Urne.js';
import NameGen from './NameGen.js';
import Univers from './Univers.js';
const U = new Univers();

const GAMESTAT = {
  init: 'after create',
  waitPlayer: 'after first player',
  voteUnivers: 'vote for univers',
  voteThemes: 'vote for themes',
  votePitch: 'pitch composition',
  game: 'The game'
}

const DATA = {
  PLAYERLIST: 'list of all players',
  VOTESTART: 'the first vote data',
  VOTEUNIVERS: 'data for univers vote',
  VOTETHEMES: 'data for themes vote',
  VOTERSTATUS: 'status des voters'
}

export class GameRoom {

  static io;
  static list = new Map();

  static get ( uuid ) {
    if( GameRoom.list.has(uuid) )
      return GameRoom.list.get(uuid);
    else {
      const gameRoom = new GameRoom( uuid );
      GameRoom.list.set(uuid, gameRoom);
      return gameRoom;
    }
  }


  stat = GAMESTAT.init;

  uuid;
  playerList = new Map();
  lastAddPlayer;
  lastOldPlayer;
  private = false;

  univer;

  electorList = new Urne();

  constructor ( _uuid ) {
    this.uuid = _uuid;
    this.stepOne();
  }

  addPlayer(player) {

    this.playerList.set( player.uuid, player );
    this.lastAddPlayer = player;

    this.electorList.addVoter( player.pseudo, player.uuid );

    player.emit('vote validated', 'start', this.data(
      {playerUUID: player.uuid}
    ));

    GameRoom.io.to(this.uuid).emit('update game data', this.data(
      {newPlayer: this.lastAddPlayer},
      DATA.PLAYERLIST,
      DATA.VOTERSTATUS
    ));

  }

  removePlayer ( uuid ) {

    const player = this.playerList.get( uuid );
    if( player === undefined ) return false;

    this.lastOldPlayer = player;

    this.electorList.removeVoter( player.pseudo );
    
    delete this.playerList.delete(uuid);

    GameRoom.io.to(this.uuid).emit('update game data', this.data(
      {removePlayer: this.lastOldPlayer},
      DATA.PLAYERLIST,
      DATA.VOTERSTATUS
    ));

  }

  dataMethods = {
    [DATA.PLAYERLIST]:  () => ({ playerList: [...this.playerList.values()] }),
    [DATA.VOTESTART]:   () => ({ candidates: [{ name: 'yes', title: 'Aller, on joue, là !' }] }),
    [DATA.VOTEUNIVERS]: () => ({ candidates: U.getUniversTitles() }),
    [DATA.VOTETHEMES]:  () => ({ candidates: U.getThemesTitles(this.univer) }),
    [DATA.VOTERSTATUS]: () => ({ voterStatus: this.electionProgress.getVoterStatusList() }),
    [DATA.VOTEPITCH]:   () => ({ candidates: [{ name: 'yes', title: 'OK, j\'aime cette histoire !' }] })
  };

  data( _ ) {
    let data = { 'gameRoomUUID' : this.uuid };

    [...arguments].forEach(arg => {
      if (this.dataMethods[arg]) {
        data = { ...data, ...this.dataMethods[arg]() };
      } else {
        data = { ...data, ...arg };
      }
    });

    return data;
  }

  generalVote ( playerUUID, vote ) {
    const player = this.playerList.get( playerUUID );
    const voter = this.electorList.getVoter( player.pseudo );
    const election = this.electorList.getElection ( vote.election );
    const candidate = election.getCandidate ( vote.candidate );
    const results = election.submitVote( voter, candidate );

    console.info('\nPlayer as voted !');
    console.info('├ election : ', election.name);
    console.info('├ player : ', voter.name);
    console.info('├ candidate : ', candidate.name);
    console.info('└ results : ', results);
  }






  stepOne() {

    console.info('\nGAMESTAT : ', this.stat);
    
    this.electionProgress = this.electorList.addElection({
      name: 'start',
      candidates: ['yes'],
      actionVote: (results, voterStatus) => GameRoom.io.to(this.uuid).emit('update vote', 'start', results, voterStatus),
      actionVoted: (results, winner) => this.stepUniversVote( results, winner )
    });

    this.stat = GAMESTAT.waitPlayer;
    console.info('\nGAMESTAT : ', this.stat);


  }

  stepUniversVote( results, winner ) {

    this.private = true;
    GameRoom.io.to(this.uuid).emit('vote validated', 'univers',this.data(
      {winner: winner.name},
      DATA.VOTEUNIVERS
    ));

    this.electionProgress = this.electorList.addElection({
      name: 'univers',
      candidates: U.getUniversList(),
      actionVote: (results, voterStatus) => GameRoom.io.to(this.uuid).emit('update vote', 'univers', results, voterStatus),
      actionVoted: (results, winner) => this.stepThemesVote( results, winner )
    });

    this.stat = GAMESTAT.voteUnivers;
    console.info('\nGAMESTAT : ', this.stat);

  }

  stepThemesVote( results, winner ) {

    this.univer = winner.name;

    GameRoom.io.to(this.uuid).emit('vote validated', 'themes', this.data(
      {winner: winner.name},
      U.getUnivers(winner.name),
      DATA.VOTETHEMES
    ));
    
    this.electionProgress = this.electorList.addElection({
      name: 'themes',
      candidates: U.getThemesFor( this.univer ),
      actionVote: (results, voterStatus) => GameRoom.io.to(this.uuid).emit('update vote', 'themes', results, voterStatus),
      actionVoted: (results, winner) => this.stepPitchVote( results, winner )
    });

    this.stat = GAMESTAT.voteThemes;
    console.info('\nGAMESTAT : ', this.stat);

  }

  stepPitchVote( results, winner ) {

    this.theme = winner.name;

    GameRoom.io.to(this.uuid).emit('vote validated', 'pitch', this.data(
      {winner: winner.name},
      U.getTheme(winner.name),
      DATA.VOTEPITCH
    ));

    const [ _, editor] = [...this.playerList][~~(Math.random() * this.playerList.size)];

    GameRoom.io.to(this.uuid).emit('update game data', this.data(
      {editor: editor}
    ));

    editor.emit('Editor is you');
    
    
    this.electorList.addElection({
      name: 'pitch',
      candidates: ['yes'],
      actionVote: (results) => GameRoom.io.to(this.uuid).emit('pitch vote', results),
      actionVoted: (results, winner) => this.stepGame( results, winner )
        //this.univer = winner.name;
        //this.stepTwo( results, winner );
        //GameRoom.io.to(this.uuid).emit('switch themes vote', results, winner.name);
    });

    this.stat = GAMESTAT.votePitch;
    console.info('\nGAMESTAT : ', this.stat);

  }

  stepGame( results, winner ) {

    this.pitch = winner.name;

    GameRoom.io.to(this.uuid).emit('vote validated', 'game', this.data(
      {winner: winner.name}
    ));

    const [ _, turn] = [...this.playerList][~~(Math.random() * this.playerList.size)];

    GameRoom.io.to(this.uuid).emit('update game data', this.data(
      {turn: turn}
    ));

    turn.emit('is you turn !');

    this.stat = GAMESTAT.game;
    console.info('\nGAMESTAT : ', this.stat);

  }

}

export class Player {

  static list = new Map();

  static makeFakePlayer () {

    const randomPseudo = NameGen.get();
    const randomGameRoomUUID = NameGen.get();
    
    console.info('\nA potentiel user is connected');
    console.info('├ random pseudo : ', randomPseudo);
    console.info('└ gameUUID : ' + randomGameRoomUUID);

    return { 'gameRoomUUID' : randomGameRoomUUID, 'pseudo' : randomPseudo }

  }

  static get ( socket, playerdata ) {

    if( Player.list.get(socket) )
      return socket.emit('error', {error: 'socket existe, je ne sait pas quoi faire de cette information'});

    if( [...Player.list].find( ([k,v]) => v === playerdata.pseudo ) )
      return socket.emit('error', {error: 'Un joueur possède déjà ce pseudo'});

    const gameRoom = GameRoom.get( playerdata.gameRoomUUID );

    if( gameRoom.private )
      return socket.emit('error', {error: 'gameRoom private'});

    const player = new Player( socket, playerdata.pseudo );
    socket.join( playerdata.gameRoomUUID );
    player.addGameRoom( gameRoom );
    gameRoom.addPlayer( player );

    const socketRoom = [...GameRoom.io.sockets.adapter.rooms].filter(([k,v]) => !Player.list.get(k));

    console.info('\nWelcome to new challenger !');
    console.info('├ pseudo : ', playerdata.pseudo);
    console.info('├ gameRoomUUID : ', playerdata.gameRoomUUID);
    console.info('└ socket rooms : ', socketRoom);

  }

  static removePlayer ( uuid ) {

    const player = Player.list.get( uuid );
    if( player === undefined ) return false;

    console.info('\nA user is disconnect');
    console.info('├ removeplayer : ' + player.pseudo);
    console.info('└ gameRoomUUID : ' + player.#gameRoom.uuid);

    delete Player.list.delete(uuid);
    player.#gameRoom.removePlayer ( uuid );
  }

  static vote ( uuid, vote) {
    const player = Player.list.get( uuid );
    player.gameRoom.generalVote( uuid, vote );
  }

  #socket;
  uuid;
  pseudo;
  #gameRoom;

  constructor ( _socket, _pseudo ) {
    this.#socket = _socket;
    this.uuid = _socket.id;
    this.pseudo = _pseudo;
    Player.list.set( this.uuid, this );
  }

  addGameRoom( gameRoom ) { this.#gameRoom = gameRoom }

  join( _ ) { this.#socket.join(...arguments) }

  emit( _ ) { this.#socket.emit(...arguments) }

  get gameRoom() { return this.#gameRoom }

}