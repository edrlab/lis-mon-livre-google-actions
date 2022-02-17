import { Assistant } from "../Assistant";
import { collections } from "./collections";
import { home_new_user } from "./home_new_user";
import { home_new_user_maybe_later } from "./home_new_user_maybe_later";
import { home_new_user_no } from "./home_new_user_no";
import { home_user } from "./home_user";
import { info } from "./info";
import { main } from "./main";
import { player } from "./player";
import { search } from "./search";
import { selection } from "./selection";

export const handler = (app = new Assistant({})) => {

  app.handle('main', main);

  app.handle('cancel', (m) => {
    m.say('bye.1');
  });

  app.handle('fallback_1', (m) => {
    m.say('fallback.1');
  });

  app.handle('fallback_2', (m) => {
    m.say('fallback.2');
  });

  app.handle('fallback_end', (m) => {
    m.say('bye.1'); 
  });

  app.handle('silence_1', (m) => {
    m.say('silence.1');
  });

  app.handle('silence_2', (m) => {
    m.say('silence.2');
  });

  app.handle('silence_end', (m) => {
    m.say('bye.1'); 
  });

  home_user(app);
  home_new_user(app);
  home_new_user_no(app);
  home_new_user_maybe_later(app);
  info(app);
  selection(app);
  player(app);
  search(app);
  collections(app);
}
