import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import type { gsap } from 'gsap';

@Component({
  selector: 'app-hero-section',
  imports: [
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private motion?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        const root = this.element.nativeElement;
        if (root.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        // Keep SSR text readable while the optional animation and display font load.
        void Promise.all([
          import('./hero-text-animation'),
          root.ownerDocument.fonts.ready,
        ]).then(([{ animateHeroText }]) => {
          if (!this.destroyRef.destroyed && this.element.nativeElement.isConnected) {
            this.motion = animateHeroText(root);
          }
        }).catch((error: unknown) => {
          console.warn('Hero text animation could not be loaded.', error);
        });
      });
    });

    this.destroyRef.onDestroy(() => this.motion?.revert());
  }
}
