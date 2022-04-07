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
    webhookHandler: player_prequel__intent__yes
  intent: "yes"
- handler:
    webhookHandler: player_prequel__intent__no
  intent: "no"
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
    it('on enter - no need to ask to resume bad url', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();

      const message = `Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.`;

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });
    it('on enter - no need to ask to resume - start from scratch', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 0;
      pullData.player.current.playing = false;
      pullData.player.current.time = 0;
      pullData.player.current.url = 'http://my.url';

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      data.scene.next.name.should.to.be.eq('player');
    });
    it('on enter - need to ask - and answer yes or no', async () => {
      body.handler.name = 'player_prequel__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 2;
      pullData.player.current.playing = false;
      pullData.player.current.time = 330;
      pullData.player.current.url = 'http://my.url';

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq('Great choice! Before we start, let me remind you how this reader works. You can put your read on hold at any time by saying \'Hey Google, Pause\'. \'Hey Google, Resume\' will let you pick up your reading where you last left it. You can also navigate between tracks by saying \'Hey Google, next\' or \'Hey Google, previous\' at any time.\n' +
             'Do you want to pick up where it left off?\n');
    });

    it('no', async () => {
      body.handler.name = 'player_prequel__intent__no';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 2;
      pullData.player.current.playing = false;
      pullData.player.current.time = 330;
      pullData.player.current.url = 'http://my.url';

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      model.data.store.player.current.index?.should.to.be.eq(0);
      model.data.store.player.current.playing.should.to.be.eq(true);
      model.data.store.player.current.url?.should.to.be.eq('http://my.url');
      model.data.store.player.current.time?.should.to.be.eq(0);
      data.scene.next.name.should.to.be.eq('player');
    });

    it('yes', async () => {
      body.handler.name = 'player_prequel__intent__yes';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 2;
      pullData.player.current.playing = false;
      pullData.player.current.time = 330;
      pullData.player.current.url = 'http://my.url';

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      model.data.store.player.current.index?.should.to.be.eq(2);
      model.data.store.player.current.playing.should.to.be.eq(true);
      model.data.store.player.current.url?.should.to.be.eq('http://my.url');
      model.data.store.player.current.time?.should.to.be.eq(330);
      data.scene.next.name.should.to.be.eq('player');
    });
  });
});
