import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectItem } from './project-item';

describe('ProjectItem', () => {
  let fixture: ComponentFixture<ProjectItem>;
  const project: ProjectSummary = {
    id: 1,
    slug: 'toolkit',
    title: 'Toolkit',
    shortDesc: 'A small developer toolkit.',
    liveUrl: 'https://example.com/toolkit',
    thumbnail: null,
    homePage: true,
    published: true,
    order: 1,
    technologies: [{ id: 1, name: 'TypeScript' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProjectItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ProjectItem);
    fixture.componentRef.setInput('project', project);
    fixture.detectChanges();
  });

  it('provides independent links for the project and live demo', () => {
    const root: HTMLElement = fixture.nativeElement;
    const [detail, live] = root.querySelectorAll<HTMLAnchorElement>('a');
    expect(detail.textContent?.trim()).toBe('Toolkit');
    expect(detail.getAttribute('href')).toBe('/project/toolkit');
    expect(live.href).toBe(project.liveUrl!);
    expect(live.target).toBe('_blank');
    expect(root.querySelector('a a')).toBeNull();
    expect(root.querySelector('.archive-card-technologies li')?.textContent?.trim()).toBe('TypeScript');
  });

  it('provides a media fallback and hides the demo link when no URL is available', () => {
    fixture.componentRef.setInput('project', { ...project, liveUrl: null });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.archive-card-media svg')).not.toBeNull();
    expect(root.querySelector('.project-card-live')).toBeNull();
  });

  it('switches from black to a full-card cover without resizing the card', () => {
    const root: HTMLElement = fixture.nativeElement;
    root.style.width = '360px';
    const card = root.querySelector<HTMLElement>('.archive-card')!;
    const media = root.querySelector<HTMLElement>('.archive-card-media')!;
    const cardHeight = card.getBoundingClientRect().height;
    const mediaHeight = media.getBoundingClientRect().height;
    expect(getComputedStyle(card).backgroundColor).toBe('rgb(0, 0, 0)');
    expect(getComputedStyle(media).backgroundColor).toBe('rgb(0, 0, 0)');

    fixture.componentRef.setInput('project', { ...project, thumbnail: `${window.location.origin}/favicon-32x32.png` });
    fixture.detectChanges();

    const cover = root.querySelector<HTMLImageElement>('.archive-card-cover')!;
    expect(cover.offsetParent).toBe(card);
    expect(getComputedStyle(cover).objectFit).toBe('cover');
    expect(getComputedStyle(card, '::before').backgroundImage).toContain('linear-gradient');
    expect(card.getBoundingClientRect().height).toBe(cardHeight);
    expect(media.getBoundingClientRect().height).toBe(mediaHeight);
  });
});
