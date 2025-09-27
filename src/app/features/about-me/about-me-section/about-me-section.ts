import {Component} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-about-me-section',
  imports: [
    MatFabButton,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './about-me-section.html',
  styleUrl: './about-me-section.scss'
})
export class AboutMeSection {

}
