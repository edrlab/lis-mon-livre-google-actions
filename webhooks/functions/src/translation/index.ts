import i18next from 'i18next';
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

export type TI18nKey = Translations['keys']['fr'];

export const i18n = i18next;

export const t = i18n.t as (key: TI18nKey, options? : object) => any;

i18n.t = t as any;
