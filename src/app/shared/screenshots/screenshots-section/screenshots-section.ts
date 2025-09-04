import {Component, inject, Input} from '@angular/core';
import {ImageUrlPipe} from "../../pipes/image-url-pipe";
import {MatIconModule} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {ScreenshotOverviewDialog} from '../screenshot-overview-dialog/screenshot-overview-dialog';

@Component({
  selector: 'app-screenshots-section',
  imports: [
    MatIconModule,
    ImageUrlPipe,
  ],
  templateUrl: './screenshots-section.html',
  styleUrl: './screenshots-section.scss'
})
export class ScreenshotsSection {
  @Input() screenshots!: string[];
  readonly dialog = inject(MatDialog);


  openDialog(img: string): void {
    this.dialog.open(ScreenshotOverviewDialog, {
      data: {url: img},
      maxWidth: '100vw',
      height: 'auto',
      width: 'auto',
      restoreFocus: false,
    });
  }
}
