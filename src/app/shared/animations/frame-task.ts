/** Run at most once per frame and ignore notifications after disposal. */
export function createFrameTask(view: Window, run: () => void) {
  let frame: number | undefined;
  let disposed = false;

  return {
    request: () => {
      if (disposed || frame !== undefined) return;
      frame = view.requestAnimationFrame(() => {
        frame = undefined;
        if (!disposed) run();
      });
    },
    dispose: () => {
      disposed = true;
      if (frame !== undefined) view.cancelAnimationFrame(frame);
      frame = undefined;
    },
  };
}
