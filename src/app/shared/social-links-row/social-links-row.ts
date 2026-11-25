import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { SocialLinksService } from '../../core/services/social.links.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly socialLinks = signal<ApiState<SocialLink[]> | null>(null);
  protected readonly statusMessage = computed(() => this.socialLinks()?.status === 'loading'
    ? $localize`:@@socialLinks.loading:Loading social links…`
    : '');

  constructor() {
    // Email and the form are rendered on the server; social links are optional.
    afterNextRender(() => {
      this.socialLinks.set(ApiState.loading());
      this.socialLinksService.getAll().pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(state => this.socialLinks.set(state));
    });
  }
}
