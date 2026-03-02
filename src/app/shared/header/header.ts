import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguagesSwitcher } from '../languages/languages-switcher/languages-switcher';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    LanguagesSwitcher
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    class: 'relative z-[9999] block'
  }
})
export class Header {
  @ViewChild('menuDetails') menuDetails!: ElementRef<HTMLDetailsElement>;

  @HostListener('document:click')
  closeOnAnyClick() {
    this.menuDetails?.nativeElement.removeAttribute('open');
  }
}
