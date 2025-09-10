import {Component, Input} from '@angular/core';
import {Certification} from '../../../core/models/certification';
import {DatePipe} from '@angular/common';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-certification-item',
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
  templateUrl: './certification-item.html',
  styleUrl: './certification-item.scss'
})
export class CertificationItem {
  @Input() certification!: Certification;
}
