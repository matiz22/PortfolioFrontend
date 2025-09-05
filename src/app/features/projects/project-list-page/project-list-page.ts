import {Component, inject} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {Project} from '../../../core/models/project';
import {MatIconModule} from '@angular/material/icon';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {mapTechnologyToChip} from '../../../shared/showcase/item-card/mappers/technologies.to.chips';

@Component({
  selector: 'app-project-list-page',
  imports: [
    HeroSection,
    MatIconModule,
    ItemCard,
  ],
  templateUrl: './project-list-page.html',
  styleUrl: './project-list-page.scss'
})
export class ProjectListPage {
  cardTitle: string = $localize`:@@homeTitle:Projects`;
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getAll(), {initialValue: [] as Project[]});
  protected readonly mapTechnologyToChip = mapTechnologyToChip;
}
