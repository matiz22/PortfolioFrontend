import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizationsPage } from './realizations-page';

describe('RealizationsPage', () => {
  let component: RealizationsPage;
  let fixture: ComponentFixture<RealizationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizationsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealizationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
