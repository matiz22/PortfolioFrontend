const LAYOUT_UNIT = '--layout-vh';

/** Firefox on iOS can change even svh when its toolbar moves (mozilla-mobile/firefox-ios#22607). */
export function stabilizeFirefoxIosViewport(view: Window): () => void {
  if (!/\bFxiOS\//i.test(view.navigator.userAgent)) {
    return () => undefined;
  }

  const doc = view.document;
  const root = doc.documentElement;
  let width = 0;
  const measure = () => {
    // The toolbar and keyboard can change height but not the unzoomed layout
    // width. Re-measure for rotation or resizing, not for every scroll gesture.
    const nextWidth = root.clientWidth;
    if (!nextWidth || nextWidth === width) return;

    const ruler = doc.createElement('div');
    ruler.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;height:100svh';
    doc.body.append(ruler);
    const height = ruler.getBoundingClientRect().height;
    ruler.remove();
    if (height <= 0) return;

    width = nextWidth;
    root.style.setProperty(LAYOUT_UNIT, `${height / 100}px`);
  };

  measure();
  view.addEventListener('resize', measure);
  return () => {
    view.removeEventListener('resize', measure);
    root.style.removeProperty(LAYOUT_UNIT);
  };
}
