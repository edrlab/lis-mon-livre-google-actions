import {ok} from 'assert';
import {AuthenticationStorage, http as httpOpdsFetcherParser, OpdsFetcher} from 'opds-fetcher-parser';
import {API_BASE_URL, LAST_SEEN_THRESHOLD} from '../constants';
import {TKeySessionScene, TStateAuthentication} from '../model/storage.interface';
import {StorageModel} from '../model/storage.model';
import {i18n, TI18n, TI18nKey} from '../translation';
import {IConversationV3, TSdkScene2} from '../type';
import {resetSelection} from './handler/selection.helper';

export class Machine {
  private _conv: IConversationV3;
  private _i18n: TI18n;
  private _model: StorageModel | undefined;
  private _fetcher: OpdsFetcher | undefined;

  private _sayAcc: string;

  constructor(conv: IConversationV3) {
    ok(conv);

    this._i18n = i18n;
    this._model = undefined;
    this._fetcher = undefined;
    this._conv = conv;

    this._sayAcc = '';
  }

  public async begin({
    storageModel,
    bearerToken,
    fetcher,
  }: {
    storageModel?: StorageModel,
    bearerToken?: string,
    fetcher?: OpdsFetcher;
  }) {
    console.info('Machine BEGIN');

    if (storageModel) {
      this._model = storageModel;
    } else {
      if (typeof bearerToken === 'string') {
        this._model = await StorageModel.create(bearerToken);
      }
    }

    if (fetcher) {
      this._fetcher = fetcher;
    } else {
      if (typeof bearerToken === 'string') {
        const authenticationStorage = new AuthenticationStorage();
        authenticationStorage.setAuthenticationToken({
          accessToken: bearerToken,
          authenticationUrl: API_BASE_URL,
        });
        const http = new httpOpdsFetcherParser(undefined, authenticationStorage);
        this._fetcher = new OpdsFetcher(http);
      }
    }

    // check new Session and keep or remove the data session
    this.removeSessionDataWhenNewUserSession();
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
    this._sayAcc += this._i18n.t(key, options) + '\n';
  }

  public get isLinked() {
    return this._conv.user.accountLinkingStatus;
  }

  public set nextScene(scene: TSdkScene2) {
    const obj = this._conv.scene;

    if (!obj.next) {
      obj.next = {};
    }
    obj.next.name = scene;
  }

  public getSessionState(scene: TKeySessionScene) {
    ok(this._model);
    return this._model.store.session.scene[scene].state;
  }

  public set authenticationState(s: TStateAuthentication) {
    ok(this._model);
    this._model.store.user.authentication = s;
  }

  public get authenticationState() {
    ok(this._model);
    return this._model.store.user.authentication;
  }

  public get isARegularUser() {
    const lastSeenTime = this._conv.user.lastSeenTime;
    if (lastSeenTime) {
      const currentDate = new Date().getTime() / 1000 / 60;
      const lastSeenDate = Date.parse(lastSeenTime) / 1000 / 60;

      const hours = currentDate - lastSeenDate;

      if (hours <= LAST_SEEN_THRESHOLD) {
        return true;
      }
    }

    return false;
  }

  public get playingInProgress() {
    ok(this._model);
    return this._model.store.player.current.playing;
  }

  public get playingNumber() {
    ok(this._model);
    return this._model.store.player.history.size;
  }

  public async getCurrentPlayingTitleAndChapter() {
    ok(this._model);

    const cur = this._model.store.player.current;
    const chapter = (cur.index || 0) + 1;
    const {title, author} = await this.getTitleAndAuthorFromWebpub(cur.url);

    return {chapter, title, author};
  }

  public async getTitleAndAuthorFromWebpub(url) {
    const webpub = await this.wepubRequest(url);
    const title = webpub?.title || 'no title'; // @TODO i18n
    const author = (webpub?.authors || [])[0] || '';
    return {title, author};
  }

  private async wepubRequest(url: string) {
    // @TODO checks if url is valid
    const webpub = await this._fetcher?.webpubRequest(url);
    return webpub;
  }

  private removeSessionDataWhenNewUserSession() {
    if (!this._model) {
      return;
    }
    const id = this._conv.session.id;
    if (!id) {
      return;
    }
    const idFromStore = this._model.store.user.sessionId;
    if (!idFromStore) {
      console.info('no user session id saved in database');
    }
    const sameSession = id === idFromStore;
    if (sameSession) {
      console.info('MIDDLEWARE :: Session in progress');
    } else {
      console.info('MIDDLEWARE :: new SESSION');
      this._model.store.session = {
        scene: {
          'home_user': {
            state: 'DEFAULT',
          },
          'selection': resetSelection(),
        },
      };
      this._model.store.user.sessionId = id;
    }
  }
}
