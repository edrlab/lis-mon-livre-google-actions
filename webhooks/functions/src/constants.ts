
export let NAME = "";
export const NAME_EN = "VALENTIN";
export const NAME_FR = "<sub alias=\"valentin\">VALENTIN</sub>";
export const setName = (lang: TLang) => NAME = lang === 'fr' ? NAME_FR : NAME_EN;

export const API_BASE_URL = "https://eole.stepnet.fr/api/v1/my_list";
export const EDRLAB_FUNCTION_URL = "https://eole.stepnet.fr/api/v1/my_list";
export const BOOKSHELF_URL = 'https://eole.stepnet.fr/api/v1/my_list';
export const SEARCH_URL = 'https://eole.stepnet.fr/api/v1/search?q={query}';
export const SEARCH_URL_FN = (value: string) => SEARCH_URL.replace("{query}", value);
export const THEMATIC_LIST_URL = 'https://eole.stepnet.fr/api/v1/preselections/thematique';
export const GENRE_LIST_URL = 'https://eole.stepnet.fr/api/v1/preselections/genre';
export const DEFAULT_LANGUAGE: TDefaultLanguage = 'fr';

export type TDefaultLanguage = Extract<TLang, 'fr'>;

export const PADDING_GROUP = 5;
export const PADDING_PUB = 3;
export const LAST_SEEN_THRESHOLD = 72;

export const PROJECT_ID = 'valentin-5';

export const TIMER = 8000;

export type TLang = 'fr' | 'en';


// init
setName(DEFAULT_LANGUAGE);
