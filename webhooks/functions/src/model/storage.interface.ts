
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

export interface IStorageSelection {
  topUrl?: string;
  url?: string;
}

export interface IStorage {
  bearerToken: string;
  selection: IStorageSelection;
  player: IStoragePlayer;
}

