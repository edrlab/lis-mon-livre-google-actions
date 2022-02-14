import { Assistant } from "../Assistant";
import { home_new_user } from "./home_new_user";
import { home_new_user_maybe_later } from "./home_new_user_maybe_later";
import { home_new_user_no } from "./home_new_user_no";
import { home_user } from "./home_user";
import { info } from "./info";
import { main } from "./main";
import { selection } from "./selection";

export const handler = (app = new Assistant({})) => {

  app.handle('main', main);

  app.handle('cancel', () => {});

  home_user(app);
  home_new_user(app);
  home_new_user_no(app);
  home_new_user_maybe_later(app);
  info(app);
  selection(app);
}
