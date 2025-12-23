import { Component, inject } from '@angular/core';
import { RealizationsService } from '../../../core/services/realizations.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { RealizationItem } from '../realization-item/realization-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-realizations-page',
  imports: [
    RealizationItem,
    Header,
    ContactSection,
    Footer
  ],
  templateUrl: './realizations-page.html',
  styleUrl: './realizations-page.scss',
})
export class RealizationsPage {
  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(
    this.realizationsService.getAll(),
    {
      initialValue: ApiState.loading<Realization[]>()
    }
  );
}
