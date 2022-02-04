import {ok} from 'assert';
import {StorageModel} from '../model/storage.model';
import {i18n, TI18n, TI18nKey} from '../translation';
import {IConversationV3} from '../type';

export class Machine {
  private _conv: IConversationV3;
  private _i18n: TI18n;
  private _model: StorageModel | undefined;

  private _sayAcc: string;

  constructor(conv: IConversationV3) {
    ok(conv);

    this._i18n = i18n;
    this._model = undefined;
    this._conv = conv;

    this._sayAcc = '';
  }

  public async begin({
    storageModel,
    bearerToken
  }: {
    storageModel?: StorageModel,
    bearerToken?: string,
  }) {
    console.info('Machine BEGIN');

    if (storageModel) {
      this._model = storageModel;
    } else {
      if (typeof bearerToken === "string") {
        this._model = await StorageModel.create(bearerToken);
      }
    }
  }

  public async end() {
    console.info('Machine END');

    if (this._model) {
      await this._model.save();
    }

    if (this._sayAcc) {
      console.info('SAY: ', this._sayAcc);
      this._conv.add(this._sayAcc);
    }
  }

  public async say(key: TI18nKey, options?: object) {
    this._sayAcc += this._i18n.t(key, options) + "\n";
  }
}
