import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { gsap } from 'gsap';

@Component({
  selector: 'app-apps-preview',
  imports: [NgTemplateOutlet],
  templateUrl: './apps-preview.html',
  styleUrls: [
    './apps-preview.scss',
    './apps-preview-workspace.scss',
    './apps-preview-layouts.scss',
    './apps-preview-scenes.scss',
    './apps-preview-notifications.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsPreview {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private motion?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        const root = this.element.nativeElement;
        void import('./apps-preview-animation').then(({ animateAppsPreview }) => {
          if (!this.destroyRef.destroyed && root.isConnected) {
            this.motion = animateAppsPreview(root);
          }
        }).catch((error: unknown) => {
          console.warn('Apps preview animation could not be loaded.', error);
        });
      });
    });

    this.destroyRef.onDestroy(() => this.motion?.revert());
  }
}
