import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {EducationService} from '../../../core/services/education.service';
import {Education} from '../../../core/models/education';
import {EducationItem} from '../education-item/education-item';
import {ApiState} from '../../../core/models/api.state';
import {NetworkError} from '../../../shared/errors/network-error/network-error';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {NotFound} from '../../../shared/errors/not-found/not-found';

@Component({
  selector: 'app-education-section',
  imports: [
    EducationItem,
    NetworkError,
    LoadingCircle,
    NotFound
  ],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss'
})
export class EducationSection {
  educationService: EducationService = inject(EducationService);
  educationList = toSignal(
    this.educationService.getAll(),
    {
      initialValue: ApiState.loading<Education[]>()
    }
  );
}
