import { stabilizeFirefoxIosViewport } from './firefox-ios-viewport';

describe('Firefox iOS layout viewport', () => {
  const root = document.documentElement;
  const layoutUnit = '--layout-vh';
  let stop: (() => void) | undefined;

  afterEach(() => {
    stop?.();
    stop = undefined;
  });

  it('ignores toolbar-only height changes but updates the measurement after rotation', () => {
    spyOnProperty(navigator, 'userAgent').and.returnValue('Mozilla/5.0 (iPhone) FxiOS/148.2');
    const width = spyOnProperty(root, 'clientWidth').and.returnValue(390);
    const size = spyOn(Element.prototype, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 0, 650));

    stop = stabilizeFirefoxIosViewport(window);
    expect(root.style.getPropertyValue(layoutUnit)).toBe('6.5px');

    size.and.returnValue(new DOMRect(0, 0, 0, 750));
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('6.5px');
    expect(size).toHaveBeenCalledTimes(1);

    width.and.returnValue(740);
    size.and.returnValue(new DOMRect(0, 0, 0, 340));
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('3.4px');

    stop();
    stop = undefined;
    width.and.returnValue(390);
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('');
  });

  it('lets other browsers use their native viewport units', () => {
    spyOnProperty(navigator, 'userAgent').and.returnValue('Mozilla/5.0 (Android) Firefox/148.0');
    stop = stabilizeFirefoxIosViewport(window);
    expect(root.style.getPropertyValue(layoutUnit)).toBe('');
  });
});
