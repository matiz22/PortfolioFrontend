import {AfterViewInit, Directive, ElementRef, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Directive({
  selector: '[appAosAnimations]'
})
export class AosAnimations implements AfterViewInit, OnInit {

  @Input() animationType: string = 'slide-in';

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.el.nativeElement.classList.add(this.animationType);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(this.el.nativeElement);
    }
  }

}
