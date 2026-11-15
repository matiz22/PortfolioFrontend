import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SectionAction } from '../section-action/section-action';

@Component({
  selector: 'app-section-next',
  imports: [SectionAction],
  templateUrl: './section-next.html',
  styleUrl: './section-next.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionNext {
  readonly targetId = input.required<string>();
}
