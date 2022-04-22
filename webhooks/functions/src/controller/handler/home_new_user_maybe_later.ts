
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const home_new_user_maybe_later = (app: Assistant) => {

  app.handle("home_new_user_maybe_later__on_enter", enter);
  app.handle("home_new_user_maybe_later__intent__fallback", help);
  app.handle("home_new_user_maybe_later__intent__fallback_end", missing);
  app.handle("home_new_user_maybe_later__intent__help", help);
  app.handle("home_new_user_maybe_later__intent__repeat", repeat);
  app.handle("home_new_user_maybe_later__intent__silence", help);
  app.handle("home_new_user_maybe_later__intent__silence_end", missing);
  app.handle("home_new_user_maybe_later__intent__link_account", linkAccount);
  app.handle("home_new_user_maybe_later__intent__learn_more", learnMore);

}

const enter: THandlerFn = (m) => {
  // m.say("home_new_user.maybeLater.1", { name: NAME });
  // m.say("home_new_user.maybeLater.2", { name: NAME });

  m.say("home_new_user_maybe_later.help.1");
}

const linkAccount: THandlerFn = (m) => {

  m.nextScene = "home_new_user_AccountLinking";
}

const help: THandlerFn = (m) => {

  // m.say("home_new_user_maybe_later.help.1");

  m.nextScene = "home_new_user_maybe_later";
}

const repeat: THandlerFn = (m) => {

  m.nextScene = "home_new_user_maybe_later";
}

const learnMore: THandlerFn = (m) => {

  // m.say("info.about.1", { name: NAME });

  m.nextScene = "info";
}