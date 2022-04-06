import { BOOKSHELF_URL, GENRE_LIST_URL, NAME, PADDING_PUB } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const home_user = (app: Assistant) => {

  app.handle("home_user__intent__search", search);
  app.handle("home_user__intent__collections", collections);
  app.handle("home_user__intent__bookshelf", bookshelf);
  app.handle("home_user__on_enter", enter);
  app.handle("home_user__intent__fallback", help);
  app.handle("home_user__intent__fallback_end", missing);
  app.handle("home_user__intent__help", help);
  app.handle("home_user__intent__repeat", repeat);
  app.handle("home_user__intent__silence", help);
  app.handle("home_user__intent__silence_end", missing);
  app.handle("home_user__intent__recent_books", recentBooks);
  app.handle("home_user__intent__current_book", currentBook);

}

const enter: THandlerFn = async (m) => {

  const state = m.getSessionState("home_user");
  const newlyLinked = m.authenticationState === "NEWLY_LINKED";
  const playing = m.isCurrentlyPlaying();
  const regularUser = m.isARegularUser;

  if (state === "SESSION") {
    // aka there is a session : the user discovered the app

    // "What would you like to do?"
    // m.say("home_user.enter.regular.1");

    // "Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?"
    m.say("home_user.enter.newlyUser.2");

  } else if (state === "REPEAT") {

    m.say("home_user.help.1");
    m.say("home_user.help.2");

    m.setSessionState("home_user", "SESSION");

  } else if (newlyLinked) {

    m.say("home_user.enter.newlyUser.1", { name: NAME });
    m.say("home_user.enter.newlyUser.2", { name: NAME });

  } else if (playing) {

    const {title, chapter, author} = await m.getCurrentPlayingInfo();
    const readingNumber = m.playingNumber - 1;

    m.say("home_user.enter.playing.1", {chapterNumber: chapter, titleAndAuthor: `${title}${author ? `, ${author}` : ''}`});
    if (readingNumber > 0) {
      m.say("home_user.enter.playing.2", {readingNumber: readingNumber});
    }
    m.say("home_user.enter.playing.3");
    m.say("home_user.enter.regular.1");
//    m.say("home_user.enter.regular.2");

  } else if (regularUser) {
    // regularUser

    m.say("home_user.enter.regular.1");
//    m.say("home_user.enter.regular.2");
  } else {
    // occasionalUser

    // "Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?"
    m.say("home_user.enter.newlyUser.2");
  }

  m.setSessionState("home_user", "SESSION");

  // "Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?"
  // m.say("home_user.enter.newlyUser.2");
}

const search: THandlerFn = (m) => {

  // query from search intent
  m.setQuerySearch();
  m.nextScene = "search";
}

const collections: THandlerFn = (m) => {
  m.nextScene = "collections";
}

const bookshelf: THandlerFn = (m) => {

  m.initAndGoToSelectionSession({
    kind: 'PUBLICATION',
    from: "home_user__intent__bookshelf",
    url: BOOKSHELF_URL,
  });
}

const recentBooks: THandlerFn = (m) => {
  
  const history = m.playingHistorySortByDate;
  const urls = [...history.keys()];
  m.initAndGoToSelectionSession({
    kind: 'PUBLICATION',
    from: "home_user__intent__recent_books",
    url: 'data://' + JSON.stringify(urls.slice(0, PADDING_PUB)), // data url with an array of webpub links
  })
}

const currentBook: THandlerFn = (m) => {
  
  const isPlaying = !!m.currentPlayingUrl;
  if (isPlaying) {

    m.playerPrequelSession.from = "home_user__intent__current_book";
    m.nextScene = 'player_prequel';
  } else {

    m.say('home_user.currentBook.1');
    m.nextScene = 'home_user';
  }
}

const help: THandlerFn = (m) => {

  m.setSessionState("home_user", "REPEAT");

  m.nextScene = "home_user";
}

const repeat: THandlerFn = (m) => {
  
  m.setSessionState("home_user", "REPEAT");
  m.nextScene = "home_user";
}
