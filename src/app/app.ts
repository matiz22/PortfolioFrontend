import {Component, signal, ViewChild} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent,} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Footer} from './shared/footer/footer/footer';
import {LanguagesSwitcher} from './shared/languages/languages-switcher/languages-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent, Footer, RouterLink, LanguagesSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Mateusz | Freelance Developer & AI Enthusiast');

  @ViewChild('drawer') drawer!: MatSidenav;

  toggleDrawer(): void {
    this.drawer.toggle();
  }

}
