export const EVENTS = {
  // Événements Client → Serveur
  CS: {
    LOBBY: {
      SEARCH: {
        PSEUDO: 'Verification of the existence of the Pseudo',
        GAMEROOM: 'Verification of the existence of the gameRoom'
      },
      JOIN: 'Connection request'
    },
    ASK: {
      VOTE: 'Client sends its vote'
    },
    PITCH: {
      DATA: 'client sends the completed pitch data'
    },
    FICHE: {
      DATA: 'Personal file data'
    },
    GAME: {
      HELP: 'Client requests help',
      STOP: 'Client sends a stop request',
      DISCUSSION: 'Client starts a discussion event',
      TURN: {
        END: 'Client ends their turn'
      },
      BREAK: {
        VOTE: 'Client submits vote during break'
      },
      SOON: {
        VOTE: 'Client submits vote near the end'
      }
    }
  },
  // Événements Serveur → Client
  SC: {
    LOBBY: {
      PSEUDOALREADYGIVEN : 'pseudo already assigned',
      GAMEROOMOPEN : 'GameRoom already open',
      ASSIGNED : 'Assign a random pseudo and gameroom name to a potential user',
      JOINED: 'user added to gameRoom'
    },
    FICHES: 'Server distributes the personal files'
  },
  // Événements Serveur → Room
  SR: {
    GAME: {
      UPDATE: 'Updated game data',
      ERROR: {
        PSEUDOALREADYGIVEN : 'A player already has this pseudo',
        GAMEROOMPRIVATE: 'gameRoom private',
        OTHER: 'General error message'
      },
      START: 'Server announces game start',
      TURN: {
        START: 'Server selects a player and announces turn start'
      },
      HELP: 'Server notifies all players about help request',
      STOP: 'Server notifies all players about stop request',
      DISCUSSION: 'Server notifies all players about discussion event',
      BREAK: {
        START: 'Server initiates break and triggers vote',
        UPDATE: 'Server sends vote updates during break',
        END: 'Server announces unanimous vote during break'
      },
      SOON: {
        START: 'Server notifies the end is approaching',
        UPDATE: 'Server sends vote updates near the end',
        END: 'Server announces unanimous vote near the end'
      },
      END: 'Server announces the end of the game'
    },
    ASK: {
      NEW: 'Server sends the data for the first question',
      END: 'Server notifies when there is unanimity',
      UPDATE: 'Server sends the votes of other clients'
    },
    PITCH: {
      EDITOR: 'server announces the editor name',
      UPDATE: 'Server returns pitch data to everyone'
    }
  }
}

export class GameState {

  // États métier
  static S = {
    UNUSED: 'UNUSED : GameRoom Freshly created',
    WAITPLAYER: 'WAITPLAYER : Waiting for new players and the end of the first vote',
    ASKUNIVERS: 'ASKUNIVERS : vote for univers',
    ASKTHEMES: 'ASKTHEMES : vote for themes',
    ASKPITCH: 'ASKPITCH : pitch composition',
    ASKFICHE: 'ASKFICHE : fiche composition',
    GAME: 'GAME : The game',
    TURN: 'TURN : The turn',
    NEXTURN: 'NEXTURN : The next turn'
  }

  // Transitions valides
  static transitions = {
    [GameState.S.UNUSED]: [GameState.S.WAITPLAYER,
                          GameState.S.ASKUNIVERS,
                          GameState.S.ASKTHEMES,
                          GameState.S.ASKPITCH,
                          GameState.S.ASKFICHE],
    [GameState.S.WAITPLAYER]: [GameState.S.ASKUNIVERS],
    [GameState.S.ASKUNIVERS]: [GameState.S.ASKTHEMES],
    [GameState.S.ASKTHEMES]: [GameState.S.ASKPITCH],
    [GameState.S.ASKPITCH]: [GameState.S.ASKFICHE],
    [GameState.S.ASKFICHE]: [GameState.S.GAME],
    [GameState.S.GAME]: [GameState.S.NEXTURN],
    [GameState.S.NEXTURN]: [GameState.S.TURN],
    [GameState.S.TURN]: [GameState.S.NEXTURN],
    // ...
  };

  static logBlock = (title, items = {}) => {
    console.groupCollapsed(title);
    const keys = Object.keys(items);
    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;
      const prefix = isLast ? '└' : '├';
      console.log(`${prefix} ${key} :`, JSON.stringify(items[key]));
    });
    console.groupEnd();
  };

  #currentState = GameState.S.UNUSED;
  #actions = new Map();

  // Accès état actuel
  get state() {
    return this.#currentState;
  }

  // Déclenche une transition si valide
  set state( newState ) {
    const allowed = GameState.transitions[this.#currentState] || [];
    if ( !allowed.includes( newState ) ) {
      console.error(`❌ Invalid transition: ${this.#currentState} → ${newState}`);
      return;
    }

    this.#currentState = newState;
    this.logState();

    const action = this.#actions.get(newState);
    if (typeof action === 'function')
         action();
    else console.warn(`⚠️ No action defined for state: ${newState}`);
  }

  // Associe une action à un état
  on(state, fn) {
    this.#actions.set(state, fn);
  }

  // Log d’état
  logState() {
    GameState.logBlock(`📘 GameState changed to: ${this.state}`);
  }

}