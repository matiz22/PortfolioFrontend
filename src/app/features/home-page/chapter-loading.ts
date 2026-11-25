import {
  afterNextRender,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';

@Injectable()
export class ChapterLoadingRegistry {
  private readonly counts = signal<Readonly<Record<string, number>>>({});
  readonly chapters = computed<ReadonlySet<string>>(() => new Set(
    Object.entries(this.counts()).filter(([, count]) => count > 0).map(([chapter]) => chapter),
  ));

  activate(chapter: string): void {
    this.counts.update((counts) => ({ ...counts, [chapter]: (counts[chapter] ?? 0) + 1 }));
  }

  deactivate(chapter: string): void {
    this.counts.update((counts) => {
      const count = counts[chapter] ?? 0;
      if (count <= 1) {
        const next = { ...counts };
        delete next[chapter];
        return next;
      }
      return { ...counts, [chapter]: count - 1 };
    });
  }
}

@Directive({ selector: '[appChapterLoading]' })
export class ChapterLoading {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly registry = inject(ChapterLoadingRegistry);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    let activeChapter: string | undefined;
    afterNextRender(() => {
      activeChapter = this.host.nativeElement.parentElement?.id;
      if (activeChapter) {
        this.registry.activate(activeChapter);
      }
    });
    this.destroyRef.onDestroy(() => {
      if (activeChapter) {
        this.registry.deactivate(activeChapter);
      }
    });
  }
}
