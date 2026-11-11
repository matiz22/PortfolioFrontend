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
import { WebDevelopmentPreview } from './web-development-preview/web-development-preview';
import { AppsPreview } from './apps-preview/apps-preview';
import { AiWorkflowPreview } from './ai-workflow-preview/ai-workflow-preview';

@Component({
  selector: 'app-about-me-section',
  imports: [WebDevelopmentPreview, AppsPreview, AiWorkflowPreview],
  templateUrl: './about-me-section.html',
  styleUrl: './about-me-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private motion?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        const root = this.element.nativeElement;

        // The server and the first client render always expose every service.
        void Promise.all([
          import('./about-me-scroll-animation'),
          root.ownerDocument.fonts.ready,
        ]).then(([{ animateAboutMeScroll }]) => {
          if (!this.destroyRef.destroyed && root.isConnected) {
            this.motion = animateAboutMeScroll(root);
          }
        }).catch((error: unknown) => {
          console.warn('About Me scroll animation could not be loaded.', error);
        });
      });
    });

    this.destroyRef.onDestroy(() => this.motion?.revert());
  }
}
