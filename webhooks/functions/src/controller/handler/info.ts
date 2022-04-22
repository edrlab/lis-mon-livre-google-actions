
import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const info = (app: Assistant) => {

  app.handle("info__on_enter", enter);
  app.handle("info__intent__yes", membership);
  app.handle("info__intent__no", no);
  app.handle("info__intent__fallback", help);
  app.handle("info__intent__fallback_end", missing);
  app.handle("info__intent__help", help);
  app.handle("info__intent__repeat", repeat);
  app.handle("info__intent__silence", help);
  app.handle("info__intent__silence_end", missing);

}

const enter: THandlerFn = (m) => {
  m.say('info.about.1');
}

const membership: THandlerFn = (m) => {

  m.say('info.yesOrMembership.1');

  m.nextScene = "actions.scene.END_CONVERSATION";
};

const no: THandlerFn = (m) => {

  m.say("bye.1");

  m.nextScene = "actions.scene.END_CONVERSATION";
};

const help: THandlerFn = (m) => {

  // m.say('info.help.1');

  m.nextScene = "info";
}

const repeat: THandlerFn = (m) => {
  m.nextScene = 'info';
};
