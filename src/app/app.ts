import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { notifyRouteAttachment } from './core/models/route-attachment';
import { RoutePresentation } from './core/services/route-presentation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PortfolioFrontend');

  constructor() {
    inject(RoutePresentation);
  }

  protected onRouteAttach(component: unknown): void {
    notifyRouteAttachment(component, 'onRouteAttach');
  }

  protected onRouteDetach(component: unknown): void {
    notifyRouteAttachment(component, 'onRouteDetach');
  }
}
