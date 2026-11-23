import {
  afterRenderEffect, ChangeDetectionStrategy, Component, inject, input, NgZone, signal,
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
})
export class HomeRailControls {
  readonly viewport = input.required<HTMLElement>();
  readonly headingId = input.required<string>();
  protected readonly position = signal<'hidden' | 'start' | 'middle' | 'end'>('hidden');
  private readonly zone = inject(NgZone);

  constructor() {
    afterRenderEffect({
      read: (onCleanup) => {
        const viewport = this.viewport();
        const view = viewport.ownerDocument.defaultView;
        if (!view) return;

        this.zone.runOutsideAngular(() => {
          const mobile = view.matchMedia(MOBILE_QUERY);
          let max = 0;
          let inlineDirection = 1;

          const sync = () => {
            const offset = inlineDirection * viewport.scrollLeft;
            this.position.set(max <= EDGE_TOLERANCE ? 'hidden'
              : offset <= EDGE_TOLERANCE ? 'start'
              : offset >= max - EDGE_TOLERANCE ? 'end'
              : 'middle');
          };

          const refresh = () => {
            max = 0;
            if (mobile.matches && viewport.querySelectorAll(CARD).length > 1) {
              const style = view.getComputedStyle(viewport);
              inlineDirection = style.direction === 'rtl' ? -1 : 1;
              if (style.overflowX === 'auto') {
                max = viewport.scrollWidth - viewport.clientWidth;
              }
            }
            sync();
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
    if (position === 'hidden' || (direction === -1 ? position === 'start' : position === 'end')) {
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
