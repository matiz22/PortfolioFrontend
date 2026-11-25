import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { afterNextRenderMotion } from '../../../../shared/animations/lazy-motion';

@Component({
  selector: 'app-apps-preview',
  imports: [NgTemplateOutlet],
  templateUrl: './apps-preview.html',
  styleUrls: [
    './apps-preview-mockups.css',
    './apps-preview.scss',
    './apps-preview-workspace.scss',
    './apps-preview-layouts.scss',
    './apps-preview-scenes.scss',
    './apps-preview-notifications.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsPreview {
  constructor() {
    afterNextRenderMotion(async () => (await import('./apps-preview-animation')).animateAppsPreview,
      'Apps preview animation could not be loaded.');
  }
}
