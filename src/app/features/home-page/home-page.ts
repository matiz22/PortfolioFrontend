import { Component, OnInit } from '@angular/core';
import { Footer } from "../../shared/footer/footer";
import { HeroSection } from "../hero/hero-section/hero-section";
import { HeroLoading } from "../hero/hero-loading/hero-loading";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";
import { Meta, Title } from '@angular/platform-browser';
import { LoadingItems } from '../../shared/loading/loading-items/loading-items';
import { ContactSection } from "../../shared/contact/contact-section/contact-section";
import { EducationSection } from "../education/education-section/education-section";
import { CertificationsSection } from "../certifications/certifications-section/certifications-section";
import { ProjectsRealizationsHomeSection } from "../showcase/projects-realizations-home-section/projects-realizations-home-section";
import { JobTimelineSection } from "../jobs/job-timeline-section/job-timeline-section";

@Component({
  selector: 'app-home-page',
  imports: [Footer, HeroSection, HeroLoading, AboutMeSection, Header, ContactSection, EducationSection, CertificationsSection, ProjectsRealizationsHomeSection, JobTimelineSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  constructor(
    private title: Title,
    private meta: Meta,
  ) { }

  ngOnInit(): void {
    const title = $localize`:@@homeTitleMeta:Mateusz Malich | Freelance Developer & AI Enthusiast`;
    const description = $localize`:@@homeDescriptionMeta:Freelance developer and student. I build simple, effective apps, websites, and AI solutions tailored to your goals.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: 'https://malich.dev/hero.png' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://malich.dev/' });
  }
}
