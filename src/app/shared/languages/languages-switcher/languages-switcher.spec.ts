import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LanguagesSwitcher} from './languages-switcher';

describe('LanguagesSwitcher', () => {
  let component: LanguagesSwitcher;
  let fixture: ComponentFixture<LanguagesSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguagesSwitcher]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LanguagesSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
