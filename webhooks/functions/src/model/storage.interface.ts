import {TSdkHandler} from '../typings/sdkHandler';

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
export type TStateHomeUser = 'SESSION' | TStateDefault;
export type TStateSelection = 'RUNNING' | 'FINISH' | TStateDefault;
export type TKindSelection = 'PUBLICATION' | 'GROUP';
export type TStateSearch = 'RUNNING' | 'FINISH' | TStateDefault;

export interface ISessionScene {
  'home_user': {
    state: TStateHomeUser,
  },
  'selection': {
    state: TStateSelection,
    kind: TKindSelection,
    url: string,
    nextUrlCounter: number,
    from: TSdkHandler,
    nbChoice: number,
  },
  'search': {
    state: TStateSearch,
    query: string,
  }
}
export type TKeySessionScene = keyof ISessionScene;

export interface IStorageSession {
  scene: ISessionScene;
}

export interface IStorageUser {
  authentication: TStateAuthentication;
  sessionId?: string;
}

export interface IStorage {
  bearerToken: string;
  player: IStoragePlayer;
  session: IStorageSession;
  user: IStorageUser;
}

