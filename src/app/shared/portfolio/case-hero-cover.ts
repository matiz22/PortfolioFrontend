import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GRAIN_CHAPTER_ACCENTS, GrainChapter } from '../grain-gradient/grain-gradient-palette';

/**
 * Thumbnail as a duotone cover behind the case-study hero: colorized with the
 * chapter's grain accent (the photo keeps only its lightness), fully visible
 * at the top and dissolving toward the bottom into the animated background.
 */
@Component({
  selector: 'app-case-hero-cover',
  template: '<img [src]="src()" fetchpriority="high" decoding="async" alt="" />',
  styleUrl: './case-hero-cover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'case-hero-cover',
    '[style.--wash-accent]': 'accent()',
  },
})
export class CaseHeroCover {
  readonly src = input.required<string>();
  readonly chapter = input.required<GrainChapter>();

  readonly accent = computed(() => GRAIN_CHAPTER_ACCENTS[this.chapter()]);
}
