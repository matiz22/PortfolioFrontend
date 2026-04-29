import { Component, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Footer } from "../../shared/footer/footer";
import { HeroSection } from "../hero/hero-section/hero-section";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";
import { Meta, Title } from '@angular/platform-browser';
import { ContactSection } from "../../shared/contact/contact-section/contact-section";
import { EducationSection } from "../education/education-section/education-section";
import { CertificationsSection } from "../certifications/certifications-section/certifications-section";
import { ProjectsRealizationsHomeSection } from "../showcase/projects-realizations-home-section/projects-realizations-home-section";
import { JobTimelineSection } from "../jobs/job-timeline-section/job-timeline-section";

@Component({
  selector: 'app-home-page',
  imports: [Footer, HeroSection, AboutMeSection, Header, ContactSection, EducationSection, CertificationsSection, ProjectsRealizationsHomeSection, JobTimelineSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly document = inject(DOCUMENT);

  constructor(
    private titleService: Title,
    private meta: Meta,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@homeTitleMeta:Mateusz Malich | Apps, Websites & AI Solutions`;
    const description = $localize`:@@homeDescriptionMeta:Building intelligent apps and modern websites that power your business. Unlock the potential of AI and cutting-edge tech for your brand. Explore my work!`;

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://malich.dev/' });

    this.addHreflangLinks();
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
