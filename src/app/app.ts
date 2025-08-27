import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {
  MatDrawer, MatDrawerContainer,
  MatDrawerContent, MatSidenav, MatSidenavContainer, MatSidenavContent,
} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatButton, MatIconButton} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatButton, MatDrawerContent, MatDrawer, MatDrawerContainer, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  @ViewChild('drawer') drawer!: MatSidenav;

  navigateToSection(sectionId: string, drawer: MatSidenav): void {
    drawer.close();

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
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
