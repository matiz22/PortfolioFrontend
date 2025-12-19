import { Component } from '@angular/core';
import { ContactSection } from "../../shared/contact/contact-section/contact-section";
import { EducationSection } from "../education/education-section/education-section";
import { CertificationsSection } from "../certifications/certifications-section/certifications-section";
import { Footer } from "../../shared/footer/footer";
import { ProjectsRealizationsHomeSection } from "../showcase/projects-realizations-home-section/projects-realizations-home-section";
import { JobTimelineSection } from "../jobs/job-timeline-section/job-timeline-section";
import { HeroSection } from "../hero/hero-section/hero-section";
import { AboutMeSection } from "../about-me/about-me-section/about-me-section";
import { Header } from "../../shared/header/header";

@Component({
  selector: 'app-home-page',
  imports: [ContactSection, EducationSection, CertificationsSection, Footer, ProjectsRealizationsHomeSection, JobTimelineSection, HeroSection, AboutMeSection, Header],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {

}
