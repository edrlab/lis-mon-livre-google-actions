import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';


chai.should();

const scene = 'info';

const yaml = `intentEvents:
- handler:
    webhookHandler: info__intent__yes
  intent: "yes"
  transitionToScene: actions.scene.END_CONVERSATION
- handler:
    webhookHandler: info__intent__help
  intent: help
- handler:
    webhookHandler: info__intent__repeat
  intent: repeat
- handler:
    webhookHandler: info__intent__yes
  intent: membership
  transitionToScene: actions.scene.END_CONVERSATION
- handler:
    webhookHandler: info__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: info__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: info__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: info__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: info__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: info__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: info__on_enter
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
    it('on enter', async () => {
      body.handler.name = 'info__on_enter';
      body.scene.name = scene;

      // const message = `CELA about text. Would you like to find out more about CELA membership, or would you prefer to exit this skill?\n`;

      await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('yes or membership', async () => {
      body.handler.name = 'info__intent__yes';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      const message = `Signing up is easy, you can head on over to the CELA online platform at CELA Library dot c.a. Keep the name of your local library and your library or SQLA number handy, that's all you'll need. You can also ask for help at your local library. As soon as your membership is activated, you can come back to  start using the CELA library via Google Assistant.\n`;
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });

    it('repeat', async () => {
      body.handler.name = 'info__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('info');
    });

    // const help = `If you'd like to learn more about CELA membership - you can ask me by saying 'membership', or simply say 'stop' to exit this skill. If you have any other questions, we recommend reaching out to your local library for support. I'm listening?\n`;

    it('help', async () => {
      body.handler.name = 'info__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('info');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'info__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('info');
    });

    it('fallback 3', async () => {
      body.handler.name = 'info__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'info__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('info');
    });

    it('silence 3', async () => {
      body.handler.name = 'info__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
