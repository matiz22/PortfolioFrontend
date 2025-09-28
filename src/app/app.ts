import {Component, signal, ViewChild} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent,} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Footer} from './shared/footer/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent, Footer, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  @ViewChild('drawer') drawer!: MatSidenav;

  constructor() {

  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }

}
