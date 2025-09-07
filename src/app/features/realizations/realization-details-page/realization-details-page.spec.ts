import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RealizationDetailsPage} from './realization-details-page';

describe('RealizationDetailsPage', () => {
  let component: RealizationDetailsPage;
  let fixture: ComponentFixture<RealizationDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizationDetailsPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RealizationDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
