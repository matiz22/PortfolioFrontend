import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialLinksRow } from '../../features/social-links/social-links-row/social-links-row';


@Component({
  selector: 'app-footer',
  imports: [RouterLink, SocialLinksRow],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
}
