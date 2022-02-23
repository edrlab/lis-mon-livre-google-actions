import { NAME, PADDING_GROUP, PADDING_PUB } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const selection = (app: Assistant) => {

  app.handle("selection__on_enter", enter);
  app.handle("selection__intent__another_one", anotherOne);
  app.handle("selection__intent__selects_book", selectBook);
  app.handle("selection__intent__fallback", help);
  app.handle("selection__intent__fallback_end", missing);
  app.handle("selection__intent__help", help);
  app.handle("selection__intent__repeat", repeat);
  app.handle("selection__intent__silence", help);
  app.handle("selection__intent__silence_end", missing);

}

const enter: THandlerFn = async (m) => {

  const { state, url, nbChoice } = m.selectionSession;
  const kind = m.selectionSession.kind;
  const handler = m.selectionSession.from;

  if (state === "RUNNING") {

    const isAvailable = kind === "GROUP" ? await m.isGroupAvailable(url) : await m.isPublicationAvailable(url);
    const isEmpty = !isAvailable;
    if (isEmpty) {
      if (handler === "search__on_enter") {
        m.say("search.empty.1", {name: NAME});
        m.nextScene = "search";
        m.searchSession.query = '';
        m.searchSession.state = 'RUNNING';
        m.searchSession.from = "selection__on_enter";
      } else {
        m.say('selection.enter.empty.1');
        m.nextScene = "home_user";
      }
      return ;
    }

    // @TODO
    // handle only one group or publication 
    // redirect to nextScene 'selection' for group 
    // or 'player-prequel' for a publication

    if (m.selectionSession.nextUrlCounter) {
      const nextLink = kind === "GROUP" ? await m.getNexLinkGroupWithUrl(url) : await m.getNexLinkPublicationWithUrl(url);
      if (nextLink) {

      } else {
        if (kind === "GROUP") {
          m.say("selection.enter.lastPage.group");
        } else {
          m.say("selection.enter.lastPage.publication");
        }
      }

    } else {
      // intro
      if (handler === "home_user__intent__bookshelf") {
        const {publication} = await m.getPublicationFromFeed(url); // @TODO fix it .. twice call to api
        m.say('selection.enter.bookshelf.first', {number: publication.length});
      } else if (handler === "home_user__intent__search") {
        const {length} = await m.getPublicationFromFeed(url); // @TODO fix it .. twice call to api
        m.say('selection.enter.search', {number: length});
      }
    }

      // @TODO handle collection group or publication

    // list groups or publication
    m.say('selection.enter.common.1');
    const list = kind === "GROUP" 
      ? (await m.getGroupsFromFeed(url)).groups.map(({title}) => title)
      : (await m.getPublicationFromFeed(url)).publication.map(({title}) => title);
    list.forEach((title, i) => m.say('selection.enter.common.2', {symbol: i + 1, title}));
    m.say('selection.enter.common.3');


    // outro
    if (handler === "home_user__intent__bookshelf") {
      m.say('selection.enter.bookshelf.second');
    }

  } else if (state === "FINISH") {

    const valid = kind === "GROUP" ? await m.selectGroup(url, nbChoice) : await m.selectPublication(url, nbChoice);

    if (valid) {
      // select OK

      const { state } = m.selectionSession;
      if (state === "RUNNING") {
        // group requested
        m.nextScene = "selection";
      }

      // const handler = m.selectionSession.from;
      // is it usefull ?
      // routing table
      // all 'handler from' route to player ?

      m.nextScene = "player";
      // @TODO set the next-scene to player prequel
      // lecture en cours ou annonciation du titre

    } else {
      // KO
      // help message
      m.say("selection.help.1");
      m.nextScene = "selection";
    }
  } else {
    throw new Error("undefined selection state");
    // @TODO
    // reset selection session
    // move to home user
  }
  // m.nextScene = "selection";

}

const selectBook: THandlerFn = async (m) => {

  const nb = m.selectBookNumber;
  const kind = m.selectionSession.kind;
  const padding = kind === "GROUP" ? PADDING_GROUP : PADDING_PUB;
  const url = m.selectionSession.url;

  const size = kind === "GROUP" ? await m.getGroupSizeWithUrl(url) : await m.getPublicationSizeWithUrl(url);

  console.info("SELECT BOOK INTENT", nb, url, size);

  if (m.selectionSession.state === "DEFAULT") {
    console.info("DEFAULT -> returns");
    m.selectionSession.nbChoice = 0;

  } else if (!nb) {
    m.selectionSession.nbChoice = 0;
    console.info("number from intent not defined");

  } else if (!size) {
    m.selectionSession.nbChoice = 0;
    console.info("size from feed request undefined .. the url has failed? " + url);

  } else if (nb < 1) {
    m.selectionSession.nbChoice = 0;
    m.say('selection.help.1');

  } else if (nb > padding || nb > size) {
    m.selectionSession.nbChoice = 0;
    m.say('selection.help.1');

  } else {
    // ok let's go
    m.selectionSession.nbChoice = nb;
    m.selectionSession.state = "FINISH";
  }

  m.nextScene = 'selection';
}

const anotherOne: THandlerFn = async (m) => {

  const { state, url } = m.selectionSession;

  if (state === "DEFAULT") {
    throw new Error("DEFAULT mode not allowed with another one intent");
  }

  if (state === "RUNNING") {

    const kind = m.selectionSession.kind;
    const nextUrl = kind === "GROUP" ? await m.getNexLinkGroupWithUrl(url) : await m.getNexLinkPublicationWithUrl(url);

    if (nextUrl) {
      m.selectionSession.url = nextUrl;
      m.selectionSession.nextUrlCounter++;
    } else {
      m.say("selection.enter.lastPage.notAvailable");
    }
  }

  m.nextScene = 'selection';
}

const help: THandlerFn = (m) => {

  m.say("selection.help.1");
  // m.say("selection.help.2");

  m.nextScene = "selection";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "selection";
}