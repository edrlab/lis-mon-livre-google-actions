import { app } from "./controller/assistant";

app.handle('main', async ({conv}) => {

  conv.add('main');

});
