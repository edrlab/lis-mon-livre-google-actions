import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';


chai.should();

const scene = 'home_new_user_maybe_later';

const yaml = `intentEvents:
- handler:
    webhookHandler: home_new_user_maybe_later__intent__learn_more
  intent: learn_more
- handler:
    webhookHandler: home_new_user_maybe_later__intent__repeat
  intent: repeat
- handler:
    webhookHandler: home_new_user_maybe_later__intent__link_account
  intent: link_account
- handler:
    webhookHandler: home_new_user_maybe_later__intent__help
  intent: help
- handler:
    webhookHandler: home_new_user_maybe_later__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: home_new_user_maybe_later__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: home_new_user_maybe_later__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: home_new_user_maybe_later__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: home_new_user_maybe_later__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: home_new_user_maybe_later__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: home_new_user_maybe_later__on_enter
`;

describe('home_new_user_maybe_later handler', () => {
  describe('sdk', () => {
    it('check main scene', (done) => {
      shell(`cat custom/scenes/${scene}.yaml`, (stdout) => {
        stdout.should.to.be.eq(yaml);
      }, done);
    });
  });

  describe('app', () => {
    it('on enter', async () => {
      body.handler.name = 'home_new_user_maybe_later__on_enter';
      body.scene.name = scene;

      const message = `Of course! you can learn more about EDRLAB or quit for now.\nWhat would you like to do?\n`;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('link account', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__link_account';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('home_new_user_AccountLinking');
    });

    it('learn more', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__learn_more';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      const message = `EDRLAB about text. Would you like to find out more about EDRLAB membership, or would you prefer to exit this skill?\n`;
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('info');
    });

    it('repeat', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('home_new_user_maybe_later');
    });

    const help = `You can ask me to link your account, or to learn more about EDRLAB. You can also exit this skill, by simply saying 'stop'. What would you like to do?\n`;

    it('help', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_maybe_later');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_maybe_later');
    });

    it('fallback 3', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_maybe_later');
    });

    it('silence 3', async () => {
      body.handler.name = 'home_new_user_maybe_later__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
