import { ChangeDetectionStrategy, Component } from '@angular/core';
import { afterNextRenderMotion } from '../../../shared/animations/lazy-motion';
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
  constructor() {
    // The server and the first client render always expose every service.
    afterNextRenderMotion(async (root) => {
      const [{ animateAboutMeScroll }] = await Promise.all([
        import('./about-me-scroll-animation'), root.ownerDocument.fonts.ready,
      ]);
      return animateAboutMeScroll;
    }, 'About Me scroll animation could not be loaded.');
  }
}
