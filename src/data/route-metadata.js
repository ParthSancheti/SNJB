export const ROUTE_META = {
  home: {
    title: 'SNJB College of Engineering, Chandwad — Autonomous Institute (SPPU)',
    description:
      'Explore B.Tech, M.Tech, MBA and Ph.D. programmes at SNJB’s Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad (Nashik). NAAC A+ & NBA Accredited.',
  },
  department: {
    title: 'Computer Engineering — SNJB College of Engineering',
    description:
      'Discover the NBA-accredited Computer Engineering programme at SNJB, Chandwad: autonomous curriculum by batch, 37 faculty & staff, laboratories and placement records.',
  },
  'ai-data-science': {
    title: 'Artificial Intelligence & Data Science — SNJB College of Engineering',
    description:
      'Explore B.Tech in Artificial Intelligence & Data Science at SNJB College of Engineering, Chandwad: published department resources and official academic links.',
  },
  'civil-engineering': {
    title: 'Civil Engineering — SNJB College of Engineering',
    description:
      'Explore the NBA-accredited B.Tech & M.Tech Civil Engineering department at SNJB College of Engineering, Chandwad.',
  },
  'electronics-telecommunication': {
    title: 'Electronics & Telecommunication — SNJB College of Engineering',
    description:
      'Explore the NBA-accredited Electronics & Telecommunication Engineering department at SNJB College of Engineering, Chandwad.',
  },
  'mechanical-engineering': {
    title: 'Mechanical Engineering — SNJB College of Engineering',
    description:
      'Explore the NBA-accredited Mechanical Engineering department at SNJB College of Engineering, Chandwad: published department resources and official academic links.',
  },
  'first-year-engineering': {
    title: 'First-Year Engineering & Applied Sciences — SNJB College of Engineering',
    description:
      'Explore First-Year B.Tech Engineering & Applied Sciences at SNJB College of Engineering, Chandwad.',
  },
  mba: {
    title: 'MBA (Master of Business Administration) — SNJB College of Engineering',
    description:
      'Explore the NBA-accredited autonomous MBA programme at SNJB College of Engineering, Chandwad: published department resources and admissions links.',
  },
  directory: {
    title: 'Explore SNJB — Complete 333-Link Institutional Directory',
    description:
      'Search and browse all 333 published academic, examination, governance, NAAC/NBA/NIRF and student-service destinations at SNJB College of Engineering.',
  },
  campus: {
    title: 'Campus Life & Student Services — SNJB College of Engineering',
    description:
      'Explore student clubs, hostels, library, sports, NSS, cultural events and 360° virtual tour at SNJB’s Jain Gurukul campus in Chandwad.',
  },
  apply: {
    title: 'Admissions AY 2026–27 & Enquiry — SNJB College of Engineering',
    description:
      'Check FY B.Tech (DTE institute code 05173), Direct Second Year, M.Tech, MBA and Ph.D. admission processes, FRA fees, scholarships and submit an admission enquiry.',
  },
  audit: {
    title: 'Project ASTRA — Source & Provenance Registry · SNJB Engineering',
    description:
      'Verified content snapshots, SHA-256 asset hashes, placement arithmetic verification and media provenance records.',
  },
};

// One registry drives both static HTML and client-side navigation metadata.
export const ROUTE_PATHS = {
  home: '/', department: '/computer-engineering',
  'ai-data-science': '/ai-data-science', 'civil-engineering': '/civil-engineering',
  'electronics-telecommunication': '/electronics-telecommunication',
  'mechanical-engineering': '/mechanical-engineering',
  'first-year-engineering': '/first-year-engineering', mba: '/mba',
  directory: '/explore', campus: '/student-life', apply: '/apply', audit: '/audit',
};

export function deploymentBase(value) {
  if (!value?.trim()) return null;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an http(s) deployment URL without credentials, query or hash.');
  }
  return url.href.replace(/\/$/, '');
}

export function deploymentURL(base, path = '/') {
  return base ? `${base}${path}` : null;
}
