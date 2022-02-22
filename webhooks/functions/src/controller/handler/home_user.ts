import { BOOKSHELF_URL, GENRE_LIST_URL, NAME } from "../../constants";
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

}

const enter: THandlerFn = async (m) => {

  const state = m.getSessionState("home_user");
  if (state === "SESSION") {
    // aka there is a session : the user discovered the app
    m.say("home_user.enter.regular.1");

    return;
  }

  const newlyLinked = m.authenticationState === "NEWLY_LINKED";
  if (newlyLinked) {
    m.say("home_user.enter.newlyUser.1", { name: NAME });
    m.say("home_user.enter.newlyUser.2", { name: NAME });

    return;
  }
  const playing = m.playingInProgress;
  if (playing) {

    const {title, chapter, author} = await m.getCurrentPlayingTitleAndChapter();
    const readingNumber = m.playingNumber;

    m.say("home_user.enter.playing.1", {chapterNumber: chapter, titleAndAuthor: `${title}${author ? `, ${author}` : ''}`});
    if (readingNumber) {
      m.say("home_user.enter.playing.2", {readingNumber: readingNumber});
    }
    m.say("home_user.enter.playing.3");
    m.say("home_user.enter.regular.1");

    return ;
  }

  const regularUser = m.isARegularUser;
  if (regularUser) {
    // regularUser
    // what is the purpose of this information ? 
    // @TODO ask to Maiike
  } else {
    // occasionalUser
  }
  
  m.say("home_user.enter.newlyUser.2");
}

const search: THandlerFn = (m) => {
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

const help: THandlerFn = (m) => {

  m.say("home_user.help.1", {name: NAME});
  m.say("home_user.help.2", {name: NAME});

  m.nextScene = "home_user";
}

const repeat: THandlerFn = (m) => {
  
  m.setSessionState("home_user", "REPEAT");
  m.nextScene = "home_user";
}