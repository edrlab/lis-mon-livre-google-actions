import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';


chai.should();

const scene = 'home_user';

const yaml = `intentEvents:
- handler:
    webhookHandler: home_user__intent__help
  intent: help
- handler:
    webhookHandler: home_user__intent__repeat
  intent: repeat
- handler:
    webhookHandler: home_user__intent__bookshelf
  intent: bookshelf
- handler:
    webhookHandler: home_user__intent__collections
  intent: collections
- handler:
    webhookHandler: home_user__intent__search
  intent: search
- handler:
    webhookHandler: home_user__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: home_user__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: home_user__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: home_user__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: home_user__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: home_user__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: home_user__on_enter
`;

describe('home_user handler', () => {
  describe('sdk', () => {
    it('check main scene', (done) => {
      shell(`cat custom/scenes/${scene}.yaml`, (stdout) => {
        stdout.should.to.be.eq(yaml);
      }, done);
    });
  });

  describe('app', () => {
    it('on enter', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;

      const message = `Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?\n`;
      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state but new session', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'newSession'; // new session

      const message = `Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?\n`;
      const pullData = parsedDataClone();
      pullData.session.scene.home_user.state = 'SESSION';
      pullData.user.sessionId = 'id';

      const data = await expressMocked(body, headers, pullData);
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state but new session undefined so the session data is not removed', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'newSession'; // new session

      const message = `Would you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection ?\n`;
      const pullData = parsedDataClone();
      pullData.session.scene.home_user.state = 'SESSION';
      pullData.user.sessionId = 'id';

      const data = await expressMocked(body, headers, pullData);
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'id';

      const message = `What would you like to do?\n`;
      const pullData = parsedDataClone();
      pullData.session.scene.home_user.state = 'SESSION';
      pullData.user.sessionId = 'id';

      const data = await expressMocked(body, headers, pullData);
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('repeat', async () => {
      body.handler.name = 'home_user__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('home_user');
    });
    it('search', async () => {
      body.handler.name = 'home_user__intent__search';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('search');
    });

    it('browse collections', async () => {
      body.handler.name = 'home_user__intent__collections';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('collections');
    });

    it('bookshelf', async () => {
      body.handler.name = 'home_user__intent__bookshelf';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('bookshelf');
    });

    const help = `You can search for a specific book by title or author, browse our collections or check your bookshelf to start reading one of your preselected books.\nWhat would you like to do?\n`;

    it('help', async () => {
      body.handler.name = 'home_user__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'home_user__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('fallback 3', async () => {
      body.handler.name = 'home_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'home_user__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('silence 3', async () => {
      body.handler.name = 'home_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('need to replace this message\n');

      // data.scene.next.name.should.to.be.eq('home_user');
    });
  });
});
