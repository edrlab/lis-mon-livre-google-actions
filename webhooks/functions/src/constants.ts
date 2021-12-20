
export const ALL_PUBLICATION_LIST_URL = "https://storage.googleapis.com/audiobook_edrlab/navigation/all.json";
export const SELECTION_URL = 'https://storage.googleapis.com/audiobook_edrlab/groups/popular.json';
export const SEARCH_URL = 'https://europe-west1-audiobooks-a6348.cloudfunctions.net/indexer?url=https://storage.googleapis.com/audiobook_edrlab/navigation/all.json&query={query}';
export const THEMATIC_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/thematic_list.json';
export const GENRE_LIST_URL = 'https://storage.googleapis.com/audiobook_edrlab/navigation/genre_list.json';
export const DEFAULT_LANGUAGE: TLang = 'fr';

export const PADDING = 5;

type TLang = 'fr' | 'en';