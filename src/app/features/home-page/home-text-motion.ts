import { gsap } from 'gsap';

const ENTER_RATIO = 0.48;
const EXIT_RATIO = 0.28;
const NAV_CLEARANCE = 72;
const OPEN_WIPE = 'inset(-0.16em -0.16em -0.16em -0.16em)';
const VERTICAL_WIPE = 'inset(100% -0.16em -0.16em -0.16em)';
const SIDE_WIPE = 'inset(-0.16em 100% -0.16em -0.16em)';

interface CopyEffect {
  group: string;
  heading: string;
  details?: string;
  effect?: 'mask' | 'wipe' | 'lines' | 'seal';
  duration?: number;
  stagger?: number;
  focusScope?: string;
  keepAtPageEnd?: boolean;
}

const EFFECTS: CopyEffect[] = [
  { group: '.about-header', heading: 'h2', effect: 'mask' },
  { group: '.about-panel-copy', heading: 'h3', details: 'p', effect: 'mask', duration: 0.36 },
  { group: '.realizations-text', heading: 'h2', details: '.realizations-description', effect: 'lines', duration: 0.46 },
  { group: '.projects-home-header', heading: 'h2', details: '.projects-home-description', effect: 'wipe', duration: 0.32 },
  { group: '.certifications-header', heading: 'h2', details: 'p', effect: 'seal', duration: 0.39 },
  { group: '.jobs-header', heading: 'h2', details: '.jobs-intro' },
  { group: '.jobs-entry', heading: 'h3', details: '.jobs-company, .jobs-dates', duration: 0.34 },
  { group: '.education-header', heading: 'h2', details: 'p' },
  { group: '.education-main', heading: '.education-degree', details: '.education-institution', duration: 0.35, focusScope: '.education-card' },
  {
    group: '.contact-copy', heading: 'h2', details: 'p', effect: 'lines',
    duration: 0.52, stagger: 0.16, focusScope: '.contact-section', keepAtPageEnd: true,
  },
];
const GROUP_SELECTOR = EFFECTS.map(({ group }) => group).join(', ');

class CopyReveal {
  inView?: boolean;
  anchored = false;
  readonly focusScope: HTMLElement;
  private readonly details: HTMLElement[];
  private shown = true;
  private animation?: gsap.core.Timeline;
  private transition?: gsap.Context;
  private concealed?: gsap.Context;

  constructor(
    readonly group: HTMLElement,
    readonly heading: HTMLElement,
    readonly config: CopyEffect,
  ) {
    this.details = config.details ? Array.from(group.querySelectorAll(config.details)) : [];
    this.focusScope = (config.focusScope && group.closest<HTMLElement>(config.focusScope)) || group;
  }

  show(shown: boolean, immediately = false): void {
    if (immediately) {
      this.settle(shown);
    } else if (this.shown !== shown) {
      if (!shown && this.animation?.progress() === 0) {
        this.settle(false);
        return;
      }
      if (!this.animation) {
        this.concealed?.revert();
        this.concealed = undefined;
        this.createTransition();
        this.animation!.progress(shown ? 0 : 1, true);
      }
      this.shown = shown;
      if (shown) {
        this.animation!.timeScale(1).play();
      } else {
        this.animation!.timeScale(1.9).reverse();
      }
    }
  }

  replayEntrance(): void {
    if (!this.animation) {
      this.shown = false;
    }
    this.show(true);
  }

  dispose(): void {
    this.transition?.revert();
    this.concealed?.revert();
    this.animation = this.transition = this.concealed = undefined;
  }

  private settle(shown: boolean): void {
    this.dispose();
    this.shown = shown;
    if (!shown) {
      // Opacity doesn't remove headings or link labels from the accessibility tree.
      this.concealed = gsap.context(() => gsap.set([this.heading, ...this.details], { opacity: 0 }));
    }
  }

  private createTransition(): void {
    const { effect, duration = 0.42, stagger = 0.09 } = this.config;
    const title = this.heading;
    this.transition = gsap.context(() => {
      const timeline = this.animation = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onComplete: () => this.settle(true),
        onReverseComplete: () => this.settle(false),
      });
      const hidden = { opacity: 0, y: 6 };
      const visible: gsap.TweenVars = { opacity: 1, y: 0, duration };
      let detailsStart = duration * 0.45;
      if (effect === 'wipe' || effect === 'mask') {
        timeline.fromTo(title, { ...hidden, y: effect === 'wipe' ? 0 : 6, clipPath: effect === 'wipe' ? SIDE_WIPE : VERTICAL_WIPE },
          { ...visible, clipPath: OPEN_WIPE }, 0);
      } else if (effect === 'lines') {
        // Read native line boxes: no replacement spans or duplicated text during hydration,
        // and the beats follow the rendered wrapping in either language.
        const style = getComputedStyle(title);
        const height = title.offsetHeight;
        const lineHeight = parseFloat(style.lineHeight);
        const lines = Math.max(1, Math.round(height / (lineHeight || height || 1)));
        // Keep the moving edge in % even at the end, so GSAP doesn't rebase
        // the clip from the heading's height to its parent's at the next beat.
        const bleed = 0.16 * parseFloat(style.fontSize) / Math.max(1, height) * 100;
        const inset = (bottom: number) => `inset(-0.16em -0.16em ${bottom}% -0.16em)`;
        const beat = duration / Math.sqrt(lines);
        for (let line = 0; line < lines; line++) {
          const position = line * (beat + stagger);
          const end = line === lines - 1 ? -bleed : 100 * (lines - line - 1) / lines;
          if (line === 0) {
            timeline.fromTo(title, { ...hidden, clipPath: inset(100) }, {
              ...visible, duration: beat, clipPath: inset(end),
            }, position);
          } else {
            timeline.to(title, { clipPath: inset(end), duration: beat }, position);
          }
        }
        detailsStart = Math.max(0, timeline.duration() - 0.16);
      } else if (effect === 'seal') {
        timeline.fromTo(title, {
          opacity: 0, scale: 1.045, transformOrigin: 'left center', '--home-seal-progress': 0,
        }, { opacity: 1, scale: 1, duration }, 0);
        timeline.to(title, { '--home-seal-progress': 1, duration: 0.3 }, 0.13);
      } else {
        timeline.fromTo(title, hidden, visible, 0);
      }
      if (this.details.length) {
        timeline.fromTo(this.details, { opacity: 0, y: 5 }, {
          opacity: 1, y: 0, duration: 0.3, stagger: 0.045,
        }, detailsStart);
      }
    });
  }
}

export function animateHomeText(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  if (!view?.IntersectionObserver || !view.MutationObserver) {
    return motion;
  }

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const reveals = new Map<HTMLElement, CopyReveal>();
    const headings = new Map<Element, CopyReveal>();
    const doc = root.ownerDocument;
    let disposed = false;
    const anchor = () => {
      try {
        return doc.getElementById(decodeURIComponent(view.location.hash.slice(1)));
      } catch {
        return null;
      }
    };
    // The browser can focus a fragment destination itself. That's navigation,
    // not keyboard focus entering one of the interactive controls.
    const focused = (reveal: CopyReveal) =>
      reveal.focusScope.contains(doc.activeElement) && doc.activeElement !== anchor();
    const playAnchored = (reveal: CopyReveal) => {
      reveal.anchored = false;
      if (focused(reveal)) {
        reveal.show(true, true);
      } else {
        reveal.replayEntrance();
      }
    };
    const requestAnchorEntrance = (reveal: CopyReveal, target: HTMLElement | null) => {
      // A chapter link introduces the section, not every card inside it.
      reveal.anchored = !!target &&
        (target.contains(reveal.group) || reveal.group.contains(target)) &&
        (!target.hasAttribute('data-grain-chapter') || reveal.heading.tagName === 'H2');
      if (reveal.anchored && reveal.inView) {
        playAnchored(reveal);
      }
    };

    // Watch the heading rather than the surrounding card: it can start its exit
    // near the navigation bar even while the rest of the card is still visible.
    // This also follows sticky intros and the clipped horizontal track natively.
    const observer = new view.IntersectionObserver((entries) => {
      if (disposed) {
        return;
      }
      for (const entry of entries) {
        const reveal = headings.get(entry.target);
        if (!reveal) {
          continue;
        }
        const wasInView = reveal.inView;
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        const keepAtEnd = reveal.config.keepAtPageEnd &&
          entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) &&
          (doc.scrollingElement?.scrollHeight ?? 0) - view.scrollY - view.innerHeight <= NAV_CLEARANCE;
        const inView = keepAtEnd === true || ratio >= (wasInView === false ? ENTER_RATIO : EXIT_RATIO);
        reveal.inView = inView;
        const retain = focused(reveal);
        if (inView) {
          if (reveal.anchored) {
            playAnchored(reveal);
          } else if (!wasInView) {
            reveal.show(true, wasInView === undefined || retain);
          }
        } else if (wasInView !== false && !retain) {
          reveal.show(false, wasInView === undefined);
        }
      }
    }, { rootMargin: `-${NAV_CLEARANCE}px 0px 0px`, threshold: [0, EXIT_RATIO, ENTER_RATIO] });

    const sync = () => {
      for (const [group, reveal] of reveals) {
        if (!root.contains(group) || !group.contains(reveal.heading)) {
          observer.unobserve(reveal.heading);
          reveal.dispose();
          headings.delete(reveal.heading);
          reveals.delete(group);
        }
      }
      const currentAnchor = anchor();
      for (const group of root.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
        if (reveals.has(group)) {
          continue;
        }
        const config = EFFECTS.find((candidate) => group.matches(candidate.group))!;
        const heading = group.querySelector<HTMLElement>(config.heading);
        if (heading) {
          const reveal = new CopyReveal(group, heading, config);
          reveals.set(group, reveal);
          headings.set(heading, reveal);
          requestAnchorEntrance(reveal, currentAnchor);
          observer.observe(heading);
        }
      }
    };
    const mutations = new view.MutationObserver((records) => {
      // Deferred components and data add groups without requiring another scroll listener.
      const changesGroup = (node: Node) => node instanceof view.Element &&
        (node.matches(GROUP_SELECTOR) || !!node.querySelector(GROUP_SELECTOR));
      if (records.some(({ addedNodes, removedNodes }) =>
        Array.from(addedNodes).some(changesGroup) || Array.from(removedNodes).some(changesGroup))) {
        sync();
      }
    });
    const onAnchor = () => {
      const target = anchor();
      for (const reveal of reveals.values()) {
        requestAnchorEntrance(reveal, target);
      }
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof view.HTMLElement) || target === anchor() ||
        target.hasAttribute('data-grain-chapter')) {
        return;
      }
      for (const reveal of reveals.values()) {
        if (reveal.focusScope.contains(target)) {
          reveal.anchored = false;
          reveal.show(true, true);
        }
      }
    };
    const onBlur = () => view.queueMicrotask(() => {
      if (!disposed) {
        for (const reveal of reveals.values()) {
          if (reveal.inView === false && !reveal.anchored && !focused(reveal)) {
            reveal.show(false);
          }
        }
      }
    });

    sync();
    mutations.observe(root, { childList: true, subtree: true });
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onBlur);
    view.addEventListener('hashchange', onAnchor);

    return () => {
      disposed = true;
      observer.disconnect();
      mutations.disconnect();
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', onBlur);
      view.removeEventListener('hashchange', onAnchor);
      reveals.forEach((reveal) => reveal.dispose());
    };
  }, root);

  return motion;
}
