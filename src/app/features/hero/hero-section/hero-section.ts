import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {
  // Animation is disabled on SSR, enabled only after client-side hydration
  isHydrated = signal(false);

  constructor() {
    afterNextRender(() => {
      // Enable animations after hydration is complete
      this.isHydrated.set(true);
    });
  }
}
