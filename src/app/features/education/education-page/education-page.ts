import { Component, inject } from '@angular/core';
import { EducationService } from '../../../core/services/education.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { EducationItem } from '../education-item/education-item';

@Component({
  selector: 'app-education-page',
  imports: [Header, Footer, ContactSection, EducationItem],
  templateUrl: './education-page.html',
  styleUrl: './education-page.scss',
})
export class EducationPage {
  educationService: EducationService = inject(EducationService);
  education = toSignal(
    this.educationService.getAll(),
    {
      initialValue: ApiState.loading<Education[]>()
    }
  );
}
