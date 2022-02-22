import { SEARCH_URL_FN } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";

export const search = (app: Assistant) => {

  app.handle("search__on_enter", enter);
  app.handle("search__intent__search", query);
  app.handle("search__intent__search_query", query);
}

const enter: THandlerFn = (m) => {

  const { state, query } = m.searchSession;

  if (state === "RUNNING") {
    m.say('search.enter.1');
    // wait intent search query

  } else if (state === "FINISH") {

    if (!query) {
      m.nextScene = "search";
      return ;
    }

    m.initAndGoToSelectionSession({
      kind: 'PUBLICATION',
      url: SEARCH_URL_FN(encodeURIComponent(query)), // @todo do you have to encode Url ?
      from: 'search__on_enter',
    });

  } else {
    throw new Error("invalid search state");
  }
}

const query: THandlerFn = (m) => {

  // query from search intent
  // query from search intent and search_query intent
  // same intent but search_query as a free text parsing
  m.setQuerySearch();
  m.nextScene = "search";
}
