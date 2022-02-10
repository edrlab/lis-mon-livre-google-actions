
export interface IStoragePlayerHistory {
  index: number;
  time: number;
  date: Date;
}

export interface IStoragePlayerCurrent {
  index?: number;
  time?: number;
  url?: string;
  playing: boolean;
}

export interface IStoragePlayer {
  current: IStoragePlayerCurrent;
  history: Map<string, IStoragePlayerHistory>;
}

export type TStateDefault = 'DEFAULT'
export type TStateAuthentication = 'NO_LINKED' | 'NEWLY_LINKED' | 'LINKED' | TStateDefault;
export type TStateHomeUser = '' | TStateDefault;

export interface ISessionScene {
  'home_user': {
    state: TStateHomeUser,
  }
}

export interface IStorageSession {
  scene: ISessionScene;
}

export interface IStorageUser {
  authentication: TStateAuthentication;
}

export interface IStorage {
  bearerToken: string;
  player: IStoragePlayer;
  session: IStorageSession;
}

