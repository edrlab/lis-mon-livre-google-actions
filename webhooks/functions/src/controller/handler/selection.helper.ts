import { IStorageSession } from "../../model/storage.interface";

export const resetSelection = (): IStorageSession["scene"]["selection"] => ({
  from: 'main',
  kind: 'GROUP',
  nextUrlCounter: 0,
  state: "DEFAULT",
  url: "",
  nbChoice: 0,
});
export const resetSessionsSelection = (session: IStorageSession) => {

  session.scene.selection.from = 'main';
  session.scene.selection.kind = 'GROUP';
  session.scene.selection.nextUrlCounter = 0;
  session.scene.selection.state = "DEFAULT";
  session.scene.selection.url = "";
  session.scene.selection.nbChoice = 0;
}