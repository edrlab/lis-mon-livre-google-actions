import { BOOKSHELF_URL, GENRE_LIST_URL, NAME, THEMATIC_LIST_URL } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const collections = (app: Assistant) => {

  app.handle("collections__on_enter", enter);
  app.handle("collections__intent__bookshelf", bookshelf);
  app.handle("collections__intent__by_genre", genre);
  app.handle("collections__intent__by_theme", theme);
  app.handle("collections__intent__fallback", help);
  app.handle("collections__intent__fallback_end", missing);
  app.handle("collections__intent__help", help);
  app.handle("collections__intent__silence", help);
  app.handle("collections__intent__silence_end", missing);

}

const enter: THandlerFn = (m) => {
  m.say('collections.enter.1');
}

const bookshelf: THandlerFn = (m) => {

  m.initAndGoToSelectionSession({
    kind: 'PUBLICATION',
    url: BOOKSHELF_URL,
    from: 'collections__intent__bookshelf',
  });
}

const genre: THandlerFn = (m) => {
  
  m.initAndGoToSelectionSession({
    kind: 'GROUP',
    url: GENRE_LIST_URL,
    from: 'collections__intent__by_genre',
  });
}

const theme: THandlerFn = (m) => {
  
  m.initAndGoToSelectionSession({
    kind: 'GROUP',
    url: THEMATIC_LIST_URL,
    from: 'collections__intent__by_theme',
  });
}

const help: THandlerFn = (m) => {

  m.say('collections.help.1');

  m.nextScene = "collections";
}
