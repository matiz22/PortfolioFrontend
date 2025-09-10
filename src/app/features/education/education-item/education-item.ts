import {Component, Input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {ImageUrlPipe} from "../../../shared/pipes/image-url-pipe";
import {ItemCard} from "../../../shared/showcase/item-card/item-card";
import {MatChip, MatChipAvatar, MatChipSet} from "@angular/material/chips";
import {MatDivider} from "@angular/material/divider";
import {MatIconModule} from '@angular/material/icon';
import {Education} from '../../../core/models/education';


@Component({
  selector: 'app-education-item',
  imports: [
    DatePipe,
    ImageUrlPipe,
    ItemCard,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatDivider,
    MatIconModule
  ],
  templateUrl: './education-item.html',
  styleUrl: './education-item.scss'
})
export class EducationItem {
  @Input() education!: Education;
  protected readonly console = console;
}
