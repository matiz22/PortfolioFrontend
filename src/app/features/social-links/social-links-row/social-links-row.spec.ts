import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialLinksRow } from './social-links-row';

describe('SocialLinksRow', () => {
  let component: SocialLinksRow;
  let fixture: ComponentFixture<SocialLinksRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLinksRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialLinksRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
