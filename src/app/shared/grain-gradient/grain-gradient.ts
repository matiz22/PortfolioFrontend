import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  viewChild,
} from '@angular/core';
import { HERO_PALETTE, watchGrainGradientPalette } from './grain-gradient-palette';
import type { GrainRenderer } from './grain-gradient-renderer';

@Component({
  selector: 'app-grain-gradient',
  template: '<div #surface class="grain-surface"></div><div class="grain-gap"></div>',
  styleUrl: './grain-gradient.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class GrainGradient {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly surface = viewChild.required<ElementRef<HTMLDivElement>>('surface');

  constructor() {
    let renderer: GrainRenderer | undefined;
    let stopPalette: (() => void) | undefined;
    this.destroyRef.onDestroy(() => {
      stopPalette?.();
      renderer?.dispose();
    });

    // Keep WebGL out of SSR and its render loop out of Angular change detection.
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      const surface = this.surface().nativeElement;
      const interactionRoot = this.element.nativeElement.parentElement!;
      let palette = HERO_PALETTE;
      stopPalette = watchGrainGradientPalette(interactionRoot, (next) => {
        palette = next;
        surface.style.setProperty('--grain-bottom', palette[1].join(' '));
        surface.style.setProperty('--grain-top', palette[2].join(' '));
        renderer?.setPalette(palette);
      });

      void import('./grain-gradient-renderer').then(async ({ mountGrainGradient }) => {
        if (this.destroyRef.destroyed) {
          return;
        }

        const mounted = await mountGrainGradient(surface, interactionRoot, () => palette);
        if (this.destroyRef.destroyed) {
          mounted?.dispose();
        } else {
          renderer = mounted;
        }
      }).catch((error: unknown) => {
        // The CSS gradient remains visible when WebGL or the optional chunk fails.
        console.warn('Grain gradient unavailable; using the static background.', error);
      });
    }));
  }
}
