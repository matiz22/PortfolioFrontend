import { Component, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Footer } from "../../shared/footer/footer";
import { HeroSection } from "../hero/hero-section/hero-section";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";
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

  constructor() { }

  ngOnInit(): void {
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
