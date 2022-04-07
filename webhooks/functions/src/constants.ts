
export let NAME = "";
export const NAME_EN = "CELA";
export const NAME_FR = "<sub alias=\"ka hèbe\">CAÉB</sub>";
export const setName = (lang: TLang) => NAME = lang === 'fr' ? NAME_FR : NAME_EN;

export const API_BASE_URL = "https://celalibrary.ca/smartspeakerv1/search";
export const EDRLAB_FUNCTION_URL = 'https://us-central1-edrlab-1.cloudfunctions.net/manifest';
// export const ALL_PUBLICATION_LIST_URL = "https://storage.googleapis.com/audiobook_edrlab/navigation/all.json";
export const BOOKSHELF_URL = 'https://celalibrary.ca/smartspeakerv1/smart-speaker-user-bookshelf';
export const SEARCH_URL = 'https://celalibrary.ca/smartspeakerv1/search?_format=json&search_term={query}';
export const SEARCH_URL_FN = (value: string) => SEARCH_URL.replace("{query}", value);
export const THEMATIC_LIST_URL = 'https://celalibrary.ca/smartspeakerv1/featured-selection';
export const GENRE_LIST_URL = 'https://celalibrary.ca/smartspeakerv1/genre-selection';
export const DEFAULT_LANGUAGE: TDefaultLanguage = 'en';

export type TDefaultLanguage = Extract<TLang, 'en'>;

export const PADDING_GROUP = 5;
export const PADDING_PUB = 3;
export const LAST_SEEN_THRESHOLD = 72;

export const PROJECT_ID = 'cela-2';


export type TLang = 'fr' | 'en';

export const TIMER = 8000;


// init
setName(DEFAULT_LANGUAGE);