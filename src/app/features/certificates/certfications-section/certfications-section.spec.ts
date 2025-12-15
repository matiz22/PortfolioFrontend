import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertficationsSection } from './certfications-section';

describe('CertficationsSection', () => {
  let component: CertficationsSection;
  let fixture: ComponentFixture<CertficationsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertficationsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertficationsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
