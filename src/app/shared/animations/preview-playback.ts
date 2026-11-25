/** Keep a decorative preview asleep outside its visible, selected document area. */
export function observePreviewPlayback(
  root: HTMLElement,
  onPlaying: (playing: boolean) => void,
  activeContainer?: HTMLElement | null,
): () => void {
  const document = root.ownerDocument;
  const view = document.defaultView;
  let inViewport = false;
  let playing = false;
  let disposed = false;
  onPlaying(false);

  const sync = () => {
    if (disposed) return;
    const active = activeContainer?.getAttribute('aria-hidden') !== 'true' && !activeContainer?.inert;
    const next = inViewport && active && root.isConnected && !document.hidden;
    if (next !== playing) {
      playing = next;
      onPlaying(next);
    }
  };
  const intersection = view?.IntersectionObserver
    ? new view.IntersectionObserver(([entry]) => {
      inViewport = !!entry?.isIntersecting && entry.intersectionRatio > 0;
      sync();
    }, { threshold: [0, 0.1] })
    : undefined;
  intersection?.observe(root);

  const selection = activeContainer && view?.MutationObserver ? new view.MutationObserver(sync) : undefined;
  if (activeContainer) {
    selection?.observe(activeContainer, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });
  }
  document.addEventListener('visibilitychange', sync);

  return () => {
    if (disposed) return;
    disposed = true;
    intersection?.disconnect();
    selection?.disconnect();
    document.removeEventListener('visibilitychange', sync);
    if (playing) onPlaying(false);
  };
}
