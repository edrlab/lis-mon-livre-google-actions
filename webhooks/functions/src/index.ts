import {conversation, Media } from "@assistant/conversation";
import * as functions from "firebase-functions";
import {OpdsFetcher} from "opds-fetcher-parser";
import {ok as _ok} from "assert";

// class-transformer
import 'reflect-metadata';  
import { pull, push } from "./database";
import { StorageDto } from "./model/storage.dto";
import { getNextLinkFromPublicationsFeed, isPublicationAvailable, isValidHttpUrl } from "./utils";
import { IConversationWithParams, MediaType, OptionalMediaControl, TPromptItem } from "./type";
import { persistMediaPlayer } from "./service/persist";
import { listPublication } from "./service/listPublication";
import { selectPublication } from "./service/selectPublication";
import { testConversation } from "./conversation/test";
import { listGroups } from "./service/listGroups";
import { selectGroup } from "./service/selectGroups";
import { ALL_PUBLICATION_LIST_URL, GENRE_LIST_URL, SEARCH_URL, SELECTION_URL, THEMATIC_LIST_URL } from "./constants";
import { i18n, t, TI18nKey } from "./translation";

const BEARER_TOKEN_NOT_DEFINED = "bearer token not defined";

const app = conversation<IConversationWithParams>();
export type TApp = typeof app;

const appHandle: typeof app.handle = app.handle.bind(app);
const __ok:(value: unknown, message?: TI18nKey) => asserts value = _ok.bind(_ok);
export const ok: typeof __ok = (v, m) => {
  return __ok(v, m ? t(m): undefined);
}


app.handle = (path, fn) => {
  const ret = appHandle(path, async (conv) => {

    await Promise.resolve(fn(conv));

    const bearerToken = conv.user.params.bearerToken;
    try {

      ok(bearerToken, 'error.bearerTokenNotDefined');
      ok(bearerToken !== BEARER_TOKEN_NOT_DEFINED, 'error.bearerTokenNotDefined')
  
      const data = conv.user.params.extract();
      await push(bearerToken, data);
    } catch (e) {

      console.error("ERROR TO save user storage to the database");
      console.error(e);
    }

    console.log("----------");
    console.log(conv.user.params);
    console.log("----------");


    // reset user storage
    // @ts-ignore
    conv.user.params = {
      bearerToken,
    };


  });

  return ret;
};

// load test conversationnel
// not used in prod MODE
// @TODO Disable it in PROD-MODE
testConversation(app);

// catch(catcher: ExceptionHandler<TConversation>): ConversationV3App<TConversation>
// ExceptionHandler(conv: TConversation, error: Error): any
app.catch((conv, error) => {
  // conv.add('error.catch', { error: error.toString() });

  console.log('ERROR');
  console.log(error);

  // conv.add(error.toString());

  conv.scene.next.name = conv.scene.name; // loop
});

// middleware<TConversationPlugin>(middleware: ConversationV3Middleware<TConversationPlugin>): ConversationV3App<TConversation>
// ConversationV3Middleware(conv: ConversationV3, framework: BuiltinFrameworkMetadata): void | ConversationV3 & TConversationPlugin | Promise<ConversationV3 & TConversationPlugin> | Promise<void>
app.middleware<IConversationWithParams>(async (conv: IConversationWithParams) => {

  if (!conv.session.params) {
    conv.session.params = {
      groupListUrl: "",
      pubListUrl: "",
      query: "",
      nextUrlCounter: 0,
      scene: 'home_lvl1',
    };
  }

  const locale = conv.user.locale;
  await i18n.changeLanguage(locale);

  const bearerTokenRaw = conv.user.params.bearerToken;
  const bearerToken = typeof bearerTokenRaw === "string" && bearerTokenRaw ? conv.user.params.bearerToken : BEARER_TOKEN_NOT_DEFINED;
  try {
    const data = await pull(bearerToken);

    // @ts-ignore
    console.log(data.player.history);
    const instance = StorageDto.create(data, bearerToken);
    conv.user.params = instance;

  } catch (e) {
    console.error('Middleware critical error firebase firestore');
    console.error(e);

    conv.user.params = StorageDto.create(undefined, bearerToken);
  }

  console.log(conv.user.params);
  console.log('==========');
  console.log(conv.request);
  console.log('----------');

  ok(conv.user.params instanceof StorageDto);

  const convAdd: IConversationWithParams["add"] = conv.add.bind(conv);
  conv.add = function (...promptItems) {

    const item: TPromptItem | undefined = promptItems[0] instanceof Media
      ? promptItems[0]
      : typeof promptItems[0] === "string"
        ? t(promptItems[0], typeof promptItems[1] === "object" ? promptItems[1] : undefined)
        : undefined;

    ok(item, 'error.convadd');

    const ret = convAdd(item);

    return ret;
  }

  // void
});

// ----------------
//
// CONVERSATION START
//
// ----------------

app.handle('cancel', (conv) => {
  // Implement your code here
  // conv.add("cancel");
});

app.handle('main', (conv) => {

  console.log(conv.add);
  
  conv.add('main.welcome');

  conv.scene.next.name = "home_members_lvl2";
});

app.handle('home_lvl1', (conv) => {

  conv.add('home.welcome');

  // wait intent
  // conv.scene.next.name
});

app.handle('test_webhook', (conv) => {
  conv.add('test.webhook', { message: functions.config().debug.message || '' });
  console.log('TEST OK');

  conv.scene.next.name = conv.scene.name;
});

app.handle('home_lvl1__intent__get_info_association_lvl1', (conv) => {

  conv.add('home.information');

  conv.scene.next.name = "home_lvl1";
});

app.handle('home_lvl1__intent__enter_member_space_lvl1', (conv) => {

  conv.scene.next.name = "home_lvl1_AccountLinking";
});

app.handle('home_lvl1__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "home_lvl1";
});

app.handle('home_lvl1__intent__listen_audiobook_lvl1', (conv) => {

  conv.scene.next.name = "home_lvl1_AccountLinking";
});

app.handle('home_members_lvl2', (conv) => {

  conv.add('homeMembers.welcome1');
  conv.add('homeMembers.welcome2');
});

app.handle('home_members_lvl2__intent__listen_audiobook_lvl2', (conv) => {
  // void

  console.log('listen_audiobook_lvl2');

  // first entry point for search
  //
  // VOID
  //
  // search_livre_lvl2 is the main entry point

  conv.scene.next.name = "search";
});

app.handle('home_members_lvl2__intent__resume_audiobook_lvl2', (conv) => {

  const url = conv.user.params.player.current.url;
  if (!isValidHttpUrl(url)) {
    conv.scene.next.name = "home_members_lvl2";
    conv.add('homeMembers.resumeAudiobook.noCurrentListening');
  } else
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";
});

app.handle('home_members__intent__selection_audiobook_lvl2', (conv) => {

  conv.scene.next.name = "selection_lvl3";
});

app.handle('selection_lvl3', (conv) => {

  conv.add("homeMembers.selection.welcome");

  // reset selection context
  // conv.user.params.selection.url = undefined;
  // conv.user.params.selection.topUrl = undefined;
  conv.session.params.pubListUrl = "";
  conv.session.params.groupListUrl = "";
  conv.session.params.nextUrlCounter = 0;
  
  conv.session.params.scene = 'selection_lvl3';

  // wait intent
  // conv.scene.next.name
});

app.handle('selection_lvl3__intent__selection_genre_lvl3', async (conv) => {

  const url = GENRE_LIST_URL; 
  conv.session.params.groupListUrl = url;
  conv.scene.next.name = 'select_group';

});

app.handle('selection_lvl3__intent__selection_thematic_list_lvl3', async (conv) => {

  const url = THEMATIC_LIST_URL;
  conv.session.params.groupListUrl = url;
  conv.scene.next.name = 'select_group';
});

app.handle('selection_lvl3__intent__selection_my_list_lvl3', async (conv) => {

  conv.session.params.pubListUrl = SELECTION_URL;
  conv.scene.next.name = 'select_publication';

  conv.session.params.nextUrlCounter = 0;

  console.log('selection_my_list_lvl3 EXIT');
});

app.handle('selection_lvl3__intent__selection_all_publication_lvl3', async (conv) => {

  conv.session.params.pubListUrl = ALL_PUBLICATION_LIST_URL;
  conv.scene.next.name = 'select_publication';

  conv.session.params.nextUrlCounter = 0;
});

app.handle('select_group', async (conv) => {

  // conv.add('homeMembers.selection.listAfterSelection');

  const url = conv.session.params.groupListUrl;
  ok(isValidHttpUrl(url));
  await listGroups(url, conv);

  // wait slot number or intent
});

app.handle('select_group__intent__stop', (conv) => {

  conv.scene.next.name = 'home_members_lvl2';
});

app.handle('select_group__intent__menu', (conv) => {

  conv.scene.next.name = 'home_members_lvl2';
});

app.handle('select_group__slot__number', async (conv) => {
  console.log('select_group_number START');

  const number = conv.intent.params?.number.resolved;

  const groupUrl = conv.session.params.groupListUrl;
  ok(isValidHttpUrl(groupUrl), 'error.selectionListNotDefined');
  const url = await selectGroup(groupUrl, number, conv);

  if (url) {
    ok(isValidHttpUrl(url), 'error.selectionPubNotDefined');
  
    conv.session.params.pubListUrl = url;
    conv.session.params.nextUrlCounter = 0;
    conv.scene.next.name = 'select_publication';
  } else {
    // conv.scene.next.name = 'select_group';
  }

  console.log('select_group_number END');
});

app.handle("ask_to_resume_listening_at_last_offset", async (conv) => {

  console.log("start: ask_to_resume_last_offset");

  const { url, index, time } = conv.user.params.player.current;
  if (isValidHttpUrl(url) && ((index && index > 0) || (time && time > 0))) {
    console.log("ask to resume enabled , wait yes or no");
    // ask yes or no in the no-code scene
    // const history = conv.user.params.player[url];
    // const date = history.d;
    // TODO: use the date info

    conv.add('player.askResumeLastOffset');

    // wait intent
  } else {
    console.log('no need to ask to resume');
    conv.scene.next.name = 'player';
  }
});

const sayAudiobookTitle = async (conv: IConversationWithParams, url: string) => {

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  const title = webpub.title;

  if (title) {
    conv.add('player.start', {title});
  }
};

app.handle('ask_to_resume_listening_at_last_offset__intent__yes', async (conv) => {

  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url));
  await sayAudiobookTitle(conv, url);

  conv.scene.next.name = 'player';
});


app.handle("ask_to_resume_listening_at_last_offset__intent__no", async (conv) => {

  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url), 'error.urlNotValid');
  console.log("erase ", url, " resume listening NO");
  await sayAudiobookTitle(conv, url);

  conv.user.params.player.current.index = 0;
  conv.user.params.player.current.time = 0;
  conv.scene.next.name = 'player';
});

app.handle('search', (conv) => {

  conv.add('homeMembers.search');

  conv.session.params.scene = 'search';

  conv.session.params.pubListUrl = "";
  conv.session.params.groupListUrl = "";

  // wait query intent
});

app.handle('search__slot__query', async (conv) => {
  // void

  const query = conv.intent.params?.query.resolved;
  console.log('search_slot_query', query);

  ok(typeof query === 'string', 'error.noQuery');
  conv.session.params.query = query;

  // save url to session storage (next link)
  const url = SEARCH_URL.replace('{query}', encodeURIComponent(query));
  console.log('search URL: ', url);

  ok(isValidHttpUrl(url));
  conv.session.params.pubListUrl = url;
  conv.session.params.nextUrlCounter = 0;
  conv.scene.next.name = "select_publication";

});

app.handle('search__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "search";
});

app.handle('select_publication', async (conv) => {


  const url = conv.session.params.pubListUrl;
  ok(isValidHttpUrl(url));
  await listPublication(url, conv);

  // wait intent
});

app.handle('select_publication__intent__stop', (conv) => {

  conv.scene.next.name = 'home_members_lvl2';
});

app.handle('select_publication__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "select_publication";
});

app.handle('select_publication__intent__next', async (conv) => {

  const url = conv.session.params.pubListUrl;
  ok(isValidHttpUrl(url));
  const nextUrl = await getNextLinkFromPublicationsFeed(url);
  if (nextUrl && await isPublicationAvailable(nextUrl)) {
    conv.session.params.pubListUrl = nextUrl;
    conv.session.params.nextUrlCounter++;
  } else {
    conv.add('homeMembers.selection.noNext') + '\n';
  }

  conv.scene.next.name = "select_publication";
});

app.handle('select_publication__slot__number', async (conv) => {
  console.log('select_publication_number START');

  const number = conv.intent.params?.number.resolved;

  console.log('NUMBER: ', number);

  const url = conv.session.params.pubListUrl;
  await selectPublication(url, number, conv);

  console.log('select_publication_number END');
});

app.handle('select_publication__intent__repeat', async (conv) => {

  conv.scene.next.name = 'select_publication';
});

app.handle("player", async (conv) => {

  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url), 'error.urlNotValid');
  console.log("Player URL:", url);

  const startIndexRaw = conv.user.params.player.current.index;
  const startTimeRaw = conv.user.params.player.current.time;

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, 'error.webpubNotDefined');

  let startIndex = (startIndexRaw && startIndexRaw > -1 && startIndexRaw <= webpub.readingOrders.length)
    ? startIndexRaw
    : 0;

  const startTime = (startTimeRaw  && startTimeRaw > -1)
    ? startTimeRaw <= (webpub.readingOrders[startIndex].duration || Infinity)
      ? startTimeRaw
      : (startIndex += 1, startTimeRaw)
    : 0;

  startIndex = startIndex <= webpub.readingOrders.length
    ? startIndex
    : 0;

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

  conv.add(
      new Media({
        mediaObjects: mediaObjects,
        mediaType: MediaType.Audio,
        optionalMediaControls: [OptionalMediaControl.Paused, OptionalMediaControl.Stopped],
        startOffset: `${startTime}s`,
      }),
  );
});

// ----------
// PLAYER
// ----------


// ////////////////////////
// Media PLAYER CONTEXT //
// ////////////////////////


app.handle('player__intent__resume_listening_player', (conv) => {
  persistMediaPlayer(conv);

  // // Acknowledge pause/stop
  // conv.add(new Media({
  //   mediaType: 'MEDIA_STATUS_ACK'
  // }));

  conv.scene.next.name = 'player';
});

// overhided by the google nest player
// 'avance' : avance de x seconds
// 'repete' : repete la track
// 'avance de 30 secondes : ne fait rien
//
// app.handle('player__intent__repeat_player', (conv) => {
//   persistMediaPlayer(conv);

//   if (conv.user.params.player.current.time)
//     conv.user.params.player.current.time -= 30;

//   conv.scene.next.name = 'player';
// });

// app.handle('player__intent__jump_30sec_player', (conv) => {
//   persistMediaPlayer(conv);

//   if (conv.user.params.player.current.time)
//     conv.user.params.player.current.time += 30;

//   conv.scene.next.name = 'player';
// });

app.handle('player__intent__listen_toc', (conv) => {
  persistMediaPlayer(conv);

  conv.add('player.notAvailable');

  // // Acknowledge pause/stop
  // conv.add(new Media({
  //   mediaType: 'MEDIA_STATUS_ACK'
  // }));

  conv.scene.next.name = 'player';
});

app.handle('player__intent__menu', (conv) => {
  persistMediaPlayer(conv);

  // Acknowledge pause/stop
  conv.add(new Media({
    mediaType: MediaType.MediaStatusACK,
  }));

  conv.scene.next.name = "home_members_lvl2";
});

app.handle('player__intent__remaining_time_player', async (conv) => {
  persistMediaPlayer(conv);

  const url = conv.user.params?.player?.current?.url;
  ok(url, 'error.urlNotValid')
  ok(isValidHttpUrl(url), 'error.urlNotValid');

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, 'error.webpubNotDefined');

  const index = conv.user.params.player.current.index || 0;
  const time = conv.user.params.player.current.time || 0;

  let minutes = 0;
  if (Array.isArray(webpub.readingOrders)) {
    let remainingTime = 0;
    for (let i = index + 1; i < webpub.readingOrders.length; i += 1) {
      remainingTime += webpub.readingOrders[i].duration || 0;
    }
    const pos = (v) => (v < 0 ? 0 : v);
    remainingTime += pos((webpub.readingOrders[index].duration || 0) - time);

    if (remainingTime >= 60) {
      minutes = Math.floor(remainingTime / 60);
    }
  }

  const hours = Math.floor(minutes / 60);
  if (hours) {
    minutes = minutes % 60;
    conv.add('player.remaining.hoursAndMinute', { hours, minutes });
  } else {
    conv.add('player.remaining.minute', { minutes });
  }

  // // Acknowledge pause/stop
  // conv.add(new Media({
  //   mediaType: 'MEDIA_STATUS_ACK'
  // }));

  conv.scene.next.name = 'player';
});

// ////////////////////////
// Media PLAYET CONTEXT //
// ////////////////////////

// Media status
app.handle('media_status', (conv) => {
  console.log('MediaStatus START');
  const mediaStatus = conv.intent.params?.MEDIA_STATUS.resolved;
  console.log('MediaStatus : ', mediaStatus);
  switch (mediaStatus) {
    case 'FINISHED':
      persistMediaPlayer(conv);
      conv.scene.next.name = "home_members_lvl2";

      // void
      break;
    case 'FAILED':

      // void
      break;
    case 'PAUSED':
      persistMediaPlayer(conv);
      // Acknowledge pause/stop
      conv.add(new Media({
        mediaType: MediaType.MediaStatusACK,
      }));

      break;
    case 'STOPPED':
      persistMediaPlayer(conv);
      // Acknowledge pause/stop
      conv.add(new Media({
        mediaType: MediaType.MediaStatusACK,
      }));

      conv.scene.next.name = "home_members_lvl2";
      break;
    default:
      conv.add('player.mediaStatus.notCorrect');
  }

  console.log('MediaStatus END');
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
