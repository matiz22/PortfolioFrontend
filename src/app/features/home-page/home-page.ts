import { afterNextRender, Component, ElementRef, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
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

@Component({
  selector: 'app-home-page',
  imports: [Footer, HeroSection, AboutMeSection, Header, ContactSection, EducationSection, CertificationsSection, RealizationsHomeSection, ProjectsHomeSection, JobTimelineSection, SectionNext, GrainGradient],
  providers: [HomeMotionLifecycle],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  readonly motionLifecycle = inject(HomeMotionLifecycle);
  protected readonly chapterAccents = GRAIN_CHAPTER_ACCENTS;
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewportScroller = inject(ViewportScroller);

  constructor() {
    afterNextRender(() => this.scrollToInitialFragment(this.host.nativeElement));
    afterNextRenderMotion(async () => {
      const [{ animateHomeText }] = await Promise.all([
        import('./home-text-motion'), this.document.fonts.ready,
      ]);
      return animateHomeText;
    }, 'Home text animation could not be loaded.');
  }

  ngOnInit(): void {
    this.addHreflangLinks();
    // Router-driven fragment restoration should land where native links do.
    this.viewportScroller.setOffset(() => {
      const chapter = this.host.nativeElement.querySelector<HTMLElement>('[data-grain-chapter]');
      const view = this.document.defaultView;
      const offset = view && chapter?.isConnected
        ? parseFloat(view.getComputedStyle(chapter).scrollMarginTop) || 0
        : 0;
      return [0, offset];
    });
  }

  private scrollToInitialFragment(root: HTMLElement): void {
    const hash = this.document.defaultView?.location.hash;
    if (!hash) {
      return;
    }

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = this.document.getElementById(id);
    if (target && root.contains(target)) {
      // The first ScrollTrigger refresh can interrupt a smooth scroll already
      // in flight. Land on initial deep links before loading the motion code.
      this.viewportScroller.scrollToAnchor(id, { behavior: 'instant' });
    }
  }

  private addHreflangLinks(): void {
    const hreflangs = [
      { hreflang: 'pl', href: 'https://malich.dev/' },
      { hreflang: 'en', href: 'https://malich.dev/en' },
      { hreflang: 'x-default', href: 'https://malich.dev/' },
    ];

    // Remove existing hreflang links to avoid duplicates on reuse
    this.document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    hreflangs.forEach(({ hreflang, href }) => {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      this.document.head.appendChild(link);
    });
  }
}
