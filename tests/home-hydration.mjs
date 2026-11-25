import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';

// Run against `ng build --configuration local`, where the API URL is loopback.
const api = 'http://127.0.0.1:8000/api/';
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
globalThis.fetch = (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.startsWith(api)) {
    return Promise.resolve(Response.json(fixtures[url.slice(api.length)] ?? []));
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
      // Take the first measurement before the real application entry point runs.
      const args = JSON.stringify(['main.js', resultPath, api, socialPath]);
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
  console.log('All five homepage summary sections retained their server-rendered cards without refetching.');
  console.log('Projects retained their server-rendered nodes and column geometry after hydration.');
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

function probe(entry, resultPath, api, socialPath) {
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
        reject(new Error(`Angular did not hydrate the original ${host.localName} host.`));
      }, 15_000);
    });
  }

  async function check() {
    await document.fonts.ready;
    if (!matchMedia('(min-width: 80rem)').matches) {
      throw new Error('Open the test at the wide Projects breakpoint (80rem or more).');
    }

    const chapters = [
      capture('app-realizations-home-section', 'app-realization-showcase-card', 1),
      capture('app-projects-home-section', '.project-preview', 5),
      capture('app-certifications-section', 'app-certification-showcase-card', 1),
      capture('app-job-timeline-section', '.jobs-entry', 2),
      capture('app-education-section', '.education-card', 1),
    ];
    const contact = capture('app-contact-section', 'app-social-links-row a', 1);
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

    const requested = new Set();
    const nativeFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.startsWith(api)) {
        requested.add(url.slice(api.length));
        return Promise.resolve(Response.json([]));
      }
      return nativeFetch(input, init);
    };
    const hydrated = Promise.all([...chapters, contact].map(({ host }) => waitForHydration(host)));
    await Promise.all([import(new URL(entry, document.baseURI)), hydrated]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const refetched = [...requested].filter(path => path.endsWith('/home-page/summary'));
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
    return [
      requested.has(socialPath) ? 'refetched' : 'did not refetch',
      contact.unchanged() ? 'retained the original link' : 'replaced the original link',
    ].join('; ');
  }

  addEventListener('load', () => {
    const report = (result) => fetch(resultPath, { method: 'POST', body: JSON.stringify(result) });
    void check().then((contact) => report({ contact }), (error) => report({ error: String(error) }));
  }, { once: true });
}
