import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EducationItem } from '../education-item/education-item';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { EducationSummary } from '../../../core/models/summary/education';
import { EducationService } from '../../../core/services/education.service';
import { AosAnimations } from '../../../shared/animations/aos-animation';
import { CursorSpotlight } from '../../../shared/animations/cursor-spotlight';

@Component({
  selector: 'app-education-section',
  imports: [
    RouterLink,
    EducationItem,
    AosAnimations,
    CursorSpotlight
  ],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss'
})
export class EducationSection {
  educationService: EducationService = inject(EducationService);
  education = toSignal(
    this.educationService.getHomeSummaryItems(),
    {
      initialValue: ApiState.loading<EducationSummary[]>()
    }
  );
}
