import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ViewportScroller } from '@angular/common';
import { HomePage } from './features/home-page/home-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App {
  private viewportScroller = inject(ViewportScroller);
  protected readonly title = signal('PortfolioFrontend');

  constructor() {
    this.viewportScroller.setOffset([0, 30]); // [x, y] offset for fixed header
  }

  protected onRouteAttach(component: unknown): void {
    if (component instanceof HomePage) component.motionLifecycle.attach();
  }

  protected onRouteDetach(component: unknown): void {
    if (component instanceof HomePage) component.motionLifecycle.detach();
  }
}
