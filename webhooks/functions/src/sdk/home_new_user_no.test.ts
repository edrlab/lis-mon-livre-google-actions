import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';


chai.should();

const scene = 'home_new_user_no';

const yaml = `intentEvents:
- handler:
    webhookHandler: home_new_user_no__intent__yes
  intent: "yes"
- handler:
    webhookHandler: home_new_user_no__intent__no
  intent: "no"
- handler:
    webhookHandler: home_new_user_no__intent__repeat
  intent: repeat
- handler:
    webhookHandler: home_new_user_no__intent__help
  intent: help
- handler:
    webhookHandler: home_new_user_no__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: home_new_user_no__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: home_new_user_no__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: home_new_user_no__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: home_new_user_no__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: home_new_user_no__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: home_new_user_no__on_enter
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
      body.handler.name = 'home_new_user_no__on_enter';
      body.scene.name = scene;

      const message = `In order to read books using the EDRLAB Library via Google, you need to be a registered EDRLAB member and link your account.\nWould you like to learn more about registering on the EDRLAB Library?\n`;
      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('yes', async () => {
      body.handler.name = 'home_new_user_no__intent__yes';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // const message = `EDRLAB is a national non-profit organization established by Canadian public libraries to champion the fundamental right of Canadians with print disabilities to access media and reading materials in the format of their choice, including audio, braille, e-text and descriptive video. Would you like to find out more about EDRLAB membership, or would you prefer to exit this skill?\n`;
      // data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('info');
    });

    it('no', async () => {
      body.handler.name = 'home_new_user_no__intent__no';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });

    it('repeat', async () => {
      body.handler.name = 'home_new_user_no__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    const help = `In order to use the EDRLAB library via your Google Home, you must be a registered member of the library and link your account. Would you like to learn more about the EDRLAB Livrary?\n`;

    it('help', async () => {
      body.handler.name = 'home_new_user_no__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'home_new_user_no__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    it('fallback 3', async () => {
      body.handler.name = 'home_new_user_no__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'home_new_user_no__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    it('silence 3', async () => {
      body.handler.name = 'home_new_user_no__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user_no');
    });
  });
});
