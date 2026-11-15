import { gsap } from 'gsap';
import { PROJECT_INTERACTION_EVENT } from './projects-hover-animation';
import { projectRowWeights } from './projects-layout';

interface RowCard {
  card: HTMLElement;
  drawer: HTMLElement;
  art: HTMLElement;
  shade: HTMLElement;
  arrow: SVGElement;
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
        const arrow = card.querySelector<SVGElement>('.project-preview-arrow');
        return drawer && art && shade && arrow ? [{
          card, drawer, art, shade, arrow,
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

    const hadRowClass = row.classList.contains('projects-home-row-horizontal');
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

    row.classList.add('projects-home-row-horizontal');
    gsap.set(row, { '--project-left': '1fr', '--project-middle': '1fr', '--project-right': '1fr' });
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
      const width = row.clientWidth;
      if (width === previousWidth) {
        return false;
      }
      previousWidth = width;
      const gap = parseFloat(view.getComputedStyle(row).columnGap) || 0;
      const expandedShare = projectRowWeights(cards.length, 0)[0] / cards.length;
      const expandedWidth = (width - gap * (cards.length - 1)) * expandedShare;
      briefWidth = Math.round(Math.min(256, Math.max(208, expandedWidth * 0.36)));
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
        const weights = projectRowWeights(cards.length, next ? cards.indexOf(next) : -1);
        const left = weights[0];
        const middle = cards.length === 3 ? weights[1] : 1;
        const right = cards.length === 3 ? weights[2] : (weights[1] ?? 1);
        const duration = next ? 0.52 : 0.38;
        transition = gsap.timeline({ paused: true })
          .to(row, {
            '--project-left': `${left}fr`,
            '--project-middle': `${middle}fr`,
            '--project-right': `${right}fr`,
            duration, ease: 'back.out(1.1)',
          }, 0);

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
            .to(item.shade, { opacity: open ? 0.12 : 0.25, duration }, 0)
            .to(item.arrow, {
              x: open ? 3 : 0, y: open ? -3 : 0, duration: 0.3, ease: 'power2.out',
            }, 0);
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

    // Listen to physical pointer movement at the stable row, not enter/leave
    // events on cards that can fire merely because their widths are changing.
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
    resize?.observe(row);
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
      if (!hadRowClass) {
        row.classList.remove('projects-home-row-horizontal');
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
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
