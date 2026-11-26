interface PinInstance {
  refresh(): void;
  revert(): void;
}

interface PinFitOptions {
  section: HTMLElement;
  stage: HTMLElement;
  pinnedClass: string;
  observe: readonly HTMLElement[];
  eligible?: () => boolean;
  /**
   * Overflow an active pin tolerates before it is released. Fresh mounts may
   * never overflow; headroom for active pins keeps measurement rounding and
   * animated overflow from flipping the fit decision back and forth.
   */
  tolerance?: number;
  mount: () => PinInstance;
}

/** Geometry drift below this is measurement noise, not a reason to refresh. */
const GEOMETRY_EPSILON = 4;

/** Mount a section's enhancement only while its candidate pinned layout fits. */
export function watchPinFit({ section, stage, pinnedClass, observe, eligible, tolerance = 0, mount }: PinFitOptions): () => void {
  const view = section.ownerDocument.defaultView;
  if (!view) return () => undefined;
  let instance: PinInstance | undefined;
  let frame: number | undefined;
  let disposed = false;
  let baseline: number[] = [];
  let overflowStreak = 0;
  // Animated overflow (preview artwork, translated copy) changes scrollHeight
  // every frame, so only stable box sizes take part in drift detection.
  const measure = () => [
    view.innerWidth, view.innerHeight,
    ...[stage, ...observe].flatMap((element) => [element.offsetWidth, element.offsetHeight]),
  ];
  const drifted = (next: number[]) =>
    next.length !== baseline.length ||
    next.some((value, index) => Math.abs(value - baseline[index]) >= GEOMETRY_EPSILON);

  const check = () => {
    frame = undefined;
    if (disposed || !section.isConnected) return;

    const canPin = eligible?.() !== false;
    if (!canPin) {
      overflowStreak = 0;
      instance?.revert();
      instance = undefined;
      section.classList.remove(pinnedClass);
      baseline = [];
      return;
    }

    // Measure the candidate pinned presentation; the class drives its layout.
    section.classList.add(pinnedClass);
    // scrollHeight also catches translated text overflowing a pinned stage's fixed height.
    const overflow = Math.max(stage.offsetHeight, stage.scrollHeight) - view.innerHeight;
    if (overflow > (instance ? tolerance : 0)) {
      // A resize can be measured against a half-updated layout. Release the pin
      // only once the next check measures the same overflow, so resizes and
      // sub-pixel drift can never flip the pin back and forth.
      if (!instance || ++overflowStreak >= 2) {
        overflowStreak = 0;
        instance?.revert();
        instance = undefined;
        section.classList.remove(pinnedClass);
        baseline = [];
        return;
      }
      schedule();
      return;
    }
    overflowStreak = 0;

    const next = measure();
    if (!instance) {
      instance = mount();
      // A pin can introduce a spacer; take a post-mount baseline to prevent refresh loops.
      baseline = measure();
    } else if (drifted(next)) {
      instance.refresh();
      baseline = measure();
    }
  };
  const schedule = () => {
    if (!disposed && frame === undefined) frame = view.requestAnimationFrame(check);
  };
  const resize = view.ResizeObserver ? new view.ResizeObserver(schedule) : undefined;
  for (const element of new Set([stage, ...observe])) resize?.observe(element);
  view.addEventListener('resize', schedule);
  check();

  return () => {
    if (disposed) return;
    disposed = true;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    resize?.disconnect();
    view.removeEventListener('resize', schedule);
    instance?.revert();
    instance = undefined;
    section.classList.remove(pinnedClass);
  };
}
