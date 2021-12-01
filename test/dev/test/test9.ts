import 'mocha';

import {ActionsOnGoogleTestManager} from '@assistant/conversation-testing';
import {ok} from 'assert';
import { inspect } from 'util';
import { DEFAULT_LOCALE, DEFAULT_SURFACE, HOME_PROMPT, MEMBER_PROMPT, PROJECT_ID, TRIGGER_PHRASE } from './constant';
import * as chai from 'chai';

const TEST_NUM = 9;
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


    await test.sendQuery(`sélections`);
    test.assertSpeech(`Les sélections disponibles sont ma liste, sélections thématiques, sélections par genre. Que voulez-vous faire ?`);

    await test.sendQuery(`ma liste`);
    test.assertSpeech(`J'ai trouvé 2 publications.\n Pour choisir une publication, dite son numéros.numéro 1 : L'assommoir de Emile Zola\nnuméro 2 : Du contrat social de Rousseau\n`);

    await test.sendQuery(`2`);

    const media = test.getMedia();
    // fs.writeFileSync('/tmp/media.json', JSON.stringify(media));
    chai.expect(media).to.deep.equal({
      "optionalMediaControls": [
        "PAUSED",
        "STOPPED"
      ],
      "mediaObjects": [
        {
          "name": "Du contrat social - 1",
          "description": "",
          "url": "https://archive.org/download/Du-contrat-social/Du_contrat_social_livre1.mp3",
          "image": {
            "large": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/Social_contract_rousseau_page.jpg",
              "alt": "Du contrat social",
              "height": 0,
              "width": 0
            },
            "image": "large"
          }
        },
        {
          "name": "Du contrat social - 2",
          "description": "",
          "url": "https://archive.org/download/Du-contrat-social/Du_contrat_social_livre2.mp3",
          "image": {
            "large": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/Social_contract_rousseau_page.jpg",
              "alt": "Du contrat social",
              "height": 0,
              "width": 0
            },
            "image": "large"
          }
        },
        {
          "name": "Du contrat social - 3",
          "description": "",
          "url": "https://archive.org/download/Du-contrat-social/Du_contrat_social_livre3.mp3",
          "image": {
            "large": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/Social_contract_rousseau_page.jpg",
              "alt": "Du contrat social",
              "height": 0,
              "width": 0
            },
            "image": "large"
          }
        },
        {
          "name": "Du contrat social - 4",
          "description": "",
          "url": "https://archive.org/download/Du-contrat-social/Du_contrat_social_livre4.mp3",
          "image": {
            "large": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/Social_contract_rousseau_page.jpg",
              "alt": "Du contrat social",
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
    test = new ActionsOnGoogleTestManager({ projectId: PROJECT_ID });
    await test.writePreviewFromDraft();
    test.setSuiteLocale(DEFAULT_LOCALE);
    test.setSuiteSurface(DEFAULT_SURFACE);
  });

  afterEach('post test cleans', async () => {
    test.cleanUpAfterTest();
  });

  it('my list', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
