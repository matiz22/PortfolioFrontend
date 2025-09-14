import {Component} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-about-me-section',
  imports: [
    MatFabButton,
    RouterLink,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './about-me-section.html',
  styleUrl: './about-me-section.scss'
})
export class AboutMeSection {

}
