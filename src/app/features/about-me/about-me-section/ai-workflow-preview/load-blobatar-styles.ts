const requests = new WeakMap<Document, Promise<void>>();

export function loadBlobatarStyles(document: Document): Promise<void> {
  const existing = requests.get(document);
  if (existing) return existing;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Angular emits non-injected styles without a hash. Key the URL to the pinned vendor version.
  link.href = 'blobatar-motion.css?v=2.7.0';
  const request = new Promise<void>((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error('Could not load Blobatar styles.')), { once: true });
    document.head.append(link);
  }).catch((error: unknown) => {
    link.remove();
    requests.delete(document);
    throw error;
  });

  requests.set(document, request);
  return request;
}
