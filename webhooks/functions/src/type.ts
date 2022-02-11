import { ConversationV3, ConversationV3App } from "@assistant/conversation";
import { Media } from "@assistant/conversation/dist/api/schema";
import { Machine } from "./controller/Machine";
import { TI18nKey } from "./translation";
import { TSdkScene } from "./typings/sdkScene";

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

export interface IConversationV3 extends ConversationV3 {
}

export interface IConversationWithParams extends IConversationV3 {
}

export interface IConversationV3App extends ConversationV3App<IConversationWithParams> {
}

export type TMachine = Machine;

export type THandlerFn = (machine: TMachine) => TMachine | undefined | void | Promise<void>;

export type TSdkScene2 = TSdkScene | "actions.scene.END_CONVERSATION";