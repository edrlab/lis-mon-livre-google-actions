import {ok} from 'assert';
import {AuthenticationStorage, http as httpOpdsFetcherParser, OpdsFetcher} from 'opds-fetcher-parser';
import {API_BASE_URL, DEFAULT_LANGUAGE, EDRLAB_FUNCTION_URL, LAST_SEEN_THRESHOLD, PADDING_GROUP, PADDING_PUB, TLang} from '../constants';
import {ISessionScene, TKeySessionScene, TKindSelection, TStateAuthentication} from '../model/storage.interface';
import {StorageModel} from '../model/storage.model';
import {i18n, TI18n, TI18nKey} from '../translation';
import {IConversationV3, TSdkScene2} from '../type';
import {resetSelection} from './handler/selection.helper';
import validator from 'validator';
import {Media} from '@assistant/conversation';
import {MediaType, OptionalMediaControl} from '@assistant/conversation/dist/api/schema';
import {IOpdsPublicationView, IOpdsResultView} from 'opds-fetcher-parser/build/src/interface/opds';
import {TSdkHandler} from '../typings/sdkHandler';
import {WebpubError} from '../error';
import {stall} from '../tools';
import {IWebPubView} from 'opds-fetcher-parser/build/src/interface/webpub';

export class Machine {
  private _conv: IConversationV3;
  private _i18n: TI18n;
  private _model: StorageModel | undefined;
  private _fetcher: OpdsFetcher | undefined;
  private _locale: TLang;

  private _sayAcc: string;

  constructor(conv: IConversationV3) {
    ok(conv);

    this._i18n = i18n;
    this._model = undefined;
    this._fetcher = undefined;
    this._conv = conv;

    this._sayAcc = '';
    this._locale = DEFAULT_LANGUAGE;
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
      } else {
        console.info('No Bearer Token Available');
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
        authenticationStorage.setAuthenticationToken({
          accessToken: bearerToken,
          authenticationUrl: EDRLAB_FUNCTION_URL,
        });
        const http = new httpOpdsFetcherParser(undefined, authenticationStorage, this._locale);
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
      if (/.*<.*>.*<\/.*>.*/.test(this._sayAcc)) {
        this._sayAcc = '<speak>' + this._sayAcc + '</speak>';
      }
      console.info('SAY: ', this._sayAcc);
      this._conv.add(this._sayAcc);
    }
  }

  public say(key: TI18nKey, options?: object) {
    this._sayAcc += this._i18n.t(key, options) + '\n';
  }

  public t(key: TI18nKey, options?: object) {
    ok(this._i18n);
    return this._i18n.t(key, options);
  }

  public saidSomething(): boolean {
    return !!this._sayAcc;
  }

  public get isLinked() {
    return this._conv.user.accountLinkingStatus;
  }

  public setLanguage(locale: TLang) {
    this._locale = locale;
    return this._i18n.changeLanguage(locale);
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

  public setSessionState<T extends keyof ISessionScene>(scene: T, state: ISessionScene[T]['state']) {
    ok(this._model);
    this._model.store.session.scene[scene].state = state;
  }


  public get playingNumber() {
    ok(this._model);
    return this._model.store.player.history.size;
  }

  public get playingHistorySortByDate() {
    ok(this._model);
    return new Map(
        [...this._model.store.player.history]
            .sort(([, {date: dateA}], [, {date: dateB}]) => dateB.getTime() - dateA.getTime()),
    );
  }

  public async getCurrentPlayingInfo(cur = this._model?.store.player.current) {
    ok(this._model);
    ok(cur);
    const url = cur.url || '';
    const chapter = (cur.index || 0) + 1;
    const {title, author, description} = await this.getInfoFromOpdsPub(url);

    return {chapter, title, author, description};
  }

  public async getInfoFromOpdsPub(opdsPubUrl: string) {
    if (!this.isValidHttpUrl(opdsPubUrl)) {
      throw new Error('not a valid opdsPubUrl in getInfoFromOpdsPub');
    }
    const {publications} = await this.feedRequest(opdsPubUrl);

    const pub = Array.isArray(publications) ? publications[0] : undefined;
    const title: string = pub?.title || this.t('noTitle');
    const author: string = ((pub && Array.isArray(pub?.authors)) ? pub?.authors : [])[0]?.name || '';
    const description: string = (pub?.description) || '';
    return {title, author, description};
  }

  public debugSelectionSession() {
    ok(this._model);
    console.info(this._model.store.session.scene.selection);
  }

  public get selectionSession() {
    ok(this._model);
    return this._model.store.session.scene.selection;
  }

  public set selectionSession(d: ISessionScene['selection']) {
    ok(this._model);
    this._model.store.session.scene.selection = d;
  }

  public get playerPrequelSession() {
    ok(this._model);
    return this._model.store.session.scene.player_prequel;
  }

  public set playerPrequelSession(d: ISessionScene['player_prequel']) {
    ok(this._model);
    this._model.store.session.scene.player_prequel = d;
  }

  public get searchSession() {
    ok(this._model);
    return this._model.store.session.scene.search;
  }

  public set searchSession(d: ISessionScene['search']) {
    ok(this._model);
    this._model.store.session.scene.search = d;
  }

  public isCurrentlyPlaying(c = this.playerCurrent) {
    const {url, time, index} = c;
    // if (!playing) {
    //   return false; // @TODO: need to define the use of this boolean
    // }
    if (url === undefined || time === undefined || index === undefined) {
      return false;
    }
    if (!this.isValidHttpUrl(url)) {
      throw new Error('not valid playing url');
    }
    if (time === 0 && index === 0) {
      return false;
    }
    return true;
  }

  public isPlayingAvailableInPlayer() {
    return !!this.playerCurrent.url;
  }

  public isPlayingAvailableInPlayerPrequelSession() {
    return !!this.playerPrequelSession.player.url;
  }

  public isCurrentlyPlayingInPlayerPrequelSession() {
    return this.isCurrentlyPlaying(this.playerPrequelSession.player);
  }

  public get playerCurrent() {
    ok(this._model);
    return this._model.store.player.current;
  }

  public initAndGoToSelectionSession({
    kind, from, url,
  }: {
    kind: TKindSelection,
    from: TSdkHandler,
    url: string,
  }) {
    // @ts-ignore
    if (!this.isValidHttpUrl(url) && !url.startsWith('data://')) { // data:// for recent books
      throw new Error('not a valid url');
    }
    this.selectionSession = {
      from, kind, url, nextUrlCounter: 0, state: 'RUNNING', nbChoice: 0,
    };
    this.nextScene = 'selection';
  }

  public async selectGroup(url: string, number: number) {
    ok(this._model);
    if (!this.isValidHttpUrl(url)) {
      throw new Error('url not valid');
    }

    const group = await this.getGroupFromNumberInSelectionWithUrl(url, number);
    if (group) {
      const groupUrl = group.groupUrl;
      if (!this.isValidHttpUrl(groupUrl)) {
        throw new Error('group url not valid');
      }
      this.selectionSession.url = group.groupUrl;
      this.selectionSession.kind = 'PUBLICATION'; // set to publication mode
      this.selectionSession.nextUrlCounter = 0; // reset
      this.selectionSession.state = 'RUNNING';
      this.selectionSession.nbChoice = 0; // reset

      this.debugSelectionSession();

      return true;
    }
    return false;
  }

  public async selectPublication(url: string, number: number) {
    ok(this._model);
    // @ts-ignore
    if (!this.isValidHttpUrl(url) && !url.startsWith('data://')) { // recent books
      throw new Error('url not valid');
    }

    let pub: {
      title: string;
      author: string;
      opdsPubUrl: string;
  } | undefined;

    if (url.startsWith('data://')) {
      const dataStr = url.substring('data://'.length);
      const data = JSON.parse(dataStr);
      ok(Array.isArray(data));

      const urlFromData = data[number - 1];
      if (this.isValidHttpUrl(urlFromData)) {
        const {publications} = await this.feedRequest(urlFromData);
        const publication = Array.isArray(publications) ? publications[0] : undefined;
        const author: string = ((publication && Array.isArray(publication?.authors)) ? publication?.authors : [])[0]?.name || '';
        pub = {
          title: publication?.title || this.t('noTitle'),
          author,
          opdsPubUrl: urlFromData,
        };
      }
    } else {
      pub = await this.getPublicationFromNumberInSelectionWithUrl(url, number);
    }

    if (pub) {
      const {opdsPubUrl} = pub;
      this.initPlayerInPlayerPrequelSession(opdsPubUrl);

      return true;
    }
    return false;
  }

  public resetSelectionSession() {
    this.selectionSession.state = 'DEFAULT';
    this.selectionSession.from = 'main';
    this.selectionSession.url = '';
    this.selectionSession.nbChoice = 0; // reset
    this.selectionSession.nextUrlCounter = 0; // reset
  }

  public initPlayerInPlayerPrequelSession(opdsPubUrl: string) {
    ok(this._model);
    const pubFromHistory = this._model.store.player.history.get(opdsPubUrl);
    this.playerPrequelSession.player = {
      url: opdsPubUrl,
      index: pubFromHistory?.index ?? 0,
      time: pubFromHistory?.time ?? 0,
    };
  }

  public resetPlayerInPLayerPrequelSession() {
    this.playerPrequelSession.player = {};
  }

  public initPlayerCurrentWithPlayerPrequelSession() {
    const {index, time, url} = this.playerPrequelSession.player;
    this.playerCurrent.index = index;
    this.playerCurrent.time = time;
    this.playerCurrent.url = url;
  }

  public async getPublicationFromNumberInSelectionWithUrl(url: string, number: number) {
    const {publication} = await this.getPublicationFromFeed(url);

    const pub = publication[number - 1];
    if (pub) {
      return pub;
    }
    return undefined;
  }

  public async getGroupFromNumberInSelectionWithUrl(url: string, number: number) {
    const {groups} = await this.getGroupsFromFeed(url);

    const group = groups[number - 1];
    if (group) {
      return group;
    }
    return undefined;
  }

  public get selectBookNumber() {
    const v = this._conv.intent.params?.number.resolved;
    if (v && typeof v === 'number') {
      return v;
    }
    return undefined;
  }

  public get querySearch() {
    const v = this._conv.intent.params?.query?.resolved;
    if (v && typeof v === 'string') {
      return v;
    }
    return undefined;
  }

  public setQuerySearch(scene: TSdkHandler = 'main') {
    const query = this.querySearch;
    if (!query) {
      this.searchSession = {
        query: '',
        state: 'RUNNING',
        from: scene,
      };
    } else {
      this.searchSession = {
        query,
        state: 'FINISH',
        from: scene,
      };
    }
  }

  public async getNexLinkPublicationWithUrl(url: string) {
    const feed = await this.feedRequest(url);
    const nextUrl = (feed.links?.next || [])[0]?.url;

    if (this.isValidHttpUrl(nextUrl) && await this.isPublicationAvailable(nextUrl)) {
      return nextUrl;
    }
    return undefined;
  }

  public async getNexLinkGroupWithUrl(url: string) {
    const feed = await this.feedRequest(url);
    const nextUrl = (feed.links?.next || [])[0]?.url;
    if (this.isValidHttpUrl(nextUrl) && await this.isGroupAvailable(nextUrl)) {
      return nextUrl;
    }
    return undefined;
  }

  public async isPublicationAvailable(url: string) {
    const {publication} = await this.getPublicationFromFeed(url);
    if (publication.length) {
      return true;
    }
    return false;
  }

  public async getPublicationFromFeed(url: string) {
    const feed = await this.feedRequest(url);

    const list = (feed.publications || [])
        .filter(({entryLinks: l}) => {
          return Array.isArray(l) && l[0]?.url && this.isValidHttpUrl(l[0].url);
        })
        .filter(({openAccessLinks: l}) => {
          return Array.isArray(l) && l[0]?.url && this.isValidHttpUrl(l[0].url);
        })
        .slice(0, PADDING_PUB)
        .map(({title, authors, entryLinks}) => ({
          title: title,
          author: Array.isArray(authors) && authors.length ? authors[0].name : '',
          opdsPubUrl: entryLinks ? entryLinks[0].url : '',
        }));

    return {publication: list, length: feed.metadata?.numberOfItems || list.length};
  }

  public async isGroupAvailable(url: string) {
    const {groups} = await this.getGroupsFromFeed(url);
    if (groups.length) {
      return true;
    }
    return false;
  }

  public async getGroupsFromFeed(url: string) {
    const feed = await this.feedRequest(url);

    const list = (feed.groups || [])
        .filter(({selfLink: l}) /* : l is IOpdsLinkView[]*/ => {
          return l?.title && l?.url && this.isValidHttpUrl(l.url);
        })
        .slice(0, PADDING_GROUP)
        .map(({selfLink: {title, url}}) => ({
          title: title,
          groupUrl: url,
        }));
    return {groups: list, length: feed.metadata?.numberOfItems || list.length};
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

  public persistMediaPlayer(finished: boolean = false) {
    if (!this._conv.request.context?.media) {
      return;
    }

    ok(this._model);
    const _progress = this._conv.context?.media?.progress || '0';
    const progress = finished ? 0 : parseInt(_progress, 10);
    const index = finished ? 0 : (this._conv.request.context?.media?.index || 0);
    const url = this._model.store.player.current.url;
    if (!this.isValidHttpUrl(url)) {
      return;
    }

    this._model.store.player.current.index = index;
    this._model.store.player.current.time = progress;

    this._model.store.player.history.set(url, {
      index,
      time: progress,
      date: new Date(),
    });

    console.info(`PERSIST MEDIA PLAYER - URL= ${url}, T=${progress}, I=${index}`);
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
    if (!this.isValidHttpUrl(url)) {
      throw new Error('no opdsPublication url');
    }

    const {publications} = await this.feedRequest(url);
    const webpubUrl: string = (Array.isArray(publications) && Array.isArray(publications[0]?.openAccessLinks)) ? publications[0].openAccessLinks[0]?.url : '';

    if (!this.isValidHttpUrl(webpubUrl)) {
      throw new Error('no webpub url');
    }

    const startIndexRaw = this._model.store.player.current.index;
    const startTimeRaw = this._model.store.player.current.time;

    const webpub = await this.webpubRequest(webpubUrl);

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

  private webpubRequest: (url: string) => Promise<IWebPubView> = stall(async (url: string) => {
    if (!validator.isURL(url)) {
      throw new Error('url not valid : ' + url);
    }
    if (!this._fetcher) {
      throw new Error('no fetcher available !');
    }
    try {
      const webpub = await this._fetcher.webpubRequest(url);
      return webpub;
    } catch (e) {
      const error = new WebpubError(`${e?.toString ? e.toString() : e}`);
      error.code = 401;
      throw error;
    }
  });

  private feedRequest: (url: string) => Promise<IOpdsResultView> = stall(async (url: string) => {
    if (!this._fetcher) {
      throw new Error('no fetcher available !');
    }

    // recent books hack
    if (url.startsWith('data://')) {
      const dataStr = url.substring('data://'.length);
      const data: string[] = JSON.parse(dataStr);
      ok(Array.isArray(data));

      const dataFiltered = data
          .filter((v) => typeof v === 'string' && this.isValidHttpUrl(v))
          .slice(0, PADDING_PUB); // FIXME: Little Hacky : need to add pagination instead of slicing 3 items
      const feedResultP = dataFiltered.map((url) => this._fetcher!.feedRequest(url));
      const feedResult = await Promise.all(feedResultP);
      const publications = feedResult
          .map(({publications}) => Array.isArray(publications) ? publications[0] : undefined)
          .filter((v) => !!v) as IOpdsPublicationView[];

      const feed: IOpdsResultView = {
        title: 'recent books',
        publications,
      };

      return feed;
    }

    if (!validator.isURL(url)) {
      throw new Error('url not valid : ' + url);
    }
    let feed: IOpdsResultView = {
      title: '',
      publications: [],
    };
    try {
      feed = await this._fetcher.feedRequest(url);
    } catch (e) {
      console.error('FETCHER ERROR START');
      console.error(e);
      console.error('FETCHER ERROR END');
    }
    return feed;
  });

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
      // see home_user.ts
      // this.setSessionState('home_user', 'SESSION');
    } else {
      console.info('MIDDLEWARE :: new SESSION');
      this._model.store.session = {
        scene: {
          'home_user': {
            state: 'DEFAULT',
          },
          'selection': resetSelection(),
          'search': {
            state: 'DEFAULT',
            query: '',
            from: 'main',
          },
          'player_prequel': {
            state: 'DEFAULT',
            from: 'main',
            player: {},
          },
        },
      };
      this._model.store.user.sessionId = id;
    }
  }

  private isValidHttpUrl(url: string | undefined): url is string {
    if (url && validator.isURL(url, {
      protocols: ['https', 'http'],
    })) {
      return true;
    }
    return false;
  }
}
