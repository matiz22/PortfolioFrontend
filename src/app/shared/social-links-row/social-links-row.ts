import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { SocialLinksService } from '../../core/services/social.links.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../core/models/api.state';
import { SocialLink } from '../../core/models/social.link';
import { ImageUrlPipe } from '../pipes/image-url-pipe';
import { StatusAnnouncer } from '../status-announcer/status-announcer';

@Component({
  selector: 'app-social-links-row',
  imports: [ImageUrlPipe, StatusAnnouncer],
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
  protected readonly statusMessage = computed(() => this.socialLinks().status === 'loading'
    ? $localize`:@@socialLinks.loading:Loading social links…`
    : '');
}
