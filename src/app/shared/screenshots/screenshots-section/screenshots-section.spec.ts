import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenshotsSection} from './screenshots-section';

describe('ScreenshotsSection', () => {
  let component: ScreenshotsSection;
  let fixture: ComponentFixture<ScreenshotsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotsSection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScreenshotsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
