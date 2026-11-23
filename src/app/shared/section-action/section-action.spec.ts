import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionAction } from './section-action';

@Component({
  imports: [SectionAction],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<a appSectionAction [variant]="variant()" href="#destination">View all projects</a>`,
})
class TestHost {
  readonly variant = input<'archive' | 'continue' | 'cta'>('archive');
}

describe('SectionAction', () => {
  let fixture: ComponentFixture<TestHost>;
  let link: HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    link = fixture.nativeElement.querySelector('a');
  });

  it('enhances the existing anchor without nesting or replacing its destination', () => {
    expect(link.getAttribute('href')).toBe('#destination');
    expect(link.textContent?.trim()).toBe('View all projects');
    expect(link.querySelector('a')).toBeNull();
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(link.classList).toContain('section-action-archive');
  });

  it('uses a glass archive chip and an unfilled continuation variant', async () => {
    const surface = link.querySelector<HTMLElement>('.section-action-surface')!;
    const chip = link.querySelector<HTMLElement>('.section-action-chip')!;
    expect(chip.classList).toContain('glass');
    expect(chip.classList).toContain('home-glass');
    expect(chip.classList).toContain('home-glass-chip');
    expect(link.querySelector('path')?.getAttribute('d')).toContain('17 7');
    surface.style.transition = 'none';
    fixture.componentRef.setInput('variant', 'continue');
    await fixture.whenStable();
    expect(link.classList).toContain('section-action-continue');
    expect(link.classList).not.toContain('section-action-archive');
    const continuationChip = link.querySelector('.section-action-chip')!;
    expect(continuationChip.classList.contains('glass')).toBeFalse();
    expect(getComputedStyle(continuationChip).animationName).toBe('none');
    expect(link.querySelector('.aura')).toBeNull();
    expect(getComputedStyle(surface).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(link.querySelector('svg')).toBeNull();
  });

  it('reserves a stationary hit area around its non-interactive motion surface', () => {
    const style = getComputedStyle(link);
    expect(parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(style.paddingLeft)).toBe(8);
    expect(parseFloat(style.paddingTop)).toBe(8);
    expect(getComputedStyle(link.querySelector('.section-action-surface')!).pointerEvents).toBe('none');
    expect(getComputedStyle(link.querySelector('svg')!).animationName).toBe('none');
  });

  it('puts the solid CTA inside the magnetic surface without frosting the chip', async () => {
    fixture.componentRef.setInput('variant', 'cta');
    await fixture.whenStable();

    const chip = link.querySelector<HTMLElement>('.section-action-surface .section-action-chip')!;
    expect(link.classList).toContain('section-action-cta');
    expect(link.classList).not.toContain('btn');
    expect(chip.classList).toContain('btn-primary');
    expect(chip.classList).not.toContain('glass');
    expect(getComputedStyle(chip).pointerEvents).toBe('none');
    expect(chip.querySelector('svg')).toBeNull();
  });
});
