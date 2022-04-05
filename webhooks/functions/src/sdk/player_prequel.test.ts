import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';
import {IWebPubView} from 'opds-fetcher-parser/build/src/interface/webpub';


chai.should();

const scene = 'player_prequel';

const yaml = `intentEvents:
- handler:
    webhookHandler: player_prequel__intent__help
  intent: help
- handler:
    webhookHandler: player_prequel__intent__repeat
  intent: repeat
- handler:
    webhookHandler: player_prequel__intent__player_prequel_back
  intent: player_prequel_back
- handler:
    webhookHandler: player_prequel__intent__player_prequel_resume
  intent: player_prequel_resume
- handler:
    webhookHandler: player_prequel__intent__player_prequel_start
  intent: player_prequel_start
- handler:
    webhookHandler: player_prequel__intent__player_prequel_summary
  intent: player_prequel_summary
- handler:
    webhookHandler: player_prequel__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: player_prequel__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: player_prequel__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: player_prequel__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: player_prequel__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: player_prequel__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: player_prequel__on_enter
`;

describe(scene + ' handler', () => {
  describe('sdk', () => {
    it('check main scene', (done) => {
      shell(`cat custom/scenes/${scene}.yaml`, (stdout) => {
        stdout.should.to.be.eq(yaml);
      }, done);
    });
  });

  describe('app', () => {
    it('on enter - bad url', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();

      const message = `Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.`;

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });
    it('on enter - home_user_current_book', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 0;
      pullData.player.current.time = 0;
      pullData.player.current.url = 'http://my.url';

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      pullData.session.scene.player_prequel.from = "home_user__intent__current_book";

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      data.scene.next.name.should.to.be.eq('player');

      model.data.store.session.scene.player_prequel.from.should.to.be.eq('main');
      model.data.store.session.scene.player_prequel.player.should.to.be.deep.eq({});;
      model.data.store.player.current.should.to.be.deep.eq(pullData.player.current);
    });
    it('on enter - from selection and playing', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 2;
      pullData.session.scene.player_prequel.player.time = 330;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      (typeof model.data.store.player.current.index).should.be.eq('undefined');
      (typeof model.data.store.player.current.time).should.be.eq('undefined');
      (typeof model.data.store.player.current.url).should.be.eq('undefined');

      model.data.store.session.scene.player_prequel.player.index?.should.be.eq(2);
      model.data.store.session.scene.player_prequel.player.time?.should.be.eq(330);
      model.data.store.session.scene.player_prequel.player.url?.should.be.eq('https://my.url');
      model.data.store.session.scene.player_prequel.from.should.be.eq('selection__on_enter');

      data.prompt.firstSimple.speech.should.to.be.eq("You've chosen my title, that you have already started.\n" +
      'Do you want to resume reading, listen the summary or come back to the list?\n');

    });
    it('on enter - from selection and no playing', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 0;
      pullData.session.scene.player_prequel.player.time = 0;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      (typeof model.data.store.player.current.index).should.be.eq('undefined');
      (typeof model.data.store.player.current.time).should.be.eq('undefined');
      (typeof model.data.store.player.current.url).should.be.eq('undefined');

      // @ts-ignore
      model.data.store.session.scene.player_prequel.player.index.should.be.eq(0);
      // @ts-ignore
      model.data.store.session.scene.player_prequel.player.time.should.be.eq(0);
      // @ts-ignore
      model.data.store.session.scene.player_prequel.player.url.should.be.eq('https://my.url');
      model.data.store.session.scene.player_prequel.from.should.be.eq('selection__on_enter');

      data.prompt.firstSimple.speech.should.to.be.eq("You've chosen my title.\n" +
      'Do you want to start reading, listen the summary or come back to the list?\n');
    });

    it('back', async () => {
      body.handler.name = 'player_prequel__intent__player_prequel_back';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 0;
      pullData.session.scene.player_prequel.player.time = 0;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);
      
      (typeof model.data.store.session.scene.player_prequel.player.index).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.time).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.url).should.be.eq('undefined');
      model.data.store.session.scene.player_prequel.from.should.be.eq('selection__on_enter');

      data.scene.next.name.should.to.be.eq('selection');

    });

    it('start', async () => {
      body.handler.name = 'player_prequel__intent__player_prequel_start';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 0;
      pullData.session.scene.player_prequel.player.time = 0;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);
      
      (typeof model.data.store.session.scene.player_prequel.player.index).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.time).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.url).should.be.eq('undefined');
      model.data.store.session.scene.player_prequel.from.should.be.eq('selection__on_enter');

      // @ts-ignore
      model.data.store.player.current.index.should.be.eq(0);
      // @ts-ignore
      model.data.store.player.current.time.should.be.eq(0);
      // @ts-ignore
      model.data.store.player.current.url.should.be.eq('https://my.url');

      data.scene.next.name.should.to.be.eq('player');

      data.prompt.firstSimple.speech.should.to.be.eq("Great choice! Before we start, let me remind you how this reader works. You can put your read on hold at any time by saying 'Hey Google, Pause'. 'Hey Google, Resume' will let you pick up your reading where you last left it. You can also navigate between chapters by saying 'Hey Google, next' or 'Hey Google, previous' at any time.\n" +
      "Let's start reading my title.\n");
      
    });
    it('resume', async () => {
      body.handler.name = 'player_prequel__intent__player_prequel_start';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 234;
      pullData.session.scene.player_prequel.player.time = 435;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);
      
      (typeof model.data.store.session.scene.player_prequel.player.index).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.time).should.be.eq('undefined');
      (typeof model.data.store.session.scene.player_prequel.player.url).should.be.eq('undefined');
      model.data.store.session.scene.player_prequel.from.should.be.eq('selection__on_enter');

      // @ts-ignore
      model.data.store.player.current.index.should.be.eq(234);
      // @ts-ignore
      model.data.store.player.current.time.should.be.eq(435);
      // @ts-ignore
      model.data.store.player.current.url.should.be.eq('https://my.url');

      data.scene.next.name.should.to.be.eq('player');

      data.prompt.firstSimple.speech.should.to.be.eq("Great choice! Before we start, let me remind you how this reader works. You can put your read on hold at any time by saying 'Hey Google, Pause'. 'Hey Google, Resume' will let you pick up your reading where you last left it. You can also navigate between chapters by saying 'Hey Google, next' or 'Hey Google, previous' at any time.\n" +
      "Let's start reading my title.\n");
      
    });
    it('summary', async () => {
      body.handler.name = 'player_prequel__intent__player_prequel_summary';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.player_prequel.player.index = 234;
      pullData.session.scene.player_prequel.player.time = 435;
      pullData.session.scene.player_prequel.player.url = 'https://my.url';

      pullData.session.scene.player_prequel.from = "selection__on_enter";
      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
        description: 'this the world',
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq("This is the summary: this the world.\n");
    });

  });
});
