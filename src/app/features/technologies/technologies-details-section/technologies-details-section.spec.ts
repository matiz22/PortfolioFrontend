import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologiesDetailsSection } from './technologies-details-section';

describe('TechnologiesDetailsSection', () => {
  let component: TechnologiesDetailsSection;
  let fixture: ComponentFixture<TechnologiesDetailsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologiesDetailsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnologiesDetailsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
