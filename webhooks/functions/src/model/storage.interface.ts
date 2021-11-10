
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

export interface IStorage {
  bearerToken: string;
  player: IStoragePlayer;
}

