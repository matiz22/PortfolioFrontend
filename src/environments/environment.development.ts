import {LanguageOption} from '../app/core/models/languages';

export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8081/api',
  storageUrl: 'https://admintest.matiz22.pl/storage',
  version: 'v1',
  languagesOptions: [
    {
      code: 'pl',
      label: 'Polski',
      url: 'https://plfront.matiz22.pl'
    },
    {
      code: 'en',
      label: 'English',
      url: 'https:///plfront.matiz22.pl/en/'
    },
  ] as LanguageOption[]
};
