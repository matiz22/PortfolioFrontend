import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { injectLazyMotion } from '../animations/lazy-motion';
import { FINE_POINTER_MOTION_QUERY } from '../animations/motion-media';

@Component({
  selector: 'a[appSectionAction]',
  templateUrl: './section-action.html',
  styleUrl: './section-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'section-action',
    '[class.section-action-archive]': "variant() === 'archive'",
    '[class.section-action-continue]': "variant() === 'continue'",
    '[class.section-action-cta]': "variant() === 'cta'",
    '[class.section-action-scroll-cue]': 'scrollCue()',
  },
})
export class SectionAction {
  readonly variant = input<'archive' | 'continue' | 'cta'>('archive');
  /** Frost the chip: archives always, continuation when hosted on the homepage. */
  readonly glass = input(false);
  readonly scrollCue = input(false);

  protected readonly chipGlass = computed(() => {
    const variant = this.variant();
    return variant === 'archive' || (variant === 'continue' && this.glass());
  });

  constructor() {
    const mountMotion = injectLazyMotion<HTMLAnchorElement>();
    afterRenderEffect((onCleanup) => {
      const strength = this.variant() === 'continue' ? 4 : 8;
      onCleanup(mountMotion(async () => {
        const { animateSectionAction } = await import('./section-action-magnet');
        return (root) => animateSectionAction(root, strength);
        // Eager sections (hero) render before the page has loaded; keep the
        // magnet download out of the critical load window.
      }, 'Section button interaction could not be loaded.', FINE_POINTER_MOTION_QUERY, true));
    });
  }
}
