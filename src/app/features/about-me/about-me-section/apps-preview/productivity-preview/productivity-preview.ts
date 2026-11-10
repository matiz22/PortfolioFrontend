import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-productivity-preview',
  host: { '[class.is-phone]': 'device() === "phone"' },
  templateUrl: './productivity-preview.html',
  styleUrl: './productivity-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductivityPreview {
  readonly device = input.required<'desktop' | 'phone'>();
}
