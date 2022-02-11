import { AccountLinkingStatus } from "@assistant/conversation/dist/api/schema";
import { NAME } from "../../constants";
import { TMachine } from "../../type";

export const main = (machine: TMachine) => {

  const isLinked = machine.isLinked;

  if (isLinked === AccountLinkingStatus.Linked) {

    machine.say("main.welcome.linked.1", { name: NAME});

    machine.nextScene = "home_user";
  } else {

    machine.say("main.welcome.noLinked.1", { name: NAME});

    machine.nextScene = "home_new_user";
  }
}