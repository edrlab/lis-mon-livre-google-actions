import { ConversationV3 } from "@assistant/conversation";
import { User, Scene } from "@assistant/conversation/dist/conversation/handler";  
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
  session: {
    params: {
      [key: string]: any;
    }
  }
}