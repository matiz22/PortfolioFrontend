import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmaiSent } from './emai-sent';

describe('EmaiSent', () => {
  let component: EmaiSent;
  let fixture: ComponentFixture<EmaiSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmaiSent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmaiSent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
