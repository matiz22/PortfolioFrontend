import { Component, OnInit } from '@angular/core';
import { ContactSection } from "../../shared/contact/contact-section/contact-section";
import { EducationSection } from "../education/education-section/education-section";
import { CertificationsSection } from "../certifications/certifications-section/certifications-section";
import { Footer } from "../../shared/footer/footer";
import { ProjectsRealizationsHomeSection } from "../showcase/projects-realizations-home-section/projects-realizations-home-section";
import { JobTimelineSection } from "../jobs/job-timeline-section/job-timeline-section";
import { HeroSection } from "../hero/hero-section/hero-section";
import { HeroLoading } from "../hero/hero-loading/hero-loading";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home-page',
  imports: [ContactSection, EducationSection, CertificationsSection, Footer, ProjectsRealizationsHomeSection, JobTimelineSection, HeroSection, HeroLoading, AboutMeSection, Header],
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
    const description = $localize`:@@homeDescriptionMeta:Freelance developer and student crafting simple, effective digital experiences. I build apps, websites, and AI solutions tailored to your goals.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
