import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import type { gsap } from 'gsap';
import { ProductivityPreview } from './productivity-preview/productivity-preview';
import { AnalyticsPreview } from './analytics-preview/analytics-preview';
import { MessagingPreview } from './messaging-preview/messaging-preview';

@Component({
  selector: 'app-apps-preview',
  imports: [ProductivityPreview, AnalyticsPreview, MessagingPreview],
  templateUrl: './apps-preview.html',
  styleUrl: './apps-preview.scss',
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
