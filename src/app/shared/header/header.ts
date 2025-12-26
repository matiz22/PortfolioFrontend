import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @ViewChild('menuDetails') menuDetails!: ElementRef<HTMLDetailsElement>;

  @HostListener('document:click')
  closeOnAnyClick() {
    this.menuDetails?.nativeElement.removeAttribute('open');
  }
}
