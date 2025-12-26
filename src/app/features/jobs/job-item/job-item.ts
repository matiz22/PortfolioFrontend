import { Component, Input } from '@angular/core';
import { Job } from '../../../core/models/job';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-job-item',
  imports: [
    ImageUrlPipe,
    RouterLink,
    DatePipe
  ],
  templateUrl: './job-item.html',
  styleUrl: './job-item.scss',
})
export class JobItem {
  @Input({ required: true }) job!: Job;
}
