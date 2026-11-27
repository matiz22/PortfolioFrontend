import { HomeCopy } from '../../../shared/animations/home-copy';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { HomeStage } from '../../../shared/home-stage/home-stage';
import { WebDevelopmentPreview } from './web-development-preview/web-development-preview';
import { AppsPreview } from './apps-preview/apps-preview';
import { AiWorkflowPreview } from './ai-workflow-preview/ai-workflow-preview';
import { AbilitiesOverview } from './abilities-overview/abilities-overview';

type Service = 'web' | 'apps' | 'ai';

@Component({
  selector: 'app-about-me-section',
  imports: [HomeCopy, HomeStage, WebDevelopmentPreview, AppsPreview, AiWorkflowPreview, AbilitiesOverview],
  templateUrl: './about-me-section.html',
  styleUrl: './about-me-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeSection {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private readonly hoveredService = signal<Service | null>(null);
  private readonly focusedService = signal<Service | null>(null);
  protected readonly expandedService = signal<Service | null>(null);
  protected readonly desktop = signal(false);
  protected readonly activeService = computed(() => this.desktop()
    ? this.hoveredService() ?? this.focusedService() ?? this.expandedService()
    : this.expandedService());
  private resetTimer?: number;

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      const media = view.matchMedia('(min-width: 64rem)');
      const syncLayout = () => {
        this.cancelReset();
        this.desktop.set(media.matches);
        this.hoveredService.set(null);
        this.focusedService.set(null);
        this.expandedService.set(null);
      };
      const selectFragment = () => {
        const service = view.location.hash.slice(1).replace(/^about-/, '');
        if (service !== 'web' && service !== 'apps' && service !== 'ai') return;
        if (view.location.hash !== `#about-${service}`) return;
        this.expandedService.set(service);
        const row = this.host.nativeElement.querySelector<HTMLElement>(`#about-${service}`);
        // Desktop articles use display: contents to share one preview grid cell.
        const target = this.desktop() ? row?.querySelector<HTMLElement>('.about-service-copy') : row;
        target?.scrollIntoView({ behavior: 'instant', block: 'center' });
        row?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
      };
      syncLayout();
      selectFragment();
      media.addEventListener('change', syncLayout);
      view.addEventListener('hashchange', selectFragment);
      this.destroy.onDestroy(() => {
        this.cancelReset();
        media.removeEventListener('change', syncLayout);
        view.removeEventListener('hashchange', selectFragment);
      });
    });
  }

  protected preview(service: Service, event: PointerEvent): void {
    if (!this.desktop() || event.pointerType === 'touch') return;
    this.cancelReset();
    this.expandedService.set(null);
    this.hoveredService.set(service);
  }

  protected focusPreview(service: Service, event: FocusEvent): void {
    // Mouse/touch focus must not keep a preview selected after the pointer leaves.
    if (!(event.target as HTMLElement).matches(':focus-visible')) return;
    this.cancelReset();
    this.focusedService.set(service);
    this.hoveredService.set(null);
  }

  protected blurPreview(): void {
    this.focusedService.set(null);
  }

  protected togglePreview(service: Service, event: MouseEvent): void {
    if (this.desktop() && (event.detail === 0 || this.hoveredService() === service)) return;
    this.expandedService.update((current) => current === service ? null : service);
  }

  protected scheduleReset(event: PointerEvent): void {
    if (!this.desktop() || event.pointerType === 'touch') return;
    this.cancelReset();
    this.resetTimer = this.document.defaultView?.setTimeout(() => {
      this.hoveredService.set(null);
      this.expandedService.set(null);
      this.resetTimer = undefined;
    }, 240);
  }

  protected cancelReset(): void {
    if (this.resetTimer === undefined) return;
    this.document.defaultView?.clearTimeout(this.resetTimer);
    this.resetTimer = undefined;
  }

  protected clearPreview(): void {
    this.cancelReset();
    this.hoveredService.set(null);
    this.focusedService.set(null);
    this.expandedService.set(null);
  }
}
