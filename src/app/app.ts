import {Component, Inject, LOCALE_ID, signal, ViewChild} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent,} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Footer} from './shared/footer/footer/footer';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {environment} from '../enviroments/enviroment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent, Footer, RouterLink, MatMenu, MatButton, MatMenuItem, MatMenuTrigger],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  @ViewChild('drawer') drawer!: MatSidenav;

  protected readonly environment = environment;

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  constructor(@Inject(LOCALE_ID) public locale: string) {

  }

  getCurrentLanguage(): string {
    return environment.languagesOptions.find(lang => lang.code === this.locale)?.label || 'Unknown';
  }
}
