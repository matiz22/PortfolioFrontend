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
    fixture.componentRef.setInput('description', 'Example case study');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the decorative glow by default but can omit it without removing the markdown', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.description-glows')).not.toBeNull();

    fixture.componentRef.setInput('showGlow', false);
    fixture.detectChanges();

    expect(host.querySelector('.description-glows')).toBeNull();
    expect(host.querySelector('markdown')).not.toBeNull();
  });
});
