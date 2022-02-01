import { conversation } from "@assistant/conversation";
import { PROJECT_ID } from "./constants";
import { IConversationV3App } from "./type";

const app = conversation({
  verification: PROJECT_ID,
  debug: true,
}) as IConversationV3App;

const appHandle: typeof app.handle = app.handle.bind(app);
app.handle = (path, fn) => {
  const ret = appHandle(path, async (conv) => {

    await Promise.resolve(fn({conv}));

  });
  return ret;
}


app.handle('main', async ({conv}) => {

  conv.add('main');

});