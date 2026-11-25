import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

import {ProjectsService} from './projects.service';

describe('ProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('should be created', () => {
    expect(TestBed.inject(ProjectsService)).toBeTruthy();
  });
});
