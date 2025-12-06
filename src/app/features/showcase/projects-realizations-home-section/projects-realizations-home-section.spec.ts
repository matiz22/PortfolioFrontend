import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectsRealizationsHomeSection} from './projects-realizations-home-section';

describe('ProjectsRealizationsHomeSection', () => {
  let component: ProjectsRealizationsHomeSection;
  let fixture: ComponentFixture<ProjectsRealizationsHomeSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsRealizationsHomeSection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectsRealizationsHomeSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
