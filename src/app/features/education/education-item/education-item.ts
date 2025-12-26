import { Component, Input } from '@angular/core';
import { Education } from '../../../core/models/education';
import { DatePipe } from '@angular/common';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-education-item',
  imports: [DatePipe, ImageUrlPipe, RouterLink],
  templateUrl: './education-item.html',
  styleUrl: './education-item.scss',
})
export class EducationItem {
  @Input({ required: true }) education!: Education;
}
