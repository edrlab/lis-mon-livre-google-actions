
export const SELECTION_URL = 'https://storage.googleapis.com/audiobook_edrlab/groups/popular.json';
export const SEARCH_URL = 'https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}';
export const THEMATIC_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/thematic_list.json';
export const GENRE_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/genre_list.json';
export const DEFAULT_LANGUAGE: TLang = 'fr';

type TLang = 'fr' | 'en';
type TI18nValue = (param: {[k: string]: any}) => string;
type TI18nItem = Required<Record<typeof DEFAULT_LANGUAGE, TI18nValue>> & Partial<Record<TLang, TI18nValue>>;

export type TI18nKey = keyof typeof _i18n;

const _i18n = {
  'error.bearerTokenNotDefined': {
    'fr': ({}) => `Aucun identifiant défini`,
    'en': ({}) => `bearerToken not defined`,
  },
  'error.catch': {
    'fr': ({}) => `une erreur s'est produite`,
    'en': ({}) => `an error happen`,
  },
  'error.convadd': {
    'fr': ({}) => `conv.add value incorrect`,
    'en': ({}) => `conv.add value incorrect`,
  },
  'main.welcome': {
    'fr': ({}) => `Bienvenue dans l\'application d\'écoute de livre audio valentin hauy`,
    'en': ({}) => `Bienvenue dans l\'application d\'écoute de livre audio valentin hauy`,
  },
  'home.welcome': {
    'fr': ({ }) => `Que voulez-vous faire ? Vous pouvez dire informations ou espace membres`,
    'en': ({}) => `Que voulez-vous faire ? Vous pouvez dire informations ou espace membres`,
  },
  'test.webhook': {
    'fr': ({message}) => `webhook works: ${message}`,
  },
  'home.information': {
    'fr': ({}) => `Voici les informations sur l\'association`,
  },
  'homeMembers.welcome.1': {
    'fr': ({}) => `Bienvenue dans l'espace membres. Les commandes possibles sont: sélection, lecture, recherche. `,
  },
  'homeMembers.welcome.2': {
    'fr': ({}) => `Que voulez-vous faire ?`,
  },
  'homeMembers.resumeAudiobook.noCurrentListening': {
    'fr': ({}) => `aucune lecture en cours`,
  },
  'homeMembers.selection.welcome': {
    'fr': ({}) => `Les sélections disponibles sont ma liste, sélections thématiques, sélections par genre, Que voulez-vous faire ?`,
  },
  'homeMembers.selection.publication': {
    'fr': ({}) => `Pour choisir une publication dite son numéro`,
  },
  'homeMembers.selection.listAfterSelection': {
    'fr': ({}) => `Pour choisir une sélection dite son numéro`,
  },
  'error.selectionListNotDefined': {
    'fr': ({}) => `selection list url not defined`,
  },
  'error.selectionPubNotDefined': {
    'fr': ({}) => `selection url not defined`,
  },
  'error.selectionNotAvailable': {
    'fr': ({}) => `no selection url available`,
  },
  'ask_resume_last_offset': {
    'fr': ({}) => `Voulez-vous reprendre la lecture là où elle s\'était arrêtée ?`,
  },
  'error.urlNotValid': {
    'fr': ({}) => `url non définis ou invalide`,
  },
  'search': {
    'fr': ({}) => `Que voulez-vous écouter ? Par exemple Zola`,
  },
  'error.noQuery': {
    'fr': ({}) => `aucune requete demandée`,
  },
  'error.webpubNotDefined': {
    'fr': ({}) => `webpub non définis`,
  },
  'mediaStatus.notCorrect': {
    'fr': ({}) => `media status incorrect`,
  },
  'player.remaining.hoursAndMinute': {
    'fr': ({hours, minutes}) => `il reste ${hours} heures et ${minutes} minutes`
  },
  'player.remaining.minute': {
    'fr': ({minutes}) => `il reste ${minutes} minutes`,
  },
  'test.player': {
    'fr': ({nb}) => `test player ${nb}`,
  },
  'test.setupSdk': {
    'fr': ({nb}) => `setup test ${nb}`,
  },
  'noResult': {
    'fr': ({}) => `aucun résultat trouvé`,
  },
  'wrongNumber': {
    'fr': ({number}) => `Le numéro ${number} est inconnu. Veuillez choisir un autre numéro.`
  },
  'list.numberPublication': {
    'fr': ({length}) => `Il y a ${length} publications :\n`,
  },
  'free': {
    'fr': ({text}) => `${text}`,
  }
}

export const i18n: Record<TI18nKey, TI18nItem> = _i18n;