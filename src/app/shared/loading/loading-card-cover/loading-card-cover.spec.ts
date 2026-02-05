import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCardCover } from './loading-card-cover';

describe('LoadingCardCover', () => {
  let component: LoadingCardCover;
  let fixture: ComponentFixture<LoadingCardCover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingCardCover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingCardCover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
