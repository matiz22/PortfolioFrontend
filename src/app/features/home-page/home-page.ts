import {Component, inject} from '@angular/core';
import {HeroSection} from '../../shared/hero/hero-section/hero-section';
import {MatDivider} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {ProjectsSection} from '../projects/projects-section/projects-section';
import {NavigationService} from '../../core/services/navigation.service';
import {RealizationsSection} from '../realizations/realizations-section/realizations-section';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {SectionTexts} from '../../shared/sections/section-texts/section-texts';
import {JobsSection} from '../jobs/jobs-section/jobs-section';
import {EducationSection} from '../education/education-section/education-section';
import {CertificationSection} from '../certifications/certification-section/certification-section';
import {ContactSection} from '../../shared/contact/contact-section/contact-section';
import {AboutMeSection} from '../about-me/about-me-section/about-me-section';


@Component({
  selector: 'app-home-page',
  imports: [
    HeroSection,
    MatDivider,
    MatIconModule,
    ProjectsSection,
    RealizationsSection,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    SectionTexts,
    JobsSection,
    EducationSection,
    CertificationSection,
    ContactSection,
    AboutMeSection,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {

  navigationService: NavigationService = inject(NavigationService);

  scrollToAbout(): void {
    this.navigationService.navigateToSection('about')
  }
}
