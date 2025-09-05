import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SectionTexts} from './section-texts';

describe('SectionTexts', () => {
  let component: SectionTexts;
  let fixture: ComponentFixture<SectionTexts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTexts]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SectionTexts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
