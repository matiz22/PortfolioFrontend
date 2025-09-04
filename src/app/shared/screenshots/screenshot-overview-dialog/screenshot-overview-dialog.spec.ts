import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenshotOverviewDialog} from './screenshot-overview-dialog';

describe('ScreenshotOverviewDialog', () => {
  let component: ScreenshotOverviewDialog;
  let fixture: ComponentFixture<ScreenshotOverviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotOverviewDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScreenshotOverviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
