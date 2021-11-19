
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

}

export const i18n: Record<TI18nKey, TI18nItem> = _i18n;