
import {env} from 'process';
import {ok} from 'assert';

export const DEFAULT_LOCALE = 'fr-FR';
export const DEFAULT_SURFACE = 'PHONE';
export const HOME_PROMPT =  "Bienvenue dans Valentin Audio.";
export const MEMBER_PROMPT = "Les commandes possibles sont: sélection, lecture, recherche. Que voulez-vous faire ?";

export const PROJECT_ID = env['PROJECT_ID'] || '';
export const TRIGGER_PHRASE = 'Parler avec valentin audio dev';


console.log(`PROJECT_ID=${PROJECT_ID}`);

ok(PROJECT_ID, 'no PROJECT_ID');


