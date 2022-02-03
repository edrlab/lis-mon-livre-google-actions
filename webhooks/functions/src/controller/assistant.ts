import {conversation} from '@assistant/conversation';
import {PROJECT_ID} from '../constants';
import {IConversationV3App, THandlerFn} from '../type';
import {TSdkHandler} from '../typings/sdkHandler';
import {Machine} from './Machine';

export const app = conversation({
  verification: PROJECT_ID,
  debug: true,
}) as IConversationV3App;

app.catch((conv, error) => {
  console.error('APP CATCH ERROR', error);

  if (conv.scene.next) {
    conv.scene.next.name = conv.scene.name;
  } // loop
});

// app.middleware((_conv, _framework) => {});

export const handle = (path: TSdkHandler, fn: THandlerFn) => {
  app.handle(path, async (conv) => {
    const machine = new Machine(conv);

    const bearerToken = conv.user.params.bearerToken;
    await machine.begin({bearerToken});

    await Promise.resolve(fn(machine));

    await machine.end();
  });
};
