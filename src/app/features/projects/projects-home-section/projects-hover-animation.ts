import { gsap } from 'gsap';

export const PROJECT_INTERACTION_EVENT = 'projects:interaction-change';

export function animateProjectDrawers(root: HTMLElement, context: gsap.Context): () => void {
  const removeListeners = Array.from(root.querySelectorAll<HTMLElement>('.project-preview'))
    .map((card) => {
      const drawer = card.querySelector<HTMLElement>('.project-preview-drawer');
      const brief = card.querySelector<HTMLElement>('.project-preview-brief');
      const art = card.querySelector<HTMLElement>('.project-preview-art');
      const shade = card.querySelector<HTMLElement>('.project-preview-shade');
      const details = card.querySelectorAll<HTMLElement>(
        '.project-preview-description, .project-preview-actions',
      );
      if (!drawer || !brief || !art || !shade) {
        return () => undefined;
      }

      const originalInert = drawer.inert;
      const originalHidden = drawer.getAttribute('aria-hidden');
      const originalExpanded = card.getAttribute('data-project-expanded');
      const hadInteractiveClass = card.classList.contains('project-preview-interactive');
      const initiallyFocused = card.contains(root.ownerDocument.activeElement);
      let expanded = false;
      let pointerInside = card.matches(':hover');
      let touchInteraction = false;
      let intent: gsap.core.Tween | undefined;
      let transition: gsap.core.Timeline | undefined;

      card.classList.add('project-preview-interactive');
      gsap.set(drawer, { height: 0, autoAlpha: 0 });
      gsap.set(details, { opacity: 0, y: 8 });
      if (!initiallyFocused) {
        drawer.inert = true;
        drawer.setAttribute('aria-hidden', 'true');
      }

      const focused = () => card.contains(root.ownerDocument.activeElement);
      const notify = () => card.dispatchEvent(new Event(PROJECT_INTERACTION_EVENT, { bubbles: true }));
      const change = (open: boolean, immediate = false) => {
        if (expanded === open) {
          if (immediate) {
            transition?.progress(1).pause();
          }
          return;
        }

        // One layout read per state change, never a read/write loop per frame.
        const height = open ? brief.offsetHeight : 0;
        expanded = open;
        transition?.kill();
        drawer.inert = !open;
        drawer.setAttribute('aria-hidden', String(!open));
        card.setAttribute('data-project-expanded', String(open));

        context.add(() => {
          const duration = open ? 0.52 : 0.36;
          transition = gsap.timeline({
            paused: true,
            onComplete: () => {
              if (expanded) {
                // Open drawers can respond naturally to text/viewport resizing.
                drawer.style.height = 'auto';
              }
            },
          })
            // Reveal the drawer over the image without reflowing the grid.
            .to(drawer, {
              height, autoAlpha: open ? 1 : 0, duration, ease: 'power3.inOut',
            }, 0)
            .to(details, {
              opacity: open ? 1 : 0, y: open ? 0 : 8,
              duration: open ? 0.28 : 0.18, stagger: 0.035, ease: 'power2.out',
            }, open ? 0.1 : 0)
            .to(art, { scale: open ? 1.025 : 1, duration, ease: 'power2.out' }, 0)
            .to(shade, { opacity: open ? 0.12 : 0.25, duration }, 0)
            .to(card, {
              rotation: open ? -0.3 : 0.18, duration: duration * 0.4, ease: 'sine.out',
            }, 0)
            .to(card, {
              rotation: open ? 0.12 : -0.06, duration: duration * 0.3, ease: 'sine.inOut',
            }, duration * 0.4)
            .to(card, {
              rotation: 0, duration: duration * 0.3, ease: 'sine.out', clearProps: 'transform',
            }, duration * 0.7);

          if (immediate) {
            transition.progress(1).pause();
          } else {
            transition.play();
          }
        });
        notify();
      };

      const cancelIntent = () => {
        intent?.kill();
        intent = undefined;
      };
      const schedule = (open: boolean) => {
        cancelIntent();
        intent = gsap.delayedCall(open ? 0.09 : 0.16, () => {
          intent = undefined;
          if (open ? pointerInside : !pointerInside && !focused() && !touchInteraction) {
            change(open);
          }
        });
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') {
          pointerInside = true;
          schedule(true);
        }
      };
      const onLeave = () => {
        pointerInside = false;
        cancelIntent();
        if (!focused() && !touchInteraction) {
          schedule(false);
        }
      };
      const onFocus = () => {
        cancelIntent();
        change(true, true);
      };
      const onFocusOut = (event: FocusEvent) => {
        if (!card.contains(event.relatedTarget as Node | null)) {
          notify();
          if (!pointerInside && !touchInteraction) {
            schedule(false);
          }
        }
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === 'touch') {
          touchInteraction = true;
          cancelIntent();
          change(true, true);
        }
      };

      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('pointerdown', onPointerDown);
      card.addEventListener('focusin', onFocus);
      card.addEventListener('focusout', onFocusOut);
      if (initiallyFocused) {
        change(true, true);
      } else if (pointerInside) {
        schedule(true);
      }

      return () => {
        cancelIntent();
        if (!hadInteractiveClass) {
          card.classList.remove('project-preview-interactive');
        }
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
        card.removeEventListener('pointerdown', onPointerDown);
        card.removeEventListener('focusin', onFocus);
        card.removeEventListener('focusout', onFocusOut);
        drawer.inert = originalInert;
        if (originalHidden === null) {
          drawer.removeAttribute('aria-hidden');
        } else {
          drawer.setAttribute('aria-hidden', originalHidden);
        }
        if (originalExpanded === null) {
          card.removeAttribute('data-project-expanded');
        } else {
          card.setAttribute('data-project-expanded', originalExpanded);
        }
      };
    });

  return () => removeListeners.forEach((remove) => remove());
}
