import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionFooter } from './section-footer';
import { SectionAction } from '../section-action/section-action';
import { SectionNext } from '../section-next/section-next';

@Component({
  imports: [SectionFooter, SectionAction, SectionNext],
  template: `
    <app-section-footer>
      <a appSectionAction href="/certifications">View all certifications</a>
      <app-section-next targetId="experience">Experience</app-section-next>
    </app-section-footer>
  `,
})
class TestHost {}

describe('SectionFooter', () => {
  let fixture: ComponentFixture<TestHost>;
  let footer: HTMLElement;
  let links: NodeListOf<HTMLAnchorElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    footer = fixture.nativeElement.querySelector('app-section-footer');
    links = footer.querySelectorAll('a');
  });

  it('keeps archive and next-section destinations separate and in reading order', () => {
    expect(links[0].getAttribute('href')).toBe('/certifications');
    expect(links[1].getAttribute('href')).toBe('#experience');
    expect(links[0].classList).toContain('section-action-archive');
    expect(links[1].classList).toContain('section-action-continue');
  });

  for (const width of [280, 600]) {
    it(`centers the continuation below the left-aligned archive at ${width}px`, () => {
      footer.style.width = `${width}px`;
      const archive = links[0].getBoundingClientRect();
      const next = links[1].getBoundingClientRect();
      const bounds = footer.getBoundingClientRect();

      expect(archive.left).toBeCloseTo(bounds.left, 1);
      expect(next.top).toBeGreaterThanOrEqual(archive.bottom);
      expect(next.left + next.width / 2).toBeCloseTo(bounds.left + bounds.width / 2, 1);
    });
  }
});
