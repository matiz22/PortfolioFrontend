import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EducationItem} from './education-item';

describe('EducationItem', () => {
  let component: EducationItem;
  let fixture: ComponentFixture<EducationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EducationItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
