import { gsap } from 'gsap';
import { PROJECT_INTERACTION_EVENT } from './projects-hover-animation';

interface RowCard {
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
  if (!view) {
    return () => {};
  }

  const cleanups = Array.from(root.querySelectorAll<HTMLElement>('.projects-home-row')).map((row) => {
    const cards: RowCard[] = Array.from(row.querySelectorAll<HTMLElement>('.project-preview'))
      .flatMap((card) => {
        const drawer = card.querySelector<HTMLElement>('.project-preview-drawer');
        const art = card.querySelector<HTMLElement>('.project-preview-art');
        const shade = card.querySelector<HTMLElement>('.project-preview-shade');
        return drawer && art && shade ? [{
          card, drawer, art, shade,
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

    let active: RowCard | undefined;
    let pointerCard: RowCard | undefined;
    let intent: gsap.core.Tween | undefined;
    let transition: gsap.core.Timeline | undefined;
    let touchInteraction = false;
    let disposed = false;
    let briefWidth = 0;
    let previousWidth = -1;
    const initiallyFocused = cards.find(({ card }) => card.contains(root.ownerDocument.activeElement));
    const focused = () => cards.find(({ card }) => card.contains(root.ownerDocument.activeElement));
    const cardAt = (target: EventTarget | null) =>
      cards.find(({ card }) => target instanceof view.Node && card.contains(target));

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
      const width = cards[0].card.clientWidth;
      if (width === previousWidth) {
        return false;
      }
      previousWidth = width;
      briefWidth = Math.min(width, Math.round(Math.min(256, Math.max(184, width * 0.65))));
      context.add(() => gsap.set(cards.map(({ card }) => card), {
        '--project-brief-width': `${briefWidth}px`,
      }));
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

      context.add(() => {
        const duration = next ? 0.52 : 0.38;
        transition = gsap.timeline({ paused: true });

        for (const item of cards) {
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

    // Use physical pointer movement to choose which card's drawer to reveal.
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
      if (!disposed && measure() && active) {
        activate(active, true, true);
      }
    }) : undefined;
    resize?.observe(cards[0].card);
    row.addEventListener('pointermove', onPointerMove);
    row.addEventListener('pointerleave', onPointerLeave);
    row.addEventListener('pointerdown', onPointerDown);
    row.addEventListener('focusin', onFocus);
    row.addEventListener('focusout', onFocusOut);
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
      row.removeEventListener('pointermove', onPointerMove);
      row.removeEventListener('pointerleave', onPointerLeave);
      row.removeEventListener('pointerdown', onPointerDown);
      row.removeEventListener('focusin', onFocus);
      row.removeEventListener('focusout', onFocusOut);
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
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
