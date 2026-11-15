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

  it('aligns archive left and continuation right in one row when there is room', () => {
    footer.style.width = '600px';
    const archive = links[0].getBoundingClientRect();
    const next = links[1].getBoundingClientRect();
    const bounds = footer.getBoundingClientRect();
    expect(archive.left).toBeCloseTo(bounds.left, 1);
    expect(next.right).toBeCloseTo(bounds.right, 1);
    expect(archive.top).toBeCloseTo(next.top, 1);
  });

  it('wraps gracefully while keeping the continuation right-aligned on small screens', () => {
    footer.style.width = '280px';
    const archive = links[0].getBoundingClientRect();
    const next = links[1].getBoundingClientRect();
    expect(next.top).toBeGreaterThanOrEqual(archive.bottom);
    expect(next.right).toBeCloseTo(footer.getBoundingClientRect().right, 1);
  });
});
