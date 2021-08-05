const {conversation, Media} = require("@assistant/conversation");
const functions = require("firebase-functions");

const {OpdsFetcher} = require("opds-fetcher-parser");
const {ok} = require("assert");

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

const app = conversation();

app.handle("cancel", (conv) => {
  // Implement your code here
  conv.add("cancel");
});

app.handle("reprendre_mon_livre_lvl2", (conv) => {

  // void

  // set the context storage
  // then the scene start the player
});

app.handle("ecouter_livre_audio_lvl2", (conv) => {
  // void

  console.log("écouter_livre_audio_lvl2");
});

async function getPubsFromFeed(query) {
  ok(typeof query === "string", "query not defined");
  const url = SEARCH_URL.replace("{query}", encodeURIComponent(query));
  console.log(url);

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


const SEARCH_URL = "https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}";
app.handle("i_want_to_listen", async (conv) => {
  // void

  console.log("i_want_to_listen START");

  let query = null;

  try {
    query = conv.intent.params.query.resolved;
  } catch (_) {
    // ignore
  }

  conv.session.params.query = query;
  const list = await getPubsFromFeed(query);

  console.log("PUBs: ");
  console.log(list);

  const length = list.length;
  if (length > 1) {
    conv.scene.next.name = "select_pub_after_search";

    conv.add(`Il y a ${length} publications :\nPour choisir une publication dite son numéro`);

    let text = "";
    list.map(({title, author}, i) => {
      text += `numero ${i + 1} : ${title} ${author ? `de ${author}` : ""}\n`;
    });

    conv.add(text);
  } else if (length === 1) {
    conv.scene.next.name = "player";

    conv.user.params.player_url = list[0].webpuburl;
  } else {
    conv.scene.next.name = "search";
  }

  console.log("i_want_to_listen STOP");

  // slot available for research
});

app.handle("select_publication_number", async (conv) => {
  console.log("select_publication_number START");

  const number = conv.intent.params.number.resolved;

  console.log("NUMBER: ", number);
  const list = await getPubsFromFeed(conv.session.params.query);
  const pub = list[number - 1];
  if (pub) {
    console.log("PUB: ", pub);

    const url = pub.webpuburl;

    if (!conv.user.params.player) {
      conv.user.params.player = {};
    }

    const history = conv.user.params.player[url];
    if (!history) {
      conv.user.params.player_startIndex = 0;
      conv.user.params.player_startTime = 0;
    } else {
      conv.user.params.player_startIndex = history.i;
      conv.user.params.player_startTime = history.t;
    }
    conv.user.params.player_url = url;
  } else {
    console.log("NO PUBS found !!");
    conv.scene.next.name = "search";
  }

  console.log("select_publication_number END");
});


app.handle("player", async (conv) => {
  const url = conv.user.params.player_url;
  ok(url, "url not defined");
  ok(isValidHttpUrl(url), "url not valid " + url);

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, "webpub not defined");

  const startIndexRaw = conv.user.params.player_startIndex;
  const startIndex =
    typeof startIndexRaw === "number" &&
      startIndexRaw <= webpub.readingOrders.length ? startIndexRaw : 0;

  const startTimeRaw = conv.user.params.player_startTime;
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

  conv.add(
      new Media({
        mediaObjects: mediaObjects,
        mediaType: "AUDIO",
        optionalMediaControls: ["PAUSED", "STOPPED"],
        startOffset: `${startTime}s`,
      }),
  );
});


// ////////////////////////
// Media PLAYET CONTEXT //
// ////////////////////////

function persistMediaPlayer(conv) {
  if (conv.request.context) {
    // Persist the media progress value

    const progress = parseInt(conv.request.context.media.progress, 10);
    const index = conv.request.context.media.index;
    const url = conv.user.params.player_url;

    conv.user.params.player_startIndex = index;
    conv.user.params.player_startTime = progress;

    if (!conv.user.params.player) {
      conv.user.params.player = {};
    }

    conv.user.params.player[url] = {
      i: index,
      t: progress,
      d: new Date().getTime(),
    };

    console.log("player persistence :");
    console.log(conv.user.params.player);
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

  const url = conv.user.params.player_url;
  ok(url, "url not defined");
  ok(isValidHttpUrl(url), "url not valid " + url);

  const opds = new OpdsFetcher();
  const webpub = await opds.webpubRequest(url);
  ok(webpub, "webpub not defined");

  const index = conv.user.params.player_startIndex || 0;
  const time = conv.user.params.player_startTime || 0;

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
        mediaType: "MEDIA_STATUS_ACK",
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
app.middleware((conv) => {

  // void
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
