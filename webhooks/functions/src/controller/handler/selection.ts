import { NAME } from "../../constants";
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