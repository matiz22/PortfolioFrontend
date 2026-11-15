import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';

import { HomePage } from './home-page';
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
    const chapters = Array.from(root.querySelector('main')!.children, (child) => child.tagName);
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
