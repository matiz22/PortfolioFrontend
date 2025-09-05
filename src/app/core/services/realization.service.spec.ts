import {TestBed} from '@angular/core/testing';

import {RealizationsService} from './realizations.service';

describe('RealizationService', () => {
  let service: RealizationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
