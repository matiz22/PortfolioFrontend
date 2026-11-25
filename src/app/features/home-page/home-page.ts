import { afterNextRender, Component, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { Footer } from "../../shared/footer/footer";
import { HeroSection } from "../hero/hero-section/hero-section";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";
import { ContactSection } from "../../shared/contact/contact-section/contact-section";
import { EducationSection } from "../education/education-section/education-section";
import { CertificationsSection } from "../certifications/certifications-section/certifications-section";
import { RealizationsHomeSection } from "../realizations/realizations-home-section/realizations-home-section";
import { ProjectsHomeSection } from "../projects/projects-home-section/projects-home-section";
import { JobTimelineSection } from "../jobs/job-timeline-section/job-timeline-section";
import { SectionNext } from '../../shared/section-next/section-next';
import { GrainGradient } from '../../shared/grain-gradient/grain-gradient';
import { GRAIN_CHAPTER_ACCENTS } from '../../shared/grain-gradient/grain-gradient-palette';
import { HomeMotionLifecycle } from '../../shared/animations/home-motion-lifecycle';
import { afterNextRenderMotion } from '../../shared/animations/lazy-motion';
import { MOTION_ALLOWED_QUERY } from '../../shared/animations/motion-media';
import { HomeCopyRegistry } from '../../shared/animations/home-copy-registry';
import { RouteAttachment } from '../../core/models/route-attachment';
import { StatusAnnouncer } from '../../shared/status-announcer/status-announcer';
import { ChapterLoading, ChapterLoadingRegistry } from './chapter-loading';

const ABOUT_SERVICE_FRAGMENTS = new Set(['about-web', 'about-apps', 'about-ai']);

@Component({
  selector: 'app-home-page',
  imports: [NgTemplateOutlet, Footer, HeroSection, AboutMeSection, Header, ContactSection, EducationSection, CertificationsSection, RealizationsHomeSection, ProjectsHomeSection, JobTimelineSection, SectionNext, GrainGradient, StatusAnnouncer, ChapterLoading],
  providers: [HomeMotionLifecycle, HomeCopyRegistry, ChapterLoadingRegistry],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home-page.scss',
})
export class HomePage implements RouteAttachment {
  private readonly motionLifecycle = inject(HomeMotionLifecycle);
  private readonly copyRegistry = inject(HomeCopyRegistry);
  protected readonly chapterAccents = GRAIN_CHAPTER_ACCENTS;
  protected readonly chapterLoading = inject(ChapterLoadingRegistry).chapters;
  protected readonly sectionLoadingMessage = $localize`:@@home.section.loading:Loading section…`;
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewportScroller = inject(ViewportScroller);

  constructor() {
    afterNextRender(() => this.scrollToInitialFragment(this.host.nativeElement));
    afterNextRenderMotion(async () => {
      const [{ animateHomeText }] = await Promise.all([
        import('./home-text-motion'), this.document.fonts.ready,
      ]);
      return (root) => animateHomeText(root, this.copyRegistry);
    }, 'Home text animation could not be loaded.', MOTION_ALLOWED_QUERY);
  }

  onRouteAttach(): void {
    this.motionLifecycle.attach();
  }

  onRouteDetach(): void {
    this.motionLifecycle.detach();
  }

  protected reloadPage(): void {
    this.document.defaultView?.location.reload();
  }

  private scrollToInitialFragment(root: HTMLElement): void {
    const fragment = this.document.defaultView?.location.hash.slice(1);
    if (!fragment) {
      return;
    }

    let id: string;
    try {
      id = decodeURIComponent(fragment);
    } catch {
      return;
    }
    // On client navigation the service panels don't exist until About renders
    // in the viewport. Its own fragment handler then lands on the exact panel.
    const target = this.document.getElementById(id) ??
      (ABOUT_SERVICE_FRAGMENTS.has(id) ? root.querySelector('#about') : null);
    if (target && root.contains(target)) {
      // The first ScrollTrigger refresh can interrupt a smooth scroll already
      // in flight. Land on initial deep links before loading the motion code.
      this.viewportScroller.scrollToAnchor(target.id, { behavior: 'instant' });
    }
  }

}
