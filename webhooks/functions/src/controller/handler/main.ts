import { AccountLinkingStatus } from "@assistant/conversation/dist/api/schema";

import { TMachine } from "../../type";

export const main = (machine: TMachine) => {

  const isLinked = machine.isLinked;

  if (isLinked === AccountLinkingStatus.Linked) {

    machine.say("main.welcome.linked.1");

    if (machine.authenticationState === "NO_LINKED") {
      machine.authenticationState = "NEWLY_LINKED";
    } else if (machine.authenticationState === "NEWLY_LINKED") {
      machine.authenticationState = "LINKED";
    } // authenticationState === LINKED raise the end of the state machine

    machine.nextScene = "home_user";
  } else {

    machine.say("main.welcome.noLinked.1");

    // machine.authenticationState = "NO_LINKED";

    machine.nextScene = "home_new_user";
  }
}