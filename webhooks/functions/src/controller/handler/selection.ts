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

  m.nextScene = 'selection';
}

const help: THandlerFn = (m) => {

  m.say("selection.help.1");
  m.say("selection.help.2");

  m.nextScene = "selection";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "selection";
}