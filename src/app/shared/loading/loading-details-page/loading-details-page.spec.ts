import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDetailsPage } from './loading-details-page';

describe('LoadingDetailsPage', () => {
  let component: LoadingDetailsPage;
  let fixture: ComponentFixture<LoadingDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingDetailsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
