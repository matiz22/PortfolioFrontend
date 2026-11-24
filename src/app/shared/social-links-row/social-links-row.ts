import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { SocialLinksService } from '../../core/services/social.links.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../core/models/api.state';
import { SocialLink } from '../../core/models/social.link';
import { ImageUrlPipe } from '../pipes/image-url-pipe';

@Component({
  selector: 'app-social-links-row',
  imports: [ImageUrlPipe],
  templateUrl: './social-links-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './social-links-row.scss',
})
export class SocialLinksRow {
  readonly glass = input(false);
  private readonly socialLinksService = inject(SocialLinksService);
  protected readonly socialLinks = toSignal(
    this.socialLinksService.getAll(),
    {
      initialValue: ApiState.loading<SocialLink[]>()
    }
  );
}
