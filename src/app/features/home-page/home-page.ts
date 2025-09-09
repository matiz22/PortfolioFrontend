import {Component, inject} from '@angular/core';
import {HeroSection} from '../../shared/hero/hero-section/hero-section';
import {AboutMe} from '../about-me/about-me';
import {MatDivider} from '@angular/material/divider';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ProjectsSection} from '../projects/projects-section/projects-section';
import {NavigationService} from '../../core/services/navigation.service';
import {RealizationsSection} from '../realizations/realizations-section/realizations-section';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {SectionTexts} from '../../shared/sections/section-texts/section-texts';
import {JobsSection} from '../jobs/jobs-section/jobs-section';


@Component({
  selector: 'app-home-page',
  imports: [
    HeroSection,
    AboutMe,
    MatDivider,
    MatIconButton,
    MatIconModule,
    ProjectsSection,
    RealizationsSection,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    SectionTexts,
    JobsSection
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {
  cardTitle: string = $localize`:@@homeTitle:👋 Hi, I’m Mateusz — Mobile & Web Developer`;
  cardSubtitle: string = $localize`:@@homeSubtitle:Crafting simple, effective digital experiences.`;

  navigationService: NavigationService = inject(NavigationService);

  scrollToAbout(): void {
    this.navigationService.navigateToSection('about')
  }
}
