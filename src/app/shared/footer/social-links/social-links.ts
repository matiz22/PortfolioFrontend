import {Component, inject} from '@angular/core';
import {SocialLinksService} from '../../../core/services/social.links.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {SocialLink} from '../../../core/models/social.link';
import {MatIconButton} from '@angular/material/button';
import {ImageUrlPipe} from '../../pipes/image-url-pipe';
import {ApiState} from '../../../core/models/api.state';

@Component({
  selector: 'app-social-links',
  imports: [
    MatIconButton,
    ImageUrlPipe
  ],
  templateUrl: './social-links.html',
  styleUrl: './social-links.scss'
})
export class SocialLinks {
  socialLinksService: SocialLinksService = inject(SocialLinksService);
  socialLinks = toSignal(
    this.socialLinksService.getAll(),
    {
      initialValue: ApiState.loading<SocialLink[]>()
    }
  );
}
