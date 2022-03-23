import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';
import {SEARCH_URL_FN} from '../constants';


chai.should();

const scene = 'search';

const yaml = `intentEvents:
- handler:
    webhookHandler: search__intent__search_query
  intent: search_query
- handler:
    webhookHandler: search__intent__search
  intent: search
onEnter:
  webhookHandler: search__on_enter
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
    it('on enter default state', async () => {
      body.handler.name = 'search__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = '';
      pullData.session.scene.search.state = 'DEFAULT';

      const message = `Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.`;

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });
    it('on enter no query available and running', async () => {
      body.handler.name = 'search__on_enter';
      body.scene.name = scene;

      const message = `What book or author are you looking for ?\n`;

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = '';
      pullData.session.scene.search.state = 'RUNNING';

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter no query available and running', async () => {
      body.handler.name = 'search__on_enter';
      body.scene.name = scene;

      const message = `In the meanwhile, is there another title or author you'd like to search for?\n`;

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = '';
      pullData.session.scene.search.state = 'RUNNING';
      pullData.session.scene.search.from = 'selection__on_enter';

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      model.data.store.session.scene.search.from.should.to.be.eq('main');
    });
    it('on enter query and finish state', async () => {
      body.handler.name = 'search__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = 'my query';
      pullData.session.scene.search.state = 'FINISH';

      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.from.should.to.be.eq('search__on_enter');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq(SEARCH_URL_FN('my%20query')); // @TODO check url encoding

      // request url with query
      // and set nextScene to selections

      data.scene.next.name.should.to.be.eq('selection');
    });
    it('search', async () => {
      body.handler.name = 'search__intent__search';
      body.scene.name = scene;
      body.intent.params = {
        query: {
          original: 'my query',
          resolved: 'my query',
        },
      };

      // parse query and state = FINISH

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = '';
      pullData.session.scene.search.state = 'RUNNING';

      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.search.state.should.to.be.eq('FINISH');
      model.data.store.session.scene.search.query.should.to.be.eq('my query');
      data.scene.next.name.should.to.be.eq('search');
    });
    it('query search', async () => {
      body.handler.name = 'search__intent__search_query';
      body.scene.name = scene;
      body.intent.params = {
        query: {
          original: 'my query',
          resolved: 'my query',
        },
      };

      // parse query and state = FINISH

      const pullData = parsedDataClone();

      pullData.session.scene.search.query = '';
      pullData.session.scene.search.state = 'RUNNING';

      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.search.state.should.to.be.eq('FINISH');
      model.data.store.session.scene.search.query.should.to.be.eq('my query');
      data.scene.next.name.should.to.be.eq('search');
    });
  });
});
