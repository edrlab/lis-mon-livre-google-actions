import { AccountLinkingStatus } from "@assistant/conversation/dist/api/schema";
import { NAME } from "../../constants";
import { TMachine } from "../../type";

export const main = (machine: TMachine) => {

  const isLinked = machine.isLinked;

  if (isLinked === AccountLinkingStatus.Linked) {

    machine.say("main.welcome.user.1", { name: NAME});
    machine.say("main.welcome.user.2");
    machine.say("main.welcome.user.3");

    machine.nextScene = "home_user";
  } else {

    machine.say("main.welcome.newUser.1", { name: NAME});
    machine.say("main.welcome.newUser.2", { name: NAME});
    machine.say("main.welcome.newUser.3");

    machine.nextScene = "home_new_user";
  }


}