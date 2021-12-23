import { ConversationV3 } from "@assistant/conversation";
import { Media } from "@assistant/conversation/dist/api/schema";
import { User, Scene } from "@assistant/conversation/dist/conversation/handler";  
import { TI18nKey } from "./translation";
import { StorageDto } from "./model/storage.dto";
import { TSdkScene } from "./sdk";

export enum MediaType {
  Audio = 'AUDIO',
  MediaStatusACK = 'MEDIA_STATUS_ACK',
  MediaTypeUnspecified = 'MEDIA_TYPE_UNSPECIFIED',
}

export enum OptionalMediaControl {
  OptionalMediaControlsUnspecified = 'OPTIONAL_MEDIA_CONTROLS_UNSPECIFIED',
  Paused = 'PAUSED',
  Stopped = 'STOPPED',
}

export type TPromptItem = TI18nKey | {[k: string]: any} | Media; //PromtItem type from @assistant/conversation

interface IUser extends User {
  params: StorageDto; 
}
interface IScene extends Scene {
  next: {
    name: TSdkScene;
  },
  name: TSdkScene;
}
export interface IConversationWithParams extends ConversationV3 {
  user: IUser;
  scene: IScene;
  add: (...promptItems: TPromptItem[]) => this;
  session: {
    params: {
      pubListUrl: string;
      groupListUrl: string;
      query: string;
      scene: TSdkScene;
      nextUrlCounter: number;
    }
  }
}