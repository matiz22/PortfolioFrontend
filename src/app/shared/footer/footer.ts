import { Component, inject } from '@angular/core';
import { SocialLinksService } from '../../core/services/social.links.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../core/models/api.state';
import { SocialLink } from '../../core/models/social.link';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../pipes/image-url-pipe';


@Component({
  selector: 'app-footer',
  imports: [RouterLink, ImageUrlPipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  socialLinksService: SocialLinksService = inject(SocialLinksService);
  socialLinks = toSignal(
    this.socialLinksService.getAll(),
    {
      initialValue: ApiState.loading<SocialLink[]>()
    }
  );
}
