import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgZone,
  viewChild,
} from '@angular/core';
import {
  GRAIN_CHAPTER_PALETTES,
  type GrainChapter,
  HERO_PALETTE,
  watchGrainGradientPalette,
} from './grain-gradient-palette';
import type {GrainRenderer} from './grain-gradient-renderer';

const CONTEXT_RETRY_DELAY = 350;

@Component({
  selector: 'app-grain-gradient',
  template: '<div #surface class="grain-surface"></div><div class="grain-gap"></div>',
  styleUrl: './grain-gradient.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.has-fixed-palette]': 'chapter() !== undefined',
    '[style.--grain-bottom]': 'palette()[1].join(" ")',
    '[style.--grain-top]': 'palette()[2].join(" ")',
  },
})
export class GrainGradient {
  /** Pin the shader to one home chapter instead of blending palettes on scroll. */
  readonly chapter = input<GrainChapter>();
  protected readonly palette = computed(() => {
    const chapter = this.chapter();
    return chapter === undefined ? HERO_PALETTE : GRAIN_CHAPTER_PALETTES[chapter];
  });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly surface = viewChild.required<ElementRef<HTMLDivElement>>('surface');

  constructor() {
    // Keep WebGL out of SSR and its render loop out of Angular change detection.
    afterRenderEffect((onCleanup) => this.zone.runOutsideAngular(() => {
      const hasFixedPalette = this.chapter() !== undefined;
      const host = this.element.nativeElement;
      const view = host.ownerDocument.defaultView;
      const surface = this.surface().nativeElement;
      const interactionRoot = host.parentElement!;
      let palette = this.palette();
      let renderer: GrainRenderer | undefined;
      let pending: AbortController | undefined;
      let retry: number | undefined;
      let retried = false;

      const stopPalette = hasFixedPalette
        ? undefined
        : watchGrainGradientPalette(interactionRoot, (next) => {
          palette = next;
          surface.style.setProperty('--grain-bottom', palette[1].join(' '));
          surface.style.setProperty('--grain-top', palette[2].join(' '));
          renderer?.setPalette(palette);
        });

      const show = () => {
        if (renderer || pending || retry !== undefined || !host.isConnected) {
          return;
        }

        const request = new AbortController();
        pending = request;
        void import('./grain-gradient-renderer').then(async ({ mountGrainGradient }) => {
          if (request.signal.aborted) {
            return;
          }

          const mounted = await mountGrainGradient(surface, interactionRoot, () => palette, request.signal, recover);
          if (request.signal.aborted) {
            mounted?.dispose();
          } else {
            renderer = mounted;
          }
        }).catch((error: unknown) => {
          if (!request.signal.aborted) {
            console.warn('Grain gradient unavailable; using the static background.', error);
          }
        }).finally(() => {
          if (pending === request) {
            pending = undefined;
          }
        });
      };

      const recover = () => {
        renderer = undefined;
        // Give the GPU a chance to recover once, not an endless remount loop.
        if (view && !retried) {
          retried = true;
          retry = view.setTimeout(() => {
            retry = undefined;
            show();
          }, CONTEXT_RETRY_DELAY);
        }
      };

      const hide = () => {
        view?.clearTimeout(retry);
        retry = undefined;
        pending?.abort();
        pending = undefined;
        renderer?.dispose();
        renderer = undefined;
      };

      // The archive can detach without destroying its component. Observe the
      // backdrop itself so scrolling within an active route keeps it live.
      const ViewportObserver = hasFixedPalette ? view?.IntersectionObserver : undefined;
      const observer = ViewportObserver
        ? new ViewportObserver((entries) => {
          if (entries.at(-1)?.isIntersecting && host.isConnected) {
            show();
          } else {
            hide();
          }
        })
        : undefined;
      if (observer) {
        observer.observe(host);
      } else {
        show();
      }

      onCleanup(() => {
        observer?.disconnect();
        hide();
        stopPalette?.();
        surface.style.removeProperty('--grain-bottom');
        surface.style.removeProperty('--grain-top');
      });
    }));
  }
}
