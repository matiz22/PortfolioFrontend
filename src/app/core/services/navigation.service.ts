import {Injectable} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  navigateToSection(sectionId: string, drawer?: MatSidenav): void {
    if (drawer) {
      drawer.close();
    }

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
