import {
  afterRenderEffect, ChangeDetectionStrategy, Component, computed, inject, input, NgZone, signal,
} from '@angular/core';

const MOBILE_QUERY = '(width < 48rem)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const CARD = '[data-home-rail-item]';
// scrollWidth is rounded, but scrollLeft can be fractional.
const EDGE_TOLERANCE = 1;

@Component({
  selector: 'app-home-rail-controls',
  templateUrl: './home-rail-controls.html',
  styleUrl: './home-rail-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.responsive]': "scope() === 'responsive'" },
})
export class HomeRailControls {
  readonly viewport = input.required<HTMLElement>();
  readonly headingId = input.required<string>();
  readonly scope = input<'mobile' | 'responsive'>('mobile');
  readonly showProgress = input(false);
  protected readonly position = signal<'hidden' | 'start' | 'middle' | 'end'>('hidden');
  protected readonly pinnedProgress = signal<number | null>(null);
  private readonly isPinned = computed(() => this.pinnedProgress() !== null);
  private readonly nativeProgress = signal(0);
  protected readonly progress = computed(() => this.pinnedProgress() ?? this.nativeProgress());
  private readonly zone = inject(NgZone);

  /** Animation owns pinned travel; Angular keeps ownership of the controls. */
  setPinnedProgress(progress: number | null): void {
    this.pinnedProgress.set(progress === null ? null : Math.max(0, Math.min(1, progress)));
  }

  constructor() {
    afterRenderEffect({
      read: (onCleanup) => {
        const viewport = this.viewport();
        const responsive = this.scope() === 'responsive';
        // Re-measure after Angular renders a mode transition and the pin's
        // synchronous cleanup has restored native overflow. Progress changes
        // within pinned mode do not rebuild observers.
        this.isPinned();
        const view = viewport.ownerDocument.defaultView;
        if (!view) return;

        this.zone.runOutsideAngular(() => {
          const mobile = view.matchMedia(MOBILE_QUERY);
          let max = 0;
          let inlineDirection = 1;
          const observedCards = new Set<Element>();

          const sync = () => {
            const offset = inlineDirection * viewport.scrollLeft;
            this.nativeProgress.set(max > EDGE_TOLERANCE ? Math.max(0, Math.min(1, offset / max)) : 0);
            this.position.set(max <= EDGE_TOLERANCE ? 'hidden'
              : offset <= EDGE_TOLERANCE ? 'start'
              : offset >= max - EDGE_TOLERANCE ? 'end'
              : 'middle');
          };

          const refresh = () => {
            max = 0;
            if ((responsive || mobile.matches) && viewport.querySelectorAll(CARD).length > 1) {
              const style = view.getComputedStyle(viewport);
              inlineDirection = style.direction === 'rtl' ? -1 : 1;
              if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
                max = viewport.scrollWidth - viewport.clientWidth;
              }
            }
            sync();
            const cards = new Set(viewport.querySelectorAll(CARD));
            for (const card of observedCards) {
              if (!cards.has(card)) {
                resize.unobserve(card);
                observedCards.delete(card);
              }
            }
            for (const card of cards) {
              if (!observedCards.has(card)) {
                resize.observe(card);
                observedCards.add(card);
              }
            }
          };

          // Observe native scroll rather than handling touch input: swipes, links,
          // and vertical page scrolling remain under the browser's control.
          viewport.addEventListener('scroll', sync, { passive: true });
          mobile.addEventListener('change', refresh);
          const resize = new ResizeObserver(refresh);
          resize.observe(viewport);
          const content = new MutationObserver(refresh);
          content.observe(viewport, { childList: true, subtree: true });
          refresh();

          onCleanup(() => {
            viewport.removeEventListener('scroll', sync);
            mobile.removeEventListener('change', refresh);
            resize.disconnect();
            content.disconnect();
          });
        });
      },
    });
  }

  protected move(direction: -1 | 1): void {
    const position = this.position();
    if (this.pinnedProgress() !== null || position === 'hidden' || (direction === -1 ? position === 'start' : position === 'end')) {
      return;
    }

    const viewport = this.viewport();
    const view = viewport.ownerDocument.defaultView;
    if (!view) return;

    const css = view.getComputedStyle(viewport);
    const rtl = css.direction === 'rtl';
    const sign = rtl ? -1 : 1;
    const bounds = viewport.getBoundingClientRect();
    const start = rtl ? bounds.right : bounds.left;
    const inset = parseFloat(css.scrollPaddingInlineStart) || 0;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const offset = sign * viewport.scrollLeft;
    const current = Math.max(0, Math.min(max, offset));

    // Find the next reachable card edge in the requested direction. Clamp the
    // final stop to the end of the rail so its trailing gutter stays visible.
    let target = direction === 1 ? max : 0;
    for (const card of viewport.querySelectorAll(CARD)) {
      const rect = card.getBoundingClientRect();
      const edge = rtl ? rect.right : rect.left;
      const stop = Math.max(0, Math.min(max, offset + sign * (edge - start) - inset));
      if (direction === 1 && stop > current + EDGE_TOLERANCE) target = Math.min(target, stop);
      if (direction === -1 && stop < current - EDGE_TOLERANCE) target = Math.max(target, stop);
    }

    viewport.scrollTo({
      left: sign * target,
      behavior: view.matchMedia(REDUCED_MOTION_QUERY).matches ? 'instant' : 'smooth',
    });
  }
}
