import { gsap } from 'gsap';
import { animateProjectRows } from './projects-row-animation';

describe('horizontal project rows', () => {
  let root: HTMLElement;
  let context: gsap.Context | undefined;
  let delayedCall: jasmine.Spy;
  let cardWidth: number;
  let resizeCallbacks: ResizeObserverCallback[];
  let disconnects: jasmine.Spy[];

  function slot(index: number): string {
    return `<div class="projects-home-slot"><div class="projects-home-motion">
      <article class="project-preview">
        <h3><a href="#project-${index}" class="project-preview-title-link">Project ${index}</a></h3>
        <div class="project-preview-art"></div><div class="project-preview-shade"></div>
        <div class="project-preview-drawer"><div class="project-preview-brief">
          <p class="project-preview-description">A personal developer project.</p>
          <div class="project-preview-actions"><a href="#demo-${index}">Live demo</a></div>
        </div></div>
      </article>
    </div></div>`;
  }

  beforeEach(() => {
    cardWidth = 484;
    resizeCallbacks = [];
    disconnects = [];
    delayedCall = spyOn(gsap, 'delayedCall').and.callThrough();
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      resizeCallbacks.push(callback);
      const disconnect = jasmine.createSpy('disconnect');
      disconnects.push(disconnect);
      return {
        observe: jasmine.createSpy('observe'), disconnect,
      } as unknown as ResizeObserver;
    });
    root = document.createElement('section');
    root.innerHTML = `
      <div class="projects-home-row">${slot(1)}${slot(2)}</div>
      <div class="projects-home-row">${slot(3)}${slot(4)}</div>
    `;
    document.body.appendChild(root);
  });

  function mockCardWidths(): void {
    for (const element of root.querySelectorAll<HTMLElement>('.project-preview')) {
      Object.defineProperty(element, 'clientWidth', { get: () => cardWidth });
    }
  }

  afterEach(() => {
    context?.revert();
    context = undefined;
    root.remove();
  });

  function start(): void {
    mockCardWidths();
    context = gsap.context((ctx) => animateProjectRows(root, ctx), root);
  }

  function row(index = 0): HTMLElement {
    return root.querySelectorAll<HTMLElement>('.projects-home-row')[index];
  }

  function card(index = 0): HTMLElement {
    return root.querySelectorAll<HTMLElement>('.project-preview')[index];
  }

  function drawer(index = 0): HTMLElement {
    return card(index).querySelector<HTMLElement>('.project-preview-drawer')!;
  }

  function move(index = 0): void {
    card(index).dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerType: 'mouse', clientX: index * 100 + 20, clientY: 100,
    }));
  }

  function finishIntent(): void {
    delayedCall.calls.mostRecent().returnValue.progress(1);
  }

  function animation(): gsap.core.Timeline {
    return gsap.getTweensOf(drawer()).find((tween) => tween.duration() > 0)!.parent!;
  }

  it('opens the left card drawer without animating the row or its columns', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);

    expect(gsap.getTweensOf([row(), row(1)])).toEqual([]);
    expect(card().getAttribute('data-project-expanded')).toBe('true');
    expect(card(1).getAttribute('data-project-expanded')).toBe('false');
    expect(drawer().inert).toBeFalse();
    expect(drawer(1).inert).toBeTrue();
    expect(drawer().style.width).toBe('256px');
    expect(drawer().style.height).toBe('');
  });

  it('can open the right-column drawer without moving the left card', () => {
    start();
    move(1);
    finishIntent();
    animation().progress(1);

    expect(drawer().inert).toBeTrue();
    expect(drawer(1).inert).toBeFalse();
    expect(drawer(1).style.width).toBe('256px');
  });

  for (const activeIndex of [0, 1, 2]) {
    it(`only opens drawer ${activeIndex + 1} in a three-card row`, () => {
      cardWidth = 350;
      row().insertAdjacentHTML('beforeend', slot(5));
      start();
      move(activeIndex);
      finishIntent();
      animation().progress(1);

      for (const index of [0, 1, 2]) {
        expect(drawer(index).inert).toBe(index !== activeIndex);
      }
      expect(drawer(activeIndex).style.width).toBe('228px');

      row().dispatchEvent(new PointerEvent('pointerleave'));
      finishIntent();
      animation().progress(1);
      expect(drawer(activeIndex).style.width).toBe('0px');
    });
  }

  it('does not switch cards from pointer boundary events alone', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);
    const calls = delayedCall.calls.count();
    card(1).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    card().dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    expect(delayedCall.calls.count()).toBe(calls);
    expect(card().getAttribute('data-project-expanded')).toBe('true');
  });

  it('retargets a running transition when moving to the other card', () => {
    start();
    move();
    finishIntent();
    const opening = animation();
    opening.pause(0.2);
    move(1);
    finishIntent();
    expect(opening.parent).toBeNull();
    animation().progress(1);
    expect(card().getAttribute('data-project-expanded')).toBe('false');
    expect(card(1).getAttribute('data-project-expanded')).toBe('true');
  });

  it('closes the drawer after its grace period', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);
    row().dispatchEvent(new PointerEvent('pointerleave'));
    expect(card().getAttribute('data-project-expanded')).toBe('true');
    finishIntent();
    animation().progress(1);
    expect(drawer().style.width).toBe('0px');
    expect(drawer().inert).toBeTrue();
  });

  it('immediately opens the focused project and protects it from hover switching', () => {
    start();
    card().querySelector<HTMLElement>('a')!.focus();
    expect(drawer().inert).toBeFalse();
    move(1);
    expect(card().getAttribute('data-project-expanded')).toBe('true');

    card(1).querySelector<HTMLElement>('a')!.focus();
    expect(drawer().inert).toBeTrue();
    expect(drawer(1).inert).toBeFalse();
  });

  it('keeps hybrid-device taps direct and does not close on touch leave', () => {
    start();
    const tap = new PointerEvent('pointerdown', {
      bubbles: true, pointerType: 'touch', cancelable: true,
    });
    card(1).dispatchEvent(tap);
    row().dispatchEvent(new PointerEvent('pointerleave'));
    expect(tap.defaultPrevented).toBeFalse();
    expect(drawer(1).inert).toBeFalse();
  });

  it('updates the measured details width when its card is resized', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);
    cardWidth = 320;
    resizeCallbacks[0]([], {} as ResizeObserver);
    expect(drawer().style.width).toBe('208px');
    expect(card().style.getPropertyValue('--project-brief-width')).toBe('208px');
  });

  it('handles an unpaired project without creating a phantom neighbour', () => {
    row().lastElementChild!.remove();
    start();
    move();
    finishIntent();
    animation().progress(1);
    expect(drawer().inert).toBeFalse();
    expect(drawer().style.width).toBe('256px');
  });

  it('restores layout, attributes and listeners when the media context is reverted', () => {
    start();
    move();
    finishIntent();
    animation().pause(0.2);
    row().dispatchEvent(new PointerEvent('pointerleave'));
    const closingIntent = delayedCall.calls.mostRecent().returnValue;
    context!.revert();
    const calls = delayedCall.calls.count();
    move(1);

    expect(closingIntent.parent).toBeNull();
    expect(delayedCall.calls.count()).toBe(calls);
    expect(card().classList).not.toContain('project-preview-horizontal');
    expect(card().style.getPropertyValue('--project-brief-width')).toBe('');
    expect(card().hasAttribute('data-project-expanded')).toBeFalse();
    expect(drawer().style.width).toBe('');
    expect(drawer().hasAttribute('aria-hidden')).toBeFalse();
    expect(drawer().inert).toBeFalse();
    disconnects.forEach((disconnect) => expect(disconnect).toHaveBeenCalled());
  });
});
