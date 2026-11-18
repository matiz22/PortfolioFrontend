import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';

import { HomePage } from './home-page';
import { GRAIN_CHAPTER_ACCENTS } from '../../shared/grain-gradient/grain-gradient-palette';
import { SectionNext } from '../../shared/section-next/section-next';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    })
    .overrideComponent(HomePage, { set: { imports: [SectionNext], schemas: [NO_ERRORS_SCHEMA] } })
    .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps one decorative background outside the main chapter order', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.home-page > app-grain-gradient').length).toBe(1);
    expect(root.querySelector('main app-grain-gradient')).toBeNull();
  });

  it('frosts every chapter navigation and the closing footer without frosting headings', async () => {
    const blocks = await fixture.getDeferBlocks();
    for (const block of blocks) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const next = root.querySelectorAll('app-section-next .section-action-chip.glass');
    expect(next.length).toBe(7);
    // Archive chips live inside section components, which this test renders as
    // unknown elements; SectionAction's own spec covers the archive variant.
    expect(root.querySelector('h1.home-glass, h2.home-glass')).toBeNull();
    expect(root.querySelector('.hero-portrait .home-glass')).toBeNull();
  });

  it('lets the same background show through every chapter and the closing area', () => {
    const root: HTMLElement = fixture.nativeElement;
    const style = getComputedStyle(root);

    expect(style.getPropertyValue('--home-section-background').trim()).toBe('transparent');
    expect(style.getPropertyValue('--contact-section-background').trim()).toBe('transparent');
    expect(getComputedStyle(root.querySelector('.home-closing')!).backgroundColor)
      .toBe('rgba(0, 0, 0, 0)');
  });

  it('disables scrolling section noise only inside the homepage', () => {
    const root: HTMLElement = fixture.nativeElement;
    const section = document.createElement('section');
    section.className = 'section-noise';
    root.querySelector('main')!.appendChild(section);

    expect(getComputedStyle(section, '::before').content).toBe('none');

    const otherPageSection = document.createElement('section');
    otherPageSection.className = 'section-noise';
    document.body.appendChild(otherPageSection);
    try {
      expect(getComputedStyle(otherPageSection, '::before').content).toBe('""');
    } finally {
      otherPageSection.remove();
    }
  });

  it('keeps contact and the site footer in the same closing chapter', async () => {
    const blocks = await fixture.getDeferBlocks();
    await blocks[blocks.length - 1].render(DeferBlockState.Complete);
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const closing = root.querySelector('.home-closing')!;
    expect(closing.querySelector('app-contact-section.home-contact')).not.toBeNull();
    expect(closing.lastElementChild?.tagName).toBe('APP-FOOTER');
    expect(root.querySelector('main app-footer')).toBeNull();
    expect(root.querySelectorAll('app-footer').length).toBe(1);
  });

  it('preserves the portfolio chapter order', async () => {
    const blocks = await fixture.getDeferBlocks();
    for (const block of blocks) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const chapters = Array.from(root.querySelector('main')!.children, (chapter) => chapter.firstElementChild?.tagName);
    expect(chapters).toEqual([
      'APP-HERO-SECTION',
      'APP-ABOUT-ME-SECTION',
      'APP-REALIZATIONS-HOME-SECTION',
      'APP-PROJECTS-HOME-SECTION',
      'APP-CERTIFICATIONS-SECTION',
      'APP-JOB-TIMELINE-SECTION',
      'APP-EDUCATION-SECTION',
    ]);
  });

  it('keeps a focusable anchor for each chapter before deferred content loads', () => {
    const root: HTMLElement = fixture.nativeElement;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-grain-chapter]'));
    expect(chapters.map((chapter) => chapter.id)).toEqual([
      'home', 'about', 'work', 'projects', 'certifications', 'experience', 'education', 'contact',
    ]);
    expect(root.querySelector('app-about-me-section')).toBeNull();
    for (const chapter of chapters) {
      expect(chapter.getAttribute('tabindex')).toBe('-1');
      expect(getComputedStyle(chapter).scrollMarginTop).toBe('96px');
    }
  });

  it('sets stable metadata accents on only the five portfolio chapters before hydration', () => {
    const root: HTMLElement = fixture.nativeElement;
    const chapters = ['work', 'projects', 'certifications', 'experience', 'education'] as const;
    for (const chapter of chapters) {
      expect(root.querySelector<HTMLElement>(`#${chapter}`)?.style.getPropertyValue('--home-metadata-accent'))
        .toBe(GRAIN_CHAPTER_ACCENTS[chapter]);
    }
    expect(root.querySelectorAll('[data-grain-chapter][style*="--home-metadata-accent"]').length)
      .toBe(chapters.length);
  });

  it('links each chapter to the next one without changing the section order', async () => {
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('app-section-next a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#about', '#work', '#projects', '#certifications', '#experience', '#education', '#contact',
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'About me', 'Client work', 'Projects', 'Certificates', 'Experience', 'Education', 'Let’s talk',
    ]);
    expect(root.querySelector('.home-closing app-section-next')).toBeNull();
  });
});
