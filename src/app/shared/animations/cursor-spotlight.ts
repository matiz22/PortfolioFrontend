import { Directive, ElementRef, Inject, OnDestroy, AfterViewInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCursorSpotlight]',
  standalone: true
})
export class CursorSpotlight implements AfterViewInit, OnDestroy {
  private overlay: HTMLElement | null = null;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseLeaveHandler: (() => void) | null = null;
  private mouseEnterHandler: (() => void) | null = null;
  private rafId: number | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.el.nativeElement;

    // Ensure host has relative/non-static positioning
    const computedPosition = getComputedStyle(host).position;
    if (computedPosition === 'static') {
      this.renderer.setStyle(host, 'position', 'relative');
    }

    // Create overlay with BIGGER dots — same grid, larger radius
    this.overlay = this.renderer.createElement('div');
    this.renderer.setStyle(this.overlay, 'position', 'absolute');
    this.renderer.setStyle(this.overlay, 'inset', '0');
    this.renderer.setStyle(this.overlay, 'pointer-events', 'none');
    this.renderer.setStyle(this.overlay, 'z-index', '1');
    this.renderer.setStyle(this.overlay, 'opacity', '0');
    this.renderer.setStyle(this.overlay, 'transition', 'opacity 0.4s ease');
    // Bigger, brighter dots on the same 24px grid
    this.renderer.setStyle(
      this.overlay,
      'backgroundImage',
      'radial-gradient(oklch(79% 0.209 151.711 / 0.9) 2.5px, transparent 2.5px)'
    );
    this.renderer.setStyle(this.overlay, 'backgroundSize', '24px 24px');
    // Mask: radial fade from cursor position — hides the big dots except near the pointer
    this.renderer.setStyle(this.overlay, '-webkit-mask-image', 'radial-gradient(300px circle at 0px 0px, black, transparent 70%)');
    this.renderer.setStyle(this.overlay, 'mask-image', 'radial-gradient(300px circle at 0px 0px, black, transparent 70%)');
    this.renderer.appendChild(host, this.overlay);

    this.mouseMoveHandler = (e: MouseEvent) => {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      this.rafId = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maskValue = `radial-gradient(300px circle at ${x}px ${y}px, black, transparent 70%)`;

        if (this.overlay) {
          this.renderer.setStyle(this.overlay, '-webkit-mask-image', maskValue);
          this.renderer.setStyle(this.overlay, 'mask-image', maskValue);
        }
      });
    };

    this.mouseEnterHandler = () => {
      if (this.overlay) {
        this.renderer.setStyle(this.overlay, 'opacity', '1');
      }
    };

    this.mouseLeaveHandler = () => {
      if (this.overlay) {
        this.renderer.setStyle(this.overlay, 'opacity', '0');
      }
    };

    host.addEventListener('mousemove', this.mouseMoveHandler);
    host.addEventListener('mouseenter', this.mouseEnterHandler);
    host.addEventListener('mouseleave', this.mouseLeaveHandler);
  }

  ngOnDestroy(): void {
    const host = this.el.nativeElement;
    if (this.mouseMoveHandler) host.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.mouseEnterHandler) host.removeEventListener('mouseenter', this.mouseEnterHandler);
    if (this.mouseLeaveHandler) host.removeEventListener('mouseleave', this.mouseLeaveHandler);

    if (this.rafId) cancelAnimationFrame(this.rafId);

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
