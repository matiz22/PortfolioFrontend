import { Component, EventEmitter, Input, Output, Signal, computed } from '@angular/core';

@Component({
  selector: 'app-pagination-tiles',
  imports: [],
  templateUrl: './pagination-tiles.html',
  styleUrl: './pagination-tiles.scss',
})
export class PaginationTiles {
  @Input({ required: true }) pageNumbers: Signal<number[]> = computed(() => []);
  @Input({ required: true }) currentPage: Signal<number> = computed(() => 1);

  @Output() pageChange = new EventEmitter<number>();

  onPageClick(page: number): void {
    this.pageChange.emit(page);
  }
}
