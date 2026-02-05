import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroLoading } from './hero-loading';

describe('HeroLoading', () => {
  let component: HeroLoading;
  let fixture: ComponentFixture<HeroLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
