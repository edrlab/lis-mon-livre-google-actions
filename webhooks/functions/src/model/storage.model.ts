import {ok} from 'assert';
import {pull, push} from './database';
import {StorageDto} from './storage.dto';

export class StorageModel {
  private _bearer: string;
  private _storage: StorageDto;
  private static _singleton: boolean;

  constructor(bearerToken: string, store: StorageDto) {
    if (StorageModel._singleton) {
      throw new Error('already instancied');
    }

    ok(bearerToken);
    this._bearer = bearerToken;

    ok(store instanceof StorageDto);
    this._storage = store;

    StorageModel._singleton = true;
  }

  public static async create(bearerToken: string) {
    const data = await pull(bearerToken);

    const store = StorageDto.create(bearerToken, data);

    // let's to cascading the storage errors accross storage -> storageModel -> Machine -> Assistant
    return new StorageModel(bearerToken, store);
  }

  public async save() {
    const data = this.store.extract();
    await push(this._bearer, data);
  }

  get store() {
    return this._storage;
  }
}
