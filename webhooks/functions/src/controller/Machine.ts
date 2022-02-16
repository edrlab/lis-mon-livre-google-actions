import {ok} from 'assert';
import {AuthenticationStorage, http as httpOpdsFetcherParser, OpdsFetcher} from 'opds-fetcher-parser';
import {API_BASE_URL, LAST_SEEN_THRESHOLD} from '../constants';
import {TKeySessionScene, TStateAuthentication} from '../model/storage.interface';
import {StorageModel} from '../model/storage.model';
import {i18n, TI18n, TI18nKey} from '../translation';
import {IConversationV3, TSdkScene2} from '../type';
import {resetSelection} from './handler/selection.helper';
import validator from 'validator';
import {Media} from '@assistant/conversation';
import {MediaType, OptionalMediaControl} from '@assistant/conversation/dist/api/schema';

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
    const url = cur.url || '';
    const chapter = (cur.index || 0) + 1;
    const {title, author} = await this.getTitleAndAuthorFromWebpub(url);

    return {chapter, title, author};
  }

  public async getTitleAndAuthorFromWebpub(url: string) {
    const webpub = await this.webpubRequest(url);
    const title = webpub?.title || 'no title'; // @TODO i18n
    const author = (webpub?.authors || [])[0] || '';
    return {title, author};
  }

  public get selectionSession() {
    ok(this._model);
    return this._model.store.session.scene.selection;
  }

  public get selectBookNumber() {
    return this._conv.intent.params?.number.resolved as number | undefined;
  }

  public async getGroupSizeWithUrl(url: string) {
    const feed = await this.feedRequest(url);
    const size = feed.groups?.length;
    return size;
  }

  public async getPublicationSizeWithUrl(url: string) {
    const feed = await this.feedRequest(url);
    const size = feed.publications?.length;
    return size;
  }

  public persistMediaPlayer() {
    ok(this._model);

    const _progress = this._conv.context?.media?.progress || '0';
    const progress = parseInt(_progress, 10);
    const index = this._conv.request.context?.media?.index || 0;
    const url = this._model.store.player.current.url;
    if (!url) {
      return;
    }
    if (!validator.isURL(url)) {
      return;
    }

    this._model.store.player.current.index = index;
    this._model.store.player.current.time = progress;
    this._model.store.player.current.playing = true; // always true

    this._model.store.player.history.set(url, {
      index,
      time: progress,
      date: new Date(),
    });
  }

  public mediaPlayerAck() {
    this._conv.add(new Media({
      mediaType: MediaType.MediaStatusACK,
    }));
  }

  public get currentPlayingUrl() {
    ok(this._model);
    const url = this._model.store.player.current.url;
    if (url && validator.isURL(url)) {
      return url;
    }
    return undefined;
  }

  public async player() {
    ok(this._model);
    const url = this.currentPlayingUrl;
    if (!url) {
      throw new Error('no playing url');
    }

    const startIndexRaw = this._model.store.player.current.index;
    const startTimeRaw = this._model.store.player.current.time;

    const webpub = await this.webpubRequest(url);
    if (!webpub) {
      throw new Error('no webpub');
    }

    let startIndex = (startIndexRaw && startIndexRaw > -1 && startIndexRaw <= webpub.readingOrders.length) ?
      startIndexRaw :
      0;

    const startTime = (startTimeRaw && startTimeRaw > -1) ?
      startTimeRaw <= (webpub.readingOrders[startIndex].duration || Infinity) ?
        startTimeRaw :
        (startIndex += 1, startTimeRaw) :
      0;

    startIndex = startIndex <= webpub.readingOrders.length ?
      startIndex :
      0;

    const mediaObjects = webpub.readingOrders
        .map((v, i) => ({
          name: `${webpub.title || ''} - ${i + 1}`,
          url: v.url,
          image: {
            large: {
              alt: webpub.title,
              url: webpub.cover || '',
            },
          },
        })).slice(startIndex);

    console.log('Media list');
    console.log(mediaObjects);
    console.log('Start Index = ', startIndex, ' Start Time = ', startTime, ' Start Time');

    this._conv.add(
        new Media({
          mediaObjects: mediaObjects,
          mediaType: MediaType.Audio,
          optionalMediaControls: [OptionalMediaControl.Paused, OptionalMediaControl.Stopped],
          startOffset: `${startTime}s`,
        }),
    );
  }

  private async webpubRequest(url: string) {
    if (!validator.isURL(url)) {
      throw new Error('url not valid : ' + url);
    }
    if (!this._fetcher) {
      throw new Error('no fetcher available !');
    }
    const webpub = await this._fetcher.webpubRequest(url);
    return webpub;
  }

  private async feedRequest(url: string) {
    if (!validator.isURL(url)) {
      throw new Error('url not valid : ' + url);
    }
    if (!this._fetcher) {
      throw new Error('no fetcher available !');
    }
    const feed = await this._fetcher.feedRequest(url);
    return feed;
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
