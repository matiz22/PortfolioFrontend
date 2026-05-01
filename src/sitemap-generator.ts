import { environment } from './environments/environment';

export interface SitemapSlugs {
  projects: { slug: string, last_modified: string }[];
  realizations: { slug: string, last_modified: string }[];
  jobs: { slug: string, last_modified: string }[];
  education: { slug: string, last_modified: string }[];
  certifications: { slug: string, last_modified: string }[];
}

export async function generateSitemapXml(): Promise<string> {
  const slugsUrl = `${environment.apiUrl}/${environment.version}/slugs`;
  
  const response = await fetch(slugsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch slugs from ${slugsUrl}`);
  }

  const data = await response.json() as SitemapSlugs;
  
  // Base URL should ideally come from environment too
  // We use the one from languagesOptions as a hint or default to the production one
  const baseUrl = environment.languagesOptions.find(l => l.code === 'pl')?.url.replace(/\/$/, '') || 'https://malich.dev';
  
  const staticPages = [
    '', '/projects', '/realizations', '/education', '/certifications', '/jobs', '/privacy-policy'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Static Pages
  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${page}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page}"/>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/en${page}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${page}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page}"/>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic Pages helper
  const addDynamicUrls = (slugs: { slug: string, last_modified: string }[], pathPrefix: string) => {
    slugs.forEach(item => {
      const lastMod = item.last_modified ? item.last_modified.split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${pathPrefix}/${item.slug}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${pathPrefix}/${item.slug}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${pathPrefix}/${item.slug}"/>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/en${pathPrefix}/${item.slug}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${pathPrefix}/${item.slug}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${pathPrefix}/${item.slug}"/>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });
  };

  addDynamicUrls(data.projects, '/project');
  addDynamicUrls(data.realizations, '/realization');
  addDynamicUrls(data.jobs, '/job');
  addDynamicUrls(data.education, '/education');
  addDynamicUrls(data.certifications, '/certification');

  xml += `</urlset>`;

  return xml;
}
