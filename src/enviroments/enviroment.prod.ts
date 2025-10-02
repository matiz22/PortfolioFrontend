import {LanguageOption} from '../app/core/models/languages';

export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1/api',
  storageUrl: 'http://127.0.0.1/storage',
  version: 'v1',
  languagesOptions: [
    {
      code: 'en',
      label: 'English',
      url: 'http://localhost:4000/en/'
    },
    {
      code: 'pl',
      label: 'Polski',
      url: 'http://localhost:4000/pl/'
    },
  ] as LanguageOption[]
};
