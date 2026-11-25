import type {ShaderMount} from '@paper-design/shaders';

import {attachGrainGradientMotion} from './grain-gradient-motion';

describe('grain gradient motion', () => {
  let root: HTMLElement;
  let shader: jasmine.SpyObj<Pick<ShaderMount, 'setSpeed' | 'setUniforms'>>;
  let reducedMotion: MediaQueryList;
  let coarsePointer: MediaQueryList;
  let frames: Map<number, FrameRequestCallback>;
  let dispose: (() => void) | undefined;
  let visibility: jasmine.Spy;

  function media(query: string, matches: boolean): MediaQueryList {
    return Object.assign(new EventTarget(), { media: query, matches }) as MediaQueryList;
  }

  function changeMedia(query: MediaQueryList, matches: boolean): void {
    Object.defineProperty(query, 'matches', { value: matches, configurable: true });
    query.dispatchEvent(new Event('change'));
  }

  function move(clientX: number, clientY: number, pointerType = 'mouse'): void {
    root.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, pointerType }));
  }

  function settle(): void {
    let time = 0;
    while (frames.size && time < 4_000) {
      time += 16;
      const pending = Array.from(frames.values());
      frames.clear();
      pending.forEach(callback => callback(time));
    }
    expect(frames.size).toBe(0);
  }

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
    shader = jasmine.createSpyObj('shader', ['setSpeed', 'setUniforms']);
    reducedMotion = media('(prefers-reduced-motion: reduce)', false);
    coarsePointer = media('(pointer: coarse)', false);
    spyOn(window, 'matchMedia').and.callFake(query => {
      if (query === reducedMotion.media) return reducedMotion;
      if (query === coarsePointer.media) return coarsePointer;
      return media(query, false);
    });
    visibility = spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    spyOn(window.performance, 'now').and.returnValue(0);
    frames = new Map();
    let frameId = 0;
    spyOn(window, 'requestAnimationFrame').and.callFake(callback => {
      frames.set(++frameId, callback);
      return frameId;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake(id => { frames.delete(id); });
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    root.remove();
  });

  it('starts visible ambient animation without a separate idle pointer loop', () => {
    dispose = attachGrainGradientMotion(root, shader);

    expect(shader.setSpeed).toHaveBeenCalledWith(0.65);
    expect(frames.size).toBe(0);
  });

  it('eases towards bounded viewport coordinates, then stops updating', () => {
    dispose = attachGrainGradientMotion(root, shader);
    shader.setUniforms.calls.reset();
    move(window.innerWidth * 2, window.innerHeight * 2);
    move(window.innerWidth, window.innerHeight);

    expect(shader.setUniforms).not.toHaveBeenCalled();
    expect(frames.size).toBe(1);
    settle();
    expect(shader.setUniforms.calls.first().args[0]).not.toEqual({
      u_offsetX: 0.22, u_offsetY: -0.22,
    });
    expect(shader.setUniforms.calls.mostRecent().args[0]).toEqual({
      u_offsetX: 0.22, u_offsetY: -0.22,
    });
  });

  it('returns to the center when the pointer leaves', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);
    settle();
    root.dispatchEvent(new PointerEvent('pointerleave'));
    settle();

    expect(shader.setUniforms.calls.mostRecent().args[0]).toEqual({
      u_offsetX: 0, u_offsetY: 0,
    });
  });

  it('ignores touch while retaining ambient motion', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0, 'touch');
    expect(frames.size).toBe(0);

    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0.65);
  });

  it('pauses the ambient loop through a burst of mobile scroll or viewport events', () => {
    changeMedia(coarsePointer, true);
    jasmine.clock().install();
    try {
      dispose = attachGrainGradientMotion(root, shader);
      shader.setSpeed.calls.reset();

      window.dispatchEvent(new Event('scroll'));
      expect(shader.setSpeed).toHaveBeenCalledOnceWith(0);
      jasmine.clock().tick(120);
      (window.visualViewport ?? window).dispatchEvent(new Event(window.visualViewport ? 'resize' : 'scroll'));
      jasmine.clock().tick(120);
      expect(shader.setSpeed).toHaveBeenCalledTimes(1);
      jasmine.clock().tick(40);
      expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0.65);

      window.dispatchEvent(new Event('scroll'));
      dispose();
      dispose = undefined;
      shader.setSpeed.calls.reset();
      jasmine.clock().tick(200);
      expect(shader.setSpeed).not.toHaveBeenCalled();
    } finally {
      dispose?.();
      dispose = undefined;
      jasmine.clock().uninstall();
    }
  });

  it('responds to a mouse even when the primary device does not report hover', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);
    settle();
    expect(shader.setUniforms.calls.mostRecent().args[0]).toEqual({
      u_offsetX: 0.22, u_offsetY: 0.22,
    });
  });

  it('receives movement even when an interactive child stops propagation', () => {
    const child = document.createElement('button');
    root.appendChild(child);
    child.addEventListener('pointermove', event => event.stopPropagation());
    dispose = attachGrainGradientMotion(root, shader);
    child.dispatchEvent(new PointerEvent('pointermove', {
      clientX: window.innerWidth, clientY: 0, pointerType: 'mouse', bubbles: true,
    }));
    settle();
    expect(shader.setUniforms.calls.mostRecent().args[0]).toEqual({
      u_offsetX: 0.22, u_offsetY: 0.22,
    });
  });

  it('renders statically when reduced motion is already enabled', () => {
    changeMedia(reducedMotion, true);
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);

    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0);
    expect(frames.size).toBe(0);
  });

  it('responds to reduced-motion changes and cancels pending pointer animation', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);
    changeMedia(reducedMotion, true);

    expect(frames.size).toBe(0);
    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0);
    expect(shader.setUniforms.calls.mostRecent().args[0]).toEqual({
      u_offsetX: 0, u_offsetY: 0,
    });
    move(window.innerWidth, 0);
    expect(frames.size).toBe(0);

    changeMedia(reducedMotion, false);
    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0.65);
  });

  it('pauses when hidden and resumes when visible', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);
    visibility.and.returnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));

    expect(frames.size).toBe(0);
    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0);

    visibility.and.returnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(shader.setSpeed.calls.mostRecent().args[0]).toBe(0.65);
  });

  it('removes listeners and cancels pending frames on destruction', () => {
    dispose = attachGrainGradientMotion(root, shader);
    move(window.innerWidth, 0);
    dispose();
    shader.setUniforms.calls.reset();
    shader.setSpeed.calls.reset();
    move(0, 0);
    root.dispatchEvent(new PointerEvent('pointerleave'));
    window.dispatchEvent(new Event('blur'));
    document.dispatchEvent(new Event('visibilitychange'));
    changeMedia(reducedMotion, true);

    expect(frames.size).toBe(0);
    expect(shader.setUniforms).not.toHaveBeenCalled();
    expect(shader.setSpeed).not.toHaveBeenCalled();
    dispose = undefined;
  });
});
