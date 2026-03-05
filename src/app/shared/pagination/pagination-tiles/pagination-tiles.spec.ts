import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PaginationTiles } from './pagination-tiles';

describe('PaginationTiles', () => {
  let component: PaginationTiles;
  let fixture: ComponentFixture<PaginationTiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationTiles]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaginationTiles);
    component = fixture.componentInstance;
    component.pageNumbers = signal([1, 2, 3]);
    component.currentPage = signal(1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
