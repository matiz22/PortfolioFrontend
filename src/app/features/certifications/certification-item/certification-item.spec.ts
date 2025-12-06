import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CertificationItem} from './certification-item';

describe('CertificationItem', () => {
  let component: CertificationItem;
  let fixture: ComponentFixture<CertificationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CertificationItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
