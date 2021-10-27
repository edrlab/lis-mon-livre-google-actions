import 'mocha';

import {env} from 'process';
import {ActionsOnGoogleTestManager} from '@assistant/conversation-testing';
import {ok, rejects} from 'assert';
import { inspect } from 'util';

const DEFAULT_LOCALE = 'fr-FR';
const DEFAULT_SURFACE = 'PHONE';
const CONTINUE_CONVO_PROMPT = "Bienvenue dans l'application d'écoute de livre audio valentin hauy Que voulez-vous faire ? Vous pouvez dire informations ou espace membres";

const PROJECT_ID = env['PROJECT_ID'] || '';
const TRIGGER_PHRASE = 'Parler avec valentin audio';

console.log(`PROJECT_ID=${PROJECT_ID}`);

ok(PROJECT_ID, 'no PROJECT_ID');

// tslint:disable:only-arrow-functions

describe('My Action Test Suite', function () {
  // Set the timeout for each test run to 60s.
  this.timeout(60000);
  let test: ActionsOnGoogleTestManager;

  async function startConversation() {
    await test.sendQuery(TRIGGER_PHRASE);
    test.assertSpeech(CONTINUE_CONVO_PROMPT);
    test.assertText(CONTINUE_CONVO_PROMPT);
    test.assertIntent('actions.intent.MAIN');
    test.assertScene('home_lvl1');

    let se = await test.sendQuery("espace membres");
    console.log(se);

    // test.assertSpeech("Bienvenue dans l'espace membres. Les commandes possibles sont, sélection, lecture, recherche. Que voulez-vous faire ?");
    let resp = test.getLatestResponse();
    console.log(inspect(resp, {showHidden: false, depth: null, colors: true}));

    test.assertText("Pour continuer d'utiliser valentin audio, je dois associer votre compte valentin audio à Google. Êtes-vous d'accord ?");

    se = await test.sendQuery("oui");
    console.log(se);

    resp = test.getLatestResponse();
    console.dir(resp);
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

  it('trigger only', async () => {
    await startConversation();
    await test.sendQuery("quitter");
    // test.assertConversationEnded();
  });
});
