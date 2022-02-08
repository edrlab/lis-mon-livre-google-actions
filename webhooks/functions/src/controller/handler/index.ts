import { Assistant } from "../Assistant";
import { home_new_user } from "./home_new_user";
import { home_new_user_maybe_later } from "./home_new_user_maybe_later";
import { info } from "./info";
import { main } from "./main";

export const handler = (app = new Assistant({})) => {

  app.handle('main', main);

  home_new_user(app);
  home_new_user_maybe_later(app);
  info(app);
}