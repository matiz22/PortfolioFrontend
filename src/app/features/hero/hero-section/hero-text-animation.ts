import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { FINE_POINTER_MOTION_QUERY, MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';

gsap.registerPlugin(SplitText);

function headlineLineStarts(heading: HTMLElement): number[] {
  const text = heading.firstChild;
  if (text?.nodeType !== Node.TEXT_NODE || text.nextSibling) {
    return [];
  }

  const range = heading.ownerDocument.createRange();
  const starts: number[] = [];
  let previousTop = Infinity;
  for (const [index, word] of Array.from((text.textContent ?? '').matchAll(/\S+/g)).entries()) {
    range.setStart(text, word.index);
    range.setEnd(text, word.index + word[0].length);
    const { top, height } = range.getBoundingClientRect();
    if (top > previousTop + height / 2) {
      starts.push(index);
    }
    previousTop = top;
  }
  return starts;
}

function splitMainHeading(heading: HTMLElement, vars: SplitText.Vars): SplitText {
  const lineStarts = headlineLineStarts(heading);
  const split = SplitText.create(heading, vars);
  const words = vars.mask === 'words' ? split.masks : split.words;

  // Keep the plain text's balanced wrapping while the animated spans are in place.
  // SplitText removes the temporary breaks when it restores the original markup.
  for (const index of lineStarts) {
    words[index]?.before(heading.ownerDocument.createElement('br'));
  }
  return split;
}

export function animateHeroText(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const mainHeading = root.querySelector<HTMLElement>('.hero-headline-main');
  const accentHeading = root.querySelector<HTMLElement>('.hero-headline-accent');
  if (!mainHeading || !accentHeading) {
    return motion;
  }
  let introFinished = false;
  let resetHover = () => {};

  motion.add(MOTION_ALLOWED_QUERY, () => {
    let introMotion: gsap.Context | undefined;
    const playIntro = () => {
      resetHover();
      introMotion?.revert();
      introFinished = false;
      introMotion = gsap.context(() => {
        const main = splitMainHeading(mainHeading, {
          type: 'words',
          mask: 'words',
          tag: 'span',
          wordsClass: 'hero-build-word',
        });
        const accent = SplitText.create(accentHeading, {
          type: 'words,chars',
          tag: 'span',
          wordsClass: 'hero-flow-word',
          charsClass: 'hero-flow-char',
        });

        // SplitText's generated spans don't inherit Angular's scoped style attributes.
        gsap.set([...main.words, ...main.masks, ...accent.words, ...accent.chars], {
          display: 'inline-block',
        });
        gsap.set(main.masks, {
          verticalAlign: 'baseline',
          padding: '0.14em 0.04em',
          margin: '-0.14em -0.04em',
        });
        gsap.set(accent.words, { whiteSpace: 'nowrap' });

        gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            main.revert();
            accent.revert();
            introFinished = true;
          },
        })
          .from(main.words, {
            yPercent: 110,
            opacity: 0,
            duration: 0.72,
            stagger: 0.1,
          }, 0)
          .from(accent.chars, {
            x: (index) => (index % 3 - 1) * 4,
            y: (index) => index % 3 === 0 ? -8 : 14,
            opacity: 0,
            duration: 0.58,
            stagger: { amount: 0.32, from: 'start' },
          }, 0.28)
          .from('.hero-role-caption', {
            y: 10,
            opacity: 0,
            duration: 0.5,
            clearProps: 'transform,opacity',
          }, 0.44)
          .from('.hero-description', {
            y: 10,
            opacity: 0,
            duration: 0.45,
            clearProps: 'transform,opacity',
          }, 0.66);
      }, root);
    };

    const section = root.querySelector('.hero-section');
    const view = root.ownerDocument.defaultView;
    const hasHeroAnchor = () => {
      const hash = view?.location.hash;
      return hash === '#home' || hash === '#hero-headline';
    };
    let armed = false;
    let inView = false;
    let disposed = false;
    if (!section || !view?.IntersectionObserver || (
      (!view.location.hash || hasHeroAnchor()) && section.getBoundingClientRect().bottom > 0
    )) {
      playIntro();
    }
    const enter = () => {
      armed = false;
      if (!introMotion || introFinished) {
        playIntro();
      }
    };
    const onAnchor = () => {
      if (!hasHeroAnchor()) {
        return;
      }
      if (inView) {
        enter();
      } else {
        armed = true;
      }
    };
    // The existing scrub handles the exit. Rearm the intro only after a real
    // departure, then replay it as the top of the page comes back into view.
    const observer = section && view?.IntersectionObserver
      ? new view.IntersectionObserver(([entry]) => {
        if (disposed || !entry) {
          return;
        }
        const tall = entry.boundingClientRect.height > view.innerHeight * 2;
        inView = entry.intersectionRatio >= (tall ? 0.2 : 0.4);
        if (entry.intersectionRatio <= (tall ? 0.08 : 0.12)) {
          armed = true;
          introFinished = false;
          resetHover();
          introMotion?.revert();
          introMotion = undefined;
        } else if (armed && inView) {
          enter();
        }
      }, { threshold: [0.08, 0.12, 0.2, 0.4] })
      : undefined;
    if (observer && section) {
      observer.observe(section);
      view?.addEventListener('hashchange', onAnchor);
    }
    return () => {
      disposed = true;
      observer?.disconnect();
      view?.removeEventListener('hashchange', onAnchor);
      introMotion?.revert();
    };
  }, root);

  motion.add(
    FINE_POINTER_MOTION_QUERY,
    () => {
      const main = mainHeading;
      const accent = accentHeading;
      let mainSplit: SplitText | undefined;
      let accentSplit: SplitText | undefined;
      const glide = gsap.timeline({
        paused: true,
        onComplete: () => {
          mainSplit?.revert();
          mainSplit = undefined;
        },
      });
      const ripple = gsap.timeline({
        paused: true,
        onComplete: () => {
          accentSplit?.revert();
          accentSplit = undefined;
        },
      });
      resetHover = () => {
        glide.pause().clear();
        ripple.pause().clear();
        mainSplit?.revert();
        accentSplit?.revert();
        mainSplit = accentSplit = undefined;
      };

      const onMainPointerEnter = (event: PointerEvent) => {
        if (!introFinished || mainSplit || event.pointerType === 'touch') {
          return;
        }

        mainSplit = splitMainHeading(main, {
          type: 'words',
          tag: 'span',
          wordsClass: 'hero-glide-word',
        });
        gsap.set(mainSplit.words, { display: 'inline-block', whiteSpace: 'nowrap' });

        glide.clear().to(mainSplit.words, {
          keyframes: [
            { x: 4, duration: 0.15, ease: 'power2.out' },
            { x: 0, duration: 0.28, ease: 'power2.inOut' },
          ],
          stagger: 0.07,
          ease: 'none',
        }).restart();
      };

      const onAccentPointerEnter = (event: PointerEvent) => {
        // Let each wave finish, and never compete with the entrance or touch input.
        if (!introFinished || accentSplit || event.pointerType === 'touch') {
          return;
        }

        accentSplit = SplitText.create(accent, {
          type: 'words,chars',
          tag: 'span',
          wordsClass: 'hero-ripple-word',
          charsClass: 'hero-ripple-char',
        });
        gsap.set([...accentSplit.words, ...accentSplit.chars], { display: 'inline-block' });
        gsap.set(accentSplit.words, { whiteSpace: 'nowrap' });

        // Reuse one timeline; only the temporary text split needs manual cleanup.
        ripple.clear().to(accentSplit.chars, {
          keyframes: [
            { y: -3, duration: 0.13, ease: 'power2.out' },
            { y: 0, duration: 0.22, ease: 'power2.inOut' },
          ],
          stagger: { amount: 0.25, from: 'start' },
          ease: 'none',
        }).restart();
      };

      main.addEventListener('pointerenter', onMainPointerEnter);
      accent.addEventListener('pointerenter', onAccentPointerEnter);
      return () => {
        main.removeEventListener('pointerenter', onMainPointerEnter);
        accent.removeEventListener('pointerenter', onAccentPointerEnter);
        resetHover();
        resetHover = () => {};
      };
    },
    root,
  );

  return motion;
}
