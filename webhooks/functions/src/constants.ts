
export const NAME = "EDRLAB";

export const API_BASE_URL = "https://storage.googleapis.com/audiobook_edrlab/feed.json";

export const ALL_PUBLICATION_LIST_URL = "https://storage.googleapis.com/audiobook_edrlab/navigation/all.json";
export const BOOKSHELF_URL = 'https://storage.googleapis.com/audiobook_edrlab/groups/popular.json';
export const SEARCH_URL = 'https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}';
export const SEARCH_URL_FN = (value: string) => SEARCH_URL.replace("{query}", value);
export const THEMATIC_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/thematic_list.json';
export const GENRE_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/genre_list.json';
export const DEFAULT_LANGUAGE: TDefaultLanguage = 'en';

export type TDefaultLanguage = Extract<TLang, 'en'>;

export const PADDING_GROUP = 5;
export const PADDING_PUB = 3;
export const LAST_SEEN_THRESHOLD = 72;

export const PROJECT_ID = 'cela-2';


type TLang = 'fr' | 'en';
