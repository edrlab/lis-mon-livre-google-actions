import {conversation, Media } from "@assistant/conversation";
import * as functions from "firebase-functions";
import {OpdsFetcher} from "opds-fetcher-parser";
import {ok} from "assert";

// class-transformer
import 'reflect-metadata';  
import { pull, push } from "./database";
import { StorageDto } from "./model/storage.dto";
import { isValidHttpUrl } from "./utils";
import { IConversationWithParams, MediaType, OptionalMediaControl } from "./type";
import { persistMediaPlayer } from "./service/persist";
import { listPublication } from "./service/listPublication";
import { selectPublication } from "./service/selectPublication";
import { testConversation } from "./conversation/test";
import { listGroups } from "./service/listGroups";
import { selectGroup } from "./service/selectGroups";

const BEARER_TOKEN_NOT_DEFINED = "bearer token not defined";
const SELECTION_URL = 'https://storage.googleapis.com/audiobook_edrlab/groups/popular.json';
const SEARCH_URL = 'https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}';
const THEMATIC_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/thematic_list.json';
const GENRE_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/genre_list.json';

const app = conversation<IConversationWithParams>();
export type TApp = typeof app;

const appHandle: typeof app.handle = app.handle.bind(app);

app.handle = (path, fn) => {
  const ret = appHandle(path, async (conv) => {

    await Promise.resolve(fn(conv));

    const bearerToken = conv.user.params.bearerToken;
    try {

      ok(bearerToken, "bearerToken not defined");
      ok(bearerToken !== BEARER_TOKEN_NOT_DEFINED, "bearerToken not defined")
  
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
  conv.add('une erreur s\'est produite');

  console.log('ERROR');
  console.log(error);

  // conv.add(error.toString());

  conv.scene.next.name = conv.scene.name; // loop
});

// middleware<TConversationPlugin>(middleware: ConversationV3Middleware<TConversationPlugin>): ConversationV3App<TConversation>
// ConversationV3Middleware(conv: ConversationV3, framework: BuiltinFrameworkMetadata): void | ConversationV3 & TConversationPlugin | Promise<ConversationV3 & TConversationPlugin> | Promise<void>
app.middleware<IConversationWithParams>(async (conv: IConversationWithParams) => {

  if (!conv.session.params) {
    conv.session.params = {};
  }

  try {

    const bearerToken = typeof conv.user.params.bearerToken === "string" ? conv.user.params.bearerToken : "";
    ok(bearerToken, "bearerToken not defined");

    const doc = await pull(bearerToken);
    const data = doc.exists ? doc.data() : undefined;
    const instance = StorageDto.create(data, bearerToken);
    conv.user.params = instance;

  } catch (e) {
    console.error('Middleware critical error firebase firestore');
    console.error(e);

    conv.user.params = StorageDto.create(undefined, BEARER_TOKEN_NOT_DEFINED);
  }

  console.log(conv.user.params);
  console.log('==========');
  console.log(conv.request);
  console.log('----------');

  ok(conv.user.params instanceof StorageDto);

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

  conv.add('Bienvenue dans l\'application d\'écoute de livre audio valentin hauy');

  conv.scene.next.name = "home_members_lvl2";
});

app.handle('home_lvl1', (conv) => {

  conv.add('Que voulez-vous faire ? Vous pouvez dire informations ou espace membres');

  // wait intent
  // conv.scene.next.name
});

app.handle('test_webhook', (conv) => {
  conv.add('Webook works :', functions.config().debug.message || '');
  console.log('TEST OK');

  conv.scene.next.name = conv.scene.name;
});

app.handle('home_lvl1__intent__get_info_association_lvl1', (conv) => {

  conv.add('Voici les informations sur l\'association');

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

  conv.add("Bienvenue dans l'espace membres. Les commandes possibles sont: sélection, lecture, recherche. ");
  conv.add("Que voulez-vous faire ?");
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
    conv.add("aucune lecture en cours");
  } else
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";
});

app.handle('home_members__intent__selection_audiobook_lvl2', (conv) => {

  conv.scene.next.name = "selection_lvl3";
});

app.handle('selection_lvl3', (conv) => {

  conv.add("Les sélections disponibles sont ma liste, sélections thématiques, sélections par genre, Que voulez-vous faire ?")

  // reset selection context
  conv.user.params.selection.url = undefined;
  conv.user.params.selection.topUrl = undefined;

  // wait intent
  // conv.scene.next.name
});

app.handle('selection_lvl3__intent__selection_genre_lvl3', async (conv) => {

  // conv.add("sélection par genre");

  const url = GENRE_LIST_URL; 
  conv.user.params.selection.topUrl = url;
  conv.user.params.selection.url = undefined;

  await listGroups(url, conv, 'select_list_after_list_selection');
});

app.handle('selection_lvl3__intent__selection_thematic_list_lvl3', async (conv) => {

  // conv.add('sélection par liste thématique');

  const url = THEMATIC_LIST_URL;
  conv.user.params.selection.topUrl = url;
  conv.user.params.selection.url = undefined;

  await listGroups(url, conv, 'select_list_after_list_selection');
});

app.handle('selection_lvl3__intent__selection_my_list_lvl3', async (conv) => {

  const url = SELECTION_URL;
  conv.user.params.selection.topUrl = undefined;
  conv.user.params.selection.url = url;

  await listPublication(url, conv, 'select_pub_after_selection', 'home_members_lvl2');

  console.log('selection_my_list_lvl3 EXIT');
});

app.handle('select_pub_after_selection', (conv) => {

  conv.add("Pour choisir une publication dite son numéro");

  // wait slot number or intent
});

app.handle('select_list_after_list_selection', (conv) => {

  conv.add("Pour choisir une sélection dite son numéro");

  // wait slot number or intent
});

app.handle('select_list_after_list_selection__slot__number', async (conv) => {
  console.log('select_publication_number START');

  const number = conv.intent.params?.number.resolved;

  const topUrl = conv.user.params.selection.topUrl;

  ok(topUrl, "selection list url not defined");
  await selectGroup(topUrl, number, conv);

  const url = conv.user.params.selection.url;
  
  ok(url, 'selection url not defined');
  await listPublication(url, conv, 'select_pub_after_selection');

  console.log('select_publication_number END');
});


app.handle('select_pub_after_selection__slot__number', async (conv) => {
  console.log('select_publication_number START');

  const number = conv.intent.params?.number.resolved;

  const url = conv.user.params.selection.url;
  ok(url, "no selection url available");
  await selectPublication(url, number, conv);

  console.log('select_publication_number END');
});

app.handle('select_pub_after_selection__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "select_pub_after_selection";
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

    conv.add('Voulez-vous reprendre la lecture là où elle s\'était arrêtée ?');

    // wait intent
  } else {
    console.log('no need to ask to resume');
    conv.scene.next.name = 'player';
  }
});

app.handle('ask_to_resume_listening_at_last_offset__intent__yes', async (conv) => {

  conv.scene.next.name = 'player';
});


app.handle("ask_to_resume_listening_at_last_offset__intent__no", async (conv) => {

  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url), "url not defined/valid " + url);
  console.log("erase ", url, " resume listening NO");

  conv.user.params.player.current.index = 0;
  conv.user.params.player.current.time = 0;
  conv.scene.next.name = 'player';
});

app.handle('search', (conv) => {

  conv.add('Que voulez-vous écouter ? Par exemple Zola');

  // wait query intent
});

app.handle('search__slot__query', async (conv) => {
  // void

  console.log('search_livre_lvl2 START');

  const query = conv.intent.params?.query.resolved;
  ok(typeof query === 'string', 'aucune requete demandée');
  conv.session.params.query = query;

  const url = SEARCH_URL.replace('{query}', encodeURIComponent(query));
  console.log('search URL: ', url);
  await listPublication(url, conv, 'select_pub_after_search', 'search');

  console.log('search_livre_lvl2 STOP');

  // slot available for research
});

app.handle('search__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "search";
});

app.handle('select_pub_after_search', (conv) => {

  conv.add("Pour choisir une publication dite son numéro");

  // wait intent
});

app.handle('select_pub_after_search__intent__resume_listening_player', (conv) => {

  conv.scene.next.name = "select_pub_after_search";
});

app.handle('select_pub_after_search__slot__number', async (conv) => {
  console.log('select_publication_number START');

  const number = conv.intent.params?.number.resolved;

  console.log('NUMBER: ', number);
  const query = conv.session.params.query;
  ok(typeof query === 'string', 'aucune requete demandée');

  const url = SEARCH_URL.replace('{query}', encodeURIComponent(query));
  console.log('select_pub_after_search__slot__number URL: ', url);
  await selectPublication(url, number, conv);

  console.log('select_publication_number END');
});

app.handle("player", async (conv) => {

  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url), "url not valid " + url);
  console.log("Player URL:", url);

  const startIndexRaw = conv.user.params.player.current.index;
  const startTimeRaw = conv.user.params.player.current.time;

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, 'webpub not defined');

  const startIndex = (startIndexRaw && startIndexRaw <= webpub.readingOrders.length)
    ? startIndexRaw
    : 0;

  const startTime = (startTimeRaw && startTimeRaw <= (webpub.readingOrders[startIndex].duration || Infinity))
    ? startTimeRaw
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


app.handle('player__intent__resume_listening_player ', (conv) => {
  persistMediaPlayer(conv);

  // // Acknowledge pause/stop
  // conv.add(new Media({
  //   mediaType: 'MEDIA_STATUS_ACK'
  // }));

  conv.scene.next.name = 'player';
});

app.handle('player__intent__remaining_time_player', async (conv) => {
  persistMediaPlayer(conv);

  const url = conv.user.params?.player?.current?.url;
  ok(url, "url not defined")
  ok(isValidHttpUrl(url), "url not valid " + url);

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, 'webpub not defined');

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
    conv.add(`il reste ${hours} heures et ${minutes} minutes`);
  } else {
    conv.add(`il reste ${minutes} minutes`);
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
    case 'STOPPED':
      persistMediaPlayer(conv);
      // Acknowledge pause/stop
      conv.add(new Media({
        mediaType: MediaType.MediaStatusACK,
      }));
      break;
    default:
      conv.add('media status incorrect');
  }

  console.log('MediaStatus END');
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
