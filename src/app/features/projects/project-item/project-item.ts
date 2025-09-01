import {Component, Input} from '@angular/core';
import {Project} from '../../../core/models/project';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {RouterLink} from '@angular/router';
import {MatRippleModule} from '@angular/material/core';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';

@Component({
  selector: 'app-project-item',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardImage,
    ImageUrlPipe,
    RouterLink,
    MatRippleModule,
    MatCardContent,
    MatCardFooter,
    MatChipSet,
    MatChip,
    MatChipAvatar,
  ],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss'
})
export class ProjectItem {
  @Input() project!: Project;
}
