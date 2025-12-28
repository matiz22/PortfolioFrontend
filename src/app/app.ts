import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private viewportScroller = inject(ViewportScroller);
  protected readonly title = signal('PortfolioFrontend');

  constructor() {
    this.viewportScroller.setOffset([0, 30]); // [x, y] offset for fixed header
  }
}

