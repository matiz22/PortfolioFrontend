import { inject, ProviderToken } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SeoData, SeoService } from '../services/seo.service';
import { ISlugService } from '../services/base/services/slug.service';
import { map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Common SEO fields shared by all detail models.
 */
export interface Seoable {
  seoEnabled: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  description: string;
}

/**
 * Applies static SEO data from route `data.seo` for listing pages.
 */
export const staticSeoResolver: ResolveFn<void> = (route) => {
  const seoService = inject(SeoService);
  const seoData = route.data['seo'];
  if (seoData) {
    seoService.updateMeta(seoData);
  }
};

/**
 * Creates a resolver that fetches an entity by slug and applies its SEO metadata.
 *
 * @param serviceToken  DI token for the service implementing ISlugService
 * @param titleFallback  Function that builds a fallback title from the entity when metaTitle is null
 */
export function createSeoResolver<T extends Seoable>(
  serviceToken: ProviderToken<ISlugService<T>>,
  titleFallback: (data: T) => string
): ResolveFn<void> {
  return (route) => {
    const slug = route.paramMap.get('slug');
    const seoService = inject(SeoService);
    const service = inject(serviceToken);
    if (!slug) return of(void 0);
    return service.getBySlug(slug).pipe(
      tap(state => {
        if (state.status === 'success') {
          const data = state.data;
          const seo: SeoData = {
            title: data.metaTitle || titleFallback(data),
            description: data.metaDescription || data.description.substring(0, 160),
            keywords: data.metaKeywords || undefined,
            robots: data.seoEnabled ? 'index, follow' : 'noindex, nofollow',
          };
          seoService.updateMeta(seo);
        }
      }),
      map(() => void 0)
    );
  };
}
