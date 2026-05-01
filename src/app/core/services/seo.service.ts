import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoData {
  title?: string;
  description?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  updateMeta(seo: SeoData): void {
    if (seo.title) {
      const fullTitle = `${seo.title}${environment.seoTitleSuffix}`;
      this.titleService.setTitle(fullTitle);
      this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    }

    if (seo.description) {
      this.metaService.updateTag({ name: 'description', content: seo.description });
      this.metaService.updateTag({ property: 'og:description', content: seo.description });
    }

    this.metaService.updateTag({ name: 'robots', content: seo.robots || 'index, follow' });

    if (seo.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: seo.ogImage });
    }

    if (seo.ogUrl) {
      this.metaService.updateTag({ property: 'og:url', content: seo.ogUrl });
    }
    
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }
}
