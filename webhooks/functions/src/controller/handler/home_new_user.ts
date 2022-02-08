import { NAME } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const home_new_user = (app: Assistant) => {

  app.handle("home_new_user__on_enter", enter);
  app.handle("home_new_user__intent__fallback", help);
  app.handle("home_new_user__intent__fallback_end", missing);
  app.handle("home_new_user__intent__help", help);
  app.handle("home_new_user__intent__maybe_later", maybeLater);
  app.handle("home_new_user__intent__no", no);
  app.handle("home_new_user__intent__repeat", repeat);
  app.handle("home_new_user__intent__silence", help);
  app.handle("home_new_user__intent__silence_end", missing);
  app.handle("home_new_user__intent__yes", yes);

}

const enter: THandlerFn = (m) => {
  m.say("main.welcome.newUser.1", { name: NAME });
  m.say("main.welcome.newUser.2", { name: NAME });
  m.say("main.welcome.newUser.3");
}

const help: THandlerFn = (m) => {

  m.say("home_new_user.help.1", {name: NAME});
  m.say("home_new_user.help.2", {name: NAME});

  m.nextScene = "home_new_user";
}

const maybeLater: THandlerFn = (m) => {

  m.say("home_new_user.maybeLater.1", {name: NAME});
  m.say("home_new_user.maybeLater.2")

  m.nextScene = "home_new_user_maybe_later";
} 

const yes: THandlerFn = (m) => {

  // do nothing

}

const no: THandlerFn = (m) => {

  m.say("home_new_user.no.1", {name: NAME});
  m.say("home_new_user.no.2", {name: NAME});

  m.nextScene = "home_new_user_no";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "home_new_user";
}