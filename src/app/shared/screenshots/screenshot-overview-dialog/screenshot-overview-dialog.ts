import {Component, inject, model} from '@angular/core';
import {ImageUrl} from './model/image.url';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ImageUrlPipe} from '../../pipes/image-url-pipe';

@Component({
  selector: 'app-screenshot-overview-dialog',
  imports: [
    ImageUrlPipe,
  ],
  templateUrl: './screenshot-overview-dialog.html',
  styleUrl: './screenshot-overview-dialog.scss'
})
export class ScreenshotOverviewDialog {
  readonly dialogRef: MatDialogRef<ScreenshotOverviewDialog> = inject(MatDialogRef<ScreenshotOverviewDialog>);
  readonly data = inject<ImageUrl>(MAT_DIALOG_DATA);
  readonly imageUrl = model(this.data.url);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
