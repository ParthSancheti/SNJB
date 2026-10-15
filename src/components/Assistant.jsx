import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Compass, GraduationCap, RotateCcw, Search, X } from 'lucide-react';
import './assistant.css';

const OFFICIAL = 'https://snjb.org/engineering/';
const FALLBACK = [
  { id: 'admissions', label: 'FY B.Tech admissions', href: `${OFFICIAL}admissions/fy-btech`, parents: ['Admissions & fees', 'Undergraduate'] },
  { id: 'direct', label: 'Direct Second Year Engineering', href: `${OFFICIAL}admissions/direct-second-year-engineering`, parents: ['Admissions & fees', 'Undergraduate'] },
  { id: 'fees', label: 'FRA-Fees Structure (AY2026-27)', href: `${OFFICIAL}fra-fees-structure-ay2026-27`, parents: ['Admissions & fees'] },
  { id: 'syllabi', label: 'UG-Autonomy syllabi', href: `${OFFICIAL}syllabi-autonomy`, parents: ['Student resources', 'Syllabi'] },
  { id: 'computer', label: 'Computer Engineering', href: '/computer-engineering', parents: ['Academics', 'Departments'] },
  { id: 'computer-people', label: 'People', href: '/computer-engineering#source-people-computer', parents: ['Academics', 'Departments', 'Computer Engineering'] },
  { id: 'computer-labs', label: 'Laboratories', href: '/computer-engineering#source-laboratories-computer', parents: ['Academics', 'Departments', 'Computer Engineering'] },
  { id: 'scholarships', label: 'Scholarships', href: `${OFFICIAL}student-corner/scholarships`, parents: ['Student resources'] },
  { id: 'contacts', label: 'Contact Us', href: `${OFFICIAL}about-us/contact-us`, parents: ['About the college'] },
];
const STOP_WORDS = new Set('a an and are at be can college could do does engineering for from get give hello help hey hi how i in is it me my need of on or please snjb some tell the their them there these this to want what when where which with would you your yaar bhai hai ka ki ke mujhe chahiye find looking about information info'.split(' '));
const WORDS = { admissions: 'admission', apply: 'admission', applying: 'admission', application: 'admission', applications: 'admission', fees: 'fee', tuition: 'fee', cost: 'fee', costs: 'fee', scholarships: 'scholarship', syllabus: 'syllab', syllabi: 'syllab', syllabuses: 'syllab', curriculum: 'syllab', curricula: 'syllab', cs: 'computer', cse: 'computer', faculty: 'people', faculties: 'people', teachers: 'people', teacher: 'people', professor: 'people', professors: 'people', staff: 'people', lab: 'laborator', labs: 'laborator', laboratory: 'laborator', laboratories: 'laborator', exams: 'examination', exam: 'examination', examinations: 'examination', timetable: 'calendar', schedule: 'calendar', careers: 'placement', career: 'placement', jobs: 'placement', job: 'placement', placements: 'placement', recruiters: 'recruiter', documents: 'document', contacts: 'contact', phone: 'contact', address: 'contact', pyqs: 'pyq' };
const CONTROLS = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';

function tokens(text) {
  return [...new Set(text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/b[.\s-]*tech/g, 'btech').replace(/time\s*table/g, 'calendar').replace(/first\s*year/g, 'fy').split(/[^\p{L}\p{N}]+/u).filter(word => word && !STOP_WORDS.has(word)).map(word => WORDS[word] || word))];
}
function flatten(groups) {
  const resources = [];
  const walk = (node, parents = []) => {
    if (node.href && /^(?:\/(?!\/)|https?:\/\/|tel:|mailto:)/.test(node.href)) resources.push({ id: node.id, label: node.label, href: node.href, parents, sourceUrl: node.sourceUrl });
    (node.children || []).forEach(child => walk(child, [...parents, node.label]));
  };
  groups.forEach(group => walk(group));
  return resources;
}
function searchable(resource) {
  const label = tokens(resource.label), parents = tokens(resource.parents.join(' ')), alias = [];
  if (parents.includes('admission')) alias.push('admission', 'eligibility', 'document');
  if (resource.href.includes('syllab') || resource.href.includes('autonomy') && resource.parents.includes('Syllabi')) alias.push('syllab', 'batch');
  if (/scholarship/.test(resource.href)) alias.push('scholarship', 'support');
  if (/people/.test(resource.href)) alias.push('people', 'mentor');
  if (/placement/.test(resource.href)) alias.push('placement');
  if (/opac|library/.test(resource.href)) alias.push('library', 'catalogue', 'book');
  if (/hostel/.test(resource.href)) alias.push('hostel', 'accommodation');
  if (/contact|tel:|mailto:/.test(resource.href)) alias.push('contact');
  return { ...resource, labelTokens: label, parentTokens: parents, aliasTokens: alias };
}
function rank(resources, query) {
  const words = tokens(query);
  if (!words.length) return [];
  const match = (term, pool) => pool.some(word => word === term || (term.length >= 4 && (word.startsWith(term) || term.startsWith(word))));
  return resources.map((resource, order) => {
    let covered = 0, score = 0;
    for (const word of words) {
      const points = match(word, resource.labelTokens) ? 9 : match(word, resource.parentTokens) ? 5 : match(word, resource.aliasTokens) ? 3 : 0;
      if (points) { covered++; score += points; }
    }
    const coverage = covered / words.length;
    if (!covered || coverage < .5) return null;
    if (resource.href === '/computer-engineering' && words.includes('computer')) score += 2;
    if (resource.href.endsWith('/admissions/fy-btech') && words.includes('admission')) score += 2;
    return { resource, score: score + coverage * 18, covered, order };
  }).filter(Boolean).sort((a, b) => b.covered - a.covered || b.score - a.score || a.order - b.order).map(result => result.resource);
}

export default function Assistant({ open, onClose, context = 'engineering', navigate }) {
  const titleId = useId(), inputId = useId(), descriptionId = useId();
  const panel = useRef(null), closeButton = useRef(null), input = useRef(null), content = useRef(null), close = useRef(onClose);
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches), [viewport, setViewport] = useState(null);
  const [directory, setDirectory] = useState(null), [status, setStatus] = useState('idle'), [retry, setRetry] = useState(0);
  const [draft, setDraft] = useState(''), [query, setQuery] = useState(''), [limit, setLimit] = useState(6);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const change = () => setMobile(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!open || !mobile || !window.visualViewport) return;
    const view = window.visualViewport, update = () => setViewport({ height: view.height, top: view.offsetTop });
    update(); view.addEventListener('resize', update); view.addEventListener('scroll', update);
    return () => { view.removeEventListener('resize', update); view.removeEventListener('scroll', update); };
  }, [open, mobile]);
  useEffect(() => {
    if (!open || directory) return;
    const controller = new AbortController(); setStatus('loading');
    fetch('/data/navigation-directory.json', { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Directory unavailable'); return response.json();
    }).then(snapshot => {
      if (!Array.isArray(snapshot.groups)) throw new Error('Invalid directory');
      const resources = flatten(snapshot.groups); if (!resources.length) throw new Error('Empty directory');
      setDirectory(resources); setStatus('ready');
    }).catch(failure => { if (failure.name !== 'AbortError') setStatus('fallback'); });
    return () => controller.abort();
  }, [open, directory, retry]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement, overflow = document.body.style.overflow;
    const background = [...document.body.children].filter(element => !element.hasAttribute('data-snjb-guide-layer')), inert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; }); document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); return; }
      if (event.key !== 'Tab') return;
      const items = [...(panel.current?.querySelectorAll(CONTROLS) || [])].filter(element => element.getClientRects().length);
      const first = items[0], last = items.at(-1), inside = panel.current?.contains(document.activeElement);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !inside)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !inside)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard); background.forEach((element, index) => { element.inert = inert[index]; }); document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  const resources = useMemo(() => (directory || FALLBACK).map(searchable), [directory]), results = useMemo(() => rank(resources, query), [resources, query]);
  const topics = context.includes('computer') ? [['Computer labs', 'computer labs'], ['Meet the faculty', 'computer faculty'], ['Syllabus', 'syllabus'], ['Admissions', 'admissions']] : [['Admissions', 'admissions'], ['Fees & scholarships', 'fees scholarships'], ['Computer Engineering', 'computer'], ['Syllabus', 'syllabus']];
  const search = value => { const next = value.trim(); if (!next) return; setQuery(next); setDraft(next); setLimit(6); content.current?.scrollTo({ top: 0, behavior: 'instant' }); };
  const reset = () => { setDraft(''); setQuery(''); setLimit(6); input.current?.focus(); };
  const go = (href, event) => {
    if (!href.startsWith('/') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); close.current?.(); if (navigate) navigate(href, event); else window.location.assign(href);
  };
  return createPortal(<AnimatePresence>{open && <div className="snjb-guide-layer" data-snjb-guide-layer="true">
    <motion.div className="snjb-guide-backdrop" aria-hidden="true" onClick={() => close.current?.()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15 }} />
    <motion.section className="snjb-guide" ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} style={mobile && viewport ? { '--guide-view-height': `${viewport.height}px`, '--guide-view-top': `${viewport.top}px` } : undefined} initial={reduced ? false : { opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 10 }} transition={{ duration: reduced ? 0 : .2, ease: [.2, .7, .2, 1] }}>
      <header className="snjb-guide-header"><span className="snjb-guide-symbol" aria-hidden="true"><Compass size={22} /></span><div><h2 id={titleId}>SNJB guide</h2><p id={descriptionId}>Demo guide · Official resources</p></div><button className="snjb-guide-icon" onClick={reset} aria-label="Clear guide search"><RotateCcw size={17} /></button><button className="snjb-guide-icon" ref={closeButton} onClick={() => close.current?.()} aria-label="Close SNJB guide"><X size={20} /></button></header>
      <div className="snjb-guide-content" ref={content}>
        {!query ? <div className="snjb-guide-welcome"><p className="snjb-guide-kicker">A useful starting point</p><h3>Find the right page.</h3><p>Tell us what you’re looking for. Explore resources from the college’s official directory.</p><div className="snjb-guide-topics" aria-label="Suggested guide topics">{topics.map(([label, value], index) => <button key={value} onClick={() => search(value)}>{index === 0 ? <GraduationCap size={16} /> : index === 3 ? <BookOpen size={16} /> : <Compass size={16} />}<span>{label}</span><ChevronRight size={15} /></button>)}</div><div className="snjb-guide-example"><Search size={15} /><p>Try “Computer faculty”, “exam timetable” or “hostel”.</p></div></div> : <div className="snjb-guide-results"><div className="snjb-guide-question"><Search size={15} aria-hidden="true" /><h3>{query}</h3></div><p className="snjb-guide-result-status" role="status">{results.length ? `${results.length} related ${results.length === 1 ? 'resource' : 'resources'}. Open a page for its official details.` : 'No close match. Try a department name, “admissions”, “syllabus” or “contacts”.'}</p><ul aria-label="Matching official resources">{results.slice(0, limit).map(resource => <li key={resource.id}><a href={resource.href} onClick={event => go(resource.href, event)} {...(resource.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><span><small>{resource.parents.join(' / ')}</small><strong>{resource.label}</strong></span>{resource.href.startsWith('/') ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}{resource.href.startsWith('http') && <span className="snjb-guide-sr"> (opens in a new tab)</span>}</a></li>)}</ul>{results.length > limit && <button className="snjb-guide-more" onClick={() => setLimit(value => value + 12)}>Show more resources<span>{results.length - limit} remaining</span><ChevronRight size={15} /></button>}{!results.length && <div className="snjb-guide-no-results"><a href={`${OFFICIAL}about-us/contact-us`} target="_blank" rel="noreferrer">Contact the college<ArrowUpRight size={16} /></a></div>}</div>}
        {status === 'loading' && <p className="snjb-guide-index-status" role="status">Loading the full directory. Core resources are available now.</p>}
        {status === 'fallback' && <div className="snjb-guide-index-status"><p>The full directory couldn’t load. Core resources remain available.</p><button onClick={() => setRetry(value => value + 1)}>Retry directory</button></div>}
        <a className="snjb-guide-directory" href="/explore" onClick={event => go('/explore', event)}><span>Browse the complete directory<small>{directory ? `${directory.length} published destinations` : 'Departments, portals and college resources'}</small></span><ArrowRight size={16} /></a>
      </div>
      <form className="snjb-guide-composer" onSubmit={event => { event.preventDefault(); search(draft); }}><label className="snjb-guide-sr" htmlFor={inputId}>What are you looking for?</label><div><input id={inputId} ref={input} type="search" value={draft} maxLength={250} onChange={event => setDraft(event.target.value)} placeholder="What are you looking for?" autoComplete="off" enterKeyHint="search" /><button type="submit" disabled={!draft.trim()} aria-label="Find official resources"><ArrowRight size={18} /></button></div><p>Searches resources locally. No question is sent to an AI service.</p></form>
    </motion.section>
  </div>}</AnimatePresence>, document.body);
}
