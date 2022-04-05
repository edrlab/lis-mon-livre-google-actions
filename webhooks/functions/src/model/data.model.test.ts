import {IStorage} from './storage.interface';

export const freshDataClone = () => Object.assign({
  dbVersion: 1,
  bearerToken: 'test',
  player: {
    current: {

    },
    history: {

    },
  },
  session: {
    scene: {
      home_user: {
        state: 'DEFAULT',
      },
      selection: {
        state: 'DEFAULT',
        kind: 'GROUP',
        url: '',
        nextUrlCounter: 0,
        nbChoice: 0,
        from: 'main',
      },
      search: {
        state: 'DEFAULT',
        query: '',
        from: 'main',
      },
      player_prequel: {
        state: 'DEFAULT',
        from: 'main',
        player: {},
      }
    },
  },
  user: {
    authentication: 'NO_LINKED',
    // sessionId: 'test',
  },
}, {});

export const parsedDataClone = (): IStorage => Object.assign({
  bearerToken: 'test',
  player: {
    current: {

    },
    history: new Map(),
  },
  session: {
    scene: {
      home_user: {
        state: 'DEFAULT',
      },
      selection: {
        state: 'DEFAULT',
        kind: 'GROUP',
        url: '',
        nextUrlCounter: 0,
        from: 'main',
        nbChoice: 0,
      },
      search: {
        state: 'DEFAULT',
        query: '',
        from: 'main',
      },
      player_prequel: {
        state: 'DEFAULT',
        from: 'main',
        player: {},
      }
    },
  },
  user: {
    authentication: 'NO_LINKED',
    sessionId: 'test',
  },
}, {}) as IStorage;
