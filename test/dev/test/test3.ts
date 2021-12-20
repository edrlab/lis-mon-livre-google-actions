import 'mocha';

import {ActionsOnGoogleTestManager} from '@assistant/conversation-testing';
import {ok} from 'assert';
import { inspect } from 'util';
import { DEFAULT_LOCALE, DEFAULT_SURFACE, HOME_PROMPT, MEMBER_PROMPT, PROJECT_ID, TRIGGER_PHRASE } from './constant';

const TEST_NUM = 3;

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

    // RECHERCHE

    await test.sendQuery('recherche');

    test.assertSpeech(`Que voulez-vous écouter ?`);

    await test.sendQuery('zola');

    await test.assertSpeech(`J'ai trouvé 2 publications.\nnuméro 1 : Thérèse Raquin de Emile Zola.\nnuméro 2 : L'assommoir de Emile Zola.\n\nPour choisir l'une des publications, dites son numéro.\n`);

    await test.sendQuery('0');

    await test.assertSpeech(`Le numéro 0 est inconnu. Veuillez choisir un autre numéro. J'ai trouvé 2 publications.\nnuméro 1 : Thérèse Raquin de Emile Zola.\nnuméro 2 : L'assommoir de Emile Zola.\n\nPour choisir l'une des publications, dites son numéro.\n`);

    test.assertScene('select_publication');

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

  it('search with zola query', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
