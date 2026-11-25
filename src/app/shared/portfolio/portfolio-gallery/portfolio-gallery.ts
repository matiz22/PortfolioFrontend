import { DecimalPipe } from '@angular/common';
import {
  afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, input, signal, viewChild,
} from '@angular/core';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';

@Component({
  selector: 'app-portfolio-gallery',
  imports: [DecimalPipe, ImageUrlPipe],
  templateUrl: './portfolio-gallery.html',
  styleUrl: './portfolio-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGallery {
  readonly title = input.required<string>();
  readonly headingId = input.required<string>();
  readonly screenshots = input.required<readonly string[]>();
  protected readonly trackId = computed(() => `${this.headingId()}-track`);
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');

  protected readonly activeIndex = signal(0);
  protected readonly positionLabel = computed(() => {
    const current = this.activeIndex() + 1;
    const total = this.screenshots().length;
    return $localize`:@@portfolioGallery.position:Screenshot ${current}:current: of ${total}:total:`;
  });

  constructor() {
    // A different portfolio entry can reuse the route and gallery component.
    afterRenderEffect(() => {
      const track = this.track()?.nativeElement;
      this.screenshots();
      this.activeIndex.set(0);
      if (track) {
        track.scrollLeft = 0;
      }
    });
  }

  protected screenshotAlt(index: number): string {
    return $localize`:@@portfolioGallery.imageAlt:${this.title()}:title: — screenshot ${index + 1}:number:`;
  }

  protected moveTo(index: number): void {
    const track = this.track()?.nativeElement;
    const slide = track?.children.item(index);
    if (!track || !(slide instanceof HTMLElement)) {
      return;
    }

    const reducedMotion = track.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  protected onTrackScroll(track: HTMLDivElement): void {
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    const stride = (second?.offsetLeft ?? 0) - (first?.offsetLeft ?? 0);
    if (stride > 0) {
      const nearest = Math.round(track.scrollLeft / stride);
      this.activeIndex.set(Math.max(0, Math.min(nearest, this.screenshots().length - 1)));
    }
  }

  protected onTrackKeydown(event: KeyboardEvent): void {
    // Only handle horizontal movement. Leave page scrolling and browser shortcuts alone.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (!direction) return;

    event.preventDefault();
    this.moveTo(this.activeIndex() + direction);
  }
}
