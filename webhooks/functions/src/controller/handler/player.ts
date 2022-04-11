import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";

export const player = (app: Assistant) => {

  app.handle("player__on_enter", enter);
  app.handle("player__intent__media_status_stopped", stopped);
  app.handle("player__intent__media_status_finished", finished);
  app.handle("player__intent__media_status_paused", paused);
  app.handle("player__intent__media_status_failed", failed);
  app.handle("player__intent__player_prequel_resume", resume);

}

const enter: THandlerFn = async (m) => {
  
  await m.player();
}

const stopped: THandlerFn = async (m) => {

  m.persistMediaPlayer();
  m.mediaPlayerAck();

  m.nextScene = "actions.scene.END_CONVERSATION";
}

const paused: THandlerFn = async (m) => {

  m.persistMediaPlayer();
  m.mediaPlayerAck();
}

const failed: THandlerFn = async (m) => {
  
  m.say("error.1");
  m.nextScene = "home_user";
}

const resume: THandlerFn = async (m) => {
  await m.player();
}

const finished: THandlerFn = async (m) => {

  m.persistMediaPlayer(true);

  m.nextScene = "home_user";
};