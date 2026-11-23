import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectPreview } from './project-preview';

describe('ProjectPreview', () => {
  let fixture: ComponentFixture<ProjectPreview>;
  let root: HTMLElement;
  let project: ProjectSummary;

  beforeEach(async () => {
    project = {
      id: 7,
      slug: 'developer-toolkit',
      title: 'Developer Toolkit',
      shortDesc: 'A small collection of tools for everyday development.',
      thumbnail: 'https://example.com/toolkit.webp',
      liveUrl: 'https://example.com/demo',
      repoUrl: 'https://example.com/source',
      homePage: true,
      published: true,
      order: 1,
      technologies: [
        { id: 1, name: 'Angular' },
        { id: 2, name: 'TypeScript' },
        { id: 3, name: 'SCSS' },
        { id: 4, name: 'GSAP' },
      ],
    };
    await TestBed.configureTestingModule({
      imports: [ProjectPreview],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPreview);
    root = fixture.nativeElement;
    fixture.componentRef.setInput('project', project);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders the screenshot and accessible title without decorative indexing', () => {
    expect(root.querySelector('h3')?.textContent).toContain(project.title);
    expect(root.querySelector('article')?.getAttribute('aria-labelledby'))
      .toBe('project-preview-title-7');
    expect(root.querySelector('.project-preview-index')).toBeNull();
    expect(root.querySelector('img')?.getAttribute('src')).toBe(project.thumbnail!);
    expect(root.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(root.querySelector('.project-preview-description')?.textContent).toBe(project.shortDesc);
  });

  it('uses a dark frosted surface without making the screenshot translucent', () => {
    const card = root.querySelector<HTMLElement>('article')!;
    expect(card.classList).toContain('glass');
    expect(card.classList).toContain('home-glass');
    expect(getComputedStyle(card).backdropFilter).toContain('blur(');
    expect(getComputedStyle(card).borderTopStyle).toBe('solid');
    expect(getComputedStyle(root.querySelector('img')!).opacity).toBe('1');
  });

  it('puts the project title before its separate action links in tab order', () => {
    const links = root.querySelectorAll<HTMLAnchorElement>('a');
    expect(links[0].classList).toContain('project-preview-title-link');
    expect(links[0].getAttribute('href')).toBe('/project/developer-toolkit');
    expect(root.querySelector('a a')).toBeNull();
    expect(links.length).toBe(4);
    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    }
  });

  it('keeps the description and actions visible without the motion enhancement', () => {
    const drawer = root.querySelector<HTMLElement>('.project-preview-drawer')!;
    expect(drawer.hidden).toBeFalse();
    expect(drawer.style.height).toBe('');
    expect(drawer.style.opacity).toBe('');
    expect(drawer.style.visibility).toBe('');
    expect(drawer.inert).toBeFalse();
    expect(drawer.contains(root.querySelector('.project-preview-description'))).toBeTrue();
    expect(root.querySelector('.project-preview-visual')?.contains(drawer)).toBeFalse();
  });

  it('keeps the title arrow-free and drawer actions as underlined text links', () => {
    expect(root.querySelector('svg, .project-preview-actions [aria-hidden]')).toBeNull();
    for (const link of root.querySelectorAll<HTMLAnchorElement>('.project-preview-actions a')) {
      expect(link.classList).toContain('home-text-action');
      expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    }
  });

  it('keeps the technology names in the preview list', () => {
    const technologies = root.querySelectorAll('.project-preview-technologies li');
    expect(Array.from(technologies).every(pill => pill.classList.contains('home-metadata-pill'))).toBeTrue();
    expect(Array.from(technologies, pill => pill.textContent))
      .toEqual(project.technologies.map(technology => technology.name));
  });

  it('keeps a narrow preview compact even when it has extra pill rows', async () => {
    const card = root.querySelector<HTMLElement>('.project-preview')!;
    root.style.width = '180px';
    card.classList.add('project-preview-horizontal');
    const initialHeight = card.offsetHeight;
    const technologies = Array.from({ length: 12 }, (_, id) => ({ id, name: `Technology ${id}` }));
    fixture.componentRef.setInput('project', { ...project, technologies });
    await fixture.whenStable();
    const list = root.querySelector<HTMLElement>('.project-preview-technologies')!;
    const pills = Array.from(root.querySelectorAll('.project-preview-technologies li'));
    expect(pills.length).toBe(technologies.length);
    expect(card.offsetHeight).toBe(initialHeight);
    expect(initialHeight).toBeGreaterThan(0);
    expect(getComputedStyle(list).overflowY).toBe('hidden');
    expect(pills[0].getBoundingClientRect().bottom).toBeLessThanOrEqual(list.getBoundingClientRect().bottom);
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  });

  it('opens the desktop drawer beside the image instead of covering it', () => {
    root.style.width = '560px';
    const card = root.querySelector<HTMLElement>('.project-preview')!;
    const image = root.querySelector<HTMLElement>('.project-preview-visual')!;
    const drawer = root.querySelector<HTMLElement>('.project-preview-drawer')!;
    card.classList.add('project-preview-horizontal');
    const height = card.offsetHeight;

    card.style.setProperty('--project-brief-width', '220px');
    drawer.style.width = '220px';

    expect(drawer.offsetWidth).toBe(220);
    expect(drawer.getBoundingClientRect().left).toBeCloseTo(image.getBoundingClientRect().right, 1);
    expect(card.offsetHeight).toBe(height);
  });

  it('omits unavailable external actions and renders a missing-thumbnail fallback', async () => {
    fixture.componentRef.setInput('project', {
      ...project, thumbnail: null, liveUrl: null, repoUrl: null, technologies: [],
    });
    await fixture.whenStable();

    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('.project-preview-fallback-title')?.textContent).toBe(project.title);
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
    expect(root.querySelectorAll('.project-preview-technologies li').length).toBe(0);
  });

  it('recovers from a broken thumbnail and retries when the thumbnail changes', async () => {
    root.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('.project-preview-fallback')).not.toBeNull();

    fixture.componentRef.setInput('project', {
      ...project, thumbnail: 'https://example.com/replacement.webp',
    });
    await fixture.whenStable();
    expect(root.querySelector('img')?.getAttribute('src')).toBe('https://example.com/replacement.webp');
  });
});
