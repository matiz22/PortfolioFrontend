import { stabilizeFirefoxIosViewport } from './firefox-ios-viewport';

describe('Firefox iOS layout viewport', () => {
  const root = document.documentElement;
  const layoutUnit = '--layout-vh';
  const grainHeight = '--grain-viewport-height';
  let stop: (() => void) | undefined;

  afterEach(() => {
    stop?.();
    stop = undefined;
  });

  it('ignores toolbar-only height changes but updates the measurement after rotation', () => {
    spyOnProperty(navigator, 'userAgent').and.returnValue('Mozilla/5.0 (iPhone) FxiOS/148.2');
    const width = spyOnProperty(root, 'clientWidth').and.returnValue(390);
    const size = spyOn(Element.prototype, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 0, 650));
    spyOnProperty(screen, 'width').and.returnValue(390);
    spyOnProperty(screen, 'height').and.returnValue(844);

    stop = stabilizeFirefoxIosViewport(window);
    expect(root.style.getPropertyValue(layoutUnit)).toBe('6.5px');
    expect(root.style.getPropertyValue(grainHeight)).toBe('844px');
    expect(root.hasAttribute('data-firefox-ios')).toBeTrue();

    size.and.returnValue(new DOMRect(0, 0, 0, 750));
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('6.5px');
    expect(root.style.getPropertyValue(grainHeight)).toBe('844px');
    expect(root.hasAttribute('data-firefox-ios')).toBeTrue();
    expect(size).toHaveBeenCalledTimes(1);

    width.and.returnValue(740);
    size.and.returnValue(new DOMRect(0, 0, 0, 340));
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('3.4px');
    expect(root.style.getPropertyValue(grainHeight)).toBe('390px');

    stop();
    stop = undefined;
    width.and.returnValue(390);
    window.dispatchEvent(new Event('resize'));
    expect(root.style.getPropertyValue(layoutUnit)).toBe('');
    expect(root.style.getPropertyValue(grainHeight)).toBe('');
    expect(root.hasAttribute('data-firefox-ios')).toBeFalse();
  });

  it('lets other browsers use their native viewport units', () => {
    spyOnProperty(navigator, 'userAgent').and.returnValue('Mozilla/5.0 (Android) Firefox/148.0');
    stop = stabilizeFirefoxIosViewport(window);
    expect(root.style.getPropertyValue(layoutUnit)).toBe('');
    expect(root.style.getPropertyValue(grainHeight)).toBe('');
    expect(root.hasAttribute('data-firefox-ios')).toBeFalse();
  });
});
