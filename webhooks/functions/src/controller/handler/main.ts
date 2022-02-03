import { NAME } from "../../constants";
import { TMachine } from "../../type";

export const main = (machine: TMachine) => {

  machine.say("main.welcome.1", { name: NAME});
  machine.say("main.welcome.2", { name: NAME});
  machine.say("main.welcome.3");

}