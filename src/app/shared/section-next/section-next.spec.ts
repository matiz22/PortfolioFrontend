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
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
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

  it('keeps a generous hit area without a pill or looping animation', () => {
    const style = getComputedStyle(link);
    expect(parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(style.minWidth)).toBeGreaterThanOrEqual(44);
    expect(getComputedStyle(link.querySelector('svg')!).animationName).toBe('none');
  });
});
