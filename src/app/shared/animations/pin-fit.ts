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
  mount: () => PinInstance;
}

/** Mount a section's enhancement only while its candidate pinned layout fits. */
export function watchPinFit({ section, stage, pinnedClass, observe, eligible, mount }: PinFitOptions): () => void {
  const view = section.ownerDocument.defaultView;
  if (!view) return () => {};
  let instance: PinInstance | undefined;
  let frame: number | undefined;
  let disposed = false;
  let geometry = '';
  const dimensions = () => [view.innerWidth, view.innerHeight,
    ...[stage, ...observe].flatMap((element) => [element.offsetWidth, element.offsetHeight, element.scrollHeight]),
  ].join(':');

  const check = () => {
    frame = undefined;
    if (disposed || !section.isConnected) return;

    const canPin = eligible?.() !== false;
    if (canPin) section.classList.add(pinnedClass);
    // scrollHeight also catches translated text overflowing a GSAP pin's fixed height.
    const fits = canPin && Math.max(stage.offsetHeight, stage.scrollHeight) <= view.innerHeight;
    if (!fits) {
      instance?.revert();
      instance = undefined;
      section.classList.remove(pinnedClass);
      geometry = '';
      return;
    }

    const nextGeometry = dimensions();
    if (!instance) {
      instance = mount();
      // A pin can introduce a spacer; take a post-mount baseline to prevent refresh loops.
      geometry = dimensions();
    } else if (geometry !== nextGeometry) {
      instance.refresh();
      geometry = dimensions();
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
