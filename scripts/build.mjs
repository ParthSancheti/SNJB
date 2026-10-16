import { build } from 'vite';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';

await build();
const index = await readFile('dist/index.html', 'utf8');

const routes = [
  [
    'computer-engineering',
    'Computer Engineering — SNJB College of Engineering',
    'Discover the NBA-accredited Computer Engineering programme at SNJB, Chandwad: curriculum by batch, 37 faculty & staff, laboratories and published outcomes.',
    true,
  ],
  [
    'ai-data-science',
    'Artificial Intelligence & Data Science — SNJB College of Engineering',
    'Explore B.Tech in Artificial Intelligence & Data Science at SNJB College of Engineering, Chandwad: 158 seat intake, laboratories and placement outcomes.',
    true,
  ],
  [
    'civil-engineering',
    'Civil Engineering — SNJB College of Engineering',
    'Explore the NBA-accredited B.Tech & M.Tech Civil Engineering department at SNJB College of Engineering, Chandwad.',
    false,
  ],
  [
    'electronics-telecommunication',
    'Electronics & Telecommunication — SNJB College of Engineering',
    'Explore the NBA-accredited Electronics & Telecommunication Engineering department at SNJB College of Engineering, Chandwad.',
    false,
  ],
  [
    'mechanical-engineering',
    'Mechanical Engineering — SNJB College of Engineering',
    'Explore the NBA-accredited Mechanical Engineering department at SNJB College of Engineering, Chandwad: labs, placements and interactive 3D kinematics.',
    false,
  ],
  [
    'first-year-engineering',
    'First-Year Engineering & Applied Sciences — SNJB College of Engineering',
    'Explore First-Year B.Tech Engineering & Applied Sciences at SNJB College of Engineering, Chandwad.',
    false,
  ],
  [
    'mba',
    'MBA (Master of Business Administration) — SNJB College of Engineering',
    'Explore the NBA-accredited autonomous MBA programme at SNJB College of Engineering, Chandwad: 81 placements in AY 2025–26, faculty and admissions.',
    false,
  ],
  [
    'explore',
    'Explore SNJB — Complete 333-Link Institutional Directory',
    'Search and browse all 333 published academic, examination, governance, NAAC/NBA/NIRF and student-service destinations at SNJB College of Engineering.',
    false,
  ],
  [
    'student-life',
    'Campus Life & Student Services — SNJB College of Engineering',
    'Explore student clubs, hostels, library, sports, NSS, cultural events and 360° virtual tour at SNJB’s Jain Gurukul campus in Chandwad.',
    false,
  ],
  [
    'apply',
    'Admissions AY 2026–27 & Enquiry — SNJB College of Engineering',
    'Check FY B.Tech (DTE Code 05173), Direct Second Year, M.Tech, MBA and Ph.D. admission processes, FRA fees, scholarships and submit an admission enquiry.',
    false,
  ],
  [
    'audit',
    'Project ASTRA — Source & Provenance Registry · SNJB Engineering',
    'Verified content snapshots, SHA-256 asset hashes, placement arithmetic verification and media provenance records.',
    false,
  ],
];

for (const [route, title, description, preloadLearning] of routes) {
  await mkdir(`dist/${route}`, { recursive: true });
  let html = index
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/\s*<link rel="preload" as="image"[^>]+>/g, '');
  if (preloadLearning) {
    html = html.replace(
      '</head>',
      '    <link rel="preload" as="image" href="/campaign/learning-desktop.webp" media="(min-width: 768px)" />\n    <link rel="preload" as="image" href="/campaign/learning-phone.webp" media="(max-width: 767px)" />\n  </head>'
    );
  }
  await writeFile(`dist/${route}/index.html`, html);
}

await copyFile('dist/index.html', 'dist/404.html');
console.log('Prepared static entry HTML files for Home and all 11 institutional routes.');
