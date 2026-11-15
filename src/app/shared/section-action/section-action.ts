import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
} from '@angular/core';
import type { gsap } from 'gsap';

@Component({
  selector: 'a[appSectionAction]',
  templateUrl: './section-action.html',
  styleUrl: './section-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'section-action',
    '[class.section-action-archive]': "variant() === 'archive'",
    '[class.section-action-continue]': "variant() === 'continue'",
  },
})
export class SectionAction {
  readonly variant = input<'archive' | 'continue'>('archive');
  private readonly element = inject<ElementRef<HTMLAnchorElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  constructor() {
    afterRenderEffect((onCleanup) => {
      const strength = this.variant() === 'archive' ? 8 : 4;
      const root = this.element.nativeElement;
      let motion: gsap.MatchMedia | undefined;
      let disposed = false;
      onCleanup(() => {
        disposed = true;
        motion?.revert();
      });

      void import('./section-action-magnet')
        .then(({ animateSectionAction }) => {
          if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
            this.zone.runOutsideAngular(() => {
              motion = animateSectionAction(root, strength);
            });
          }
        })
        .catch((error: unknown) => {
          // Routing, native anchors, and CSS focus states do not depend on motion.
          console.warn('Section button interaction could not be loaded.', error);
        });
    });
  }
}
