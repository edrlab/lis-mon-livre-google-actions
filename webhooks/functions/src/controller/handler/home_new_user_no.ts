import { NAME } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const home_new_user_no = (app: Assistant) => {

  app.handle("home_new_user_no__on_enter", enter);
  app.handle("home_new_user_no__intent__fallback", help);
  app.handle("home_new_user_no__intent__fallback_end", missing);
  app.handle("home_new_user_no__intent__help", help);
  app.handle("home_new_user_no__intent__no", no);
  app.handle("home_new_user_no__intent__repeat", repeat);
  app.handle("home_new_user_no__intent__silence", help);
  app.handle("home_new_user_no__intent__silence_end", missing);
  app.handle("home_new_user_no__intent__yes", yes);

}

const enter: THandlerFn = (m) => {
  m.say('home_new_user.no.1', {name: NAME});
  m.say('home_new_user.no.2', {name: NAME});
}

const help: THandlerFn = (m) => {

  m.say("home_new_user_no.help.1", {name: NAME});

  m.nextScene = "home_new_user_no";
}

const yes: THandlerFn = (m) => {

  // m.say("info.about.1", {name: NAME});

  m.nextScene = "info";
}

const no: THandlerFn = (m) => {

  m.nextScene = "actions.scene.END_CONVERSATION";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "home_new_user_no";
}