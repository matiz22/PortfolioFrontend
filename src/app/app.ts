import {Component, inject, signal, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent,} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NavigationService} from './core/services/navigation.service';
import {Footer} from './shared/footer/footer/footer';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatToolbar, MatNavList, MatListItem, MatIconButton, MatIconModule, MatSidenavContainer, MatSidenav, MatSidenavContent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  private translate = inject(TranslateService);
  @ViewChild('drawer') drawer!: MatSidenav;

  constructor(private navigationService: NavigationService) {
    this.translate.addLangs(['pl', 'en']);
    this.translate.setFallbackLang('en');
    console.log(this.translate.getBrowserLang());
    const lang = this.translate.getBrowserLang() ?? 'en';
    this.translate.use(lang);
  }

  navigateToSection(sectionId: string): void {
    this.navigationService.navigateToSection(sectionId, this.drawer);
  }

  toggleDrawer(): void {
    this.navigationService.toggleDrawer(this.drawer);
  }

}
