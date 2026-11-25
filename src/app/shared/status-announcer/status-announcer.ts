import { afterRenderEffect, ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-status-announcer',
  template: '<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcedMessage() }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusAnnouncer {
  readonly message = input('');
  protected readonly announcedMessage = signal('');

  constructor() {
    // Keep the region empty for its first render so assistive technology can
    // register it before any message arrives, then update only its text node.
    afterRenderEffect(() => this.announcedMessage.set(this.message()));
  }
}
