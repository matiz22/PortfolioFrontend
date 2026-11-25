import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inject, LOCALE_ID, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiState } from '../../../models/api.state';
import { HomeOperations } from './home.operations';

describe('HomeOperations', () => {
  const url = '/jobs/home-page';
  const summaryUrl = `${url}/summary`;
  const key = makeStateKey<{ start_date: string }[]>(`home-summary:en:${summaryUrl}`);
  const dtos = [{ start_date: '2024-01-01' }];
  const mapSummary = (dto: typeof dtos[number]) => ({ startDate: new Date(dto.start_date) });

  function setup(platform: 'server' | 'browser') {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: platform },
      { provide: LOCALE_ID, useValue: 'en' },
    ] });
    const http = TestBed.inject(HttpTestingController);
    const transfer = TestBed.inject(TransferState);
    const operations = TestBed.runInInjectionContext(() =>
      new HomeOperations(inject(HttpClient), url, mapSummary, 'Job'),
    );
    return { http, transfer, operations };
  }

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('maps the server response but serializes the original JSON once', () => {
    const { http, transfer, operations } = setup('server');
    const receive = jasmine.createSpy('receive');
    operations.getHomeSummaryItems(mapSummary).subscribe(receive);

    const request = http.expectOne(summaryUrl);
    expect(request.request.transferCache).toBeFalse();
    request.flush(dtos);
    expect(receive).toHaveBeenCalledOnceWith(ApiState.success(dtos.map(mapSummary)));
    expect(transfer.get(key, [])).toEqual(dtos);
  });

  it('reconstructs dates synchronously from the snapshot and requests fresh data on the next visit', () => {
    const { http, transfer, operations } = setup('browser');
    transfer.set(key, dtos);
    const receive = jasmine.createSpy('receive');
    const summaries = operations.getHomeSummaryItems(mapSummary);
    expect(transfer.hasKey(key)).toBeTrue();

    summaries.subscribe(receive);
    expect(receive).toHaveBeenCalledOnceWith(ApiState.success(dtos.map(mapSummary)));
    expect(receive.calls.mostRecent().args[0].data[0].startDate instanceof Date).toBeTrue();
    expect(transfer.hasKey(key)).toBeFalse();
    http.expectNone(summaryUrl);

    summaries.subscribe();
    http.expectOne(summaryUrl).flush(dtos);
  });

  it('uses an empty snapshot and leaves another locale’s snapshot alone', () => {
    const { http, transfer, operations } = setup('browser');
    const otherLocaleKey = makeStateKey<typeof dtos>(`home-summary:pl:${summaryUrl}`);
    transfer.set(otherLocaleKey, dtos);
    transfer.set(key, []);
    const receive = jasmine.createSpy('receive');

    operations.getHomeSummaryItems(mapSummary).subscribe(receive);

    expect(receive).toHaveBeenCalledOnceWith(ApiState.success([]));
    expect(transfer.get(otherLocaleKey, [])).toEqual(dtos);
    expect(transfer.hasKey(key)).toBeFalse();
    http.expectNone(summaryUrl);
  });

  it('does not transfer a failed response', () => {
    const { http, transfer, operations } = setup('server');
    const receive = jasmine.createSpy('receive');
    operations.getHomeSummaryItems(mapSummary).subscribe(receive);

    http.expectOne(summaryUrl).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(receive).toHaveBeenCalledOnceWith(ApiState.error('Failed to load job.'));
    expect(transfer.hasKey(key)).toBeFalse();
  });
});
