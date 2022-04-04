import {BaseApp, conversation, ConversationV3, ConversationV3App, OmniHandler} from '@assistant/conversation';
import {OpdsFetcher} from 'opds-fetcher-parser';
import {DEFAULT_LANGUAGE, PROJECT_ID, setName, TIMER, TLang} from '../constants';
import {StorageModel} from '../model/storage.model';
import {THandlerFn} from '../type';
import {TSdkHandler} from '../typings/sdkHandler';
import {TSdkScene} from '../typings/sdkScene';
import {enter as selectionEnter} from './handler/selection';
import {Machine} from './Machine';
import {ok} from 'assert';
import {WebpubError} from '../error';

export class Assistant {
  private _app: OmniHandler & BaseApp & ConversationV3App<ConversationV3>;
  private _storageModel: StorageModel | undefined;
  private _fetcher: OpdsFetcher | undefined;
  private _locale: TLang;

  constructor({
    storageModel,
    fetcher,
  }: {
    storageModel?: StorageModel,
    fetcher?: OpdsFetcher,
  }) {
    this._app = conversation({
      verification: process.env['NODE_ENV'] === 'PRODUCTION' ? PROJECT_ID : undefined,
      debug: process.env['NODE_ENV'] === 'development' ? true : false,
    });

    this._locale = DEFAULT_LANGUAGE;

    this._app.catch((conv, error) => {
      console.error('APP CATCH ERROR', error);

      if (conv.scene.next) {
        conv.scene.next.name = 'actions.scene.END_CONVERSATION';
      }

      // error instanceOf WebpubError !== True ?! why?
      if ((error as WebpubError).code === 401) {
        console.log('WEBPUB ERROR code 401');

        if (this._locale === 'en') {
          conv.add('Sorry, it is not possible to go further. Please unlink your EDRLAB account from your assistant, then link them again.');
        } else if (this._locale === 'fr') {
          conv.add('Désolé, impossible d\'aller plus loin : dissociez votre compte CAÉB de votre assistant puis ré-associez les.');
        }
      } else {
        if (this._locale === 'en') {
          conv.add('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');
        } else if (this._locale === 'fr') {
          conv.add('Oups, quelque chose s\'est mal passé.');
        }
      }
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
      // @TODO need to send an alert to google log on timeout error
      const timerP = new Promise<void>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), TIMER));
      const machine = new Machine(conv);

      const locale = (conv.user.locale || '').split('-')[0];
      console.log('LOCALE=', locale);
      ok(locale === 'fr' || locale === 'en', 'locale not known ' + locale);
      setName(locale);
      this._locale = locale;

      await machine.setLanguage(locale);

      console.info('ASSISTANT:', path);
      console.info('scene.name=', conv.scene.name);
      console.info('linkingStatus', conv.user.accountLinkingStatus);

      const bearerToken = conv.user.params.bearerToken;
      await machine.begin({bearerToken, storageModel: this._storageModel, fetcher: this._fetcher});

      await Promise.race([timerP, Promise.resolve(fn(machine))]);

      // HACK
      // google actions platform doesn't allow to set the same next scene name than the actual in the 'on_enter' handler scene
      // it's a platform limitation for a basic infinite loop I think
      if (path === 'selection__intent__selects_book' && conv.scene.next?.name as TSdkScene === 'selection' && machine.getSessionState('selection') === 'FINISH') {
        await Promise.race([timerP, Promise.resolve(selectionEnter(machine))]);
      }

      await machine.end();
    });
  };

  public get app() {
    return this._app;
  }
}

