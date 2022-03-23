import { THandlerFn } from "../../type";
import { Assistant } from "../Assistant";

export const player_prequel = (app: Assistant) => {

  app.handle("player_prequel__on_enter", enter);
  app.handle("player_prequel__intent__yes", yes);
  app.handle("player_prequel__intent__no", no);

}

const enter: THandlerFn = async (m) => {
  
  const isPlaying = m.isCurrentlyPlaying();

  const isRegular = m.isARegularUser;
  const a = m.playerCurrent.playing;
  if (!isRegular || !a) {
    m.say("player.explain");
  }

  if (isPlaying) {
    m.say("player.askResumeLastOffset");
  } else {

    await intro(m);
    m.nextScene = "player";
  }
  m.playerCurrent.playing = true;

}

const intro: THandlerFn = async (m) => {

  const {title} = await m.getCurrentPlayingTitleAndChapter();
  m.say("player.start", {title});
  
  
  // m.say("player.start2", {title});
}

const yes: THandlerFn = async (m) => {
  
  await intro(m);
  m.playerCurrent.playing = true;
  m.nextScene = "player";
}

const no: THandlerFn = async (m) => {

  m.playerCurrent.index = 0;
  m.playerCurrent.time = 0;
  
  await intro(m);
  m.playerCurrent.playing = true;
  m.nextScene = "player";
}



