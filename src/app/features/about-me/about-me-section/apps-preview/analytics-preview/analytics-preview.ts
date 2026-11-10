import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-analytics-preview',
  host: { '[class.is-phone]': 'device() === "phone"' },
  templateUrl: './analytics-preview.html',
  styleUrl: './analytics-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPreview {
  readonly device = input.required<'desktop' | 'phone'>();
}
