import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RealizationsSection} from './realizations-section';

describe('RealizationsSection', () => {
  let component: RealizationsSection;
  let fixture: ComponentFixture<RealizationsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizationsSection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RealizationsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
