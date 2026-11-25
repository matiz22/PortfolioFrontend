import { gsap } from 'gsap';
import { animateProjectRows } from './projects-row-animation';

describe('horizontal project grid', () => {
  let root: HTMLElement;
  let context: gsap.Context | undefined;
  let delayedCall: jasmine.Spy;
  let gridWidth: number;
  let columns: number;
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

  function render(slots = 4): void {
    root.innerHTML = `<div class="projects-home-grid">${
      Array.from({ length: slots }, (_, index) => slot(index + 1)).join('')
    }</div>`;
  }

  beforeEach(() => {
    gridWidth = 1000;
    columns = 2;
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
    render();
    document.body.appendChild(root);
  });

  afterEach(() => {
    context?.revert();
    context = undefined;
    root.remove();
  });

  function start(): void {
    const element = grid();
    element.style.setProperty('--project-column-count', String(columns));
    element.style.columnGap = '32px';
    Object.defineProperty(element, 'clientWidth', { get: () => gridWidth });
    context = gsap.context((ctx) => animateProjectRows(root, ctx), root);
  }

  function grid(): HTMLElement {
    return root.querySelector<HTMLElement>('.projects-home-grid')!;
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

  function offsets(index = 0): [number, number] {
    const style = card(index).closest<HTMLElement>('.projects-home-motion')!.style;
    return [
      parseFloat(style.getPropertyValue('--project-inline-offset')) || 0,
      parseFloat(style.getPropertyValue('--project-width-offset')) || 0,
    ];
  }

  it('animates the hovered card to 65% of its row without resizing other rows', () => {
    start();
    expect(offsets()).toEqual([0, 0]);
    move();
    finishIntent();
    const opening = animation();
    expect(opening.duration()).toBe(0.52);
    // The original ease moves quickly, then overshoots slightly before settling.
    opening.pause(0.26);
    expect(offsets()[1]).toBeGreaterThan(145.2);
    expect(offsets(1)[1]).toBeLessThan(-145.2);
    opening.progress(1);

    expect(offsets()[1]).toBeCloseTo(145.2);
    expect(offsets(1)[0]).toBeCloseTo(145.2);
    expect(offsets(1)[1]).toBeCloseTo(-145.2);
    expect(offsets(2)).toEqual([0, 0]);
    expect(offsets(3)).toEqual([0, 0]);
    expect(card().getAttribute('data-project-expanded')).toBe('true');
    expect(card(1).getAttribute('data-project-expanded')).toBe('false');
    expect(drawer().inert).toBeFalse();
    expect(drawer(1).inert).toBeTrue();
    expect(drawer().style.width).toBe('227px');
    expect(drawer().style.height).toBe('');
  });

  it('widens a right-column card by shrinking the left card', () => {
    start();
    move(1);
    finishIntent();
    animation().progress(1);

    expect(offsets()[1]).toBeCloseTo(-145.2);
    expect(offsets(1)[0]).toBeCloseTo(-145.2);
    expect(offsets(1)[1]).toBeCloseTo(145.2);
    expect(drawer().inert).toBeTrue();
    expect(drawer(1).inert).toBeFalse();
    expect(drawer(1).style.width).toBe('227px');
  });

  it('uses the active column in a three-column grid', () => {
    render(3);
    columns = 3;
    gridWidth = 1264;
    start();
    move(2);
    finishIntent();
    animation().progress(1);

    expect(offsets(0)).toEqual([0, -100]);
    expect(offsets(1)).toEqual([-100, -100]);
    expect(offsets(2)).toEqual([-200, 200]);
    expect(drawer(0).inert).toBeTrue();
    expect(drawer(1).inert).toBeTrue();
    expect(drawer(2).inert).toBeFalse();
    expect(drawer(2).style.width).toBe('216px');

    grid().dispatchEvent(new PointerEvent('pointerleave'));
    finishIntent();
    animation().progress(1);
    expect([offsets(0), offsets(1), offsets(2)]).toEqual([[0, 0], [0, 0], [0, 0]]);
    expect(drawer(2).style.width).toBe('0px');
  });

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

  it('retargets a running transition and restores the previous row when moving to another row', () => {
    start();
    move();
    finishIntent();
    const opening = animation();
    opening.pause(0.2);
    move(3);
    finishIntent();
    expect(opening.parent).toBeNull();
    animation().progress(1);
    expect(offsets(0)).toEqual([0, 0]);
    expect(offsets(1)).toEqual([0, 0]);
    expect(offsets(2)[1]).toBeCloseTo(-145.2);
    expect(offsets(3)[1]).toBeCloseTo(145.2);
    expect(card().getAttribute('data-project-expanded')).toBe('false');
    expect(card(3).getAttribute('data-project-expanded')).toBe('true');
  });

  it('returns to equal widths after the closing grace period', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);
    grid().dispatchEvent(new PointerEvent('pointerleave'));
    expect(card().getAttribute('data-project-expanded')).toBe('true');
    finishIntent();
    const closing = animation();
    expect(closing.duration()).toBe(0.38);
    closing.progress(1);
    expect([offsets(), offsets(1)]).toEqual([[0, 0], [0, 0]]);
    expect(drawer().style.width).toBe('0px');
    expect(drawer().inert).toBeTrue();
  });

  it('immediately opens the focused project and protects it from hover switching', () => {
    start();
    card().querySelector<HTMLElement>('a')!.focus();
    expect(offsets()[1]).toBeCloseTo(145.2);
    expect(drawer().inert).toBeFalse();
    move(1);
    expect(card().getAttribute('data-project-expanded')).toBe('true');

    card(1).querySelector<HTMLElement>('a')!.focus();
    expect(offsets()[1]).toBeCloseTo(-145.2);
    expect(offsets(1)[1]).toBeCloseTo(145.2);
    expect(drawer().inert).toBeTrue();
    expect(drawer(1).inert).toBeFalse();
  });

  it('keeps hybrid-device taps direct and does not close on touch leave', () => {
    start();
    const tap = new PointerEvent('pointerdown', {
      bubbles: true, pointerType: 'touch', cancelable: true,
    });
    card(1).dispatchEvent(tap);
    grid().dispatchEvent(new PointerEvent('pointerleave'));
    expect(tap.defaultPrevented).toBeFalse();
    expect(drawer(1).inert).toBeFalse();
  });

  it('updates the details width when the grid resizes', () => {
    start();
    move();
    finishIntent();
    animation().progress(1);
    gridWidth = 800;
    resizeCallbacks[0]([], {} as ResizeObserver);
    expect(offsets()[1]).toBeCloseTo(115.2);
    expect(drawer().style.width).toBe('208px');
    expect(card().style.getPropertyValue('--project-brief-width')).toBe('208px');
  });

  it('updates the active row when resizing across the column count without replacing cards', () => {
    start();
    move(2);
    finishIntent();
    animation().progress(1);
    const cards = Array.from(root.querySelectorAll('.project-preview'));
    columns = 3;
    grid().style.setProperty('--project-column-count', '3');
    resizeCallbacks[0]([], {} as ResizeObserver);

    expect(offsets(0)).toEqual([0, -78]);
    expect(offsets(1)).toEqual([-78, -78]);
    expect(offsets(2)).toEqual([-156, 156]);
    expect(offsets(3)).toEqual([0, 0]);
    expect(Array.from(root.querySelectorAll('.project-preview'))).toEqual(cards);
  });

  it('uses the full width of a final pair at the three-column breakpoint', () => {
    render(5);
    columns = 3;
    start();
    move(4);
    finishIntent();
    animation().progress(1);

    expect([offsets(0), offsets(1), offsets(2)]).toEqual([[0, 0], [0, 0], [0, 0]]);
    expect(offsets(3)[1]).toBeCloseTo(-145.2);
    expect(offsets(4)[1]).toBeCloseTo(145.2);
    expect(drawer(4).style.width).toBe('227px');
  });

  it('handles a final single project without redistributing width', () => {
    render(4);
    columns = 3;
    start();
    move(3);
    finishIntent();
    animation().progress(1);
    expect([offsets(0), offsets(1), offsets(2), offsets(3)]).toEqual([[0, 0], [0, 0], [0, 0], [0, 0]]);
    expect(drawer(3).inert).toBeFalse();
    expect(drawer(3).style.width).toBe('256px');
  });

  it('restores layout, attributes and listeners when the media context is reverted', () => {
    start();
    move();
    finishIntent();
    animation().pause(0.2);
    grid().dispatchEvent(new PointerEvent('pointerleave'));
    const closingIntent = delayedCall.calls.mostRecent().returnValue;
    context!.revert();
    const calls = delayedCall.calls.count();
    move(1);

    expect(closingIntent.parent).toBeNull();
    expect(delayedCall.calls.count()).toBe(calls);
    expect(grid().classList).not.toContain('projects-home-grid-horizontal');
    expect(card().closest<HTMLElement>('.projects-home-motion')!.style.cssText).toBe('');
    expect(card().classList).not.toContain('project-preview-horizontal');
    expect(card().style.getPropertyValue('--project-brief-width')).toBe('');
    expect(card().hasAttribute('data-project-expanded')).toBeFalse();
    expect(drawer().style.width).toBe('');
    expect(drawer().hasAttribute('aria-hidden')).toBeFalse();
    expect(drawer().inert).toBeFalse();
    disconnects.forEach((disconnect) => expect(disconnect).toHaveBeenCalled());
  });
});
