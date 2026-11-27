import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';

// Run against `ng build --configuration local`, where the API URL is loopback.
const api = 'http://127.0.0.1:8000/api/';
const socialMode = process.env['HYDRATION_SOCIAL_MODE'] ?? 'success';
if (!['success', 'error', 'timeout'].includes(socialMode)) {
  throw new Error('HYDRATION_SOCIAL_MODE must be success, error or timeout.');
}
const summary = (id, name) => ({
  id,
  slug: `fixture-${name}-${id}`,
  title: `Fixture ${name} ${id}`,
  short_desc: 'A project description.',
  home_page: true,
  published: true,
  order: id,
  technologies: [],
  skills: [],
});
const socialPath = 'v1/social-links/translated';
const fixtures = {
  'v1/projects/translated/home-page/summary': Array.from({ length: 5 }, (_, i) =>
    summary(i + 1, 'project')),
  'v1/realizations/translated/home-page/summary': [
    { ...summary(1, 'work'), client_name: 'Fixture client' },
  ],
  'v1/certifications/translated/home-page/summary': [
    {
      ...summary(1, 'certification'), name: 'Fixture certification',
      issuing_organization: 'Fixture organization', issue_date: '2023-05-15',
    },
  ],
  'v1/jobs/translated/home-page/summary': [
    { ...summary(1, 'job'), company_name: 'Fixture employer', start_date: '2020-05-15' },
    { ...summary(2, 'job'), company_name: 'Fixture employer', start_date: '2024-05-15', is_current: true },
  ],
  'v1/education/translated/home-page/summary': [
    { ...summary(1, 'education'), institution: 'Fixture school', degree: 'Fixture degree', start_date: '2020-05-15' },
  ],
  [socialPath]: [{ id: 1, name: 'Fixture social link', url: 'https://example.com', icon: '', order: 1 }],
};
const nativeFetch = globalThis.fetch;
let serverSocialRequests = 0;
globalThis.fetch = (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.startsWith(api)) {
    const path = url.slice(api.length);
    if (path === socialPath) serverSocialRequests++;
    return Promise.resolve(Response.json(fixtures[path] ?? []));
  }
  return nativeFetch(input, init);
};

const { reqHandler } = await import('../dist/PortfolioFrontend/server/server.mjs');
const resultPath = '/__home-hydration-result';
const { promise, resolve, reject } = Promise.withResolvers();
const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === resultPath) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    res.end();
    const { error, contact } = JSON.parse(Buffer.concat(chunks).toString());
    if (error) reject(new Error(error));
    else resolve(contact);
  } else if (req.url === '/' && req.headers['x-raw-ssr'] !== '1') {
    try {
      const response = await nativeFetch(origin, { headers: { 'x-raw-ssr': '1' } });
      const html = await response.text();
      const entry = '<script src="main.js" type="module"></script>';
      if (!response.ok || !html.includes(entry)) {
        throw new Error('Expected SSR output from ng build --configuration local.');
      }
      if (serverSocialRequests) {
        throw new Error('SSR requested the optional social links.');
      }
      // Take the first measurement before the real application entry point runs.
      const args = JSON.stringify(['main.js', resultPath, api, socialPath, socialMode, fixtures[socialPath]]);
      const script = `<script>(${probe})(...${args})</script>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html.replace(entry, script));
    } catch (error) {
      res.statusCode = 500;
      res.end(String(error));
      reject(error);
    }
  } else {
    reqHandler(req, res);
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}/`;
const browser = process.env['HYDRATION_BROWSER']
  ? spawn(process.env['HYDRATION_BROWSER'], [origin], { stdio: 'inherit' })
  : undefined;
browser?.once('error', reject);
console.log(`Open ${origin} in a browser with a viewport at least 80rem wide.`);
const timer = setTimeout(() => reject(new Error('No hydration result received.')), 60_000);
try {
  const contact = await promise;
  console.log('About hydrated on idle; the remaining chapters waited for the viewport.');
  console.log('All five homepage summary sections retained their server-rendered cards without refetching.');
  console.log('Projects retained their server-rendered nodes and column geometry after hydration.');
  console.log('Chapter footer links and the Contact anchor survived hydration.');
  console.log(`Contact social links (separate API): ${contact}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
  browser?.kill();
  server.close();
  globalThis.fetch = nativeFetch;
}

function probe(entry, resultPath, api, socialPath, socialMode, socialLinks) {
  function checkChapterNavigation() {
    const nextLinks = [
      ['home', '.hero-next', 'about'],
      ['about', '.about-next', 'work'],
      ['work', '.realizations-next', 'projects'],
      ['projects', '.projects-home-footer', 'certifications'],
      ['certifications', '.certifications-footer', 'experience'],
      ['experience', '.jobs-bottom', 'education'],
      ['education', '.education-footer', 'contact'],
    ];
    for (const [from, footer, to] of nextLinks) {
      const links = document.querySelectorAll(`#${from} app-section-next a`);
      const link = links[0];
      const target = document.querySelectorAll(`#${to}`);
      if (links.length !== 1 || !link.closest(footer) || link.getAttribute('href') !== `#${to}` ||
          target.length !== 1 || !target[0].matches('main > [data-grain-chapter]')) {
        throw new Error(`Expected a next link from ${from} in ${footer} to the chapter #${to}.`);
      }
    }
    if (document.querySelector('#contact app-section-next') ||
        document.querySelector('#contact .contact-section')?.hasAttribute('id') !== false) {
      throw new Error('Expected Contact to end the chapter chain without a duplicate inner ID.');
    }
  }

  function capture(hostSelector, itemSelector, count) {
    const host = document.querySelector(`${hostSelector}[ngh]`);
    const read = () => Array.from(host?.querySelectorAll(itemSelector) ?? []);
    const nodes = read();
    if (!host || nodes.length !== count) {
      throw new Error(`Expected ${count} server-rendered items in ${hostSelector} before hydration.`);
    }
    return {
      host,
      unchanged() {
        const after = read();
        return host.isConnected && after.length === nodes.length && after.every((node, i) => node === nodes[i]);
      },
    };
  }

  // Angular removes the original host's marker when claiming the DOM.
  function waitForHydration(host) {
    if (!host.hasAttribute('ngh')) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (!host.hasAttribute('ngh')) {
          observer.disconnect();
          clearTimeout(timeout);
          resolve();
        }
      });
      observer.observe(host, { attributes: true, attributeFilter: ['ngh'] });
      const timeout = setTimeout(() => {
        observer.disconnect();
        const { top, bottom } = host.getBoundingClientRect();
        reject(new Error(`Angular did not hydrate ${host.localName} (bounds ${top} to ${bottom}, viewport ${innerHeight}).`));
      }, 15_000);
    });
  }

  function waitForElement(selector) {
    const existing = document.querySelector(selector);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timeout);
          resolve(element);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const timeout = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Did not find ${selector}.`));
      }, 10_000);
    });
  }

  async function check() {
    await document.fonts.ready;
    if (!matchMedia('(min-width: 80rem)').matches) {
      throw new Error('Open the test at the wide Projects breakpoint (80rem or more).');
    }
    checkChapterNavigation();

    const summaries = [
      capture('app-realizations-home-section', 'app-realization-showcase-card', 1),
      capture('app-projects-home-section', '.project-preview', 5),
      capture('app-certifications-section', 'app-certification-showcase-card', 1),
      capture('app-job-timeline-section', '.jobs-entry', 2),
      capture('app-education-section', '.education-card', 1),
    ];
    const about = capture('app-about-me-section', 'h2', 1);
    const contact = capture('app-contact-section', 'input:not([type="hidden"]), textarea', 5);
    const email = contact.host.querySelector('a[href="mailto:contact@malich.dev"]');
    if (!email || contact.host.querySelector('app-social-links-row a, .social-links-state')) {
      throw new Error('Expected Contact SSR to render its form and email, without API-dependent links or a loading message.');
    }
    const chapters = [about, ...summaries, contact];
    const selector = 'app-projects-home-section .projects-home-grid > .projects-home-slot';
    const before = Array.from(document.querySelectorAll(selector));
    const snapshot = (slots) => slots.map(({ offsetLeft, offsetWidth }) => [offsetLeft, offsetWidth]);
    const geometry = JSON.stringify(snapshot(before));
    const [a, b, c, d, e] = before;
    if (before.length !== 5 || a.offsetTop !== b.offsetTop ||
        b.offsetTop !== c.offsetTop || a.offsetTop >= d.offsetTop ||
        d.offsetTop !== e.offsetTop || a.offsetWidth >= d.offsetWidth ||
        Math.abs(d.offsetWidth - e.offsetWidth) > 1) {
      throw new Error('Expected three columns followed by a full-width row of two before hydration.');
    }

    const requested = [];
    let socialRequestAborted = false;
    const nativeFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.startsWith(api)) {
        const path = url.slice(api.length);
        requested.push(path);
        if (path === socialPath) {
          if (socialMode === 'error') {
            return Promise.resolve(Response.json(null, { status: 503 }));
          }
          if (socialMode === 'timeout') {
            const signal = init?.signal ?? input.signal;
            return new Promise((_, reject) => {
              signal.addEventListener('abort', () => {
                socialRequestAborted = true;
                reject(signal.reason);
              }, { once: true });
            });
          }
          return Promise.resolve(Response.json(socialLinks));
        }
        return Promise.resolve(Response.json([]));
      }
      return nativeFetch(input, init);
    };
    const heroReady = waitForHydration(document.querySelector('app-hero-section[ngh]'));
    const aboutReady = waitForHydration(about.host);
    await Promise.all([import(new URL(entry, document.baseURI)), heroReady, aboutReady]);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (const { host } of [...summaries, contact]) {
      if (host.getBoundingClientRect().top > innerHeight && !host.hasAttribute('ngh')) {
        throw new Error(`Idle hydrated off-screen ${host.localName}.`);
      }
    }
    if (!contact.host.hasAttribute('ngh') || requested.includes(socialPath)) {
      throw new Error('Contact initialized before reaching its viewport.');
    }
    // Start at the bottom so any lazily activated pin can add space without
    // shifting the next test target (which is above it).
    for (const { host } of chapters.toReversed()) {
      const hydrated = waitForHydration(host);
      host.closest('[data-grain-chapter]').scrollIntoView({ behavior: 'instant' });
      await hydrated;
    }
    const socialSelector = socialMode === 'success'
      ? 'app-social-links-row a[href="https://example.com"]'
      : 'app-social-links-row [role="alert"]';
    await waitForElement(socialSelector);
    if (requested.filter(path => path === socialPath).length !== 1 ||
        (socialMode === 'timeout' && !socialRequestAborted) ||
        contact.host.querySelector('a[href="mailto:contact@malich.dev"]') !== email) {
      throw new Error('Expected one bounded browser request with the original email fallback intact.');
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const refetched = requested.filter(path => path.endsWith('/home-page/summary'));
    if (refetched.length) {
      throw new Error(`Hydration refetched summary endpoints: ${refetched.join(', ')}.`);
    }
    for (const chapter of chapters) {
      if (!chapter.unchanged()) {
        throw new Error(`Hydration replaced cards in ${chapter.host.localName}.`);
      }
    }
    const after = Array.from(document.querySelectorAll(selector));
    if (after.length !== before.length || after.some((slot, index) => slot !== before[index])) {
      throw new Error('Hydration replaced a server-rendered project slot.');
    }
    const hydratedGeometry = JSON.stringify(snapshot(after));
    if (hydratedGeometry !== geometry) {
      throw new Error(`Hydration changed the horizontal geometry: ${geometry} → ${hydratedGeometry}.`);
    }
    checkChapterNavigation();
    return `${socialMode}; fetched once in the browser, email and form preserved`;
  }

  addEventListener('load', () => {
    const report = (result) => fetch(resultPath, { method: 'POST', body: JSON.stringify(result) });
    void check().then((contact) => report({ contact }), (error) => report({ error: String(error) }));
  }, { once: true });
}
