import { GameState, EVENTS } from './GameState.js';
import Urne from './Urne.js';
import NameGen from './NameGen.js';
import { Univers as U } from './Univers.js';
//const U = new Univers();

export class GameRoom {

  static io;
  static list = new Map();

  static has ( uuid ) {
    return GameRoom.list.has(uuid);
  }

  static get ( uuid ) {
    if( GameRoom.list.has(uuid) )
      return GameRoom.list.get(uuid);
    else {
      const gameRoom = new GameRoom( uuid );
      GameRoom.list.set(uuid, gameRoom);
      return gameRoom;
    }
  }


  gameState;

  uuid;
  playerList = new Map();
  lastAddPlayer;
  lastOldPlayer;
  private = false;

  electorList = new Urne();
  askName;
  askTitle;
  askCandidates;
  editor;
  CardDraw;
  turn;


  constructor ( _uuid ) {
    this.uuid = _uuid;

    this.gameState = new GameState();

    this.gameState.on ( GameState.S.WAITPLAYER, () => {

      this.addAsk(
        'start',
        ['yes'],
        ( candidateStatus, winner ) => {
          this.emit(EVENTS.SR.ASK.END, candidateStatus, winner );
          this.gameState.state = GameState.S.ASKUNIVERS;
        }
      );

    });

    this.gameState.on ( GameState.S.ASKUNIVERS, () => {

      this.addAsk(
        'univers',
        U.getUniversList(),
        ( candidateStatus, winner ) => {
          this.univer = winner.name;
          this.emit(EVENTS.SR.ASK.END, candidateStatus, winner.name );
          this.gameState.state = GameState.S.ASKTHEMES;
        }
      );

    });


    this.gameState.on ( GameState.S.ASKTHEMES, () => {

      this.addAsk(
        'themes',
        U.getThemesListFor( this.univer ),
        ( candidateStatus, winner ) => {
          this.theme = winner.name;
          this.emit(EVENTS.SR.ASK.END, candidateStatus, winner.name );
          this.gameState.state = GameState.S.ASKPITCH;
        }
      );

    });


    this.gameState.on ( GameState.S.ASKPITCH, () => {

      this.addAsk(
        'pitch',
        ['ok'],
        ( candidateStatus, winner ) => {
          this.emit(EVENTS.SR.ASK.END, candidateStatus, winner );
          this.gameState.state = GameState.S.ASKFICHE;
        }
      );

      const [ _, _editor] = [...this.playerList][~~(Math.random() * this.playerList.size)];
      this.editor = _editor;
      this.emit(EVENTS.SR.PITCH.EDITOR, { editor: this.editor, theme: this.theme });

    });


    this.gameState.on ( GameState.S.ASKFICHE, () => {

      this.addAsk(
        'fiche',
        ['done'],
        ( candidateStatus, winner ) => {
          this.emit(EVENTS.SR.ASK.END, candidateStatus, winner );
          this.gameState.state = GameState.S.GAME;
        }
      );

      const fichesList = U.getFichesListFor( this.univer );
      [...this.playerList].forEach( ([_,player]) => {
        player.fiche = ~~(Math.random() * fichesList.length);
        player.emit(EVENTS.SC.FICHES, player.fiche);
      });

    });


    this.gameState.on ( GameState.S.GAME, () => {

      this.private = true;

      // Préparation de la partie

      this.CardDraw = [                                               // Récupération des mots
        ...U.getWords().map( w => ({word: w, type: 'neutre'})),
        ...U.getWords(this.univer).map( w => ({word: w, type: this.univer}))
      ];

      this.CardDraw = this.shuffleArray(this.CardDraw);                       // Mélange des mots
      this.CardDraw = this.CardDraw.slice(0, 30);                             // Récupération du nombre maximal des mots (30, 40, 50, 60)

      // Ajouts des informations complémentaires
      this.CardDraw.forEach( card => {
        card.ref = ~~(Math.random() * 4);
        card.positif = ~~(Math.random() * 4);
        card.negatif = ~~(Math.random() * 4);
        if ( card.negatif === card.positif )
          card.negatif = (card.negatif+1)%4;
      });

      // Ajout des étapes de jeu
      this.CardDraw.push({type: 'step', word:'end', ref: ~~(Math.random() * 4)});
      this.CardDraw.splice( 30-this.playerList.size, 0, {type: 'step', word:'nearEnd', ref: ~~(Math.random() * 4)});
      this.CardDraw.splice( 30/2, 0, {type: 'step', word:'middle', ref: ~~(Math.random() * 4)});
      
      //console.log( CardDraw );

      this.emit(EVENTS.SR.GAME.START);                              // Server announces game start

      this.turn = ~~(Math.random() * this.playerList.size);

      this.gameState.state = GameState.S.NEXTURN;

    });


    this.gameState.on ( GameState.S.NEXTURN, () => {

      this.turn = (this.turn+1)%this.playerList.size;

      let cardRecto = this.CardDraw.shift();
      let cardVerso = { type: this.CardDraw[0].type, ref: this.CardDraw[0].ref };

      this.emit(EVENTS.SR.GAME.TURN.START, [...this.playerList][this.turn][1], cardRecto, cardVerso);             // Server selects player and starts their turn

    });


    this.gameState.on ( GameState.S.TURN, () => {

      this.gameState.state = GameState.S.NEXTURN;

    });

/*
      GameRoom.on(EVENTS.SR.GAME.HELP, () => {});                   // Server notifies all players of help request
      GameRoom.on(EVENTS.SR.GAME.STOP, () => {});                   // Server notifies all players of stop request
      GameRoom.on(EVENTS.SR.GAME.DISCUSSION, () => {});             // Server notifies all players of discussion event

      GameRoom.on(EVENTS.SR.GAME.BREAK.START, () => {});          // Server initiates break and triggers vote
      GameRoom.on(EVENTS.SR.GAME.BREAK.UPDATE, () => {});         // Server sends vote updates during break
      GameRoom.on(EVENTS.SR.GAME.BREAK.END, () => {});            // Server announces unanimous vote during break

      GameRoom.on(EVENTS.SR.GAME.SOON.START, () => {});           // Server notifies that the end is approaching
      GameRoom.on(EVENTS.SR.GAME.SOON.UPDATE, () => {});          // Server sends vote updates near the end
      GameRoom.on(EVENTS.SR.GAME.SOON.END, () => {});             // Server announces unanimous vote near the end

      GameRoom.on(EVENTS.SR.GAME.END, () => {}); 
*/



    this.gameState.state = GameState.S.WAITPLAYER;
  }



  shuffleArray(array) {
    const result = [...array]; // copie pour ne pas muter l’original
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  emit( _ ) { GameRoom.io.to(this.uuid).emit(...arguments) }

  addAsk( name, candidates, end ) {

    this.askName = name;
    this.askCandidates = candidates;

    this.election = this.electorList.addElection({
      name: name, candidates: this.askCandidates,
      actionVote: ( candidateStatus, voterStatus ) => this.emit(EVENTS.SR.ASK.UPDATE, candidateStatus, voterStatus),
      actionVoted: ( candidateStatus, winner ) => end(candidateStatus, winner)
    });

    this.emit(EVENTS.SR.ASK.NEW, { name: name, candidates: candidates });

    GameState.logBlock('🗳️ Vote create', {'name': name});
  }

  addPlayer(player) {

    this.playerList.set( player.uuid, player );
    this.electorList.addVoter( player.pseudo, player.uuid );
    this.lastAddPlayer = player;

    player.emit(EVENTS.SC.LOBBY.JOINED, {
      gameRoomUUID: this.uuid,
      pseudo: player.pseudo,
      playerUUID: player.uuid,
      gameState: this.gameState.state
    });

    this.emit(EVENTS.SR.GAME.UPDATE, {
      gameRoomUUID: this.uuid,
      newPlayer: this.lastAddPlayer,
      playerList: [...this.playerList.values()],
      univers: this.univer,
      theme: this.theme
    });

    player.emit(EVENTS.SR.ASK.NEW, { name: this.askName, candidates: this.askCandidates });
    this.emit(EVENTS.SR.PITCH.EDITOR, { editor: this.editor, theme: this.theme });
    this.emit(EVENTS.SR.ASK.UPDATE, this.election?.getCandidateStatusList(), this.election?.getVoterStatusList());

    const fichesList = U.getFichesListFor( this.univer );
    [...this.playerList].forEach( ([_,player]) => {
      if( !player.fiche ) player.fiche = ~~(Math.random() * fichesList.length);
      player.emit(EVENTS.SC.FICHES, player.fiche)
    });

  }

  removePlayer ( uuid ) {

    const player = this.playerList.get( uuid );
    if( player === undefined ) return false;

    this.lastOldPlayer = player;

    this.electorList.removeVoter( player.pseudo );
    
    delete this.playerList.delete(uuid);

    this.emit(EVENTS.SR.GAME.UPDATE, {
      gameRoomUUID: this.uuid,
      removePlayer: this.lastOldPlayer,
      playerList: [...this.playerList.values()],
      univers: this.univer,
      theme: this.theme
    });

    const playerlist = [...this.playerList];
    if( this.editor && this.editor.uuid === player.uuid && this.playerList.length > 0 ) {
      const [ _, _editor] = playerlist[~~(Math.random() * this.playerList.size)];
      this.editor = _editor;
      this.emit(EVENTS.SR.PITCH.EDITOR, { editor: this.editor, theme: this.theme });
    }

  }

}

export class Player {

  static list = new Map();

  static makeFakePlayer () {

    const randomPseudo = NameGen.get();
    const randomGameRoomUUID = NameGen.get();
    
    GameState.logBlock('🔌 A potentiel user is connected', {'random pseudo': randomPseudo, 'gameUUID': randomGameRoomUUID});

    return { 'gameRoomUUID' : randomGameRoomUUID, 'pseudo' : randomPseudo }

  }

  static has ( token ) {
    let isuuid = Player.list.has(token);
    let ispseudo = [...Player.list].find( ([k,v]) => v.pseudo === token );
    return isuuid || !!ispseudo;
  }

  static removePlayer ( uuid ) {

    const player = Player.list.get( uuid );
    if( player === undefined ) return false;

    GameState.logBlock('🔌 A user is disconnect', player);

    delete Player.list.delete(uuid);
    player.#gameRoom.removePlayer ( uuid );
  }

  #socket;
  uuid;
  pseudo;
  #gameRoom;
  fiche;

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