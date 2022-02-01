import { ConversationV3, ConversationV3App } from "@assistant/conversation";
import { Media } from "@assistant/conversation/dist/api/schema";
import { TI18nKey } from "./translation";

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

export interface IConversationWithParams extends ConversationV3 {
}

export interface IConversationV3App extends ConversationV3App<IConversationWithParams> {
  handle: (path: string, fn: (obj: any) => any) => this;
}