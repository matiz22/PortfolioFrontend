import {Component, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {Project} from '../../../core/models/project';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {SectionTexts} from '../../../shared/sections/section-texts/section-texts';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {mapTechnologyToChip} from '../../../shared/mappers/technologies.to.chips';
import {mapSkillToChip} from '../../../shared/mappers/skills.to.chips';

@Component({
  selector: 'app-projects-section',
  imports: [
    MatIconModule,
    RouterLink,
    MatButtonModule,
    SectionTexts,
    ItemCard,
  ],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss'
})
export class ProjectsSection {
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getHomeItems(), {initialValue: [] as Project[]});

  protected readonly mapTechnologyToChip = mapTechnologyToChip;
  protected readonly mapSkillToChip = mapSkillToChip;
}
