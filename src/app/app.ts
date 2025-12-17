import { Component, signal } from '@angular/core';
import { AboutMeSection } from './features/about-me/about-me-section/about-me-section';
import { Header } from './shared/header/header';
import { HeroSection } from './features/hero/hero-section/hero-section';
import { JobTimelineSection } from './features/jobs/job-timeline-section/job-timeline-section';
import { Footer } from './shared/footer/footer';
import {
  ProjectsRealizationsHomeSection
} from './features/showcase/projects-realizations-home-section/projects-realizations-home-section';
import { EducationSection } from './features/education/education-section/education-section';
import { CertificationsSection } from "./features/certifications/certifications-section/certifications-section";
import { ContactSection } from "./shared/contact/contact-section/contact-section";

@Component({
  selector: 'app-root',
  imports: [AboutMeSection, Header, HeroSection, JobTimelineSection, Footer, ProjectsRealizationsHomeSection, EducationSection, CertificationsSection, ContactSection],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');
}

