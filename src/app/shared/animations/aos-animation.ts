import { AfterViewInit, Directive, ElementRef, inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAosAnimations]',
  standalone: true
})
export class AosAnimations implements AfterViewInit, OnInit {

  @Input('appAosAnimations') animationType = 'reveal-elegant';
  @Input() delay: string | number = 0;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.el.nativeElement.classList.add(this.animationType);
    if (this.delay !== undefined) {
      const baseDelay = 150;
      const delayValue = typeof this.delay === 'number' ? `${this.delay + baseDelay}ms` : this.delay;
      this.el.nativeElement.style.transitionDelay = delayValue;
      this.el.nativeElement.style.animationDelay = delayValue;
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
            }, 2000); // Wait longer than max animation duration (1.4s)

            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(this.el.nativeElement);
    }
  }

}
