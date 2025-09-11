import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SiteLinks} from './site-links';

describe('SiteLinks', () => {
  let component: SiteLinks;
  let fixture: ComponentFixture<SiteLinks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteLinks]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SiteLinks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
