import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();
}
