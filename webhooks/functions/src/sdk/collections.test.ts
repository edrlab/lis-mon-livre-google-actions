import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';
import {BOOKSHELF_URL, GENRE_LIST_URL, THEMATIC_LIST_URL} from '../constants';


chai.should();

const scene = 'collections';

const yaml = `intentEvents:
- handler:
    webhookHandler: collections__intent__bookshelf
  intent: bookshelf
- handler:
    webhookHandler: collections__intent__by_genre
  intent: by_genre
- handler:
    webhookHandler: collections__intent__by_theme
  intent: by_theme
- handler:
    webhookHandler: collections__intent__help
  intent: help
- handler:
    webhookHandler: collections__intent__fallback
  intent: actions.intent.NO_MATCH_1
- handler:
    webhookHandler: collections__intent__fallback
  intent: actions.intent.NO_MATCH_2
- handler:
    webhookHandler: collections__intent__fallback_end
  intent: actions.intent.NO_MATCH_FINAL
- handler:
    webhookHandler: collections__intent__silence
  intent: actions.intent.NO_INPUT_1
- handler:
    webhookHandler: collections__intent__silence
  intent: actions.intent.NO_INPUT_2
- handler:
    webhookHandler: collections__intent__silence_end
  intent: actions.intent.NO_INPUT_FINAL
onEnter:
  webhookHandler: collections__on_enter
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
      body.handler.name = 'collections__on_enter';
      body.scene.name = scene;

      const message = `Okay, would you prefer to get a choice of collections by theme or by genre?\n`;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });

    it('by genre', async () => {
      body.handler.name = 'collections__intent__by_genre';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.from.should.to.be.eq('collections__intent__by_genre');
      model.data.store.session.scene.selection.kind.should.to.be.eq('GROUP');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq(GENRE_LIST_URL);

      data.scene.next.name.should.to.be.eq('selection');
    });
    it('by theme', async () => {
      body.handler.name = 'collections__intent__by_theme';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.from.should.to.be.eq('collections__intent__by_theme');
      model.data.store.session.scene.selection.kind.should.to.be.eq('GROUP');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq(THEMATIC_LIST_URL);

      data.scene.next.name.should.to.be.eq('selection');
    });
    it('bookshelf', async () => {
      body.handler.name = 'collections__intent__bookshelf';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.from.should.to.be.eq('collections__intent__bookshelf');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq(BOOKSHELF_URL);

      data.scene.next.name.should.to.be.eq('selection');
    });

    const help = `To hear an overview of available themes, say 'by theme'. For an overview of available genres, say 'by genre'.\n`;

    it('help', async () => {
      body.handler.name = 'collections__intent__help';
      body.scene.name = scene;


      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('collections');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'collections__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('collections');
    });

    it('fallback 3', async () => {
      body.handler.name = 'collections__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'collections__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('collections');
    });

    it('silence 3', async () => {
      body.handler.name = 'collections__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
