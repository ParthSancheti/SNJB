import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Compass, Folder, GraduationCap, House, Laptop, Monitor, Moon, Sun, X } from 'lucide-react';
import './navigation-hub.css';
import './v13-overlay.css';

const shortcuts = [
  { label: 'Home', href: '/', icon: House },
  { label: 'Campus life', href: '/student-life', icon: Compass },
  { label: 'Apply', href: '/apply', icon: GraduationCap },
  { label: 'Fees · 2026–27', href: 'https://snjb.org/engineering/fra-fees-structure-ay2026-27', icon: BookOpen },
];
const controls = 'a[href],button:not([disabled]),input:not([disabled])';

export default function NavigationHub({ open, onClose, navigate, theme, onThemeChange, anchorRef, motionEnabled=true, onMotionChange }) {
  const reduced = useReducedMotion(), panel = useRef(null), layer = useRef(null), close = useRef(onClose);
  const [position, setPosition] = useState({ top: 90, left: 16, origin: 24 });
  const [unfolded, setUnfolded] = useState(false);
  useLayoutEffect(() => {
    setUnfolded(false);
    if (!open) return;
    if (reduced) { setUnfolded(true); return; }
    let nextFrame;
    const firstFrame = requestAnimationFrame(() => { nextFrame = requestAnimationFrame(() => setUnfolded(true)); });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(nextFrame); };
  }, [open, reduced]);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const anchor = anchorRef?.current?.getBoundingClientRect(), width = Math.min(440, innerWidth - 24);
      const left = Math.max(12, Math.min(anchor?.left ?? 16, innerWidth - width - 12));
      const top = Math.min((anchor?.bottom ?? 70) + 12, Math.max(12, innerHeight - 250));
      setPosition({ top, left, origin: (anchor ? anchor.left + anchor.width / 2 : left + 24) - left });
    };
    measure(); addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [open, anchorRef]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement, overflow = document.body.style.overflow;
    const background = [...document.body.children].filter(node => node !== layer.current), inert = background.map(node => node.inert);
    background.forEach(node => { node.inert = true; }); document.body.style.overflow = 'hidden';
    panel.current?.querySelector('a')?.focus({ preventScroll: true });
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return; }
      if (event.key !== 'Tab') return;
      const items = [...(panel.current?.querySelectorAll(controls) || [])].filter(node => node.getClientRects().length), first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard); document.body.style.overflow = overflow;
      background.forEach((node, index) => { node.inert = inert[index]; });
      const restore = anchorRef?.current || previous; if (restore?.isConnected) restore.focus({ preventScroll: true });
    };
  }, [open, anchorRef]);
  useEffect(() => {
    const resized = () => { if (innerWidth >= 1024) close.current(); };
    addEventListener('resize',resized); return () => removeEventListener('resize',resized);
  },[]);
  const follow = (href, event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    close.current(); if (href.startsWith('/')) { event.preventDefault(); navigate(href, event); }
  };
  const destination = (href, label, Icon = ArrowRight) => <a href={href} onClick={event => follow(href, event)} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Icon size={18} aria-hidden="true" /><span>{label}</span>{href.startsWith('/') ? <ArrowRight size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}</a>;

  return createPortal(<AnimatePresence>{open && <motion.div ref={layer} className="navigation-hub-backdrop navigation-hub-layer-v13" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }} onPointerDown={event => { if (event.target === event.currentTarget) { event.preventDefault(); close.current(); } }}>
    <div className="hub-background-glass" aria-hidden="true" />
    <motion.section ref={panel} role="dialog" aria-modal="true" aria-labelledby="navigation-hub-title" data-opening="anchor-spring" className="navigation-hub navigation-hub-v8 navigation-hub-v13" style={{ top: position.top, left: position.left, '--hub-top': `${position.top}px`, transformOrigin: `${position.origin}px -12px`, transformPerspective: 900 }} initial={reduced ? false : { opacity: 0, y: -22, scale: .74, rotateX: -7, filter: 'blur(5px)' }} animate={unfolded || reduced ? { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' } : { opacity: 0, y: -22, scale: .74, rotateX: -7, filter: 'blur(5px)' }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, scale: .88, filter: 'blur(4px)' }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 27, mass: .8 }}>
      <span className="overlay-glass-sheen" aria-hidden="true" />
      <header className="navigation-hub-heading"><div><h2 id="navigation-hub-title">Quick access</h2><p>Shortcuts & appearance.</p></div><button aria-label="Close navigation" onClick={() => close.current()}><X size={20} aria-hidden="true" /></button></header>
      <div className="hub-scroll">
        <nav className="hub-shortcuts" aria-label="Quick navigation">{shortcuts.map(({ label, href, icon }) => <div key={href}>{destination(href, label, icon)}</div>)}</nav>

      </div>
      <div className="hub-directory">{destination('/explore', 'All college resources', Compass)}</div>
      <div className="navigation-hub-appearance"><p>Appearance</p><div role="group" aria-label="Choose appearance">{[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'Auto', icon: Monitor }].map(({ value, label, icon: Icon }) => <button key={value} aria-pressed={theme === value} onClick={event => { onThemeChange(value, event); close.current(); }}><Icon size={16} aria-hidden="true" />{label}</button>)}</div></div>
      <label className="hub-background-motion"><span>Background motion</span><input type="checkbox" role="switch" checked={motionEnabled} onChange={event => onMotionChange?.(event.target.checked)} /><span className="hub-motion-track" aria-hidden="true"><span /></span></label>
    </motion.section>
  </motion.div>}</AnimatePresence>, document.body);
}
