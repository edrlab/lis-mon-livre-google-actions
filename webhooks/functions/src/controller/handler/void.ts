import { THandlerFn } from "../../type";

export const missing: THandlerFn = (m) => {
  m.say("void");
} 