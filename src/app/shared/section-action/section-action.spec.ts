import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionAction } from './section-action';

@Component({
  imports: [SectionAction],
  template: `<a appSectionAction [variant]="variant" href="#destination">View all projects</a>`,
})
class TestHost {
  variant: 'archive' | 'continue' = 'archive';
}

describe('SectionAction', () => {
  let fixture: ComponentFixture<TestHost>;
  let link: HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    link = fixture.nativeElement.querySelector('a');
  });

  it('enhances the existing anchor without nesting or replacing its destination', () => {
    expect(link.getAttribute('href')).toBe('#destination');
    expect(link.textContent?.trim()).toBe('View all projects');
    expect(link.querySelector('a')).toBeNull();
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(link.classList).toContain('section-action-archive');
  });

  it('uses an outlined archive surface and an unfilled continuation variant', () => {
    const surface = link.querySelector<HTMLElement>('.section-action-surface')!;
    expect(getComputedStyle(surface).borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(link.querySelector('path')?.getAttribute('d')).toContain('17 7');
    surface.style.transition = 'none';
    fixture.componentInstance.variant = 'continue';
    fixture.detectChanges();
    expect(link.classList).toContain('section-action-continue');
    expect(link.classList).not.toContain('section-action-archive');
    expect(getComputedStyle(surface).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(link.querySelector('path')?.getAttribute('d')).toContain('12 4');
  });

  it('reserves a stationary hit area around its non-interactive motion surface', () => {
    const style = getComputedStyle(link);
    expect(parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(style.paddingLeft)).toBe(8);
    expect(parseFloat(style.paddingTop)).toBe(8);
    expect(getComputedStyle(link.querySelector('.section-action-surface')!).pointerEvents).toBe('none');
    expect(getComputedStyle(link.querySelector('svg')!).animationName).toBe('none');
  });
});
