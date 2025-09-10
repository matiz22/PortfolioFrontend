import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {EducationService} from '../../../core/services/education.service';
import {Education} from '../../../core/models/education';
import {EducationItem} from '../education-item/education-item';

@Component({
  selector: 'app-education-section',
  imports: [
    EducationItem
  ],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss'
})
export class EducationSection {
  educationService: EducationService = inject(EducationService);
  educationList = toSignal(this.educationService.getAll(), {initialValue: [] as Education[]});
}
