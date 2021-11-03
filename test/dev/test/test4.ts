import 'mocha';

import {ActionsOnGoogleTestManager} from '@assistant/conversation-testing';
import {ok} from 'assert';
import { inspect } from 'util';
import { DEFAULT_LOCALE, DEFAULT_SURFACE, HOME_PROMPT, MEMBER_PROMPT, PROJECT_ID, TRIGGER_PHRASE } from './constant';
import * as fs from 'fs';
import * as chai from 'chai';

const TEST_NUM = 4;

describe('My Action Test Suite', function () {
  // Set the timeout for each test run to 60s.
  this.timeout(60000);
  let test: ActionsOnGoogleTestManager;

  async function startConversation() {
    await test.sendQuery(TRIGGER_PHRASE);
    test.assertSpeech(HOME_PROMPT + " " + MEMBER_PROMPT);
    test.assertText(HOME_PROMPT + " " + MEMBER_PROMPT);
    test.assertIntent('actions.intent.MAIN');
    test.assertScene('home_members_lvl2');

    await test.sendQuery(`setup test ${TEST_NUM}`);

    test.assertSpeech(`setup test ${TEST_NUM} ${MEMBER_PROMPT}`);

    // RECHERCHE

    await test.sendQuery('recherche');

    test.assertSpeech(`Que voulez-vous écouter ?`);

    await test.sendQuery('zola');

    await test.assertSpeech(`Il y a 2 publications :\n Pour choisir une publication dite son numéronumero 1 : Thérèse Raquin de Emile Zola\nnumero 2 : L'assommoir de Emile Zola\n`);

    await test.sendQuery('0');

    await test.assertSpeech(`Le numéro 0 est inconnu. Veuillez choisir un autre numéro. Pour choisir une publication dite son numéro`);

    test.assertScene('select_pub_after_search');

    await test.sendQuery('1');

    const resp: any = test.getLatestResponse();

    // console.log(resp);
    // console.log(inspect(resp, {showHidden: false, depth: null, colors: true}));
    //

    chai.expect(JSON.stringify(resp.output.actionsBuilderPrompt.content)).to.equal(JSON.stringify({
      "media": {
        "optionalMediaControls": [
          "PAUSED",
          "STOPPED"
        ],
        "mediaObjects": [
          {
            "name": "Thérèse Raquin - 1",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap01-03.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 2",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap04-06.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 3",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap07-09.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 4",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap10-12.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 5",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap13-16.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 6",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap17-18.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 7",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap19-20.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 8",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap21-22.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 9",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap23-25.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 10",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap26-27.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 11",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap28-29.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          },
          {
            "name": "Thérèse Raquin - 12",
            "description": "",
            "url": "https://archive.org/download/Therese-Raquin/Therese-Raquin-Chap30-32.mp3",
            "image": {
              "large": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Raquin.jpg",
                "alt": "Thérèse Raquin",
                "height": 0,
                "width": 0
              },
              "image": "large"
            }
          }
        ],
        "startOffset": {
          "seconds": "0",
          "nanos": 0
        },
        "mediaType": "AUDIO"
      },
      "content": "media"
    }));

    test.assertScene('player'); 
    
  }

  before('before all', async () => {
    // Load project settings to read project ID and trigger phrase.
    test = new ActionsOnGoogleTestManager({projectId: PROJECT_ID});
    await test.writePreviewFromDraft();
    test.setSuiteLocale(DEFAULT_LOCALE);
    test.setSuiteSurface(DEFAULT_SURFACE);
  });

  afterEach('post test cleans', async () => {
    test.cleanUpAfterTest();
  });

  it('search with bad query', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
