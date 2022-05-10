import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';

/* eslint-disable no-unused-vars */

chai.should();

const scene = 'player';

const yaml = `intentEvents:
- handler:
    webhookHandler: player__intent__media_status_finished
  intent: actions.intent.MEDIA_STATUS_FINISHED
- handler:
    webhookHandler: player__intent__media_status_paused
  intent: actions.intent.MEDIA_STATUS_PAUSED
- handler:
    webhookHandler: player__intent__media_status_stopped
  intent: actions.intent.MEDIA_STATUS_STOPPED
- handler:
    webhookHandler: player__intent__media_status_failed
  intent: actions.intent.MEDIA_STATUS_FAILED
onEnter:
  webhookHandler: player__on_enter
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
    it('on enter with no playing url', async () => {
      body.handler.name = 'player__on_enter';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      const message = 'Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.';

      data.prompt.firstSimple.speech.should.to.be.eq(message);

      // catch trap

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });
    it('media status finished', async () => {
      body.handler.name = 'player__intent__media_status_finished';
      body.scene.name = scene;
      body.context.media.index = 2;
      body.context.media.progress = '40s';

      const pullData = parsedDataClone();
      pullData.player.current.index = 0;
      pullData.player.current.time = 0;
      pullData.player.current.url = 'http://my.url';
      const model = await storageModelMocked(pullData);

      const webpub = undefined;

      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      model.data.store.player.current.index = 2;
      model.data.store.player.current.time?.should.to.be.eq(0);
      model.data.store.player.current.url?.should.to.be.eq('http://my.url');
    });
    it('media status stopped', async () => {
      body.handler.name = 'player__intent__media_status_stopped';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);
    });
    it('media status paused', async () => {
      body.handler.name = 'player__intent__media_status_stopped';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);
    });
    it('media status failed', async () => {
      body.handler.name = 'player__intent__media_status_failed';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);
    });
  });
});
