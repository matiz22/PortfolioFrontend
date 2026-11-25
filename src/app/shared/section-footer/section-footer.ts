import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-section-footer',
  templateUrl: './section-footer.html',
  styleUrl: './section-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionFooter {}
