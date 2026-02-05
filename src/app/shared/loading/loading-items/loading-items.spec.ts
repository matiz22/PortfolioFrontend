import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingItems } from './loading-items';

describe('LoadingItems', () => {
  let component: LoadingItems;
  let fixture: ComponentFixture<LoadingItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
