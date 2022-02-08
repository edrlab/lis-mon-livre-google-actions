import { NAME } from "../../constants";
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const info = (app: Assistant) => {


  app.handle("info__intent__yes", membership);
  app.handle("info__intent__fallback", help);
  app.handle("info__intent__fallback_end", missing);
  app.handle("info__intent__help", help);
  app.handle("info__intent__repeat", repeat);
  app.handle("info__intent__silence", help);
  app.handle("info__intent__silence_end", missing);

}

const membership: THandlerFn = (m) => {

  m.say('info.yesOrMembership.1', {name: NAME});

  m.nextScene = "actions.scene.END_CONVERSATION";
};

const help: THandlerFn = (m) => {

  m.say('info.help.1', {name: NAME});

  m.nextScene = "info";
}

const repeat: THandlerFn = (m) => {

  m.say('info.about.1', {name: NAME});

  m.nextScene = 'info';
};
