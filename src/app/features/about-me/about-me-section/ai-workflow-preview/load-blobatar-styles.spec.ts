import { loadBlobatarStyles } from './load-blobatar-styles';

describe('loadBlobatarStyles', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument();
  });

  it('reuses the same stylesheet request for a document', async () => {
    const request = loadBlobatarStyles(doc);
    expect(loadBlobatarStyles(doc)).toBe(request);
    const links = doc.head.querySelectorAll('link[rel="stylesheet"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toContain('blobatar-motion.css');

    links[0].dispatchEvent(new Event('load'));
    await request;
    expect(loadBlobatarStyles(doc)).toBe(request);
  });

  it('removes a failed link so the next preview activation can retry', async () => {
    const failedRequest = loadBlobatarStyles(doc);
    doc.head.querySelector('link')!.dispatchEvent(new Event('error'));
    await expectAsync(failedRequest).toBeRejectedWithError('Could not load Blobatar styles.');
    expect(doc.head.querySelector('link')).toBeNull();

    const retry = loadBlobatarStyles(doc);
    expect(retry).not.toBe(failedRequest);
    doc.head.querySelector('link')!.dispatchEvent(new Event('load'));
    await retry;
  });
});
