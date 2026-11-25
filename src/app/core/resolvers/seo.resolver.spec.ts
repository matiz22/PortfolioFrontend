import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { ApiState } from '../models/api.state';
import { ISlugService } from '../services/base/services/slug.service';
import { SeoService } from '../services/seo.service';
import { createEntityResolver, Seoable } from './seo.resolver';

interface TestEntity extends Seoable {
  title: string;
}

const SERVICE = new InjectionToken<ISlugService<TestEntity>>('slug service');
const ENTITY: TestEntity = {
  title: 'Case study',
  seoEnabled: true,
  metaTitle: null,
  metaDescription: null,
  description: 'A project description.',
};

describe('createEntityResolver', () => {
  const getBySlug = jasmine.createSpy<ISlugService<TestEntity>['getBySlug']>('getBySlug');
  const updateMeta = jasmine.createSpy<SeoService['updateMeta']>('updateMeta');
  const loadService = jasmine.createSpy('loadService').and.resolveTo(SERVICE);

  beforeEach(() => {
    getBySlug.calls.reset();
    updateMeta.calls.reset();
    loadService.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        { provide: SERVICE, useValue: { getBySlug } },
        { provide: SeoService, useValue: { updateMeta } },
      ],
    });
  });

  function resolve(slug: string) {
    const resolver = createEntityResolver<TestEntity>(loadService, (entity) => entity.title);
    const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => resolver(route, {} as RouterStateSnapshot));
    expect(loadService).not.toHaveBeenCalled();
    if (!isObservable(result)) throw new Error('Expected an observable resolver');
    return firstValueFrom(result);
  }

  it('loads the route service on demand and applies SEO before emitting the resolved entity', async () => {
    const state = ApiState.success(ENTITY);
    getBySlug.and.returnValue(of(state));

    expect(await resolve('case-study')).toEqual(state);
    expect(loadService).toHaveBeenCalledTimes(1);
    expect(getBySlug).toHaveBeenCalledOnceWith('case-study');
    expect(updateMeta).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      title: ENTITY.title,
      description: ENTITY.description,
    }));
  });

  it('returns a failed request without replacing route metadata', async () => {
    const state = ApiState.error<TestEntity>('Not found');
    getBySlug.and.returnValue(of(state));

    expect(await resolve('missing')).toEqual(state);
    expect(updateMeta).not.toHaveBeenCalled();
  });
});
