import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EducationDetailsPage} from './education-details-page';

describe('EducationDetailsPage', () => {
  let component: EducationDetailsPage;
  let fixture: ComponentFixture<EducationDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationDetailsPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EducationDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
