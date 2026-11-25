import { ChangeDetectionStrategy, Component } from '@angular/core';
import { afterNextRenderMotion } from '../../../../shared/animations/lazy-motion';
import { StorefrontPreview } from './storefront-preview/storefront-preview';
import { DashboardPreview } from './dashboard-preview/dashboard-preview';

@Component({
  selector: 'app-web-development-preview',
  imports: [StorefrontPreview, DashboardPreview],
  templateUrl: './web-development-preview.html',
  styleUrls: ['./web-development-preview-mockup.css', './web-development-preview.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebDevelopmentPreview {
  constructor() {
    afterNextRenderMotion(async () => (await import('./web-preview-animation')).animateWebPreview,
      'Web Development preview animation could not be loaded.');
  }
}
