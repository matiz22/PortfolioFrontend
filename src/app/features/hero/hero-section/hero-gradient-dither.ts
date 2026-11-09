// A 4×4 Bayer threshold matrix produces deliberate pixel clusters, not random grain.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const PIXEL_SIZE = 2;
const ALPHA_STEP = 46;
const TONE_STEPS = 2;

export function renderHeroDither(root: HTMLElement): () => void {
  const view = root.ownerDocument.defaultView;
  if (!view) {
    return () => {};
  }

  const layers = Array.from(root.querySelectorAll<HTMLCanvasElement>('canvas.hero-gradient-field'))
    .flatMap((canvas) => {
      const context = canvas.getContext('2d');
      return context ? [{
        canvas,
        context,
        background: canvas.style.backgroundImage,
        backgroundPriority: canvas.style.getPropertyPriority('background-image'),
        width: canvas.getAttribute('width'),
        height: canvas.getAttribute('height'),
        rendered: false,
      }] : [];
    });
  if (!layers.length) {
    return () => {};
  }

  const paint = () => {
    const bounds = layers.map(({ canvas }) => canvas.getBoundingClientRect());

    layers.forEach((layer, index) => {
      const { canvas, context } = layer;
      const { width: cssWidth, height: cssHeight } = bounds[index];
      if (!cssWidth || !cssHeight) {
        return;
      }

      // Keep two-CSS-pixel cells on normal displays and cap bitmap memory on huge screens.
      const pixelSize = Math.max(PIXEL_SIZE, cssWidth / 1280, cssHeight / 960);
      const width = Math.ceil(cssWidth / pixelSize);
      const height = Math.ceil(cssHeight / pixelSize);
      if (layer.rendered && canvas.width === width && canvas.height === height) {
        return;
      }

      const style = view.getComputedStyle(canvas);
      const origin = (style.getPropertyValue('--glow-origin').trim() || '78% 28%')
        .split(/\s+/).map((value) => parseFloat(value) / 100);
      const color = style.getPropertyValue('--glow-color').trim() ||
        style.getPropertyValue('--color-primary').trim();

      canvas.width = width;
      canvas.height = height;
      // Let Canvas resolve the theme's OKLCH color into sRGB without another dependency.
      context.fillStyle = '#4ade80';
      if (color) {
        context.fillStyle = color;
      }
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const image = context.createImageData(width, height);

      for (let y = 0; y < height; y++) {
        const dy = ((y + 0.5) / height - origin[1]) / 0.72;
        for (let x = 0; x < width; x++) {
          const dx = ((x + 0.5) / width - origin[0]) / 0.72;
          const falloff = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
          const intensity = falloff * falloff * (3 - 2 * falloff) * TONE_STEPS;
          const threshold = (BAYER[(y % 4) * 4 + x % 4] + 0.5) / 16;
          const tone = Math.floor(intensity) + (intensity % 1 > threshold ? 1 : 0);
          const offset = (y * width + x) * 4;

          image.data[offset] = red;
          image.data[offset + 1] = green;
          image.data[offset + 2] = blue;
          image.data[offset + 3] = tone * ALPHA_STEP;
        }
      }

      context.putImageData(image, 0, 0);
      canvas.style.backgroundImage = 'none';
      layer.rendered = true;
    });
  };

  // Paint only on initialization/resize. Mouse movement just transforms these cached layers.
  paint();
  let frame: number | undefined;
  const schedulePaint = () => {
    frame ??= view.requestAnimationFrame(() => {
      frame = undefined;
      paint();
    });
  };
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedulePaint) : undefined;
  if (observer) {
    layers.forEach(({ canvas }) => observer.observe(canvas));
  } else {
    view.addEventListener('resize', schedulePaint);
  }

  return () => {
    observer?.disconnect();
    view.removeEventListener('resize', schedulePaint);
    if (frame !== undefined) {
      view.cancelAnimationFrame(frame);
    }
    for (const layer of layers) {
      layer.canvas.style.setProperty('background-image', layer.background, layer.backgroundPriority);
      for (const attribute of ['width', 'height'] as const) {
        const value = layer[attribute];
        if (value === null) {
          layer.canvas.removeAttribute(attribute);
        } else {
          layer.canvas.setAttribute(attribute, value);
        }
      }
    }
  };
}
