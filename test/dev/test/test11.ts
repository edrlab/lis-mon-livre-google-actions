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
    test.assertSpeech(`Les sélections disponibles sont ma liste, sélections thématiques, sélections par genre, Que voulez-vous faire ?`);

    await test.sendQuery(`selections par genre`);

    test.assertSpeech(``);

    await test.sendQuery(`numéro 2`);

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

  it('genre selection', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
