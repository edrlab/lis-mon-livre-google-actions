import {conversation, ConversationV3, Media } from "@assistant/conversation";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {OpdsFetcher} from "opds-fetcher-parser";
import {ok} from "assert";
import { User } from "@assistant/conversation/dist/conversation/handler";

enum MediaType {
  Audio = 'AUDIO',
  MediaStatusACK = 'MEDIA_STATUS_ACK',
  MediaTypeUnspecified = 'MEDIA_TYPE_UNSPECIFIED',
}

enum OptionalMediaControl {
  OptionalMediaControlsUnspecified = 'OPTIONAL_MEDIA_CONTROLS_UNSPECIFIED',
  Paused = 'PAUSED',
  Stopped = 'STOPPED',
}

interface IUser extends User {
  params: {
    bearerToken?: string;
    player?: {
      current: {
        index?: number;
        time?: number;
        url?: string;
      }
      history: {
        [url: string]: {
          index: number;
          time: number;
          date: number;
        };
      }
    };
  };
}
interface IConvesationWithParams extends ConversationV3 {
  user: IUser;
}

admin.initializeApp();

const db = admin.firestore();

const app = conversation<IConvesationWithParams>();

const appHandle: typeof app.handle = app.handle.bind(app);

app.handle = (path, fn) => {

  const ret = appHandle(path, async (conv) => {

    let pass = false;
    try {

      const id = conv.user.params.bearerToken;

      ok(id, "bearerToken not defined");

      const docRef = db.collection("user-storage").doc(id);
      await Promise.resolve(fn(conv));
      pass = true;
      await docRef.set(conv.user.params);

    } catch (e) {
      console.error(e);
      if (!pass)
        await Promise.resolve(fn(conv));

    }
  });

  return ret;
};

function isValidHttpUrl(string: string) {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

async function getPubsFromFeed(url: string) {

  const opds = new OpdsFetcher();
  const feed = await opds.feedRequest(url);

  ok(Array.isArray(feed.publications), "no publications");
  const list = feed.publications
      .filter(({openAccessLinks: l}) /* : l is IOpdsLinkView[]*/ => {
        return (
          Array.isArray(l) &&
        l[0] &&
        isValidHttpUrl(l[0].url)
        );
      })
      .slice(0, 5)
      .map(({title, authors, openAccessLinks}) => ({
        title: title,
        author: Array.isArray(authors) ? authors[0].name : "",
        webpuburl: openAccessLinks[0].url,
      }));

  return list;
}

//////////
// TEST //
//////////

app.handle("test_player_sdk", (conv) => {

  const nb = conv.intent.params.number.resolved;

  switch (nb) {

    case 123:

      conv.user.params = {
        ...conv.user.params,
        player: {
          ...conv.user.params.player || {},
          current: {
            index: 2,
            url: "https://storage.googleapis.com/audiobook_edrlab/webpub/therese_raquin_emile_zola.json",
            time: 123, 
          },
          history: {
            ["https://storage.googleapis.com/audiobook_edrlab/webpub/therese_raquin_emile_zola.json"]: {
              index: 2,
              date: 0,
              time: 123,
            },
          }
        },
      };

      break;

    case 456:

      break;
    case 789:

      break;
  }

  console.log("test_PLAYER");
  console.log(conv.user.params);

  conv.add(`test player ${nb}`);
});

app.handle("setup_test_sdk", (conv) => {

  const nb = conv.intent.params.number.resolved;

  conv.user.params = {
    bearerToken: `test-${nb}`,
  }

  conv.add(`setup test ${nb}`);

});

//////////
// TEST //
//////////

// ----------------
//
// CONVERSATION START
//
// ----------------

app.handle("cancel", (conv) => {
  // Implement your code here
  // conv.add("cancel");
});

app.handle("test_webhook", (conv) => {

  conv.add("Webook works :", functions.config().debug.message || "");
  console.log("TEST OK");
});

// -----------
// LVL2 MENU
// SELECTION 
// -----------


const WEBPUB_URL = "https://storage.googleapis.com/audiobook_edrlab/webpub/";

// const extract_name_from_url = (url: string) => {
//   const name = /\/(?:.(?!\/))+$/.exec(url)[0];
//   if (typeof name === "string")
//     return name.slice(1);
//   return "";
// };

// -----------
// LVL3 MENU
// SELECTION
// -----------

app.handle("selection_genre_lvl3", async (conv) => {

  conv.add("sélection par genre");
});

app.handle("selection_thematic_list_lvl3", async (conv) => {

  conv.add("sélection par liste thématique");
});

const SELECTION_URL = "https://storage.googleapis.com/audiobook_edrlab/groups/popular.json"
app.handle("selection_my_list_lvl3", async (conv) => {

  const url = SELECTION_URL;
  const list = await getPubsFromFeed(url);

  console.log("PUBs: ", list);

  const length = list.length;
  if (length > 1) {
    conv.scene.next.name = "select_pub_after_selection";
    conv.add(`Il y a ${length} publications :\n`);

    let text = "";
    list.map(({title, author}, i) => {
      text += `numero ${i + 1} : ${title} ${author ? `de ${author}` : ""}\n`;
    });

    conv.add(text);
  } else if (length === 1) {
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";

    conv.user.params.player.current.url = list[0].webpuburl;
  } else {
    conv.scene.next.name = "home_members_lvl2";

    conv.add("aucun résultat trouvé");
  }

  console.log("selection_my_list_lvl3 EXIT");

});

// ---------
// LVL3 MENU
// SELECTION
// ---------

app.handle("select_publication_number_after_selection", async (conv) => {
  console.log("select_publication_number START");

  const number = conv.intent.params.number.resolved;

  const url = SELECTION_URL;
  const list = await getPubsFromFeed(url);
  const pub = list[number - 1];
  if (pub) {
    console.log("PUB: ", pub);

    const url = pub.webpuburl;

    if (!conv.user.params.player) {
      conv.user.params.player = {
        current: {
        },
        history: {
        },
      };
    }

    const history = conv.user.params.player[url];
    if (!history) {
      conv.user.params.player.current.index = 0;
      conv.user.params.player.current.time = 0;
    } else {
      conv.user.params.player.current.index = history.i;
      conv.user.params.player.current.time = history.t;
    }
    conv.user.params.player.current.url = url;

    // should be specified
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";
  } else {
    console.log("NO PUBS found !!");
    conv.add(`Le numéro ${number} est inconnu. Veuillez choisir un autre numéro.`);
    conv.scene.next.name = "select_pub_after_selection";
  }

  console.log("select_publication_number END");
});


// -----------
// LVL2 MENU
// SELECTION 
// -----------

app.handle("reprendre_mon_livre_lvl2", (conv) => {

  // void

  const url = conv.user.params.player.current.url;
  if (!url) {
    conv.scene.next.name = "home_members_lvl2";
    conv.add("aucune lecture en cours");
  }

});

app.handle("ecouter_livre_audio_lvl2", (conv) => {
  // void

  console.log("écouter_livre_audio_lvl2");

  // first entry point for search
  //
  // VOID
  //
  // search_livre_lvl2 is the main entry point
});


// ----------
// LVL2 MENU
// SEARCH
// ----------

const SEARCH_URL = "https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}";

// if scene.slot.status == "FINAL" => call search_livre_lvl2
app.handle("search_livre_lvl2", async (conv) => {
  // void

  console.log("search_livre_lvl2 START");

  let query = null;

  try {
    query = conv.intent.params.query.resolved;
  } catch (_) {
    // ignore
  }

  ok(typeof query === "string", "aucune requete demandée");
  conv.session.params.query = query;
 
  const url = SEARCH_URL.replace("{query}", encodeURIComponent(query));
  console.log("search URL: ", url);

  const list = await getPubsFromFeed(url);

  console.log("PUBs: ");
  console.log(list);

  const length = list.length;
  if (length > 1) {
    conv.scene.next.name = "select_pub_after_search";
    conv.add(`Il y a ${length} publications :\n`);

    let text = "";
    list.map(({title, author}, i) => {
      text += `numero ${i + 1} : ${title} ${author ? `de ${author}` : ""}\n`;
    });

    conv.add(text);
  } else if (length === 1) {
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";

    conv.user.params.player.current.url = list[0].webpuburl;
  } else {
    conv.scene.next.name = "search";

    conv.add("aucun résultat trouvé");
  }

  console.log("search_livre_lvl2 STOP");

  // slot available for research
});

app.handle("select_publication_number_after_search", async (conv) => {
  console.log("select_publication_number START");

  const number = conv.intent.params.number.resolved;

  console.log("NUMBER: ", number);
  const query = conv.session.params.query;
  ok(typeof query === "string", "aucune requete demandée");
 
  const url = SEARCH_URL.replace("{query}", encodeURIComponent(query));
  console.log("select_publication_number_after_search URL: ", url);

  const list = await getPubsFromFeed(url);
  const pub = list[number - 1];
  if (pub) {
    console.log("PUB: ", pub);

    const url = pub.webpuburl;

    if (!conv.user.params.player) {
      conv.user.params.player = {
        current: {
        },
        history: {
        }
      };
    }

    const history = conv.user.params.player[url];
    if (!history) {
      conv.user.params.player.current.index = 0;
      conv.user.params.player.current.time = 0;
    } else {
      conv.user.params.player.current.index = history.i;
      conv.user.params.player.current.time = history.t;
    }
    conv.user.params.player.current.url = url;

    // should be specified
    conv.scene.next.name = "ask_to_resume_listening_at_last_offset";
  } else {
    console.log("NO PUBS found !!");
    conv.add(`Le numéro ${number} est inconnu. Veuillez choisir un autre numéro.`);
    conv.scene.next.name = "select_pub_after_search";
  }

  console.log("select_publication_number END");
});


// ----------
// LVL2 MENU
// SEARCH
// ----------

app.handle("ask_to_resume_listening_at_last_offset", async (conv) => {

  console.log("start: ask_to_resume_last_offset");

  const { url, index, time } = conv.user.params.player.current;
  if (url && (index > 0 || time > 0)) {
    console.log("ask to resume enabled , wait yes or no");
    // ask yes or no in the no-code scene
    const history = conv.user.params.player[url];
    const date = history.d;
    // TODO: use the date info
    
    conv.add("Voulez-vous reprendre la lecture là où elle s'était arrêtée ?");
  } else {
    console.log("no need to ask to resume");
    conv.scene.next.name = "player";
  }

});

app.handle("ask_to_resume_listening_at_last_offset__yes", async (conv) => {

  // nothing
  // not used
  conv.scene.next.name = "player";
  
});


app.handle("ask_to_resume_listening_at_last_offset__no", async (conv) => {

  const url = conv.user.params.player.current.url;
  if (url) {
    console.log("erase ", url, " resume listening NO");
    conv.user.params.player.current.index = 0;
    conv.user.params.player.current.time = 0;
  }
  conv.scene.next.name = "player";

});


// ----------
// PLAYER
// ----------

app.handle("player", async (conv) => {
  const url = conv.user.params.player.current.url;

  console.log("Player URL:", url);
  ok(url, "url not defined");
  ok(isValidHttpUrl(url), "url not valid " + url);

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, "webpub not defined");

  const startIndexRaw = conv.user.params.player.current.index;
  const startIndex =
    typeof startIndexRaw === "number" &&
      startIndexRaw <= webpub.readingOrders.length ? startIndexRaw : 0;

  const startTimeRaw = conv.user.params.player.current.time;
  const startTime =
    typeof startTimeRaw === "number" &&
      startTimeRaw <= (webpub.readingOrders[startIndex].duration || Infinity) ? startTimeRaw : 0;

  const mediaObjects = webpub.readingOrders
      .map((v, i) => ({
        name: `${webpub.title || ""} - ${i + 1}`,
        url: v.url,
        image: {
          large: {
            alt: webpub.title,
            url: webpub.cover || "",
          },
        },
      })).slice(startIndex);

  console.log("Media list");
  console.log(mediaObjects);
  console.log("Start Index = ", startIndex, " Start Time = ", startTime, " Start Time");

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
// Media PLAYET CONTEXT //
// ////////////////////////

function persistMediaPlayer(conv: IConvesationWithParams) {
  if (conv.request.context) {
    // Persist the media progress value

    const progress = parseInt(conv.request.context.media.progress, 10);
    const index = conv.request.context.media.index;
    const url = conv.user.params.player.current.url

    conv.user.params.player.current.index = index;
    conv.user.params.player.current.time = progress;

    if (!conv.user.params.player) {
      conv.user.params.player = {
        current: {
        },
        history: {
        }
      };
    }

    conv.user.params.player.history[url] = {
      index: index,
      time: progress,
      date: new Date().getTime(),
    };

    console.log("player persistence :");
    console.log(conv.user.params.player);
  } else {

    console.log("NO conv.request.context !!");
  }
}

app.handle("reprendre_la_lecture", (conv) => {
  persistMediaPlayer(conv);

  // // Acknowledge pause/stop
  // conv.add(new Media({
  //   mediaType: 'MEDIA_STATUS_ACK'
  // }));

  conv.scene.next.name = "player";
});

app.handle("remaining_time", async (conv) => {
  persistMediaPlayer(conv);

  const url = conv.user.params?.player?.current?.url;
  ok(isValidHttpUrl(url), "url not valid " + url);

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, "webpub not defined");

  const index = conv.user.params.player.current.index|| 0;
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

  conv.scene.next.name = "player";
});

// ////////////////////////
// Media PLAYET CONTEXT //
// ////////////////////////

// Media status
app.handle("media_status", (conv) => {
  console.log("MediaStatus START");
  const mediaStatus = conv.intent.params.MEDIA_STATUS.resolved;
  console.log("MediaStatus : ", mediaStatus);
  switch (mediaStatus) {
    case "FINISHED":
      persistMediaPlayer(conv);
      conv.scene.next.name = "home_members_lvl2";

      // void
      break;
    case "FAILED":

      // void
      break;
    case "PAUSED":
    case "STOPPED":
      persistMediaPlayer(conv);
      // Acknowledge pause/stop
      conv.add(new Media({
        mediaType: MediaType.MediaStatusACK,
      }));
      break;
    default:
      conv.add("media status incorrect");
  }

  console.log("MediaStatus END");
});


// catch(catcher: ExceptionHandler<TConversation>): ConversationV3App<TConversation>
// ExceptionHandler(conv: TConversation, error: Error): any
app.catch((conv, error) => {
  conv.add("une erreur s'est produite");

  console.log("ERROR");
  console.log(error);
});

// middleware<TConversationPlugin>(middleware: ConversationV3Middleware<TConversationPlugin>): ConversationV3App<TConversation>
// ConversationV3Middleware(conv: ConversationV3, framework: BuiltinFrameworkMetadata): void | ConversationV3 & TConversationPlugin | Promise<ConversationV3 & TConversationPlugin> | Promise<void>
app.middleware<IConvesationWithParams>(async (conv: IConvesationWithParams) => {

  console.log(conv.user.params);
  console.log("==========");
  console.log(conv);
  console.log("----------");

  let bearerToken: string;

  try {
    const btraw = conv.user.params.bearerToken;
    if (typeof btraw === "string")
      bearerToken = btraw;

    ok(bearerToken, "bearerToken not defined");
  } catch (e) {

    console.error("middleware error BearerToken");
    console.error(e);
  }

  if (!conv.user.params) {
    conv.user.params = {};
  }

  if (
    !(
      conv.user.params.player &&
      conv.user.params.player.history &&
      conv.user.params.player.current
    )
  ) {
    conv.user.params.player = {
      history: {
      },
      current: {
      },
    }
  }

  try {

    const docRef = db.collection("user-storage").doc(bearerToken);
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log("No such document!");
      conv.user.params = {
        bearerToken,
        player: conv.user.params.player,
      }
    } else {
      console.log("Document data:", doc.data());

      const data = doc.data();
      if (
        typeof data.bearerToken === "string" &&
        typeof data.player === "object" &&
        typeof data.player.history === "object" &&
        typeof data.player.current === "object"
      ) {

        conv.user.params = data as IConvesationWithParams["user"]["params"];
      }
    }
  } catch (e) {

    console.error("Middleware critical error firebase firestore");
    console.error(e);
  }

  console.log("user-params:");
  console.log(conv.user.params);

  // void
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
