import 'mocha';

import {ActionsOnGoogleTestManager} from '@assistant/conversation-testing';
import {ok} from 'assert';
import { inspect } from 'util';
import { DEFAULT_LOCALE, DEFAULT_SURFACE, HOME_PROMPT, MEMBER_PROMPT, PROJECT_ID, TRIGGER_PHRASE } from './constant';
import * as chai from 'chai';

const TEST_NUM = 8;
import * as fs from 'fs';

describe('My Action Test Suite', function () {
  // Set the timeout for each test run to 60s.
  this.timeout(60000);
  let test: ActionsOnGoogleTestManager;

  async function startConversation() {
    await test.sendQuery(TRIGGER_PHRASE);
    test.assertSpeech(HOME_PROMPT + " " + MEMBER_PROMPT);
    // test.assertText(HOME_PROMPT + " " + MEMBER_PROMPT);
    test.assertIntent('actions.intent.MAIN');
    test.assertScene('home_members_lvl2');

    await test.sendQuery(`setup test ${TEST_NUM}`);
    test.assertSpeech(`setup test ${TEST_NUM} ${MEMBER_PROMPT}`);

    // 123 : player therese_raquin_emile_zola.json
    await test.sendQuery(`test player 123`);
    test.assertSpeech(`test player 123 ${MEMBER_PROMPT}`);

    // RECHERCHE

    await test.sendQuery('lecture');
    test.assertSpeech(`Voulez-vous reprendre la lecture là où elle s'était arrêtée `);

    await test.sendQuery('non');

    let media = test.getMedia();
//    fs.writeFileSync('/tmp/media.json', JSON.stringify(media));
    chai.expect(media).to.deep.equal({
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
    });

    await test.sendQuery('reprend la lecture');

    media = test.getMedia();
    //    console.log(media);
    //
    //    same
    chai.expect(media).to.deep.equal({
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
    });


    //
    // resp = test.getLatestResponse();
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

  it('player resume listening | repprendre la lecture', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
