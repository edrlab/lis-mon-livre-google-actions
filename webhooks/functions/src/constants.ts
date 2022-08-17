
export let NAME = "EOLE";

export const API_BASE_URL = "https://eole-recette.avh.asso.fr/api/v1/my_list";
export const EDRLAB_FUNCTION_URL = "";
export const BOOKSHELF_URL = 'https://eole-recette.avh.asso.fr/api/v1/my_list?per_page=5';
export const SEARCH_URL = 'https://eole-recette.avh.asso.fr/api/v1/search?search={query}&support=1&per_page=5';
export const SEARCH_URL_FN = (value: string) => SEARCH_URL.replace("{query}", value);
export const THEMATIC_LIST_URL = 'https://eole-recette.avh.asso.fr/api/v1/preselections/thematique?per_page=5&per_page_collection=5';
export const GENRE_LIST_URL = 'https://eole-recette.avh.asso.fr/api/v1/preselections/genre?per_page=5&per_page_collection=5';
export const DEFAULT_LANGUAGE: TDefaultLanguage = 'fr';

export type TDefaultLanguage = Extract<TLang, 'fr'>;

export const PADDING_GROUP = 5;
export const PADDING_PUB = 5;
export const LAST_SEEN_THRESHOLD = 72;

export const PROJECT_ID = 'valentin-4';

export const TIMER = 8000;

export type TLang = 'fr' | 'en';
