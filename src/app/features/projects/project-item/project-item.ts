import {Component, Input} from '@angular/core';
import {Project} from '../../../core/models/project';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-project-item',
  imports: [
    ImageUrlPipe,
    RouterLink
  ],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss',
})
export class ProjectItem {
  @Input({required: true}) project!: Project;
}
