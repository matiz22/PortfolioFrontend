import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { animateAppsPreview } from './apps-preview-animation';
import { AppsPreview } from './apps-preview';

describe('AppsPreview', () => {
  let fixture: ComponentFixture<AppsPreview>;
  let root: HTMLElement;
  let canAnimate: boolean;
  let motion: gsap.MatchMedia | undefined;

  beforeEach(() => {
    canAnimate = true;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      if (query === '(prefers-reduced-motion: no-preference)') {
        Object.defineProperty(media, 'matches', { value: canAnimate });
      }
      return media;
    });
    TestBed.configureTestingModule({ imports: [AppsPreview] });
    fixture = TestBed.createComponent(AppsPreview);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    fixture.destroy();
  });

  const step = (name: string) => Array.from(root.querySelectorAll(`[data-app-step="${name}"]`));
  const opacity = (element: Element) => Number(getComputedStyle(element).opacity);
  const screens = () => Array.from(root.querySelectorAll<HTMLElement>('[data-app-device]'));
  const scenes = (screen: HTMLElement) => Array.from(screen.querySelectorAll<HTMLElement>('[data-app-scene]'));

  function expectScene(name: string): void {
    for (const screen of screens()) {
      for (const scene of scenes(screen)) {
        expect(opacity(scene)).withContext(`${screen.dataset['appDevice']} / ${scene.dataset['appScene']}`)
          .toBe(scene.dataset['appScene'] === name ? 1 : 0);
      }
    }
  }

  function startAnimation(): gsap.core.Timeline {
    const timeline = spyOn(gsap, 'timeline').and.callThrough();
    motion = animateAppsPreview(root);
    return timeline.calls.mostRecent().returnValue;
  }

  it('shows the vault mockups without rotation or biometric overlays for reduced motion', () => {
    canAnimate = false;
    const timeline = spyOn(gsap, 'timeline');
    motion = animateAppsPreview(root);

    expect(screens().map((element) => element.dataset['appDevice'])).toEqual(['desktop', 'phone']);
    for (const screen of screens()) {
      expect(scenes(screen).map((scene) => scene.dataset['appScene'])).toEqual(['vault', 'studio', 'notes']);
    }
    expectScene('vault');
    expect(Array.from(root.querySelectorAll('[data-app-hidden]')).every((element) => opacity(element) === 0)).toBeTrue();
    expect(timeline).not.toHaveBeenCalled();
  });

  it('fits the three layouts inside narrow frames', () => {
    root.style.width = '257px';
    root.style.height = '240px';

    for (const element of root.querySelectorAll('.mock-attachment, .mock-tabs, .vault-grid, .note-page, .mock-toast, .note-reader-paper')) {
      const screen = element.closest('.mock-screen')!.getBoundingClientRect();
      const bounds = element.getBoundingClientRect();
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.top).toBeGreaterThanOrEqual(screen.top);
      expect(bounds.bottom).toBeLessThanOrEqual(screen.bottom);
      expect(bounds.right).toBeLessThanOrEqual(screen.right);
    }

    for (const art of root.querySelectorAll('.report-art')) {
      const bounds = art.getBoundingClientRect();
      const cover = art.parentElement!.getBoundingClientRect();
      expect(bounds.bottom).toBeLessThan(cover.bottom);
      expect(bounds.top).toBeGreaterThan(cover.top);
    }
  });

  it('scales the phone body, corners, and screen together on mobile and desktop', () => {
    const phone = root.querySelector<HTMLElement>('.mockup-phone')!;
    const screen = phone.querySelector<HTMLElement>('.mockup-phone-display')!;

    for (const [width, height] of [[272, 256], [327, 256], [342, 256], [382, 256], [630, 320]]) {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;
      const styles = getComputedStyle(phone);

      expect(parseFloat(styles.width) / parseFloat(styles.height)).toBeCloseTo(462 / 978, 3);
      expect(parseFloat(styles.borderTopLeftRadius) / parseFloat(styles.width)).toBeCloseTo(65 / 462, 3);
      const inset = parseFloat(styles.paddingTop) + parseFloat(styles.borderTopWidth);
      // Borders snap to physical pixels; calc() retains their fractional size.
      expect(Math.abs(parseFloat(getComputedStyle(screen).borderTopLeftRadius)
        - (parseFloat(styles.borderTopLeftRadius) - inset))).toBeLessThan(1);
    }
  });

  it('sweeps the Face ID line to the bottom before verifying and removing the locks', () => {
    const timeline = startAnimation();
    const scan = step('face-scan')[0];
    const scanStart = timeline.labels['face-scan'];
    const locks = step('vault-lock');
    const lineY = () => ['y1', 'y2'].map((attr) => Number(scan.getAttribute(attr)));

    timeline.time(scanStart - 0.01);
    expect(lineY()).toEqual([3, 3]);

    timeline.time(scanStart + 0.43);
    expect(lineY()).toEqual([12, 12]);
    expect(opacity(scan)).toBe(1);

    timeline.time(scanStart + 0.9);
    expect(lineY()).toEqual([21, 21]);
    expect(opacity(scan)).toBe(1);
    expect(step('verified').map(opacity)).toEqual([0, 0]);
    expect(locks.every((lock) => opacity(lock) === 1)).toBeTrue();

    timeline.time(timeline.labels['vault-verified'] + 0.05);
    expect(opacity(scan)).toBe(0);
    expect(locks.every((lock) => opacity(lock) === 0)).toBeTrue();
  });

  it('rotates both devices in sync and plays each app’s native action', () => {
    const timeline = startAnimation();
    const at = (action: string, seconds: number) => timeline.time(timeline.labels[action] + seconds);

    at('unlock', 0.8);
    expectScene('vault');
    expect(step('biometric').map(opacity)).toEqual([1, 1]);
    at('unlock', 1.55);
    expect(step('verified').map(opacity)).toEqual([1, 1]);
    at('unlock', 2.2);
    expect(step('biometric').map(opacity)).toEqual([0, 0]);
    expect(step('vault-lock').every((icon) => opacity(icon) === 0)).toBeTrue();

    at('attach', 1.6);
    expectScene('studio');
    expect(opacity(step('drag-ghost')[0])).toBe(1);
    expect(opacity(step('scan-beam')[0])).toBe(1);
    at('attach', 2.4);
    expect(opacity(step('drop-check')[0])).toBe(1);
    expect(opacity(step('scan-check')[0])).toBe(1);

    at('handoff', 0.2);
    expectScene('notes');
    expect(opacity(step('offline')[0])).toBe(1);
    expect(step('notification').map(opacity)).toEqual([0, 0]);
    at('handoff', 1.3);
    expect(opacity(step('synced')[0])).toBe(1);
    expect(step('notification').map(opacity)).toEqual([1, 1]);
    at('handoff', 2.2);
    expect(opacity(step('toast-pointer')[0])).toBe(1);
    expect(opacity(step('toast-tap')[0])).toBe(1);
    expect(step('note-detail').map(opacity)).toEqual([0, 0]);
    at('note-open', 0.4);
    expect(step('notification').map(opacity)).toEqual([0, 0]);
    expect(step('note-detail').map(opacity)).toEqual([1, 1]);

    timeline.totalTime(timeline.duration() + timeline.labels['unlock'] + 0.8);
    expectScene('vault');
    expect(step('biometric').map(opacity)).toEqual([1, 1]);
    expect(step('vault-lock').every((icon) => opacity(icon) === 1)).toBeTrue();
    expect(opacity(step('drop-check')[0])).toBe(0);
    expect(opacity(step('synced')[0])).toBe(0);
    expect(step('note-detail').map(opacity)).toEqual([0, 0]);
  });
});
