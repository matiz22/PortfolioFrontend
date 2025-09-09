import {Component, inject} from '@angular/core';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {toSignal} from '@angular/core/rxjs-interop';
import {JobsService} from '../../../core/services/jobs.service';
import {Job} from '../../../core/models/job';
import {DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-jobs-section',
  imports: [
    ImageUrlPipe,
    ItemCard,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    DatePipe,
    MatIconModule
  ],
  templateUrl: './jobs-section.html',
  styleUrl: './jobs-section.scss'
})
export class JobsSection {
  jobsService: JobsService = inject(JobsService);
  jobs = toSignal(this.jobsService.getAll(), {initialValue: [] as Job[]});
}
