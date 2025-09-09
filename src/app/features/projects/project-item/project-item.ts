import {Component, Input} from '@angular/core';
import {ImageUrlPipe} from "../../../shared/pipes/image-url-pipe";
import {ItemCard} from "../../../shared/showcase/item-card/item-card";
import {MatChip, MatChipAvatar, MatChipSet} from "@angular/material/chips";
import {Project} from '../../../core/models/project';

@Component({
  selector: 'app-project-item',
  imports: [
    ImageUrlPipe,
    ItemCard,
    MatChip,
    MatChipAvatar,
    MatChipSet
  ],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss'
})
export class ProjectItem {
  @Input() project!: Project;
}
