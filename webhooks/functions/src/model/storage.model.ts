import {ok} from 'assert';
import {pull, push} from './database';
import {StorageDto} from './storage.dto';

export class StorageModel {
  private _bearer: string;
  private _storage: StorageDto;

  constructor(bearerToken: string, store: StorageDto) {
    ok(bearerToken);
    this._bearer = bearerToken;

    ok(store instanceof StorageDto);
    this._storage = store;
  }

  public static async create(bearerToken: string) {
    const data = await pull(bearerToken);

    const store = StorageDto.create(bearerToken, data);
    const storageModel = new StorageModel(bearerToken, store);
    return storageModel;
  }

  public async save() {
    const data = this.store.extract();
    await push(this._bearer, data);
  }

  get store() {
    return this._storage;
  }
}
