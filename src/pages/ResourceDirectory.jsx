import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, BookOpen, BriefcaseBusiness, Building2, ChevronRight, Compass, FileText, FlaskConical, Folder, GraduationCap, Grid2X2, Search, ShieldCheck, X } from 'lucide-react';
import './resource-directory.css';
import './resource-v12.css';

const groupIcons = { graduation: GraduationCap, admissions: GraduationCap, building: Building2, briefcase: BriefcaseBusiness, shield: ShieldCheck, files: FileText, book: BookOpen, flask: FlaskConical, grid: Grid2X2 };
const normalize = text => text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function walk(nodes, parents = []) {
  return nodes.flatMap(node => [{ ...node, parents }, ...walk(node.children || [], [...parents, { id: node.id, label: node.label }])]);
}

function resolvePath(groups, path) {
  let nodes = groups;
  const crumbs = [];
  for (const id of path) {
    const node = nodes.find(item => item.id === id);
    if (!node) break;
    crumbs.push(node);
    nodes = node.children || [];
  }
  return { crumbs, nodes };
}

export default function ResourceDirectory({ navigate }) {
  const reduced = useReducedMotion();
  const [directory, setDirectory] = useState(null);
  const [error, setError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [path, setPath] = useState([]);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const headingRef = useRef(null);
  const shouldFocusHeading = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    setLoadingMessage(false);
    const messageTimer = window.setTimeout(() => setLoadingMessage(true), 700);
    fetch('/data/navigation-directory.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Resource directory could not load.'); return response.json(); })
      .then(data => { setDirectory(data); setLoadingMessage(false); })
      .catch(reason => { if (reason.name !== 'AbortError') { setError(true); setLoadingMessage(false); } })
      .finally(() => window.clearTimeout(messageTimer));
    return () => { controller.abort(); window.clearTimeout(messageTimer); };
  }, [attempt]);

  const groups = directory?.groups || [];
  const { crumbs, nodes } = resolvePath(groups, path);
  const current = crumbs.at(-1);
  const searchResults = useMemo(() => {
    if (!query.trim() || !directory) return [];
    const needle = normalize(query.trim());
    const matching = walk(directory.groups).filter(node => normalize([node.label, ...node.parents.map(parent => parent.label)].join(' ')).includes(needle));
    const seen = new Set();
    return matching.filter(node => {
      const key = node.href || node.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [directory, query]);
  const searching = !!query.trim();

  useEffect(() => {
    if (shouldFocusHeading.current) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' });
      shouldFocusHeading.current = false;
    }
  }, [path, reduced]);

  function browse(nextPath) {
    setQuery('');
    shouldFocusHeading.current = true;
    setPath(nextPath);
  }

  function internalLink(href, event) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href, event);
  }

  function renderRow(node, searched = false) {
    const isFolder = (node.children || []).length > 0;
    const Icon = node.icon ? groupIcons[node.icon] || Folder : isFolder ? Folder : FileText;
    const context = searched ? node.parents.map(parent => parent.label).join(' / ') : node.description;
    const rowContent = <><span className={`resource-row-icon ${isFolder ? 'is-folder' : ''}`}><Icon size={18} strokeWidth={1.65} aria-hidden="true" /></span><span className="resource-row-copy"><strong>{node.label}</strong>{context && <span>{context}</span>}{node.unavailable && <span>Link not published on the source website</span>}</span>{isFolder ? <span className="resource-row-count">{node.children.length}<ChevronRight size={15} aria-hidden="true" /></span> : node.href ? <ArrowUpRight size={16} aria-hidden="true" /> : null}</>;
    const enter = { initial: reduced ? false : { opacity: .65, scale: .975, y: 7 }, whileInView: { opacity: 1, scale: 1, y: 0 }, viewport: { once: true, amount: .2 }, transition: { duration: reduced ? 0 : .27, ease: [.2, .75, .2, 1] } };
    if (isFolder) return <motion.li {...enter} key={`${node.id}-${searched ? node.parents.map(parent => parent.id).join('-') : ''}`}><button type="button" className="resource-row" onClick={() => browse(searched ? [...node.parents.map(parent => parent.id), node.id] : [...path, node.id])}>{rowContent}</button></motion.li>;
    if (!node.href) return <motion.li {...enter} key={node.id}><div className="resource-row resource-row-unavailable">{rowContent}</div></motion.li>;
    const internal = node.href.startsWith('/');
    const newWindow = /^https?:/.test(node.href);
    return <motion.li {...enter} key={node.id}><a className="resource-row" href={node.href} onClick={internal ? event => internalLink(node.href, event) : undefined} {...(newWindow ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{rowContent}{newWindow && <span className="resource-sr-only">, opens the official resource in a new tab</span>}</a></motion.li>;
  }

  return <article className="resource-directory resource-v12">
    <header className="resource-intro">
      <p className="resource-eyebrow"><Compass size={14} aria-hidden="true" /> THE COLLEGE, CONNECTED</p>
      <h1>Everything.<br /><span>Easy to find.</span></h1>
      <p>Departments, admissions, college documents and everyday essentials. Find what you need, then get straight to it.</p>
    </header>
    <div className="resource-browser">
      <div className="resource-search-box"><Search size={20} strokeWidth={2.2} aria-hidden="true" /><label className="resource-sr-only" htmlFor="resource-search">Search all college resources</label><input ref={searchRef} id="resource-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search departments, fees, library…" autoComplete="off" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={18} aria-hidden="true" /></button>}</div>
      <div className="resource-browser-columns">
        <aside className="resource-sidebar" aria-label="Resource categories"><p>Browse the college</p><button type="button" className={!path.length && !searching ? 'is-current' : ''} onClick={() => browse([])} aria-current={!path.length && !searching ? 'page' : undefined}><Grid2X2 size={17} aria-hidden="true" />All resources</button>{groups.map(group => { const Icon = groupIcons[group.icon] || Folder; return <button type="button" key={group.id} className={path[0] === group.id && !searching ? 'is-current' : ''} onClick={() => browse([group.id])} aria-current={path[0] === group.id && !searching ? 'page' : undefined}><Icon size={17} strokeWidth={1.7} aria-hidden="true" /><span>{group.label}</span></button>; })}</aside>
        <section className="resource-content" aria-labelledby="resource-folder-title">
          <div className="resource-toolbar">
            <button type="button" className="resource-back" disabled={!path.length && !searching} onClick={() => searching ? setQuery('') : browse(path.slice(0, -1))} aria-label={searching ? 'Leave search results' : 'Go to parent folder'}><ArrowLeft size={18} aria-hidden="true" /></button>
            <nav className="resource-breadcrumbs" aria-label="Resource breadcrumb"><button type="button" onClick={() => browse([])} aria-current={!crumbs.length && !searching ? 'page' : undefined}>All resources</button>{!searching && crumbs.map((crumb, index) => <span key={crumb.id}><ChevronRight size={12} aria-hidden="true" />{index === crumbs.length - 1 ? <span aria-current="page">{crumb.label}</span> : <button type="button" onClick={() => browse(path.slice(0, index + 1))}>{crumb.label}</button>}</span>)}{searching && <span><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">Search</span></span>}</nav>
          </div>
          <div className="resource-folder-heading"><div><h2 ref={headingRef} tabIndex={-1} id="resource-folder-title">{searching ? `Results for “${query.trim()}”` : current?.label || 'All resources'}</h2><p>{searching ? `${searchResults.length} matching ${searchResults.length === 1 ? 'resource' : 'resources'}` : current?.description || (current ? `${nodes.length} ${nodes.length === 1 ? 'item' : 'items'}` : 'Choose a folder to explore.')}</p></div>{!searching && current?.href && <a href={current.href} className="resource-overview-link" onClick={current.href.startsWith('/') ? event => internalLink(current.href, event) : undefined} {...(!current.href.startsWith('/') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{current.href.startsWith('/') ? 'Department overview' : 'Open overview'}<ArrowUpRight size={15} aria-hidden="true" /></a>}</div>
          <div className="resource-list-window"><div className="resource-list-viewport" key={searching ? 'search' : path.join('/') || 'root'}>{error ? <div className="resource-empty"><p>The resource list could not load.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button><a href="https://snjb.org/engineering/" target="_blank" rel="noopener noreferrer">Open the college website<ArrowUpRight size={15} aria-hidden="true" /></a></div> : !directory ? <div className="resource-empty" role="status">{loadingMessage ? 'Loading college resources…' : ''}</div> : <AnimatePresence mode="wait" initial={false}><motion.div key={searching ? 'search' : path.join('/') || 'root'} initial={reduced ? false : { opacity: 0, y: 5, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reduced ? undefined : { opacity: 0, y: -3, filter: 'blur(3px)' }} transition={{ duration: reduced ? 0 : .14 }}>
            {(searching ? searchResults : nodes).length ? <ul className={`resource-list ${!path.length && !searching ? 'resource-list-root' : ''}`}>{(searching ? searchResults : nodes).map(node => renderRow(node, searching))}</ul> : <div className="resource-empty"><p>No resources match “{query.trim()}”.</p><span>Try a department name, “fees” or “library”.</span></div>}
          </motion.div></AnimatePresence>}</div></div>
        </section>
      </div>
      <p className="resource-source-note">Home and Computer Engineering open in this preview. Other resources open the published college website or portal.<a href="https://snjb.org/engineering/" target="_blank" rel="noopener noreferrer">College website<ArrowUpRight size={13} aria-hidden="true" /></a></p>
    </div>
  </article>;
}
