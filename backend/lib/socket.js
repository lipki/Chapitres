import { GameState, EVENTS } from "./GameState.js";
import { GameRoom, Player } from "./GameRoom.js";

export function communication ( io ) {

  io.on('connection', socket => {  //user:cs:init

    GameState.logBlock('🔌 socket connection', {socketid: socket.id});

    socket.on('disconnect', () => {
      GameState.logBlock('🔌 socket disconnect', {socketid: socket.id});
      Player.removePlayer(socket.id);
    });

    socket.emit(EVENTS.SC.LOBBY.ASSIGNED, Player.makeFakePlayer() );

    socket.on(EVENTS.CS.LOBBY.SEARCH.PSEUDO, ( pseudo ) => {
      socket.emit( EVENTS.SC.LOBBY.PSEUDOALREADYGIVEN, Player.has( pseudo ) );
    });

    socket.on(EVENTS.CS.LOBBY.SEARCH.GAMEROOM, ( gameRoom ) => {
      socket.emit( EVENTS.SC.LOBBY.GAMEROOMOPEN, GameRoom.has( gameRoom ) );
    });

    socket.on(EVENTS.CS.LOBBY.JOIN, newPlayerData => {

      if( Player.list.get(socket) )
        return socket.emit(EVENTS.SR.GAME.ERROR.OTHER);

      if( [...Player.list].find( ([k,v]) => v.pseudo === newPlayerData.pseudo ) )
        return socket.emit(EVENTS.SR.GAME.ERROR.PSEUDOALREADYGIVEN);

      const gameRoom = GameRoom.get( newPlayerData.gameRoomUUID );

      if( gameRoom.private )
        return socket.emit(EVENTS.SR.GAME.ERROR.GAMEROOMPRIVATE);

      const player = new Player( socket, newPlayerData.pseudo );
      socket.join( gameRoom.uuid );
      player.addGameRoom( gameRoom );
      gameRoom.addPlayer( player );

      GameState.logBlock('🙋 Welcome to new challenger !', {
        pseudo: player.pseudo,
        gameRoomUUID: gameRoom.uuid,
        socketRooms: [...GameRoom.io.sockets.adapter.rooms].filter(([k,v]) => !Player.list.get(k))
      });

    });

    socket.on(EVENTS.CS.ASK.VOTE, _candidate => {

      const gameRoom = Player.list.get( socket.id ).gameRoom;
      const player = gameRoom.playerList.get( socket.id );
      const voter = gameRoom.electorList.getVoter( player.pseudo );
      const election = gameRoom.electorList.getElection ( gameRoom.askName );
      const candidate = election.getCandidate ( _candidate );

      GameState.logBlock('✅🧍 Player as voted !', {
        election: election.name,
        player: voter.name, candidate: _candidate
      });

      election.submitVote( voter, candidate );
    });

    socket.on(EVENTS.CS.PITCH.DATA, pitchChange => {
      io.to(Player.list.get( socket.id ).gameRoom.uuid).emit(EVENTS.SR.PITCH.UPDATE, pitchChange);
    });

    socket.on(EVENTS.CS.GAME.TURN.END, () => {
      Player.list.get( socket.id ).gameRoom.gameState.state = GameState.S.TURN;
    });
    
  })

}