import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';
import { HomeCopyConfig, HomeCopyRegistry } from './home-copy-registry';

@Directive({
  selector: '[appHomeCopy]',
})
export class HomeCopy {
  readonly appHomeCopy = input.required<HomeCopyConfig>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly registry = inject(HomeCopyRegistry, { optional: true });

  constructor() {
    afterRenderEffect((onCleanup) => {
      const config = this.appHomeCopy();
      if (this.registry) {
        onCleanup(this.registry.register(this.element.nativeElement, config));
      }
    });
  }
}
