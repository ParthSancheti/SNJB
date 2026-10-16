import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Compass, GraduationCap, House, Send } from 'lucide-react';

const items = [
  { id: 'home', label: 'Home', href: '/', Icon: House },
  { id: 'campus', label: 'Campus', href: '/student-life', Icon: GraduationCap },
  { id: 'resources', label: 'Explore', href: '/explore', Icon: Compass },
  { id: 'apply', label: 'Apply', href: '/apply', Icon: Send },
];

const mapPageToTab = (pageKey) => {
  if (pageKey === 'directory' || pageKey === 'audit') return 'resources';
  if (pageKey === 'campus') return 'campus';
  if (pageKey === 'apply') return 'apply';
  if (pageKey === 'home') return 'home';
  return null;
};

export default function BottomNavigation({ pageKey, navigate, hidden }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(() => mapPageToTab(pageKey));
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const inspect = () => setCovered(Boolean(document.querySelector('[aria-modal="true"],dialog[open]')));
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'aria-modal'],
    });
    inspect();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActive(mapPageToTab(pageKey));
  }, [pageKey]);

  const follow = (event, item) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setActive(item.id);
    navigate(item.href, event);
  };

  return (
    <AnimatePresence>
      {!hidden && !covered && (
        <motion.nav
          className="bottom-navigation"
          aria-label="Primary pages"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          {items.map((item) => (
            <motion.a
              key={item.id}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              data-active={active === item.id}
              aria-current={active === item.id ? 'page' : undefined}
              onClick={(event) => follow(event, item)}
              layout={reduced ? false : 'position'}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 440, damping: 25, mass: 0.7 }}
            >
              {active === item.id && (
                <motion.span
                  className="bottom-navigation-pill"
                  layoutId="primary-navigation-pill"
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 440, damping: 23, mass: 0.7 }}
                />
              )}
              <item.Icon size={19} strokeWidth={1.75} aria-hidden="true" />
              <AnimatePresence initial={false}>
                {active === item.id && (
                  <motion.span
                    className="bottom-navigation-label"
                    initial={reduced ? false : { width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 440, damping: 27 }}
                  >{item.label}</motion.span>
                )}
              </AnimatePresence>
            </motion.a>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
