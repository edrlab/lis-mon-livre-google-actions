import * as i18next from 'i18next';
import * as frTranslation from './fr/fr.json';
import {Translations} from './../typings/i18n';
import {DEFAULT_LANGUAGE} from '../constants';

i18next.init({
  resources: {
    'fr': {
      translation: frTranslation,
    },
  },
  fallbackLng: DEFAULT_LANGUAGE,
});

export type TI18nKey = Translations['keys'][typeof DEFAULT_LANGUAGE];

export type TI18n = typeof i18next & {t: (key: TI18nKey, options? : object) => any};
export const i18n: TI18n = i18next;
