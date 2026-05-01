import { inject, ProviderToken } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SeoData, SeoService } from '../services/seo.service';
import { environment } from '../../../environments/environment';
import { ISlugService } from '../services/base/services/slug.service';
import { tap } from 'rxjs';
import { ApiState } from '../models/api.state';

/**
 * Common SEO fields shared by all detail models.
 */
export interface Seoable {
  seoEnabled: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  description: string;
  thumbnail?: string | null;
}

/**
 * Applies static SEO data from route `data.seo` for listing pages.
 */
export const staticSeoResolver: ResolveFn<void> = (route) => {
  const seoService = inject(SeoService);
  const seoData: SeoData | undefined = route.data['seo'];
  if (seoData) {
    seoService.updateMeta(seoData);
  }
};

/**
 * Creates a resolver that fetches an entity by slug and applies its SEO metadata.
 * This is the preferred way for SSR as it ensures meta tags are updated BEFORE rendering.
 *
 * @param serviceToken  DI token for the service implementing ISlugService
 * @param titleBuilder  Function that builds a fallback title from the entity when metaTitle is null
 */
export function createEntityResolver<T extends Seoable>(
  serviceToken: ProviderToken<ISlugService<T>>,
  titleBuilder: (data: T) => string
): ResolveFn<ApiState<T>> {
  return (route) => {
    const slug = route.paramMap.get('slug');
    if (!slug) return inject(serviceToken).getBySlug(''); // Or error state

    const service = inject(serviceToken);
    const seoService = inject(SeoService);

    return service.getBySlug(slug).pipe(
      tap(state => {
        if (state.status === 'success') {
          const seo = buildSeoFromModel(state.data, titleBuilder(state.data));
          seoService.updateMeta(seo);
        }
      })
    );
  };
}

/**
 * Builds SeoData from a model that implements Seoable.
 *
 * @param data           The entity with SEO fields
 * @param titleFallback  A fallback title when metaTitle is null
 */
export function buildSeoFromModel<T extends Seoable>(
  data: T,
  titleFallback: string,
): SeoData {
  // Fallback to public/opengraph.png if no thumbnail is provided
  let ogImage = '/opengraph.png';
  if (data.thumbnail) {
    ogImage = data.thumbnail.startsWith('http')
      ? data.thumbnail
      : `${environment.storageUrl}/${data.thumbnail}`;
  }

  return {
    title: data.metaTitle || titleFallback,
    description: data.metaDescription || data.description.substring(0, 160),
    robots: data.seoEnabled ? 'index, follow' : 'noindex, nofollow',
    ogImage: ogImage
  };
}
