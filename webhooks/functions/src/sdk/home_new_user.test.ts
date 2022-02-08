import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';


chai.should();

const scene = 'home_new_user';

const yaml = `intentEvents:
- handler:
    webhookHandler: home_new_user__intent__help
  intent: help
- handler:
    webhookHandler: home_new_user__intent__maybe_later
  intent: maybe_later
- handler:
    webhookHandler: home_new_user__intent__no
  intent: "no"
- handler:
    webhookHandler: home_new_user__intent__repeat
  intent: repeat
- handler:
    webhookHandler: home_new_user__intent__yes
  intent: "yes"
  transitionToScene: home_new_user_AccountLinking
- handler:
    webhookHandler: home_new_user__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: home_new_user__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: home_new_user__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: home_new_user__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: home_new_user__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: home_new_user__on_enter
`;

describe('home_new_user handler', () => {
  describe('sdk', () => {
    it('check main scene', (done) => {
      shell(`cat custom/scenes/${scene}.yaml`, (stdout) => {
        stdout.should.to.be.eq(yaml);
      }, done);
    });
  });

  describe('app', () => {
    it('on enter', async () => {
      body.handler.name = 'home_new_user__on_enter';
      body.scene.name = scene;

      const message = `Welcome to EDRLAB Library!\nTo fully enjoy your audiobooks and access your personal bookshelf, you will need to link your EDRLAB account.\nWould you like to do so now ?\n`;
      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);

    });
    it('yes', async () => {
      body.handler.name = 'home_new_user__intent__yes';
      body.scene.name = scene;

      await expressMocked(body, headers);

      // expect authentication
      // automatic transition to account linking
    });

    it('no', async () => {
      body.handler.name = 'home_new_user__intent__no';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      console.log(data.prompt.firstSimple);

      const message = `In order to read books using the EDRLAB Library via Google, you need to be a registered EDRLAB member and link your account.\nWould you like to learn more about EDRLAB?\n`;
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('home_new_user_no');
    });

    it('maybeLater', async () => {
      body.handler.name = 'home_new_user__intent__maybe_later';
      body.scene.name = scene;

      const message = `Of course! you can learn more about EDRLAB or quit for now.\nWhat would you like to do?\n`;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('home_new_user_maybe_later');
    });

    const help = `To fully experience EDRLAB Library, and enjoy your favorite audiobooks via Google, you'll need to connect your CELA account. To do so, answer 'yes' when prompted and follow the instructions. I will then send a connection link, that you will find into the Google Home application. You will have to log in to your EDRLAB account. You'll only have to do this once, and you'll be all set to start enjoying the wonderful world of EDRLAB books for hours on end!\nWould you like to link your account right now?\n`;

    it('help', async () => {
      body.handler.name = 'home_new_user__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'home_new_user__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('fallback 3', async () => {
      body.handler.name = 'home_new_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'home_new_user__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 3', async () => {
      body.handler.name = 'home_new_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
