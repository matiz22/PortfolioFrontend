import { gsap } from 'gsap';
import { PROJECT_INTERACTION_EVENT } from './projects-hover-animation';
import { projectRowOffsets } from './projects-layout';

interface RowCard {
  index: number;
  surface: HTMLElement;
  card: HTMLElement;
  drawer: HTMLElement;
  art: HTMLElement;
  shade: HTMLElement;
  details: NodeListOf<HTMLElement>;
  originalInert: boolean;
  originalHidden: string | null;
  originalExpanded: string | null;
  hadHorizontalClass: boolean;
}

export function animateProjectRows(root: HTMLElement, context: gsap.Context): () => void {
  const view = root.ownerDocument.defaultView;
  const grid = root.querySelector<HTMLElement>('.projects-home-grid');
  if (!view || !grid) {
    return () => {};
  }

  const slots = Array.from(grid.querySelectorAll<HTMLElement>(':scope > .projects-home-slot'));
  const cards: RowCard[] = slots.flatMap((slot, index) => {
    const surface = slot.querySelector<HTMLElement>('.projects-home-motion');
    const card = surface?.querySelector<HTMLElement>('.project-preview');
    if (!surface || !card) {
      return [];
    }
    const drawer = card.querySelector<HTMLElement>('.project-preview-drawer');
    const art = card.querySelector<HTMLElement>('.project-preview-art');
    const shade = card.querySelector<HTMLElement>('.project-preview-shade');
    return drawer && art && shade ? [{
      index, surface, card, drawer, art, shade,
      details: card.querySelectorAll<HTMLElement>('.project-preview-description, .project-preview-actions'),
      originalInert: drawer.inert,
      originalHidden: drawer.getAttribute('aria-hidden'),
      originalExpanded: card.getAttribute('data-project-expanded'),
      hadHorizontalClass: card.classList.contains('project-preview-horizontal'),
    }] : [];
  });
  if (cards.length === 0) {
    return () => {};
  }

  const hadGridClass = grid.classList.contains('projects-home-grid-horizontal');
  let columns = 2;
  let active: RowCard | undefined;
  let pointerCard: RowCard | undefined;
  let intent: gsap.core.Tween | undefined;
  let transition: gsap.core.Timeline | undefined;
  let touchInteraction = false;
  let disposed = false;
  let gridWidth = -1;
  let gap = 0;
  let shifted = new Set<HTMLElement>();
  const initiallyFocused = cards.find(({ card }) => card.contains(root.ownerDocument.activeElement));
  const focused = () => cards.find(({ card }) => card.contains(root.ownerDocument.activeElement));
  const cardAt = (target: EventTarget | null) =>
    cards.find(({ card }) => target instanceof view.Node && card.contains(target));

  grid.classList.add('projects-home-grid-horizontal');
  for (const item of cards) {
    item.card.classList.add('project-preview-horizontal');
    gsap.set(item.drawer, { width: 0, autoAlpha: 0 });
    gsap.set(item.details, { opacity: 0, x: 12 });
    if (item !== initiallyFocused) {
      item.drawer.inert = true;
      item.drawer.setAttribute('aria-hidden', 'true');
    }
  }

  const measure = () => {
    const style = view.getComputedStyle(grid);
    const width = grid.clientWidth;
    const nextColumns = slots.length === 1
      ? 1
      : parseInt(style.getPropertyValue('--project-column-count'), 10) || 2;
    const nextGap = parseFloat(style.columnGap) || 0;
    if (width === gridWidth && nextColumns === columns && nextGap === gap) {
      return false;
    }
    gridWidth = width;
    columns = nextColumns;
    gap = nextGap;
    return true;
  };
  measure();

  const activate = (next: RowCard | undefined, immediate = false, force = false) => {
    if (active === next && !force) {
      if (immediate) {
        transition?.progress(1).pause();
      }
      return;
    }
    active = next;
    transition?.kill();
    for (const item of cards) {
      const open = item === next;
      item.drawer.inert = !open;
      item.drawer.setAttribute('aria-hidden', String(!open));
      item.card.setAttribute('data-project-expanded', String(open));
    }

    const column = next ? next.index % columns : 0;
    const rowStart = next ? next.index - column : 0;
    const rowCount = next ? Math.min(columns, slots.length - rowStart) : 0;
    const available = Math.max(0, gridWidth - gap * (rowCount - 1));
    const offsets = next && rowCount > 1 ? projectRowOffsets(available, rowCount, column) : [];
    const expandedWidth = next ? available / rowCount + (offsets[column]?.width ?? 0) : 0;
    const briefWidth = Math.round(Math.min(256, Math.max(208, expandedWidth * 0.36)));
    const nextShifted = new Set<HTMLElement>();

    context.add(() => {
      if (next) {
        gsap.set(next.card, { '--project-brief-width': `${briefWidth}px` });
      }
      const duration = next ? 0.52 : 0.38;
      transition = gsap.timeline({
        paused: true,
        onComplete: () => { shifted = nextShifted; },
      });

      for (const item of cards) {
        const offset = offsets[item.index - rowStart];
        if (offset) {
          nextShifted.add(item.surface);
        }
        if (offset || shifted.has(item.surface)) {
          // Include a previously animated row until it has returned to its CSS size.
          shifted.add(item.surface);
          transition.to(item.surface, {
            '--project-inline-offset': `${offset?.inline ?? 0}px`,
            '--project-width-offset': `${offset?.width ?? 0}px`,
            duration, ease: 'back.out(1.1)',
          }, 0);
        }
        const open = item === next;
        transition
          .to(item.drawer, {
            width: open ? briefWidth : 0, autoAlpha: open ? 1 : 0,
            duration, ease: 'power3.inOut',
          }, 0)
          .to(item.details, {
            opacity: open ? 1 : 0, x: open ? 0 : 12,
            duration: open ? 0.28 : 0.18, stagger: 0.035, ease: 'power2.out',
          }, open ? 0.12 : 0)
          .to(item.art, { scale: open ? 1.025 : 1, duration, ease: 'power2.out' }, 0)
          .to(item.shade, { opacity: open ? 0.12 : 0.25, duration }, 0);
      }
      if (immediate) {
        transition.progress(1).pause();
      } else {
        transition.play();
      }
    });
    cards.forEach(({ card }) => card.dispatchEvent(
      new Event(PROJECT_INTERACTION_EVENT, { bubbles: true }),
    ));
  };

  const cancelIntent = () => {
    intent?.kill();
    intent = undefined;
  };
  const schedule = (next: RowCard | undefined) => {
    cancelIntent();
    if (next === active) {
      return;
    }
    intent = gsap.delayedCall(next ? 0.09 : 0.16, () => {
      intent = undefined;
      const focus = focused();
      if (!focus && !touchInteraction && pointerCard === next) {
        activate(next);
      }
    });
  };

  // Card boundaries move during expansion; only real pointer movement should switch cards.
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      return;
    }
    touchInteraction = false;
    const next = cardAt(event.target);
    if (next !== pointerCard) {
      pointerCard = next;
      if (!focused()) {
        schedule(next);
      }
    }
  };
  const onPointerLeave = () => {
    pointerCard = undefined;
    if (!focused() && !touchInteraction) {
      schedule(undefined);
    }
  };
  const onFocus = (event: FocusEvent) => {
    const next = cardAt(event.target);
    if (next) {
      cancelIntent();
      activate(next, true);
    }
  };
  const onFocusOut = () => {
    view.queueMicrotask(() => {
      if (!disposed && !focused() && !touchInteraction) {
        schedule(pointerCard);
      }
    });
  };
  const onPointerDown = (event: PointerEvent) => {
    const next = cardAt(event.target);
    if (event.pointerType === 'touch' && next) {
      touchInteraction = true;
      cancelIntent();
      activate(next, true);
    }
  };
  const resize = view.ResizeObserver ? new view.ResizeObserver(() => {
    if (!disposed && measure() && (active || shifted.size)) {
      activate(active, true, true);
    }
  }) : undefined;
  // The grid width is stable during a tween, unlike the individual card widths.
  resize?.observe(grid);
  grid.addEventListener('pointermove', onPointerMove);
  grid.addEventListener('pointerleave', onPointerLeave);
  grid.addEventListener('pointerdown', onPointerDown);
  grid.addEventListener('focusin', onFocus);
  grid.addEventListener('focusout', onFocusOut);
  if (initiallyFocused) {
    activate(initiallyFocused, true);
  } else {
    pointerCard = cards.find(({ card }) => card.matches(':hover'));
    if (pointerCard) {
      schedule(pointerCard);
    }
  }

  return () => {
    disposed = true;
    cancelIntent();
    resize?.disconnect();
    grid.removeEventListener('pointermove', onPointerMove);
    grid.removeEventListener('pointerleave', onPointerLeave);
    grid.removeEventListener('pointerdown', onPointerDown);
    grid.removeEventListener('focusin', onFocus);
    grid.removeEventListener('focusout', onFocusOut);
    if (!hadGridClass) {
      grid.classList.remove('projects-home-grid-horizontal');
    }
    for (const item of cards) {
      if (!item.hadHorizontalClass) {
        item.card.classList.remove('project-preview-horizontal');
      }
      item.drawer.inert = item.originalInert;
      if (item.originalHidden === null) {
        item.drawer.removeAttribute('aria-hidden');
      } else {
        item.drawer.setAttribute('aria-hidden', item.originalHidden);
      }
      if (item.originalExpanded === null) {
        item.card.removeAttribute('data-project-expanded');
      } else {
        item.card.setAttribute('data-project-expanded', item.originalExpanded);
      }
    }
  };
}
