import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';
import {IOpdsResultView} from 'opds-fetcher-parser/build/src/interface/opds';
import {IWebPubView} from 'opds-fetcher-parser/build/src/interface/webpub';

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

  const messageHelpers = (number: number, it: Array<[nb: number, title: string]>, nextPage = false) => {
    const a = 'Pick one of these by requesting the corresponding number.\n' + (nextPage ? 'Or ask for the next set.\n' : '');
    const b = it.reduce((pv, [nb, title]) => pv + `${nb}. ${title}\n`, '');
    const c = 'Which number do you choose?\n';
    return a + b + c;
  };

  const help = 'At this stage, you must choose a title among the proposed set, by mentioning its number, for example number 1. You can request other titles by using the Next or Previous commands.\n';

  describe('app', () => {
    it('on enter', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;


      // TODO
      // LOT of Code here because all messages will be in on-enter

      // test si state === "running" sinon forward vers la bonne scene
      // tant que state !=== 'finish' dire à l'utilisateur les resultats
      // soit de groupes ou soit de publications puis demander le numéro
      // lorsque le numéro est vérifier dans select book intent
      // vérifier le numéro dans la state machine et afficher la proposition
      // lorsque cela est la derniere page afficher la page en cours et dire un message
      //
      // ici ce trouve la machine a état de selection
      // nécéssite surement d'étoffer les états .. au lieu de les morcelés

      // state === running
      // 1) check url
      // 2) check page
      // 3) if (last page) ->say
      // 4) afficher resultat

      // state === finish
      // 1) check url
      // 2) check page ((else an error happen (reset ? )))
      // 3) routing table with from handler

      // 1) state === running
      // 2) vérifier url
      // 3) vérifier page
      // 4) afficher utilisateur
      // 5) attendre numéro
      // 6) checker ce numéro
      // 7) afficher utilisateur
      // 8) attendre num
      // 9) check num
      // 10) last page -> say user
      // 11) afficher user
      // 12) good choice user
      // 13) machine finish
      // 15) table de routage prochaine scene en fonction de sceneFrom

      const message = `Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.`;

      const pullData = parsedDataClone();

      // DEFAULT : trigger an error
      // pullData.session.scene.selection.state = 'DEFAULT';
      const data = await expressMocked(body, headers, pullData);

      data.prompt.firstSimple.speech.should.to.be.eq(message);

      // must redirect to home_user when the state machine not initialized
      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });

    it('on enter - state running - no url', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      const data = await expressMocked(body, headers, pullData);

      const message = `Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.`;
      data.prompt.firstSimple.speech.should.to.be.eq(message);
      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });

    const newFeed = (): Partial<IOpdsResultView> => ({
      publications: [
        {
          openAccessLinks: [
            {
              url: 'http://pub.url',
            },
          ],
          baseUrl: 'http://base.url',
          title: 'first publication',
          authors: [],
          numberOfPages: 0,
        },
        {
          openAccessLinks: [
            {
              url: 'http://pub.url',
            },
          ],
          baseUrl: 'http://base.url',
          title: 'second publication',
          authors: [],
          numberOfPages: 0,
        },
      ],
      groups: [
        {
          selfLink: {
            title: 'first group',
            url: 'http://group.url',
          },
        },
        {
          selfLink: {
            title: 'second group',
            url: 'http://group.url',
          },
        },
        // {
        //   selfLink: {
        //     title: 'third group',
        //     url: '',
        //   }
        // },
      ],
      // @ts-ignore
      links: {
        next: [
          {
            url: 'http://next.link',
          },
        ],
      },
    });

    const testStateRunningPublication = (n = false) => {
      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.kind = 'PUBLICATION';

      const feed: Partial<IOpdsResultView> = {
        publications: [
          {
            openAccessLinks: [
              {
                url: 'http://pub.url',
              },
            ],
            title: 'first publication',
            baseUrl: '',
            authors: [],
            numberOfPages: 0,
          },
          {
            openAccessLinks: [
              {
                url: 'http://pub.url',
              },
            ],
            title: 'second publication',
            baseUrl: '',
            authors: [],
            numberOfPages: 0,
          },
          {
            openAccessLinks: [
              {
                url: 'http://pub.url',
              },
            ],
            title: 'third publication',
            baseUrl: '',
            authors: [],
            numberOfPages: 0,
          },
        ],
      };
      const message = messageHelpers(3, [
        [1, 'first publication.'],
        [2, 'second publication.'],
        [3, 'third publication.'],
      ], n);

      console.log(message);


      return {pullData, feed, message};
    };
    const testStateRunningGroup = (n = false) => {
      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.kind = 'GROUP';

      const feed: Partial<IOpdsResultView> = {
        groups: [
          {
            selfLink: {
              title: 'first group',
              url: 'http://my.url',
            },
          },
          {
            selfLink: {
              title: 'second group',
              url: 'http://my.url',
            },
          },
          {
            selfLink: {
              title: 'third group',
              url: 'http://my.url',
            },
          },
        ],
      };
      const message = messageHelpers(3, [
        [1, 'first group.'],
        [2, 'second group.'],
        [3, 'third group.'],
      ], n);

      return {pullData, feed, message};
    };

    it('on enter - state running - publication empty', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      let {pullData, feed, message} = testStateRunningPublication();
      pullData.session.scene.selection.nextUrlCounter = 0;

      // @ts-ignore
      feed.publications = [];

      message = 'Uh Oh! Nothing to read here quite yet. Not to worry though, we can fix that right away!  Would you like to browse our collections? Or perhaps you\'d like to search for a specific book by author or book title?\n';

      const data = await expressMocked(body, headers, pullData, feed);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });
    it('on enter - state running - group empty', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      let {pullData, feed, message} = testStateRunningGroup();
      pullData.session.scene.selection.nextUrlCounter = 0;

      // @ts-ignore
      feed.groups = [];

      message = 'Uh Oh! Nothing to read here quite yet. Not to worry though, we can fix that right away!  Would you like to browse our collections? Or perhaps you\'d like to search for a specific book by author or book title?\n';

      const data = await expressMocked(body, headers, pullData, feed);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });
    it('on enter - state running - publication empty - from search', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      let {pullData, feed, message} = testStateRunningPublication();
      pullData.session.scene.selection.nextUrlCounter = 0;
      pullData.session.scene.selection.from = 'search__on_enter';
      const model = await storageModelMocked(pullData);

      // @ts-ignore
      feed.publications = [];

      message = 'It seems like the book you are looking for is currently unavailable in the EDRLAB Library.\n';

      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      model.data.store.session.scene.search.from.should.to.be.eq('selection__on_enter');
      model.data.store.session.scene.search.query.should.to.be.eq('');
      model.data.store.session.scene.search.state.should.to.be.eq('RUNNING');
      data.scene.next.name.should.to.be.eq('home_user');
    });

    it('on enter - state running - publication list first page with no next link', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningPublication();
      pullData.session.scene.selection.nextUrlCounter = 0;

      // @ts-ignore
      feed.links = {};

      const data = await expressMocked(body, headers, pullData, feed);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - group list first page with no next link', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningGroup();
      const data = await expressMocked(body, headers, pullData, feed);
      // @ts-ignore
      feed.links = {};

      // must say the first page
      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - publication list last page', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningPublication();
      pullData.session.scene.selection.nextUrlCounter = 3;
      // @ts-ignore
      feed.links = {};
      const data = await expressMocked(body, headers, pullData, feed);

      data.prompt.firstSimple.speech.should.to.be.eq('Here\'s the last available books.\n' + message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - group list last page', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningGroup();
      pullData.session.scene.selection.nextUrlCounter = 3;
      // @ts-ignore
      feed.links = {};
      const data = await expressMocked(body, headers, pullData, feed);

      // must say the first page
      data.prompt.firstSimple.speech.should.to.be.eq('Here\'s the last available groups.\n' + message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - publication list page > 0', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningPublication(true);
      pullData.session.scene.selection.nextUrlCounter = 3;
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url',
          },
        ],
      };
      const data = await expressMocked(body, headers, pullData, feed);

      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - group list last page > 0', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningGroup(true);
      pullData.session.scene.selection.nextUrlCounter = 3;
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url',
          },
        ],
      };
      const data = await expressMocked(body, headers, pullData, feed);

      // must say the first page
      data.prompt.firstSimple.speech.should.to.be.eq(message);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - publication list with next page - from bookshelf', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed, message} = testStateRunningPublication(true);
      pullData.session.scene.selection.nextUrlCounter = 0;
      pullData.session.scene.selection.from = 'home_user__intent__bookshelf';
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url',
          },
        ],
      };
      const data = await expressMocked(body, headers, pullData, feed);

      const message2 = 'Here are the first 3 titles on your bookshelf:\n' + message + 'Or perhaps you\'d like to explore the other titles on your bookshelf?\n';

      data.prompt.firstSimple.speech.should.to.be.eq(message2);
      // data.scene.next.name.should.to.be.eq('selection');
    });

    it('on enter - state running - recent books', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;

      const {pullData, feed} = testStateRunningPublication();
      pullData.session.scene.selection.nextUrlCounter = 0;
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.kind = 'PUBLICATION';
      pullData.session.scene.selection.url = 'data://["https://my.url","https://my.url","https://my.url"]';
      pullData.session.scene.selection.from = 'home_user__intent__recent_books';

      const webpub: Partial<IWebPubView> = {
        title: 'my test title',
        authors: ['author'],
      };

      const data = await expressMocked(body, headers, pullData, feed, webpub);

      data.prompt.firstSimple.speech.should.to.be.eq('Pick one of these by requesting the corresponding number.\n' +
      '1. my test title.\n' +
      '2. my test title.\n' +
      '3. my test title.\n' +
      'Which number do you choose?\n');
      // data.scene.next.name.should.to.be.eq('selection');
    });
    it('on_enter - groups - state == DEFAULT should throw', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;
      // body.intent.params = {
      //   number: {
      //     original: '3',
      //     resolved: 3,
      //   },
      // };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'GROUP';
      model.data.store.session.scene.selection.url = 'http://my.url';
      model.data.store.session.scene.selection.nbChoice = 3;
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      // THROWS !!

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
      model.data.store.session.scene.selection.state.should.to.be.eq('DEFAULT');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(3);
      data.prompt.firstSimple.speech.should.to.be.eq('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');
    });

    it('on_enter - pub - state == DEFAULT should throw', async () => {
      body.handler.name = 'selection__on_enter';
      body.scene.name = scene;
      // body.intent.params = {
      //   number: {
      //     original: '3',
      //     resolved: 3,
      //   },
      // };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      model.data.store.session.scene.selection.url = 'http://my.url';
      model.data.store.session.scene.selection.nbChoice = 0;
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      // THROWS !!

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
      model.data.store.session.scene.selection.state.should.to.be.eq('DEFAULT');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      data.prompt.firstSimple.speech.should.to.be.eq('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');
    });


    // @TODO
    // complete the test from handler
    // it('on enter - state running - group list last with next page - from collection', async () => {

    //   body.handler.name = 'selection__on_enter';
    //   body.scene.name = scene;

    //   const {pullData, feed, message} = testStateRunningGroup();
    //   pullData.session.scene.selection.nextUrlCounter = 3;
    //   // @ts-ignore
    //   feed.links = {
    //     next: [
    //       {
    //         url: "http://my.url"
    //       }
    //     ]
    //   };
    //   const data = await expressMocked(body, headers, pullData, feed);

    //   // must say the first page
    //   data.prompt.firstSimple.speech.should.to.be.eq(message);
    //   data.scene.next.name.should.to.be.eq('selection');

    // });
    it('select book - number 1', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '1',
          resolved: 1,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);

      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('player_prequel');
      model.data.store.session.scene.selection.state.should.to.be.eq('FINISH');
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(1);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.from.should.to.be.eq('main');
    });
    it('select book - number 2 ', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '2',
          resolved: 2,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('player_prequel');
      model.data.store.session.scene.selection.state.should.to.be.eq('FINISH');
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(2);
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0);
      model.data.store.session.scene.selection.from.should.to.be.eq('main');
    });

    it('select book - number 3 with only 2 pub available', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '3',
          resolved: 3,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
    });

    it('select book - state == DEFAULT should throw in on_enter instead of select_books', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '3',
          resolved: 3,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      // THROWS !!

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.state.should.to.be.eq('DEFAULT');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      // data.prompt.firstSimple.speech.should.to.be.eq('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
    });

    it('select book - number 10', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '10',
          resolved: 10,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.url = 'http://my.url';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.kind = 'PUBLICATION';
      const feed = newFeed();
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      // must be set in selection__on_enter not here : return all logics to on_enter
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0); // reset
      // or
      // say the fallback message if type is incorrect
      // need to check with google data
    });
    it('select book - group - number 1', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '1',
          resolved: 1,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'GROUP';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);

      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq('http://group.url');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
    });
    it('select book - group - number 2', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '2',
          resolved: 2,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'GROUP';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING');
      model.data.store.session.scene.selection.url.should.to.be.eq('http://group.url');
      model.data.store.session.scene.selection.kind.should.to.be.eq('PUBLICATION');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
    });

    it('select book - group - number 3 with only 2 pub available', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '3',
          resolved: 3,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'GROUP';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');

      // must be set in selection__on_enter not here : return all logics to on_enter
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
      // data.prompt.firstSimple.speech.should.to.be.eq('Pick one out of 3 titles by mentioning their numbers. You can also ask for \'another one\'.\n' +
      // 'Pick one of these by saying their numbers.\n' +
      // '1. first group.\n' +
      // '2. second group.\n' +
      // 'Which one would you like to start reading?\n');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0); // reset
    });
    it('select book - group - state == DEFAULT should throw on selection on_enter not in select_books', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '3',
          resolved: 3,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.kind = 'GROUP';
      model.data.store.session.scene.selection.url = 'http://my.url';
      const feed = newFeed();
      feed.publications?.length.should.to.be.eq(2);
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      // THROWS !!

      data.scene.next.name.should.to.be.eq('selection');
      model.data.store.session.scene.selection.state.should.to.be.eq('DEFAULT');
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0);
      // data.prompt.firstSimple.speech.should.to.be.eq('Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.');
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
    });

    it('select book - group - number 10', async () => {
      body.handler.name = 'selection__intent__selects_book';
      body.scene.name = scene;
      body.intent.params = {
        number: {
          original: '10',
          resolved: 10,
        },
      };

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.session.scene.selection.url = 'http://my.url';
      model.data.store.session.scene.selection.state = 'RUNNING';
      model.data.store.session.scene.selection.kind = 'GROUP';
      const feed = newFeed();
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      data.scene.next.name.should.to.be.eq('selection');
      // must be set in selection__on_enter not here : return all logics to on_enter
      (typeof data.prompt.firstSimple).should.to.be.eq('undefined');
      // data.prompt.firstSimple.speech.should.to.be.eq('Pick one out of 3 titles by mentioning their numbers. You can also ask for \'another one\'.\n' +
      // 'Pick one of these by saying their numbers.\n' +
      // '1. first group.\n' +
      // '2. second group.\n' +
      // 'Which one would you like to start reading?\n');
      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nbChoice.should.to.be.eq(0); // reset
      // or
      // say the fallback message if type is incorrect
      // need to check with google data
    });

    it('another one with machine not running', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('DEFAULT'); // equals to original state
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(0); // stay at 0
      model.data.store.session.scene.selection.url.should.to.be.eq(''); // reset

      // catch trap
      const message = 'Oops, something went wrong. I will exit the app. Feel free to reopen it as soon as possible.';
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('actions.scene.END_CONVERSATION');
    });

    it('another one with machine running but next link url is good with no publication available', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      pullData.session.scene.selection.kind = 'PUBLICATION';
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = {};
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url.next',
          },
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(3); // +1
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url'); // reset

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('another one with machine running but next link url is good with no groups available', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = {};
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url.next',
          },
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(3); // +1
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url'); // reset

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('another one with machine running - publication', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      pullData.session.scene.selection.kind = 'PUBLICATION';
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = newFeed();
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url.next',
          },
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url.next'); // reset
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(4); // +1

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('another one with machine running - group', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      pullData.session.scene.selection.kind = 'GROUP';
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = newFeed();
      // @ts-ignore
      feed.links = {
        next: [
          {
            url: 'http://my.url.next',
          },
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url.next'); // reset
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(4); // +1

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('another one with machine running and no next link available - publication', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      pullData.session.scene.selection.kind = 'PUBLICATION';
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = newFeed();
      // @ts-ignore
      feed.links = {
        next: [
          {url: ''},
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(3); // 3
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url'); // reset

      const message = 'no another results available.\n';
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('another one with machine running and no next link available - group', async () => {
      body.handler.name = 'selection__intent__another_one';
      body.scene.name = scene;

      const pullData = parsedDataClone();
      pullData.session.scene.selection.state = 'RUNNING';
      pullData.session.scene.selection.url = 'http://my.url';
      pullData.session.scene.selection.nextUrlCounter = 3;
      pullData.session.scene.selection.kind = 'GROUP';
      const model = await storageModelMocked(pullData);
      const feed: Partial<IOpdsResultView> = newFeed();
      // @ts-ignore
      feed.links = {
        next: [
          {url: ''},
        ],
      };
      const data = await expressMocked(body, headers, undefined, feed, undefined, model.data);

      model.data.store.session.scene.selection.state.should.to.be.eq('RUNNING'); // equals to original state
      model.data.store.session.scene.selection.nextUrlCounter.should.to.be.eq(3); // 3
      model.data.store.session.scene.selection.url.should.to.be.eq('http://my.url'); // reset

      const message = 'no another results available.\n';
      data.prompt.firstSimple.speech.should.to.be.eq(message);

      data.scene.next.name.should.to.be.eq('selection');
    });

    it('repeat', async () => {
      body.handler.name = 'selection__intent__repeat';
      body.scene.name = scene;

      const data = await expressMocked(body, headers);

      data.scene.next.name.should.to.be.eq('selection');
    });

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

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

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

      data.prompt.firstSimple.speech.should.to.be.eq('Bye!\n');

      // data.scene.next.name.should.to.be.eq('home_new_user');
    });
  });
});
