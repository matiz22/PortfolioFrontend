import { AfterViewInit, Directive, ElementRef, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAosAnimations]',
  standalone: true
})
export class AosAnimations implements AfterViewInit, OnInit {

  @Input() animationType: string = 'slide-in';
  @Input() delay: string | number = 0;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.el.nativeElement.classList.add(this.animationType);
    if (this.delay) {
      const delayValue = typeof this.delay === 'number' ? `${this.delay}ms` : this.delay;
      this.el.nativeElement.style.transitionDelay = delayValue;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Cleanup animation classes and styles after animation completes
            // Only remove transition-delay to prevent conflicts with existing hover effects
            setTimeout(() => {
              entry.target.classList.remove(this.animationType, 'visible');
              (entry.target as HTMLElement).style.transitionDelay = '';
              // Don't clear transition property to preserve hover animations
            }, 1200); // Wait longer than max animation duration (1s)

            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(this.el.nativeElement);
    }
  }

}
