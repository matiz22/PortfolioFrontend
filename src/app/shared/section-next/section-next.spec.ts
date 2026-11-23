import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionNext } from './section-next';

@Component({
  imports: [SectionNext],
  template: `<app-section-next [targetId]="target">Client work</app-section-next>`,
})
class TestHost {
  target = 'work';
}

describe('SectionNext', () => {
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

  it('uses a native same-page link with the projected destination name', () => {
    expect(link.getAttribute('href')).toBe('#work');
    expect(link.textContent?.trim()).toBe('Client work');
    expect(link.hasAttribute('role')).toBeFalse();
    expect(link.hasAttribute('tabindex')).toBeFalse();
    expect(link.querySelector('svg')).toBeNull();
  });

  it('updates the destination when its input changes', () => {
    fixture.componentInstance.target = 'projects';
    fixture.detectChanges();
    expect(link.getAttribute('href')).toBe('#projects');
  });

  it('frosts the next-chapter surface as a shared home glass chip', () => {
    const chip = link.querySelector<HTMLElement>('.section-action-chip')!;
    expect(chip.classList).toContain('glass');
    expect(chip.classList).toContain('home-glass');
    expect(chip.classList).toContain('home-glass-chip');
    expect(getComputedStyle(chip).backdropFilter).toContain('blur(');
    expect(getComputedStyle(chip).borderTopStyle).toBe('solid');
    expect(getComputedStyle(chip).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('centers the link within its section navigation slot', () => {
    const host = link.parentElement!;
    host.style.width = '320px';
    const bounds = host.getBoundingClientRect();
    const target = link.getBoundingClientRect();

    expect(target.left + target.width / 2).toBeCloseTo(bounds.left + bounds.width / 2, 1);
  });

  it('uses an unclipped, rounded button with a visible DaisyUI glow and bold label', () => {
    const aura = link.querySelector('.aura.aura-glow')!;
    const style = getComputedStyle(link.querySelector('.section-action-chip')!);

    expect(style.clipPath).toBe('none');
    expect(parseFloat(style.borderRadius)).toBeGreaterThan(0);
    expect(Number(style.fontWeight)).toBeGreaterThanOrEqual(600);
    expect(getComputedStyle(link).clipPath).toBe('none');
    expect(getComputedStyle(aura).backgroundImage).toContain('radial-gradient(');
  });

  it('animates the button and glow together without moving the link hit area', () => {
    const style = getComputedStyle(link);
    const surface = link.querySelector('.section-action-surface')!;
    const aura = surface.querySelector('.aura.aura-glow')!;
    const chip = aura.querySelector('.section-action-chip')!;
    const motion = getComputedStyle(aura);

    expect(parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(style.minWidth)).toBeGreaterThanOrEqual(44);
    expect(style.animationName).toBe('none');
    expect(getComputedStyle(surface).animationName).toBe('none');
    expect(chip.querySelector('.section-action-label')?.textContent?.trim()).toBe('Client work');

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      expect(motion.animationName).toBe('none');
      expect(getComputedStyle(aura, '::before').animationName).toBe('none');
      expect(getComputedStyle(aura, '::after').animationName).toBe('none');
    } else {
      expect(motion.animationName).toContain('section-action-scroll-dip');
      expect(motion.animationIterationCount).toBe('infinite');
      expect(getComputedStyle(aura, '::before').animationName).toBe('aura-glow');
    }
  });
});
