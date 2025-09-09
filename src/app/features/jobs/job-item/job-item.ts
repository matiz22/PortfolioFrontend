import {Component, Input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {ImageUrlPipe} from "../../../shared/pipes/image-url-pipe";
import {ItemCard} from "../../../shared/showcase/item-card/item-card";
import {MatChip, MatChipAvatar, MatChipSet} from "@angular/material/chips";
import {Job} from '../../../core/models/job';
import {MatIconModule} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-job-item',
  imports: [
    DatePipe,
    ImageUrlPipe,
    ItemCard,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatIconModule,
    MatDivider
  ],
  templateUrl: './job-item.html',
  styleUrl: './job-item.scss'
})
export class JobItem {
  @Input() job!: Job;
}
