import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export function animateHeroText(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  let introFinished = false;

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    introFinished = false;
    const main = SplitText.create(root.querySelector('.hero-headline-main'), {
      type: 'words',
      mask: 'words',
      tag: 'span',
      wordsClass: 'hero-build-word',
    });
    const accent = SplitText.create(root.querySelector('.hero-headline-accent'), {
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
        // Restore normal text flow and semantics once the one-shot reveal ends.
        main.revert();
        accent.revert();
        introFinished = true;
      },
    })
      .addLabel('construct', 0)
      .from(main.words, {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.1,
      }, 'construct')
      .addLabel('streamline', 0.28)
      .from(accent.chars, {
        x: (index) => (index % 3 - 1) * 4,
        y: (index) => index % 3 === 0 ? -8 : 14,
        autoAlpha: 0,
        duration: 0.58,
        stagger: { amount: 0.32, from: 'start' },
      }, 'streamline')
      .from('.hero-role-caption', {
        y: 10,
        autoAlpha: 0,
        duration: 0.5,
        clearProps: 'transform,opacity,visibility',
      }, 0.44)
      .from('.hero-description', {
        y: 10,
        autoAlpha: 0,
        duration: 0.45,
        clearProps: 'transform,opacity,visibility',
      }, 0.66)
      .from('.hero-actions', {
        y: 8,
        autoAlpha: 0,
        duration: 0.45,
        clearProps: 'transform,opacity,visibility',
      }, 0.83);
  }, root);

  motion.add(
    '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
    () => {
      const main = root.querySelector<HTMLElement>('.hero-headline-main')!;
      const accent = root.querySelector<HTMLElement>('.hero-headline-accent')!;
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

      const onMainPointerEnter = (event: PointerEvent) => {
        if (!introFinished || mainSplit || event.pointerType === 'touch') {
          return;
        }

        mainSplit = SplitText.create(main, {
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
        glide.kill();
        ripple.kill();
        mainSplit?.revert();
        accentSplit?.revert();
      };
    },
    root,
  );

  return motion;
}
