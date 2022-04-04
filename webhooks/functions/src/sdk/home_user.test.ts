import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';
import {IWebPubView} from 'opds-fetcher-parser/build/src/interface/webpub';
import {BOOKSHELF_URL} from '../constants';


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
    webhookHandler: home_user__intent__recent_books
  intent: recent_books
- handler:
    webhookHandler: home_user__intent__current_book
  intent: current_book
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
      body.session.id = 'on enter'; // new session

      const message = '<speak>Would you like to consult your bookshelf, or browse our collections? You can also search for a book by saying search for, <break time=\"200ms\"/>followed by a book title or an author.\n</speak>';
      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state but new session', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'id'; // new session

      const message = '<speak>Would you like to consult your bookshelf, or browse our collections? You can also search for a book by saying search for, <break time=\"200ms\"/>followed by a book title or an author.\n</speak>';
      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);
      model.data.store.session.scene.home_user.state.should.to.be.eq('SESSION');
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state but new session undefined so the session data is not removed', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'on enter with session state but new session undefined so the session data is not removed'; // new session

      const message = '<speak>Would you like to consult your bookshelf, or browse our collections? You can also search for a book by saying search for, <break time=\"200ms\"/>followed by a book title or an author.\n</speak>';
      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);
      model.data.store.session.scene.home_user.state.should.to.be.eq('SESSION');
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with session state', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'test';

      const message = '<speak>Would you like to consult your bookshelf, or browse our collections? You can also search for a book by saying search for, <break time=\"200ms\"/>followed by a book title or an author.\n</speak>';
      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);
      model.data.store.session.scene.home_user.state.should.to.be.eq('SESSION');
      data.prompt.firstSimple.speech.should.to.be.eq(message);
    });
    it('on enter with a current playing no history', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'on enter with a current playing no history';

      const pullData = parsedDataClone();
      pullData.player.current.index = 9;
      pullData.player.current.url = 'https://my.url';
      pullData.player.current.time = 0;
      pullData.player.current.playing = true;


      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const data = await expressMocked(body, headers, pullData, undefined, webpub);
      console.log(JSON.stringify(data, null, 4));

      data.prompt.firstSimple.speech.should.to.be.eq('You are listening to the 10 chapter of my title, hello, which you can now resume reading.\n' +
      'And, of course, \n' +
      'You can consult your bookshelf, browse our collections or search for a book by its title or author. What is your choice?\n');
    });
    it('on enter with a current playing and history', async () => {
      body.handler.name = 'home_user__on_enter';
      body.scene.name = scene;
      body.session.id = 'on enter with a current playing and history';

      const pullData = parsedDataClone();
      pullData.player.current.index = 9;
      pullData.player.current.url = 'https://my.url';
      pullData.player.current.time = 0;
      pullData.player.current.playing = true;

      pullData.player.history = {
        // @ts-ignore
        1: {index: 0, time: 0, date: new Date()},
        2: {index: 0, time: 0, date: new Date()},
        3: {index: 0, time: 0, date: new Date()},
        4: {index: 0, time: 0, date: new Date()},
      };
      // pullData.player.history.set("1", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("2", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("3", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("4", {index: 0, time: 0, date: new Date()});

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const data = await expressMocked(body, headers, pullData, undefined, webpub);
      console.log(JSON.stringify(data, null, 4));

      data.prompt.firstSimple.speech.should.to.be.eq('You are listening to the 10 chapter of my title, hello, which you can now resume reading.\n' +
      'You are also reading 3 other recent books, which you can choose from.\n' +
      'And, of course, \n' +
      'You can consult your bookshelf, browse our collections or search for a book by its title or author. What is your choice?\n');
    });

    it('repeat', async () => {
      body.handler.name = 'home_user__intent__repeat';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);
      model.data.store.session.scene.home_user.state.should.to.be.eq('REPEAT');

      data.scene.next.name.should.to.be.eq('home_user');
    });
    it('search', async () => {
      body.handler.name = 'home_user__intent__search';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('search');
    });
    it('search with query', async () => {
      body.handler.name = 'home_user__intent__search';
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
      pullData.session.scene.search.state = 'DEFAULT';

      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.search.state.should.to.be.eq('FINISH');
      model.data.store.session.scene.search.query.should.to.be.eq('my query');
      data.scene.next.name.should.to.be.eq('search');
    });

    it('recents book', async () => {
      body.handler.name = 'home_user__intent__recent_books';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 9;
      pullData.player.current.url = 'https://my.url';
      pullData.player.current.time = 0;
      pullData.player.current.playing = false;

      pullData.player.history = {
        // @ts-ignore
        1: {index: 0, time: 0, date: new Date()},
        2: {index: 0, time: 0, date: new Date()},
        3: {index: 0, time: 0, date: new Date()},
        4: {index: 0, time: 0, date: new Date()},
      };
      // pullData.player.history.set("1", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("2", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("3", {index: 0, time: 0, date: new Date()});
      // pullData.player.history.set("4", {index: 0, time: 0, date: new Date()});
      const model = await storageModelMocked(pullData);

      const webpub: Partial<IWebPubView> = {
        title: 'my title',
        authors: [
          'hello',
          'world',
        ],
      };

      const data = await expressMocked(body, headers, undefined, undefined, webpub, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.url.should.to.be.eq('data://["1","2","3"]');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
    });

    it('current book available', async () => {
      body.handler.name = 'home_user__intent__current_book';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.player.current.index = 9;
      pullData.player.current.url = 'https://my.url';
      pullData.player.current.time = 0;
      pullData.player.current.playing = false;

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.scene.next.name.should.to.be.eq('player_prequel');
    });

    it('current book not available', async () => {
      body.handler.name = 'home_user__intent__current_book';
      body.scene.name = scene;

      const pullData = parsedDataClone();

      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      data.scene.next.name.should.to.be.eq('home_user');
      data.prompt.firstSimple.speech.should.to.be.eq('Your have no current book.\n');
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

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);

      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.from.should.to.be.eq('home_user__intent__bookshelf');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq(BOOKSHELF_URL);

      data.scene.next.name.should.to.be.eq('selection');
    });

    // const help = `You can search for a specific book by title or author, browse our collections or check your bookshelf to start reading one of your preselected books.\nWhat would you like to do?\n`;

    it('help', async () => {
      body.handler.name = 'home_user__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('fallback 1 and 2', async () => {
      body.handler.name = 'home_user__intent__help';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('fallback 3', async () => {
      body.handler.name = 'home_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_user');
    });

    it('silence 1 and 2', async () => {
      body.handler.name = 'home_user__intent__silence';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      // data.prompt.firstSimple.speech.should.to.be.eq(help);

      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('silence 3', async () => {
      body.handler.name = 'home_user__intent__fallback_end';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_user');
    });
  });
});
