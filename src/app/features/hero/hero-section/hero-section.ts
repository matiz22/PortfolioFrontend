import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { afterNextRenderMotion } from '../../../shared/animations/lazy-motion';
import { MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';
import { SectionAction } from '../../../shared/section-action/section-action';

@Component({
  selector: 'app-hero-section',
  imports: [
    NgOptimizedImage,
    SectionAction,
  ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  constructor() {
    afterNextRenderMotion(async (root) => {
      const [{ animateHeroScroll }] = await Promise.all([
        import('./hero-scroll-animation'), root.ownerDocument.fonts.ready,
      ]);
      return animateHeroScroll;
    }, 'Hero scroll animation could not be loaded.', MOTION_ALLOWED_QUERY);

    // Keep SSR text readable while the optional animation and display font load.
    afterNextRenderMotion(async (root) => {
      const [{ animateHeroText }] = await Promise.all([
        import('./hero-text-animation'), root.ownerDocument.fonts.ready,
      ]);
      return animateHeroText;
    }, 'Hero text animation could not be loaded.', MOTION_ALLOWED_QUERY);
  }
}
