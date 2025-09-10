import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CertificationDetailsPage} from './certification-details-page';

describe('CertificationDetailsPage', () => {
  let component: CertificationDetailsPage;
  let fixture: ComponentFixture<CertificationDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationDetailsPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CertificationDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
