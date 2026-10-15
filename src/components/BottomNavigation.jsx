import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Compass, GraduationCap, House, Send } from 'lucide-react';

const items = [
  { id: 'home', label: 'Home', href: '/', Icon: House },
  { id: 'campus', label: 'Campus', href: '/student-life', Icon: GraduationCap },
  { id: 'resources', label: 'Explore', href: '/explore', Icon: Compass },
  { id: 'apply', label: 'Apply', href: '/apply', Icon: Send },
];

export default function BottomNavigation({ pageKey, navigate, hidden, transitioning }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(pageKey === 'directory' ? 'resources' : pageKey === 'department' ? null : pageKey === 'campus' ? 'campus' : pageKey === 'apply' ? 'apply' : 'home');
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const inspect = () => setCovered(Boolean(document.querySelector('[aria-modal="true"],dialog[open]')));
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-modal'] });
    inspect(); return () => observer.disconnect();
  }, []);
  useEffect(() => { setActive(pageKey === 'directory' ? 'resources' : pageKey === 'campus' ? 'campus' : pageKey === 'apply' ? 'apply' : pageKey === 'department' ? null : 'home'); }, [pageKey]);
  const follow = (event, item) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setActive(item.id);
    navigate(item.href, event);
  };
  return <AnimatePresence>{!hidden && !covered && <motion.nav className="bottom-navigation" aria-label="Primary pages"
    initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
    transition={{ duration: reduced ? 0 : .18 }}>
    {items.map(item => <motion.a key={item.id} href={item.href} aria-label={item.label} title={item.label}
      data-active={active === item.id} aria-current={active === item.id ? 'page' : undefined}
      onClick={event => follow(event, item)} layout={reduced ? false : 'position'} whileTap={reduced ? undefined : { scale: .94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 29, mass: .75 }}>
      {active === item.id && <motion.span className="bottom-navigation-pill" layoutId="primary-navigation-pill"
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 27, mass: .75 }} />}
      <item.Icon size={21} strokeWidth={1.7} aria-hidden="true" />
      {active === item.id && <motion.span className="bottom-navigation-label" initial={reduced ? false : { opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : .16 }}>{item.label}</motion.span>}
    </motion.a>)}
  </motion.nav>}</AnimatePresence>;
}
