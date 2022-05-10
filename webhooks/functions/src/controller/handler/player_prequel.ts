import { t } from "i18next";
import { THandlerFn, TMachine } from "../../type";
import { TSdkScene } from "../../typings/sdkScene";
import { Assistant } from "../Assistant";
import { missing } from "./void";

export const player_prequel = (app: Assistant) => {

  app.handle("player_prequel__on_enter", enter);
  app.handle("player_prequel__intent__player_prequel_summary", summary);
  app.handle("player_prequel__intent__player_prequel_back", back);
  app.handle("player_prequel__intent__player_prequel_resume", resume);
  app.handle("player_prequel__intent__player_prequel_start", start);
  app.handle("player_prequel__intent__help", help);
  app.handle("player_prequel__intent__repeat", repeat);
  app.handle("player_prequel__fallback", help);
  app.handle("player_prequel__fallback_end", missing);
  app.handle("player_prequel__silence", help);
  app.handle("player_prequel__silence_end", help);

}

const enter: THandlerFn = async (m) => {

  const from = m.playerPrequelSession.from;
  // const fromScene = from.split("__")[0] as TSdkScene;
  // const state = m.getSessionState('player_prequel');

  if (from === "home_user__intent__current_book") {

    // from home user last book

    // go to player direct
    // check if playing available

    m.playerPrequelSession.player = m.playerCurrent;
    const isPlayingAvailable = m.isPlayingAvailableInPlayerPrequelSession();

    if (isPlayingAvailable) {
      m.playerPrequelSession.from = "main";

      await startPlaying(m);
      return ;
    }
  }

  // from selection

  // > vous avez choisi <TITLE>
  const { title } = await m.getCurrentPlayingInfo(m.playerPrequelSession.player);

  const isPlaying = m.isCurrentlyPlayingInPlayerPrequelSession();
  if (isPlaying) {
    m.say("player_prequel.enter.1", { title, resume: m.t('player_prequel.enter.1-continue') });
    m.say("player_prequel.enter.2", { resumeOrStart: m.t('player_prequel.enter.2-continue') });

  } else {

    m.say("player_prequel.enter.1", { title, resume: m.t('player_prequel.enter.1-begin') });
    m.say("player_prequel.enter.2", { resumeOrStart: m.t('player_prequel.enter.2-begin') });
  }

}

// help scene
// player_prequel.help

//
// A tout moment vous pouvez demandé le lecture du résumé du livre,
// demandé qui l'as écrit, obtenir le temps d'écoute du livre,
// ou tout simplement naviguer dans la table des matiere.

const startPlaying = async (m: TMachine) => {

  const isRegular = m.isARegularUser;
  if (!isRegular) {
    m.say("player.explain");
  }

  m.initPlayerCurrentWithPlayerPrequelSession();
  const { title } = await m.getCurrentPlayingInfo();
  const resume = m.isCurrentlyPlaying();
  if (resume) {
    m.say("player.start2", { title });
  } else {
    m.say("player.start", { title });
  }
  m.nextScene = "player";

  m.resetPlayerInPLayerPrequelSession();
  m.resetSelectionSession();
}

const back: THandlerFn = async (m) => {

  m.resetPlayerInPLayerPrequelSession();
  m.selectionSession.state = "RUNNING";
  m.selectionSession.nbChoice = 0;
  m.nextScene = 'selection';
};

const resume: THandlerFn = async (m) => {

  await startPlaying(m);
};

const start: THandlerFn = async (m) => {

  await startPlaying(m);
};

const repeat: THandlerFn = async (m) => {

  m.nextScene = "player_prequel";
}

const help: THandlerFn = async (m) => {

  // help message
  m.say("player_prequel.help.1");
}

const summary: THandlerFn = async (m) => {

  const {description} = await m.getCurrentPlayingInfo(m.playerPrequelSession.player);
  
  if (!description) {

    // no description
    m.say("player_prequel.noSummary");
  } else {
    m.say("player_prequel.summarize", {summary: description});
  }

  m.say("player_prequel.summary.1");

  // loop
  // m.nextScene = 'player_prequel';
};