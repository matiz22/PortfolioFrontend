import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-messaging-preview',
  host: { '[class.is-phone]': 'device() === "phone"' },
  templateUrl: './messaging-preview.html',
  styleUrl: './messaging-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagingPreview {
  readonly device = input.required<'desktop' | 'phone'>();
}
