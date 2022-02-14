import { IStorage } from "./storage.interface";

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
    },
  },
  user: {
    authentication: 'NO_LINKED',
    sessionId: "",
  },
});