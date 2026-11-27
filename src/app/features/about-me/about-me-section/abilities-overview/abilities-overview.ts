import { ChangeDetectionStrategy, Component } from '@angular/core';
import { afterNextRenderMotion } from '../../../../shared/animations/lazy-motion';
import { observePreviewPlayback } from '../../../../shared/animations/preview-playback';

@Component({
  selector: 'app-abilities-overview',
  templateUrl: './abilities-overview.html',
  styleUrls: [
    './abilities-overview.scss',
    './abilities-overview-devices.scss',
    './abilities-overview-extraction.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbilitiesOverview {
  constructor() {
    afterNextRenderMotion(async () => (root) => {
      const stop = observePreviewPlayback(root, (playing) => {
        root.classList.toggle('is-playing', playing);
      }, root.closest<HTMLElement>('.about-overview'));
      return () => {
        stop();
        root.classList.remove('is-playing');
      };
    }, 'Abilities overview animation could not be loaded.');
  }
}
