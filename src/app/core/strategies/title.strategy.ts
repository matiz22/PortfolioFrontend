import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly titleService = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      // If title is already set (e.g. by SeoService), we might want to skip or re-apply
      // But buildTitle returns the value from the route config.
      const fullTitle = `${title}${environment.seoTitleSuffix}`;
      this.titleService.setTitle(fullTitle);
    }
  }
}
