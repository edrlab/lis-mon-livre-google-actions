import { Assistant } from "../Assistant";
import { home_new_user } from "./home_new_user";
import { main } from "./main";

export const handler = (app = new Assistant({})) => {

  app.handle('main', main);

  home_new_user(app);
}