import {Component, signal, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent,} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  @ViewChild('drawer') drawer!: MatSidenav;

  navigateToSection(sectionId: string, drawer: MatSidenav): void {
    drawer.close();

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }, 300);
  }

  toggleDrawer(drawer: MatSidenav): void {
    drawer.toggle();

    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

}
