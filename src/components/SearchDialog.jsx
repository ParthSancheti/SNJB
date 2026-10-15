import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Compass, FileText, GraduationCap, Laptop, Search, Sparkles, Users, Wallet, X } from 'lucide-react';
import './search.css';
import './desktop-search-v12.css';
import './v13-overlay.css';
import { loadNavigationSource } from '../data/navigation-source.js';

const searchEntries = [
  { id: 'computer', title: 'Computer Engineering', category: 'Programme', description: 'Curriculum, laboratories, faculty and student community.', href: '/computer-engineering', aliases: ['cs', 'cse', 'computer science', 'computing', 'software', 'department', 'branch'], icon: Laptop, local: true },
  { id: 'admissions', title: 'First-year admissions', category: 'Admissions', description: 'Official admission information and enquiry contacts.', href: 'https://snjb.org/engineering/admissions/fy-btech', aliases: ['apply', 'application', 'btech', 'b tech', 'b.tech', 'fy', 'fy btech', 'first year btech', 'eligibility', 'cap', 'cet', 'admission'], icon: GraduationCap },
  { id: 'direct-admission', title: 'Direct second-year admissions', category: 'Admissions', description: 'Published eligibility and admission process for the direct second-year route.', href: 'https://snjb.org/engineering/admissions/direct-second-year-engineering', aliases: ['dse', 'dse admissions', 'direct second year', 'second year admissions', 'lateral entry'], icon: GraduationCap },
  { id: 'curriculum', title: 'Find your syllabus', category: 'Academics', description: 'Autonomous UG curriculum, organised by admission batch.', href: 'https://snjb.org/engineering/syllabi-autonomy', aliases: ['curriculum', 'course', 'syllabus', 'syllabi', 'semester', 'batch', 'academics', 'subjects'], icon: BookOpen },
  { id: 'fees', title: 'Fees · Academic year 2026–27', category: 'Admissions', description: 'Official FRA fee information. Confirm the applicable year.', href: 'https://snjb.org/engineering/fra-fees-structure-ay2026-27', aliases: ['tuition', 'fee', 'fees', 'admission fees', 'admissions fees', 'college fees', 'fra', 'cost', 'financial'], icon: Wallet },
  { id: 'placements', title: 'Department placement statistics', category: 'Careers', description: 'Official reporting by department and academic year.', href: 'https://snjb.org/engineering/placements/dept-placement-statistics', aliases: ['placements', 'jobs', 'offers', 'career', 'careers', 'recruitment', 'recruiters'], icon: Users },
  { id: 'contact', title: 'Contact the college', category: 'Support', description: 'Admissions, college and department contact directory.', href: 'https://snjb.org/engineering/about-us/contact-us', aliases: ['contact', 'phone', 'email', 'address', 'enquiry', 'help', 'counselling', 'office', 'location'], icon: Users },
  { id: 'scholarships', title: 'Scholarships & financial support', category: 'Student resources', description: 'Official scholarship information and scheme conditions.', href: 'https://snjb.org/engineering/student-corner/scholarships', aliases: ['scholarships', 'scholarship', 'financial aid', 'grant', 'support', 'tfws'], icon: Wallet },
  { id: 'faculty', title: 'Computer Engineering faculty', category: 'People', description: 'Official department faculty directory.', href: '/computer-engineering#dept-faculty', local: true, aliases: ['faculty', 'professor', 'teacher', 'mentorship', 'people', 'staff', 'hod'], icon: Users },
  { id: 'labs', title: 'Computer Engineering laboratories', category: 'Facilities', description: 'Explore the department’s named learning facilities.', href: '/computer-engineering#dept-labs', local: true, aliases: ['laboratory', 'lab', 'labs', 'facilities', 'systems', 'network'], icon: Laptop },
  { id: 'computer-curriculum', title: 'Computer Engineering curriculum', category: 'Academics', description: 'Choose your admission batch and year for the published syllabus.', href: '/computer-engineering#dept-curriculum', local: true, aliases: ['computer syllabus', 'computer syllabi', 'computer curriculum', 'cs syllabus', 'cse curriculum', 'subjects', 'batch'], icon: BookOpen },
  { id: 'space', title: 'SPACE · Student association', category: 'Community', description: 'Computer Engineering’s student association.', href: '/computer-engineering#dept-community', local: true, aliases: ['space', 'club', 'clubs', 'community', 'association', 'student', 'students', 'event', 'events'], icon: Users },
];

const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\bph d\b/g, 'phd').replace(/\b([bm]) tech\b/g, '$1tech').replace(/\b(?:exams?|examinations?)\b/g, 'examination').replace(/\b(?:timetable|time table)\b/g, 'calendar').replace(/\s+/g, ' ').trim();
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]';
const searchStopWords = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'me', 'my', 'i', 'want', 'find', 'show', 'where', 'can', 'how', 'please']);
const canonicalHref = href => href.replace(/^http:\/\/www\.snjb\.org\//, 'https://snjb.org/').replace(/^https:\/\/www\.snjb\.org\//, 'https://snjb.org/').replace(/\/$/, '');
let cachedDirectoryEntries = null;
let directoryRequest = null;

function directoryEntries(data) {
  const entries = [];
  const visit = (nodes, parents = []) => nodes.forEach(node => {
    if (node.href) {
      const context = parents.map(parent => parent.label);
      const department = context.find(label => /engineering|telecommunication|data science|^mba$/i.test(label));
      const aliases = [];
      if (/people/i.test(node.label)) aliases.push('faculty', 'teachers', 'professors', 'staff', 'hod');
      if (/laborator/i.test(node.label)) aliases.push('lab', 'labs', 'laboratory');
      if (/syllab/i.test(node.label)) aliases.push('syllabus', 'syllabi', 'curriculum', 'subjects');
      if (/hostel/i.test(node.label)) aliases.push('hostel', 'hostels', 'accommodation');
      if (/computer/i.test(context.join(' ') + node.label)) aliases.push('cs', 'cse', 'computer science');
      if (/artificial intelligence/i.test(context.join(' ') + node.label)) aliases.push('ai', 'aids', 'ai ds', 'data science');
      if (/electronics/i.test(context.join(' ') + node.label)) aliases.push('entc', 'e tc', 'electronics', 'telecommunication');
      const title = department && !normalize(node.label).includes(normalize(department)) ? `${department} · ${node.label}` : node.label;
      entries.push({ id: `directory-${node.id}`, title, category: context[0] || 'College resources',
        description: context.length > 1 ? context.slice(1).join(' / ') : context[0] || 'Published college resource',
        href: node.href, aliases, icon: FileText, local: node.href.startsWith('/') });
    }
    visit(node.children || [], [...parents, node]);
  });
  visit(data.groups);
  return entries;
}

function loadDirectory() {
  if (cachedDirectoryEntries) return Promise.resolve(cachedDirectoryEntries);
  if (!directoryRequest) directoryRequest = loadNavigationSource()
    .then(data => { cachedDirectoryEntries = directoryEntries(data); return cachedDirectoryEntries; })
    .finally(() => { directoryRequest = null; });
  return directoryRequest;
}

function mergeEntries(directory) {
  const merged = searchEntries.map(entry => ({ ...entry }));
  const existing = new Map(merged.map(entry => [canonicalHref(entry.href), entry]));
  for (const entry of directory) {
    const previous = existing.get(canonicalHref(entry.href));
    if (previous) previous.directoryAliases = [entry.title, entry.description, entry.category, ...entry.aliases];
    else { existing.set(canonicalHref(entry.href), entry); merged.push(entry); }
  }
  return merged;
}

export default function SearchDialog({ open, onClose, navigate, onAsk }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [directory, setDirectory] = useState(cachedDirectoryEntries || []);
  const [directoryFailed, setDirectoryFailed] = useState(false);
  const [directorySlow, setDirectorySlow] = useState(false);
  const [retry, setRetry] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [desktop, setDesktop] = useState(() => innerWidth >= 1024);
  const [unfolded, setUnfolded] = useState(false);
  const [geometry, setGeometry] = useState({ top: 12, left: 12, width: innerWidth - 24, sourceLeft: innerWidth - 72, sourceTop: 8, sourceBottom: 52, sourceRight: 8 });

  useLayoutEffect(() => {
    setUnfolded(false);
    if (!open) return;
    if (reducedMotion) { setUnfolded(true); return; }
    let nextFrame;
    // Paint the source-sized glass first, so rasterising page blur cannot skip the opening.
    const firstFrame = requestAnimationFrame(() => { nextFrame = requestAnimationFrame(() => setUnfolded(true)); });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(nextFrame); };
  }, [open, reducedMotion]);

  useLayoutEffect(() => {
    const measure = () => {
      setDesktop(innerWidth >= 1024);
      const header = document.querySelector('.site-header .header-inner')?.getBoundingClientRect();
      const source = document.querySelector('.search-trigger')?.getBoundingClientRect();
      const target = innerWidth >= 1024 && header ? header : { top: 12, left: 12, width: innerWidth - 24, right: innerWidth - 12 };
      if (source) setGeometry({ top: target.top, left: target.left, width: target.width, sourceLeft: source.left - target.left, sourceTop: source.top - target.top, sourceBottom: source.bottom - target.top, sourceRight: target.right - source.right });
    };
    measure(); addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [open]);

  useEffect(() => {
    if (!open || cachedDirectoryEntries) {
      if (open && cachedDirectoryEntries) { setDirectory(cachedDirectoryEntries); setDirectoryFailed(false); setDirectorySlow(false); }
      return;
    }
    let active = true;
    setDirectoryFailed(false);
    setDirectorySlow(false);
    const timer = setTimeout(() => { if (active) setDirectorySlow(true); }, 900);
    loadDirectory().then(entries => { if (active) { setDirectory(entries); setDirectoryFailed(false); } })
      .catch(() => { if (active) setDirectoryFailed(true); })
      .finally(() => { clearTimeout(timer); if (active) setDirectorySlow(false); });
    return () => { active = false; clearTimeout(timer); };
  }, [open, retry]);

  useEffect(() => { setVisibleLimit(8); }, [query, open]);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const isolated = [];
    document.body.style.overflow = 'hidden';
    for (const element of document.body.children) {
      if (element.hasAttribute('data-snjb-search-layer')) continue;
      isolated.push([element, element.inert]);
      element.inert = true;
    }
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current?.(); }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll(focusableSelector)).filter((element) => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      const inside = panelRef.current.contains(document.activeElement);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !inside)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !inside)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      for (const [element, wasInert] of isolated) element.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  const normalizedQuery = normalize(query);
  const entries = useMemo(() => mergeEntries(directory), [directory]);
  const results = useMemo(() => {
    if (!normalizedQuery) return searchEntries.slice(0, 6);
    const terms = normalizedQuery.split(' ').filter(word => !searchStopWords.has(word));
    const words = terms.length ? terms : normalizedQuery.split(' ');
    return entries.map((entry, order) => {
      const title = normalize(entry.title);
      const aliases = [...entry.aliases, ...(entry.directoryAliases || [])].map(normalize);
      const text = normalize(`${entry.title} ${entry.description} ${entry.category} ${aliases.join(' ')}`);
      if (!words.every(word => text.includes(word))) return { ...entry, score: 0, order };
      const mediaPenalty = /\.(?:jpe?g|png|webp|gif)(?:$|[?#])/i.test(entry.href) && !/\b(?:photo|image|gallery|event|orientation)\b/.test(normalizedQuery) ? 18 : 0;
      const feeIntent = words.some(word => /^(?:fee|fees|tuition)$/.test(word)) && /\b(?:fee|fees|tuition)\b/.test(title) ? 8 : 0;
      const score = (title === normalizedQuery ? 40 : aliases.includes(normalizedQuery) ? 32 : title.includes(normalizedQuery) ? 24 : 6)
        + words.filter(word => title.includes(word)).length * 2 + feeIntent + (entry.local ? 1 : 0) - mediaPenalty;
      return { ...entry, score, order };
    }).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score || a.order - b.order);
  }, [normalizedQuery, entries]);
  const visibleResults = results.slice(0, visibleLimit);
  const collapsedClip = `inset(${geometry.sourceTop}px ${geometry.sourceRight}px calc(100% - ${geometry.sourceBottom}px) ${geometry.sourceLeft}px round 32px)`;
  const reveal = reducedMotion ? { initial: false } : {
    initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: .3, delay: .13, ease: [.2, .8, .2, 1] },
  };

  const resultControls = () => Array.from(panelRef.current?.querySelectorAll('[data-search-result]') || []);
  const moveResultFocus = (event, index) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); const links = resultControls(); links[Math.min(index + 1, links.length - 1)]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); if (index === 0) inputRef.current?.focus(); else resultControls()[index - 1]?.focus(); }
    if (event.key === 'Home') { event.preventDefault(); resultControls()[0]?.focus(); }
    if (event.key === 'End') { event.preventDefault(); const links = resultControls(); links[links.length - 1]?.focus(); }
  };

  const chooseResult = (event, entry) => {
    if (entry.local && navigate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      onCloseRef.current?.();
      navigate(entry.href, event);
    } else if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) onCloseRef.current?.();
  };

  return createPortal(<AnimatePresence>
    {open && <div className="snjb-search-layer" data-snjb-search-layer="true">
      <motion.div className="snjb-search-backdrop" aria-hidden="true" onPointerDown={event => { event.preventDefault(); onCloseRef.current?.(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .32 }} />
      <motion.section ref={panelRef} className={`snjb-search snjb-search-fullscreen snjb-search-v13 ${desktop ? 'snjb-search-desktop-v12' : ''}`} data-opening="source-expand" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}
        style={{ '--search-top': `${geometry.top}px`, '--search-left': `${geometry.left}px`, '--search-width': `${geometry.width}px`, transformOrigin: `${geometry.sourceLeft}px ${geometry.sourceTop}px` }}
        initial={reducedMotion ? false : { opacity: .65, clipPath: collapsedClip }}
        animate={unfolded || reducedMotion ? { opacity: 1, clipPath: 'inset(0 0 0 0 round 28px)' } : { opacity: .65, clipPath: collapsedClip }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: .1, clipPath: collapsedClip }}
        transition={reducedMotion ? { duration: 0 } : { duration: .42, ease: [.22, .85, .18, 1] }}>
        <span className="overlay-glass-sheen" aria-hidden="true" />
        <motion.header {...reveal} className="snjb-search-header"><div><span>FIND YOUR NEXT STEP</span><h2 id={titleId}>Search SNJB</h2></div><button type="button" onClick={() => onCloseRef.current?.()} aria-label="Close search"><X size={22} /></button></motion.header>
        <motion.form {...reveal} className="snjb-search-form" role="search" onSubmit={(event) => { event.preventDefault(); resultControls()[0]?.click(); }}>
          <Search size={22} strokeWidth={2.25} aria-hidden="true" />
          <label htmlFor={`${titleId}-query`} className="snjb-search-sr-only">Search programmes and college resources</label>
          <input ref={inputRef} id={`${titleId}-query`} autoComplete="off" spellCheck="false" maxLength={150} type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); resultControls()[0]?.focus(); } }} placeholder="A programme, syllabus, admissions…" />
          {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X size={17} /></button>}
        </motion.form>
        <p id={descriptionId} className="snjb-search-description">Search all published college resources, departments and portals.</p>
        {directoryFailed && <div className="snjb-search-network" role="status"><span>The full directory could not load. Popular resources are available.</span><button type="button" onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
        {directorySlow && <p className="snjb-search-network" role="status">Loading the full resource directory…</p>}
        <div className="snjb-search-results-heading"><span>{normalizedQuery ? 'SEARCH RESULTS' : 'POPULAR DESTINATIONS'}</span><span role="status" aria-live="polite">{normalizedQuery ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Start here'}</span></div>
        <motion.div {...reveal} className="snjb-search-results">
          {results.length > 0 ? <ul>{visibleResults.map((entry, index) => {
            const Icon = entry.icon;
            const newWindow = /^https?:/.test(entry.href);
            return <li key={entry.id}><a href={entry.href} data-search-result="true" onClick={(event) => chooseResult(event, entry)} onKeyDown={(event) => moveResultFocus(event, index)} target={newWindow ? '_blank' : undefined} rel={newWindow ? 'noopener noreferrer' : undefined}>
              <span className="snjb-search-result-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
              <span className="snjb-search-result-copy"><small>{entry.category}</small><strong>{entry.title}</strong><span>{entry.description}</span></span>
              {entry.local ? <ArrowRight size={18} className="snjb-search-result-arrow" aria-hidden="true" /> : <ArrowUpRight size={18} className="snjb-search-result-arrow" aria-hidden="true" />}
              {newWindow && <span className="snjb-search-sr-only"> (published resource, opens in a new tab)</span>}
            </a></li>;
          })}</ul> : <div className="snjb-search-empty"><Search size={26} strokeWidth={1.5} aria-hidden="true" /><h3>No matching resource yet.</h3><p>Try “Computer”, “syllabus” or “admissions”, or ask the college for help.</p><div><button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>See popular resources <ArrowRight size={15} /></button><a href="https://snjb.org/engineering/about-us/contact-us" target="_blank" rel="noopener noreferrer">Contact SNJB <ArrowUpRight size={15} /><span className="snjb-search-sr-only"> (opens in a new tab)</span></a></div></div>}
          {results.length > visibleLimit && <button type="button" className="snjb-search-more" onClick={() => setVisibleLimit(limit => limit + 8)}>Show {Math.min(8, results.length - visibleLimit)} more<span>{results.length - visibleLimit} remaining</span><ArrowDown size={14} aria-hidden="true" /></button>}
        </motion.div>
        <div className="snjb-search-paths"><a className="snjb-search-directory" href="/explore" onClick={event => chooseResult(event, { href: '/explore', local: true })}><Compass size={16} aria-hidden="true" /><span>Browse every college resource</span><ArrowRight size={15} aria-hidden="true" /></a>
        {onAsk && <button className="snjb-search-guide" type="button" onClick={() => { onCloseRef.current?.(); requestAnimationFrame(() => onAsk()); }}><Sparkles size={16} aria-hidden="true" /><span>Ask the SNJB guide<small>Source-linked help with college resources</small></span><ArrowRight size={15} aria-hidden="true" /></button>}</div>
        <footer className="snjb-search-footer"><span><kbd><ArrowDown size={11} aria-hidden="true" /></kbd> to explore <kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></footer>
      </motion.section>
    </div>}
  </AnimatePresence>, document.body);
}
