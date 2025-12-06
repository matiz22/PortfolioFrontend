import {Component, signal} from '@angular/core';
import {AboutMeSection} from './features/about-me/about-me-section/about-me-section';
import {Header} from './shared/header/header';
import {HeroSection} from './features/hero/hero-section/hero-section';
import {ProjectItem} from './features/projects/project-item/project-item';
import {RealizationItem} from './features/realizations/realization-item/realization-item';
import {JobTimelineSection} from './features/jobs/job-timeline-section/job-timeline-section';
import {EducationItem} from './features/education/education-item/education-item';
import {CertificationItem} from './features/certifications/certification-item/certification-item';
import {Footer} from './shared/footer/footer';
import {
  ProjectsRealizationsHomeSection
} from './features/showcase/projects-realizations-home-section/projects-realizations-home-section';

@Component({
  selector: 'app-root',
  imports: [AboutMeSection, Header, HeroSection, ProjectItem, RealizationItem, JobTimelineSection, EducationItem, CertificationItem, Footer, ProjectsRealizationsHomeSection],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');
}

