import {Component, Input} from '@angular/core';
import {HeroSection} from '../../hero/hero-section/hero-section';
import {ImageUrlPipe} from '../../pipes/image-url-pipe';
import {MarkdownComponent} from 'ngx-markdown';
import {ScreenshotsSection} from '../../screenshots/screenshots-section/screenshots-section';
import {Chip} from '../../models/chip';
import {Link} from '../../models/link';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {MatFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-item-details-page',
  imports: [
    HeroSection,
    ImageUrlPipe,
    MarkdownComponent,
    ScreenshotsSection,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatFabButton,
    MatIconModule,
  ],
  templateUrl: './item-details-page.html',
  styleUrl: './item-details-page.scss',
})
export class ItemDetailsPage {
  @Input() title!: string;
  @Input() thumbnail: string | undefined | null = null;
  @Input() description!: string;
  @Input() screenshots!: string[];
  @Input() technologies: Chip[] = [];
  @Input() skills: Chip[] = [];
  @Input() links: Link[] = [];
}
