import {Component, Inject, LOCALE_ID} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-languages-switcher',
  imports: [
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './languages-switcher.html',
  styleUrl: './languages-switcher.scss'
})
export class LanguagesSwitcher {
  languagesOptions = environment.languagesOptions

  constructor(@Inject(LOCALE_ID) public locale: string) {
  }

  getCurrentLanguage(): string {
    return this.languagesOptions.find(lang => lang.code === this.locale)?.label || 'Unknown';
  }
}
