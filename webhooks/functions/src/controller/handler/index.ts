import { Assistant } from "../Assistant";
import { main } from "./main";

export const handler = (app = new Assistant({})) => {

  app.handle('main', main);
}