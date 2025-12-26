import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionMd } from './description-md';

describe('DescriptionMd', () => {
  let component: DescriptionMd;
  let fixture: ComponentFixture<DescriptionMd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionMd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionMd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
