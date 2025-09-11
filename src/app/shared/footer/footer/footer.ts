import {Component} from '@angular/core';
import {SiteLinks} from '../site-links/site-links';
import {SocialLinks} from '../social-links/social-links';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-footer',
  imports: [
    SiteLinks,
    SocialLinks,
    MatDivider
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
