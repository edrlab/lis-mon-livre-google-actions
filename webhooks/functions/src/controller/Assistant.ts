import {BaseApp, conversation, ConversationV3, ConversationV3App, OmniHandler} from '@assistant/conversation';
import {OpdsFetcher} from 'opds-fetcher-parser';
import {PROJECT_ID} from '../constants';
import {StorageModel} from '../model/storage.model';
import {THandlerFn} from '../type';
import {TSdkHandler} from '../typings/sdkHandler';
import {Machine} from './Machine';

export class Assistant {
  private _app: OmniHandler & BaseApp & ConversationV3App<ConversationV3>;
  private _storageModel: StorageModel | undefined;
  private _fetcher: OpdsFetcher | undefined;

  constructor({
    storageModel,
    fetcher,
  }: {
    storageModel?: StorageModel,
    fetcher?: OpdsFetcher,
  }) {
    this._app = conversation({
      verification: process.env['NODE_ENV'] === 'PRODUCTION' ? PROJECT_ID : undefined,
      debug: false,
    });

    this._app.catch((conv, error) => {
      console.error('APP CATCH ERROR', error);

      if (conv.scene.next) {
        conv.scene.next.name = 'actions.scene.END_CONVERSATION';
      }

      // @TODO fix translation
      conv.add('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');

      // @TODO
      // remove session
      // and return to main menu or home_user if authenticated
    });

    if (storageModel) {
      this._storageModel = storageModel;
    }

    if (fetcher) {
      this._fetcher = fetcher;
    }

    // app.middleware((_conv, _framework) => {});
  }

  public handle = (path: TSdkHandler, fn: THandlerFn) => {
    this._app.handle(path, async (conv) => {
      const machine = new Machine(conv);

      const bearerToken = conv.user.params.bearerToken;
      await machine.begin({bearerToken, storageModel: this._storageModel, fetcher: this._fetcher});

      await Promise.resolve(fn(machine));

      await machine.end();

      // console.log(JSON.stringify(conv, null, 4));
    });
  };

  public get app() {
    return this._app;
  }
}

