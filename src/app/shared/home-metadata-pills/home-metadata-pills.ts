import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type MetadataItem = { id: number; name: string };

const TECHNOLOGIES = $localize`:@@home.metadata.technologies:Technologies`;
const SKILLS = $localize`:@@home.metadata.skills:Skills`;

@Component({
  selector: 'ul[appHomeMetadataPills]',
  templateUrl: './home-metadata-pills.html',
  styleUrl: './home-metadata-pills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[attr.aria-label]': 'label()',
    '[class.is-skill-list]': 'kind() === "skills"',
  },
})
export class HomeMetadataPills {
  readonly items = input.required<readonly MetadataItem[]>();
  readonly kind = input<'technologies' | 'skills'>('technologies');

  protected readonly label = computed(() => this.kind() === 'skills' ? SKILLS : TECHNOLOGIES);
}
