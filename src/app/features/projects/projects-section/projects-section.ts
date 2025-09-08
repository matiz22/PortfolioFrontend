import {Component, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {Project} from '../../../core/models/project';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';

@Component({
  selector: 'app-projects-section',
  imports: [
    MatIconModule,
    RouterLink,
    MatButtonModule,
    ItemCard,
    ImageUrlPipe,
    MatChip,
    MatChipAvatar,
    MatChipSet,
  ],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss'
})
export class ProjectsSection {
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getHomeItems(), {initialValue: [] as Project[]});
}
