import { Component, Inject, LOCALE_ID, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LanguageOption } from '../../../core/models/languages';

@Component({
  selector: 'app-languages-switcher',
  standalone: true,
  imports: [],
  templateUrl: './languages-switcher.html',
  styleUrl: './languages-switcher.scss',
})
export class LanguagesSwitcher {
  @Input() mode: 'dropdown' | 'inline' = 'dropdown';
  languagesOptions: LanguageOption[] = environment.languagesOptions;

  constructor(@Inject(LOCALE_ID) public locale: string) { }

  getCurrentLanguage(): string {
    return this.languagesOptions.find((lang: LanguageOption) => lang.code === this.locale)?.label || 'Unknown';
  }
}
