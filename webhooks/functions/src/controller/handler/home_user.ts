import { NAME } from "../../constants";
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

const enter: THandlerFn = (m) => {
  m.say("home_user.enter.1", { name: NAME });
  m.say("home_user.enter.2", { name: NAME });
  m.say("home_user.enter.3", { name: NAME });
}

const search: THandlerFn = (m) => {
  m.nextScene = "search";
}

const collections: THandlerFn = (m) => {
  m.nextScene = "collections";
}

const bookshelf: THandlerFn = (m) => {
  m.nextScene = "bookshelf";
}

const help: THandlerFn = (m) => {

  m.say("home_user.help.1", {name: NAME});
  m.say("home_user.help.2", {name: NAME});

  m.nextScene = "home_user";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "home_user";
}