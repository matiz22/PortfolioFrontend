import { ViewportScroller } from '@angular/common';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomePage } from './home-page';
import { ApiState } from '../../core/models/api.state';
import { CertificationsService } from '../../core/services/certifications.service';
import { ContactService } from '../../core/services/contact.service';
import { EducationService } from '../../core/services/education.service';
import { JobsService } from '../../core/services/jobs.service';
import { ProjectsService } from '../../core/services/projects.service';
import { RealizationsService } from '../../core/services/realizations.service';
import { SocialLinksService } from '../../core/services/social.links.service';
import { GRAIN_CHAPTER_ACCENTS } from '../../shared/grain-gradient/grain-gradient-palette';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let getSocialLinks: jasmine.Spy;

  function createHome(): ComponentFixture<HomePage> {
    const home = TestBed.createComponent(HomePage);
    // Exercise the real section templates without starting optional motion.
    home.componentInstance.onRouteDetach();
    return home;
  }

  beforeEach(async () => {
    const emptySummary = { getHomeSummaryItems: () => of(ApiState.success([])) };
    getSocialLinks = jasmine.createSpy('getAll').and.returnValue(of(ApiState.success([])));
    await TestBed.configureTestingModule({
      imports: [HomePage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        { provide: CertificationsService, useValue: emptySummary },
        { provide: ContactService, useValue: jasmine.createSpyObj('ContactService', ['sendEmail']) },
        { provide: EducationService, useValue: emptySummary },
        { provide: JobsService, useValue: emptySummary },
        { provide: ProjectsService, useValue: emptySummary },
        { provide: RealizationsService, useValue: emptySummary },
        { provide: SocialLinksService, useValue: { getAll: getSocialLinks } },
      ],
    }).compileComponents();

    fixture = createHome();
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

  const chapterIds = ['home', 'about', 'work', 'projects', 'certifications', 'experience', 'education', 'contact'];
  for (const id of [...chapterIds, 'about-web', 'about-apps', 'about-ai']) {
    it(`lands on #${id} without waiting for its chapter to load`, async () => {
      const originalUrl = location.href;
      const scroll = spyOn(TestBed.inject(ViewportScroller), 'scrollToAnchor');
      fixture.destroy();
      try {
        history.replaceState(null, '', `#${id}`);
        fixture = createHome();
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

  it('renders the real Contact with home inputs and keeps the site footer outside main', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const main = root.querySelector('main')!;
    const closing = main.querySelector<HTMLElement>('#contact.home-closing')!;
    const block = (await fixture.getDeferBlocks()).at(-1)!;
    const status = closing.querySelector('[role="status"]')!;

    expect(closing.querySelector('.home-chapter-placeholder')).not.toBeNull();
    expect(closing.querySelector('app-contact-section')).toBeNull();
    expect(getSocialLinks).not.toHaveBeenCalled();

    await block.render(DeferBlockState.Loading);
    await fixture.whenStable();
    expect(status.textContent).toContain('Loading section…');
    expect(closing.querySelector('app-contact-section')).toBeNull();
    expect(getSocialLinks).not.toHaveBeenCalled();

    await block.render(DeferBlockState.Complete);
    await fixture.whenStable();

    const contact = closing.querySelector('app-contact-section.home-contact.contact-blended')!;
    const section = contact.querySelector('section.contact-section')!;
    expect(root.querySelectorAll('#contact').length).toBe(1);
    expect(root.querySelector('#contact')).toBe(closing);
    expect(section.hasAttribute('id')).toBeFalse();
    expect(section.getAttribute('aria-labelledby')).toBe('contact-heading');
    expect(section.querySelector('#contact-heading')?.textContent)
      .toContain('Send me a note. We’ll take it from there.');
    expect(section.querySelector('.contact-copy > p')?.textContent).toContain('Share an idea');
    expect(section.querySelector('.contact-form-card.glass form')).not.toBeNull();
    expect(closing.querySelector('.home-chapter-loading')).toBeNull();
    expect(status.textContent?.trim()).toBe('');
    expect(getSocialLinks).toHaveBeenCalledTimes(1);

    const footer = root.querySelector<HTMLElement>('.home-page > app-footer')!;
    expect(root.querySelectorAll('main').length).toBe(1);
    expect(main.querySelector('app-footer')).toBeNull();
    expect(root.querySelectorAll('app-footer').length).toBe(1);
    expect(getComputedStyle(footer).display).toBe('block');
    expect(getComputedStyle(footer).getPropertyValue('--footer-divider-width').trim()).toBe('0');
  });

  it('keeps the Contact anchor and recovery action when its deferred code fails', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const closing = root.querySelector('#contact')!;
    const block = (await fixture.getDeferBlocks()).at(-1)!;
    await block.render(DeferBlockState.Error);
    await fixture.whenStable();

    expect(root.querySelector('#contact')).toBe(closing);
    expect(closing.getAttribute('tabindex')).toBe('-1');
    expect(closing.querySelector('[role="alert"] button')?.textContent).toContain('Reload page');
    expect(closing.querySelector('app-contact-section')).toBeNull();
    expect(getSocialLinks).not.toHaveBeenCalled();
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

  it('projects each next link into the real section footer and links to a unique chapter', async () => {
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const nextLinks = [
      ['home', 'app-hero-section .hero-next', 'about', 'How I work'],
      ['about', 'app-about-me-section .about-next', 'work', 'Client work'],
      ['work', 'app-realizations-home-section app-section-footer.realizations-next', 'projects', 'Projects'],
      ['projects', 'app-projects-home-section app-section-footer.projects-home-footer', 'certifications', 'Certificates'],
      ['certifications', 'app-certifications-section app-section-footer.certifications-footer', 'experience', 'Experience'],
      ['experience', 'app-job-timeline-section app-section-footer.jobs-bottom', 'education', 'Education'],
      ['education', 'app-education-section app-section-footer.education-footer', 'contact', 'Let’s talk'],
    ];
    for (const [from, footer, to, label] of nextLinks) {
      const links = root.querySelectorAll<HTMLAnchorElement>(`#${from} app-section-next a`);
      expect(links.length).withContext(from).toBe(1);
      const [link] = links;
      expect(link?.matches(`#${from} ${footer} app-section-next a`)).withContext(from).toBeTrue();
      expect(link?.getAttribute('href')).withContext(from).toBe(`#${to}`);
      expect(link?.textContent?.trim()).withContext(from).toBe(label);
      expect(link?.classList.contains('section-action-scroll-cue')).withContext(from).toBeTrue();
      expect(root.querySelectorAll(`main > #${to}[data-grain-chapter]`).length).withContext(to).toBe(1);
    }
    expect(root.querySelectorAll('app-section-next .aura.aura-glow').length).toBe(7);
    expect(root.querySelector('app-section-next svg')).toBeNull();
    expect(root.querySelector('#contact app-section-next')).toBeNull();
  });
});
