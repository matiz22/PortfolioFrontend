import { Component, Input } from '@angular/core';
import { LoadingCard } from '../loading-card/loading-card';
import { LoadingCardCover } from '../loading-card-cover/loading-card-cover';

@Component({
  selector: 'app-loading-items',
  imports: [LoadingCard, LoadingCardCover],
  templateUrl: './loading-items.html',
  styleUrl: './loading-items.scss',
})
export class LoadingItems {
  @Input() count: number = 9;
  @Input() variant: 'default' | 'cover' = 'default';

  // Helper to generate array for loop
  getItems() {
    return new Array(this.count);
  }
}
