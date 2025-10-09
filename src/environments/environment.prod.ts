import {LanguageOption} from '../app/core/models/languages';

export const environment = {
  production: true,
  apiUrl: 'http://127.0.0.1:8081/api',
  storageUrl: 'https://admin.malich.dev/storage',
  version: 'v1',
  languagesOptions: [
    {
      code: 'pl',
      label: 'Polski',
      url: 'https:///malich.dev/'
    },
    {
      code: 'en',
      label: 'English',
      url: 'https://malich.dev/en/'
    },
  ] as LanguageOption[]
};
