import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';


chai.should();

const scene = 'selection';

const yaml = `intentEvents:
- handler:
    webhookHandler: selection__intent__selects_book
  intent: selects_book
- handler:
    webhookHandler: selection__intent__repeat
  intent: repeat
- handler:
    webhookHandler: selection__intent__another_one
  intent: another_one
- handler:
    webhookHandler: selection__intent__help
  intent: help
- handler:
    webhookHandler: selection__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: selection__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: selection__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: selection__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: selection__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: selection__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: selection__on_enter
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
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const message = `Here are the first 3 titles on your bookshelf:\n`;

      // TODO
      // LOT of Code here because all messages will be in on-enter

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });

    it('select book', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;

      // TODO check type validation

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('selection');
      // or
      // say the fallback message if type is incorrect
      // need to check with google data
    });

    it('another one', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      // TODO check session data page incr

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('repeat', async () => {
      body.handler.name = 'selection__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('selection');
    });

    const help = `Pick one out of 3 titles by mentioning their letter, A - B or C, or ask for their summary by saying 'Summary of A'. You can also ask for 'another one' or directly search by genre, author or book title.\nWhat would you like to do?\n`;

    it('help', async () => {
      body.handler.name = 'selection__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'selection__intent__fallback';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('fallback 3', async () => {
      body.handler.name = 'selection__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'selection__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('silence 3', async () => {
      body.handler.name = 'selection__intent__silence_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
