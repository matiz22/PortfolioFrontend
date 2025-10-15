import {Component, OnInit} from '@angular/core';
import {HeroSection} from '../../shared/hero/hero-section/hero-section';
import {MatDivider} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {ProjectsSection} from '../projects/projects-section/projects-section';
import {RealizationsSection} from '../realizations/realizations-section/realizations-section';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {SectionTexts} from '../../shared/sections/section-texts/section-texts';
import {JobsSection} from '../jobs/jobs-section/jobs-section';
import {EducationSection} from '../education/education-section/education-section';
import {CertificationSection} from '../certifications/certification-section/certification-section';
import {ContactSection} from '../../shared/contact/contact-section/contact-section';
import {AboutMeSection} from '../about-me/about-me-section/about-me-section';
import {Meta, Title} from '@angular/platform-browser';


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
export class HomePage implements OnInit{
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    const title = $localize`:@@homeTitleMeta:Mateusz | Freelance Developer & AI Enthusiast`;
    const description = $localize`:@@homeDescriptionMeta:Freelance developer and student crafting simple, effective digital experiences. I build apps, websites, and AI solutions tailored to your goals.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
