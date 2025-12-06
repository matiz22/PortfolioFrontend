import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RealizationItem} from './realization-item';

describe('RealizationItem', () => {
  let component: RealizationItem;
  let fixture: ComponentFixture<RealizationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizationItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RealizationItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
