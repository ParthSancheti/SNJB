import { build, loadEnv } from 'vite';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { ROUTE_META, ROUTE_PATHS, deploymentBase, deploymentURL } from '../src/data/route-metadata.js';

const siteURL = deploymentBase(process.env.VITE_SITE_URL || loadEnv('production', process.cwd(), 'VITE_').VITE_SITE_URL);
await build();
const index = await readFile('dist/index.html', 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

for (const [key, path] of Object.entries(ROUTE_PATHS)) {
  const { title, description } = ROUTE_META[key];
  let html = index
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(description)}" />`);
  for (const [attr, name, value] of [
    ['property', 'og:title', title], ['property', 'og:description', description],
    ['name', 'twitter:title', title], ['name', 'twitter:description', description],
    ['name', 'robots', siteURL ? 'index, follow' : 'noindex, nofollow'],
  ]) {
    html = html.replace(new RegExp(`<meta ${attr}="${name}" content="[^"]*"\\s*\\/?>`), `<meta ${attr}="${name}" content="${escape(value)}" />`);
  }
  // A demo must not identify the legacy institution URL as its own deployment.
  html = html.replace(/\s*<link rel="canonical"[^>]+>/g, '').replace(/\s*<meta property="og:url"[^>]+>/g, '');
  if (siteURL) {
    const canonical = escape(deploymentURL(siteURL, path));
    html = html.replace('</head>', `    <link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />\n  </head>`);
    html = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")([^"]+)(")/g,
      (_, before, image, after) => `${before}${escape(deploymentURL(siteURL, image))}${after}`);
  }
  if (path !== '/') html = html.replace(/\s*<link rel="preload" as="image"[^>]+>/g, '');
  if (key === 'department') {
    html = html.replace('</head>', '    <link rel="preload" as="image" href="/campaign/learning-desktop.webp" media="(min-width: 768px)" />\n    <link rel="preload" as="image" href="/campaign/learning-phone.webp" media="(max-width: 767px)" />\n  </head>');
  }
  const directory = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
}
await copyFile('dist/index.html', 'dist/404.html');
console.log(`Prepared 12 route-specific static entries; ${siteURL ? 'deployment metadata configured' : 'demo noindex (set VITE_SITE_URL for publication)'}.`);
