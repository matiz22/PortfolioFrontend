import { Component, signal } from '@angular/core';
import { AboutMeSection } from './features/about-me/about-me-section/about-me-section';
import { Header } from './shared/header/header';
import { HeroSection } from './features/hero/hero-section/hero-section';
import { JobTimelineSection } from './features/jobs/job-timeline-section/job-timeline-section';
import { CertificationItem } from './features/certifications/certification-item/certification-item';
import { Footer } from './shared/footer/footer';
import {
  ProjectsRealizationsHomeSection
} from './features/showcase/projects-realizations-home-section/projects-realizations-home-section';
import { EducationSection } from './features/education/education-section/education-section';
import { CertificationsSection } from "./features/certifications/certifications-section/certifications-section";

@Component({
  selector: 'app-root',
  imports: [AboutMeSection, Header, HeroSection, JobTimelineSection, CertificationItem, Footer, ProjectsRealizationsHomeSection, EducationSection, CertificationsSection],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');
}

