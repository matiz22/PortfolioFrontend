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
import { StorefrontPreview } from './storefront-preview/storefront-preview';
import { DashboardPreview } from './dashboard-preview/dashboard-preview';

@Component({
  selector: 'app-web-development-preview',
  imports: [StorefrontPreview, DashboardPreview],
  templateUrl: './web-development-preview.html',
  styleUrl: './web-development-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebDevelopmentPreview {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private motion?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        const root = this.element.nativeElement;
        void import('./web-preview-animation').then(({ animateWebPreview }) => {
          if (!this.destroyRef.destroyed && root.isConnected) {
            this.motion = animateWebPreview(root);
          }
        }).catch((error: unknown) => {
          console.warn('Web Development preview animation could not be loaded.', error);
        });
      });
    });

    this.destroyRef.onDestroy(() => this.motion?.revert());
  }
}
