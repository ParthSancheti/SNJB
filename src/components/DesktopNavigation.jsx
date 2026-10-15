import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronDown, Compass, Monitor, Moon, Sun, X } from 'lucide-react';
import { loadNavigationSource } from '../data/navigation-source.js';

const primaryGroups = [
  { id: 'about', label: 'About' }, { id: 'academics', label: 'Academics' },
  { id: 'admissions', label: 'Admissions' }, { id: 'placements', label: 'Placements' },
];

function NavigationFolder({ node, link, children }) {
  const [hovered, setHovered] = useState(false), [pinned, setPinned] = useState(false);
  return <details open={hovered || pinned} onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}>
    <summary onClick={event => { event.preventDefault(); setPinned(value => !value); }}>{node.label}<ChevronDown size={15} aria-hidden="true" /></summary>
    {node.href && link(node.href, `${node.label} overview`)}{children}
  </details>;
}

export default function DesktopNavigation({ navigate, theme, onThemeChange, motionEnabled, onMotionChange, onExpanded, pageKey, searchOpen }) {
  const [open, setOpen] = useState(false), [pinned, setPinned] = useState(false), [data, setData] = useState(null), [error, setError] = useState(false), [group, setGroup] = useState('academics'), [retry, setRetry] = useState(0);
  const root = useRef(null), trigger = useRef(null), lastTrigger = useRef(null), pinnedRef = useRef(false), closeTimer = useRef(null), reduced = useReducedMotion();
  const clearClose = useCallback(() => { clearTimeout(closeTimer.current); }, []);
  const close = useCallback(() => { clearClose(); pinnedRef.current = false; setPinned(false); setOpen(false); }, [clearClose]);
  const reveal = (id, pin = false, element) => {
    clearClose(); if (id) setGroup(id);
    if (pin) { pinnedRef.current = true; setPinned(true); }
    if (element) lastTrigger.current = element;
    setOpen(true);
  };
  const leave = useCallback(() => {
    clearClose(); closeTimer.current = setTimeout(() => { if (!pinnedRef.current) setOpen(false); }, 150);
  }, [clearClose]);

  useEffect(() => { close(); }, [pageKey, searchOpen, close]);
  useEffect(() => { onExpanded?.(open); }, [open, onExpanded]);
  useEffect(() => {
    if (data || (!open && innerWidth < 1024)) return;
    let live = true;
    loadNavigationSource().then(value => { if (live) { setData(value); setError(false); } }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [retry, open, data]);
  useEffect(() => {
    const header = root.current?.closest('header');
    const outside = event => { if (!header?.contains(event.target)) close(); };
    const keys = event => { if (event.key === 'Escape' && open) { event.preventDefault(); close(); (lastTrigger.current || trigger.current)?.focus(); } };
    const resize = () => { if (innerWidth < 1024) close(); };
    header?.addEventListener('pointerenter', clearClose); header?.addEventListener('pointerleave', leave);
    if (open) { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keys); }
    addEventListener('resize', resize);
    return () => { header?.removeEventListener('pointerenter', clearClose); header?.removeEventListener('pointerleave', leave); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keys); removeEventListener('resize', resize); clearClose(); };
  }, [open, close, leave, clearClose]);

  const follow = (href, event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    close(); if (href.startsWith('/')) { event.preventDefault(); navigate(href, event); }
  };
  const link = (href, label) => <a href={href} onClick={event => follow(href, event)} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}<ArrowUpRight size={14} aria-hidden="true" /></a>;
  const tree = nodes => <ul>{nodes.map(node => <li key={node.id}>{node.children?.length ? <NavigationFolder node={node} link={link}>{tree(node.children)}</NavigationFolder> : node.href ? link(node.href, node.label) : <span>{node.label} · Source link unavailable</span>}</li>)}</ul>;
  const portalTarget = document.querySelector('.site-header');
  const current = data?.groups.find(item => item.id === group) || data?.groups[0];
  return <div className="desktop-navigation desktop-navigation-v12" ref={root}>
    <nav className="desktop-primary" aria-label="Desktop primary navigation">{primaryGroups.map(item => <button key={item.id} type="button" aria-expanded={open && group === item.id} aria-controls="desktop-college-navigation" onPointerEnter={event => { if (event.pointerType === 'mouse') reveal(item.id, false, event.currentTarget); }} onClick={event => reveal(item.id, true, event.currentTarget)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); reveal(item.id, true, event.currentTarget); requestAnimationFrame(() => document.querySelector('.desktop-mega-content a, .desktop-mega-content summary')?.focus()); } }}>{item.label}<ChevronDown size={12} aria-hidden="true" /></button>)}</nav>
    <button ref={trigger} type="button" className="desktop-browse" aria-expanded={open} aria-controls="desktop-college-navigation" onPointerEnter={event => { if (event.pointerType === 'mouse') reveal(null, false, event.currentTarget); }} onClick={event => { if (pinnedRef.current && open) close(); else reveal(null, true, event.currentTarget); }}><span className="college-compass"><Compass size={18} strokeWidth={2} aria-hidden="true" /></span><span>College menu</span><ChevronDown size={14} aria-hidden="true" /></button>
    {portalTarget && createPortal(<AnimatePresence>{open && <motion.section id="desktop-college-navigation" className="desktop-mega desktop-mega-v12" aria-label="Complete college navigation" data-pinned={pinned} onPointerEnter={clearClose} onPointerLeave={leave} initial={reduced ? false : { opacity: 0, y: -8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6 }} transition={{ duration: reduced ? 0 : .18 }}>
      <div className="desktop-mega-heading"><div><small>EXPLORE SNJB</small><h2>The college, connected.</h2></div><span className="desktop-menu-hint">{pinned ? 'Menu stays open · Esc to close' : 'Explore a category · Click to keep open'}</span><button type="button" aria-label="Close college navigation" onClick={() => { close(); (lastTrigger.current || trigger.current)?.focus(); }}><X size={19} /></button></div>
      <div className="desktop-mega-browser"><nav aria-label="College navigation categories">{data?.groups.map(item => <button type="button" key={item.id} aria-pressed={current?.id === item.id} onPointerEnter={event => { if (event.pointerType === 'mouse') setGroup(item.id); }} onFocus={() => setGroup(item.id)} onClick={() => { setGroup(item.id); pinnedRef.current = true; setPinned(true); }}>{item.label}<ArrowUpRight size={15} aria-hidden="true" /></button>)}</nav><div className="desktop-mega-content" key={current?.id}><h3>{current?.label}</h3><p>{current?.description}</p>{current?.href && link(current.href, 'Open overview')}{current && tree(current.children || [])}{!data && <p role="status">{error ? 'College navigation could not load.' : 'Loading college navigation…'} {error && <button type="button" onClick={() => { setError(false); setRetry(value => value + 1); }}>Retry</button>}</p>}</div></div>
      <div className="desktop-mega-footer">{link('/explore', 'Open complete directory')}<div className="desktop-appearance" role="group" aria-label="Choose desktop appearance">{[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'Auto', Monitor]].map(([value, label, Icon]) => <button type="button" key={value} aria-label={label} aria-pressed={theme === value} onClick={event => { onThemeChange(value, event); close(); }}><Icon size={16} aria-hidden="true" /></button>)}</div><label>Background motion<input type="checkbox" role="switch" checked={motionEnabled} onChange={event => onMotionChange(event.target.checked)} /></label></div>
    </motion.section>}</AnimatePresence>, portalTarget)}
  </div>;
}
