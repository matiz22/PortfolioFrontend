import { NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomePage } from './home-page';
import { CertificationsSection } from '../certifications/certifications-section/certifications-section';
import { HeroSection } from '../hero/hero-section/hero-section';
import { ApiState } from '../../core/models/api.state';
import { CertificationsService } from '../../core/services/certifications.service';
import { GRAIN_CHAPTER_ACCENTS } from '../../shared/grain-gradient/grain-gradient-palette';
import { SectionNext } from '../../shared/section-next/section-next';
import { StatusAnnouncer } from '../../shared/status-announcer/status-announcer';
import { ChapterLoading } from './chapter-loading';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        { provide: CertificationsService, useValue: { getHomeSummaryItems: () => of(ApiState.success([])) } },
      ],
    })
    .overrideComponent(HomePage, {
      set: {
        imports: [NgTemplateOutlet, CertificationsSection, HeroSection, SectionNext, StatusAnnouncer, ChapterLoading],
        schemas: [NO_ERRORS_SCHEMA],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('keeps one live region and stable skeleton geometry through all deferred states', async () => {
    const root: HTMLElement = fixture.nativeElement;
    root.style.setProperty('--home-stage-height', '640px');
    const [block] = await fixture.getDeferBlocks();
    const chapter = root.querySelector<HTMLElement>('#about')!;
    const status = chapter.querySelector<HTMLElement>('[role="status"]')!;

    await block.render(DeferBlockState.Placeholder);
    await fixture.whenStable();
    const placeholder = chapter.querySelector<HTMLElement>('.home-chapter-loading')!;
    const statuses = Array.from(root.querySelectorAll('[data-grain-chapter] > app-status-announcer [role="status"]'));
    expect(statuses.length).toBe(7);
    expect(statuses.map(region => region.textContent?.trim()).every(message => message === '')).toBeTrue();
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(placeholder.getAttribute('aria-hidden')).toBe('true');
    expect(placeholder.querySelectorAll('.home-chapter-skeleton .skeleton').length).toBe(4);
    expect(placeholder.querySelector('[role="status"]')).toBeNull();
    const placeholderMinBlockSize = getComputedStyle(placeholder).minBlockSize;
    expect(placeholderMinBlockSize).toBe('640px');

    await block.render(DeferBlockState.Loading);
    await fixture.whenStable();
    const loading = chapter.querySelector<HTMLElement>('.home-chapter-loading')!;
    expect(chapter.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent).toContain('Loading section…');
    expect(statuses.filter(region => region.textContent?.trim())).toEqual([status]);
    expect(loading).not.toBe(placeholder);
    expect(getComputedStyle(loading).minBlockSize).toBe(placeholderMinBlockSize);

    await block.render(DeferBlockState.Complete);
    await fixture.whenStable();
    expect(chapter.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(chapter.querySelector('.home-chapter-loading')).toBeNull();
    expect(chapter.querySelector('app-about-me-section')).not.toBeNull();
  });

  it('shows a recoverable failure inside the existing chapter anchor', async () => {
    const [block] = await fixture.getDeferBlocks();
    const chapter = fixture.nativeElement.querySelector('#about');
    const status = chapter.querySelector('[role="status"]');
    await block.render(DeferBlockState.Loading);
    await fixture.whenStable();
    expect(status.textContent).toContain('Loading section…');
    await block.render(DeferBlockState.Error);
    await fixture.whenStable();
    expect(chapter.tabIndex).toBe(-1);
    expect(chapter.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(chapter.querySelector('[role="alert"]').textContent).toContain('This section could not be loaded.');
    expect(chapter.querySelector('button').textContent).toContain('Reload page');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const chapterIds = ['home', 'about', 'work', 'projects', 'certifications', 'experience', 'education', 'contact'];
  for (const id of [...chapterIds, 'about-web', 'about-apps', 'about-ai']) {
    it(`lands on #${id} without waiting for its chapter to load`, async () => {
      const originalUrl = location.href;
      const scroll = spyOn(TestBed.inject(ViewportScroller), 'scrollToAnchor');
      fixture.destroy();
      try {
        history.replaceState(null, '', `#${id}`);
        fixture = TestBed.createComponent(HomePage);
        await fixture.whenStable();

        const anchor = chapterIds.includes(id) ? id : 'about';
        expect(scroll).toHaveBeenCalledOnceWith(anchor, { behavior: 'instant' });
      } finally {
        history.replaceState(null, '', originalUrl);
      }
    });
  }

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

  it('keeps contact in the main landmark and the site footer outside it', async () => {
    const blocks = await fixture.getDeferBlocks();
    await blocks[blocks.length - 1].render(DeferBlockState.Complete);
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const main = root.querySelector('main')!;
    const closing = main.querySelector<HTMLElement>('#contact.home-closing')!;
    const footer = root.querySelector<HTMLElement>('.home-page > app-footer')!;
    expect(root.querySelectorAll('main').length).toBe(1);
    expect(closing.querySelector('app-contact-section.home-contact.contact-blended')).not.toBeNull();
    expect(root.querySelectorAll('#contact').length).toBe(1);
    expect(main.querySelector('app-footer')).toBeNull();
    expect(root.querySelectorAll('app-footer').length).toBe(1);
    expect(getComputedStyle(footer).display).toBe('block');
    expect(getComputedStyle(footer).getPropertyValue('--footer-divider-width').trim()).toBe('0');
  });

  it('preserves the portfolio chapter order', async () => {
    const blocks = await fixture.getDeferBlocks();
    for (const block of blocks) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const chapters = Array.from(root.querySelector('main')!.children, (chapter) =>
      Array.from(chapter.children)
        .find((child) => !child.matches('app-status-announcer'))?.tagName);
    expect(chapters).toEqual([
      'APP-HERO-SECTION',
      'APP-ABOUT-ME-SECTION',
      'APP-REALIZATIONS-HOME-SECTION',
      'APP-PROJECTS-HOME-SECTION',
      'APP-CERTIFICATIONS-SECTION',
      'APP-JOB-TIMELINE-SECTION',
      'APP-EDUCATION-SECTION',
      'APP-CONTACT-SECTION',
    ]);
  });

  it('keeps a focusable anchor for each chapter before deferred content loads', () => {
    const root: HTMLElement = fixture.nativeElement;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-grain-chapter]'));
    expect(chapters.map((chapter) => chapter.id)).toEqual(chapterIds);
    expect(root.querySelector('app-about-me-section')).toBeNull();
    for (const chapter of chapters) {
      expect(chapter.getAttribute('tabindex')).toBe('-1');
      expect(getComputedStyle(chapter).scrollMarginTop).toBe('0px');
    }
  });

  it('keeps focus visible without a corner mark while each chapter is deferred', () => {
    const root: HTMLElement = fixture.nativeElement;
    for (const chapter of root.querySelectorAll<HTMLElement>('[data-grain-chapter]:not(#home)')) {
      chapter.focus({ preventScroll: true });
      expect(chapter.matches(':focus-visible')).withContext(chapter.id).toBeTrue();
      expect(getComputedStyle(chapter, '::before').content).withContext(chapter.id).toBe('none');
      expect(getComputedStyle(chapter).outlineOffset).withContext(chapter.id).toBe('-2px');
      chapter.blur();
    }
  });

  it('moves the focus outline to the certifications heading once it renders', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const certifications = root.querySelector<HTMLElement>('#certifications')!;
    certifications.focus({ preventScroll: true });
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const heading = certifications.querySelector('#certifications-heading')!;
    expect(document.activeElement).toBe(certifications);
    expect(getComputedStyle(certifications, '::before').content).toBe('none');
    expect(getComputedStyle(certifications).outlineStyle).toBe('none');
    expect(getComputedStyle(heading).outlineStyle).toBe('solid');
    certifications.blur();
  });

  it('keeps the hero free of an outline or accent bar when its anchor receives focus', () => {
    const root: HTMLElement = fixture.nativeElement;
    const hero = root.querySelector<HTMLElement>('#home')!;
    const heading = hero.querySelector('#hero-headline')!;

    expect(getComputedStyle(heading).outlineStyle).toBe('none');
    expect(getComputedStyle(heading).boxShadow).toBe('none');
    hero.focus({ preventScroll: true });
    expect(document.activeElement).toBe(hero);
    expect(getComputedStyle(hero).outlineStyle).toBe('none');
    expect(getComputedStyle(heading).outlineStyle).toBe('none');
    expect(getComputedStyle(heading).boxShadow).toBe('none');
    hero.blur();
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
      'How I work', 'Client work', 'Projects', 'Certificates', 'Experience', 'Education', 'Let’s talk',
    ]);
    expect(links.every((link) => link.classList.contains('section-action-scroll-cue'))).toBeTrue();
    expect(root.querySelectorAll('app-section-next .aura.aura-glow').length).toBe(7);
    expect(root.querySelector('app-section-next svg')).toBeNull();
    expect(root.querySelector('.home-closing app-section-next')).toBeNull();
  });
});
