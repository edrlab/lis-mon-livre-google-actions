import {IStorage} from './storage.interface';

export const freshDataClone = () => Object.assign({
  dbVersion: 1,
  bearerToken: 'test',
  player: {
    current: {
      playing: false,
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
        from: 'main',
      },
    },
  },
  user: {
    authentication: 'NO_LINKED',
  },
}, {});

export const parsedDataClone = (): IStorage => ({
  bearerToken: 'test',
  player: {
    current: {
      playing: false,
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
    },
  },
  user: {
    authentication: 'NO_LINKED',
    sessionId: '',
  },
});
