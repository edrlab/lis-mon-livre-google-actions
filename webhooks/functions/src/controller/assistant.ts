import { BaseApp, conversation, ConversationV3, ConversationV3App, OmniHandler } from '@assistant/conversation';
import {PROJECT_ID} from '../constants';
import { StorageModel } from '../model/storage.model';
import { IConversationV3App, THandlerFn, TMachine } from '../type';
import { TSdkHandler } from '../typings/sdkHandler';
import { Machine } from './Machine';

export class Assistant {

  private _app: OmniHandler & BaseApp & ConversationV3App<ConversationV3>;
  private _storageModel: StorageModel | undefined;
  
  constructor({
    storageModel
  }: {
    storageModel?: StorageModel,
  }) {

    this._app = conversation({
      // verification: PROJECT_ID,
      debug: true,
    });

    this._app.catch((conv, error) => {
      console.error('APP CATCH ERROR', error);

      if (conv.scene.next) {
        conv.scene.next.name = conv.scene.name;
      } // loop
    });

    if (storageModel) {
      this._storageModel = storageModel;
    }

    // app.middleware((_conv, _framework) => {});
  }

  public handle = (path: TSdkHandler, fn: THandlerFn) => {
    this._app.handle(path, async (conv) => {

      const machine = new Machine(conv);

      const bearerToken = conv.user.params.bearerToken;
      await machine.begin({ bearerToken, storageModel: this._storageModel });

      await Promise.resolve(fn(machine));

      await machine.end();

      // console.log(JSON.stringify(conv, null, 4));
    });
  };

  public get app() {
    return this._app;
  }
}

