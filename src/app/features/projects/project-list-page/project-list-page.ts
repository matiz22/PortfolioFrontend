import {Component, inject} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {Project} from '../../../core/models/project';
import {MatIconModule} from '@angular/material/icon';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';

@Component({
  selector: 'app-project-list-page',
  imports: [
    HeroSection,
    MatIconModule,
    ItemCard,
    ImageUrlPipe,
    MatChip,
    MatChipAvatar,
    MatChipSet,
  ],
  templateUrl: './project-list-page.html',
  styleUrl: './project-list-page.scss'
})
export class ProjectListPage {
  cardTitle: string = $localize`:@@homeTitle:Projects`;
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getAll(), {initialValue: [] as Project[]});
}
