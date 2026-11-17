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
    let dispose: (() => void) | undefined;
    this.destroyRef.onDestroy(() => dispose?.());

    // Keep WebGL out of SSR and its render loop out of Angular change detection.
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      void import('./grain-gradient-renderer').then(async ({ mountGrainGradient }) => {
        if (this.destroyRef.destroyed) {
          return;
        }

        const surface = this.surface().nativeElement;
        const interactionRoot = this.element.nativeElement.parentElement!;
        const cleanup = await mountGrainGradient(surface, interactionRoot);
        if (this.destroyRef.destroyed) {
          cleanup();
        } else {
          dispose = cleanup;
        }
      }).catch((error: unknown) => {
        // The CSS gradient remains visible when WebGL or the optional chunk fails.
        console.warn('Grain gradient unavailable; using the static background.', error);
      });
    }));
  }
}
