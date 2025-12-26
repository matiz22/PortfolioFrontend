import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationDetailPage } from './certification-detail-page';

describe('CertificationDetailPage', () => {
  let component: CertificationDetailPage;
  let fixture: ComponentFixture<CertificationDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
