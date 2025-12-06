import {ComponentFixture, TestBed} from '@angular/core/testing';

import {JobTimelineSection} from './job-timeline-section';

describe('JobTimelineSection', () => {
  let component: JobTimelineSection;
  let fixture: ComponentFixture<JobTimelineSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobTimelineSection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobTimelineSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
