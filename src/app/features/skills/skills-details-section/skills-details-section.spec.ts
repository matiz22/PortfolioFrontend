import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsDetailsSection } from './skills-details-section';

describe('SkillsDetailsSection', () => {
  let component: SkillsDetailsSection;
  let fixture: ComponentFixture<SkillsDetailsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsDetailsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsDetailsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
