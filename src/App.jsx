import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { MotionConfig, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, ArrowUpRight, MapPin, Sparkles, ExternalLink, ChevronDown } from 'lucide-react';
import Home from './pages/Home.jsx';
import Assistant from './components/Assistant.jsx';
import SearchDialog from './components/SearchDialog.jsx';
import NavigationHub from './components/NavigationHub.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import DesktopNavigation from './components/DesktopNavigation.jsx';

const official = 'https://snjb.org/engineering';
const ComputerEngineering = lazy(() => import('./pages/ComputerEngineering.jsx'));
const DepartmentPage = lazy(() => import('./pages/DepartmentPage.jsx'));
const ResourceDirectory = lazy(() => import('./pages/ResourceDirectory.jsx'));
const VisitorPage = lazy(() => import('./pages/VisitorPage.jsx'));
const AuditPage = lazy(() => import('./pages/AuditPage.jsx'));

const OTHER_DEPTS = new Set([
  'ai-data-science',
  'civil-engineering',
  'electronics-telecommunication',
  'mechanical-engineering',
  'first-year-engineering',
  'mba',
]);

const ROUTE_META = {
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
      'Explore B.Tech in Artificial Intelligence & Data Science at SNJB College of Engineering, Chandwad: 158 seat intake, laboratories, placement outcomes and curriculum.',
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
      'Explore the NBA-accredited Mechanical Engineering department at SNJB College of Engineering, Chandwad: labs, placements and interactive 3D kinematics.',
  },
  'first-year-engineering': {
    title: 'First-Year Engineering & Applied Sciences — SNJB College of Engineering',
    description:
      'Explore First-Year B.Tech Engineering & Applied Sciences at SNJB College of Engineering, Chandwad.',
  },
  mba: {
    title: 'MBA (Master of Business Administration) — SNJB College of Engineering',
    description:
      'Explore the NBA-accredited autonomous MBA programme at SNJB College of Engineering, Chandwad: 81 placements in AY 2025–26, faculty and admissions.',
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
      'Check FY B.Tech (DTE Code 05173), Direct Second Year, M.Tech, MBA and Ph.D. admission processes, FRA fees, scholarships and submit an admission enquiry.',
  },
  audit: {
    title: 'Project ASTRA — Source & Provenance Registry · SNJB Engineering',
    description:
      'Verified content snapshots, SHA-256 asset hashes, placement arithmetic verification and media provenance records.',
  },
};

const routeKey = (value) => {
  const clean = value.replace(/\/$/, '').toLowerCase();
  if (!clean || clean === '') return 'home';
  if (clean === '/computer-engineering') return 'department';
  if (clean === '/explore' || clean === '/directory') return 'directory';
  if (clean === '/student-life' || clean === '/campus') return 'campus';
  if (clean === '/apply' || clean === '/admissions') return 'apply';
  if (clean === '/audit') return 'audit';
  const slug = clean.slice(1);
  if (OTHER_DEPTS.has(slug)) return slug;
  return 'home';
};

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try {
      return localStorage.getItem('snjb-background-motion') !== 'off';
    } catch {
      return true;
    }
  });
  const [routeChanging, setRouteChanging] = useState(false);
  const [explosion, setExplosion] = useState(null);
  const commitNavigation = useRef(null);
  const coveredNavigation = useRef(false);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('snjb-theme');
      return ['light', 'dark'].includes(saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  });
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const brandAnchor = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.backgroundMotion = motionEnabled ? 'on' : 'off';
    try {
      localStorage.setItem('snjb-background-motion', motionEnabled ? 'on' : 'off');
    } catch {}
  }, [motionEnabled]);

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      const dark = theme === 'dark' || (theme === 'system' && query.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', dark);
      setIsDark(dark);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#050508' : '#f0f4f8');
    };
    update();
    query.addEventListener('change', update);
    try {
      localStorage.setItem('snjb-theme', theme);
    } catch {}
    return () => query.removeEventListener('change', update);
  }, [theme]);

  const pageKey = routeKey(path);
  const department = pageKey === 'department';
  const otherDept = OTHER_DEPTS.has(pageKey);
  const directory = pageKey === 'directory';
  const audit = pageKey === 'audit';
  const reduced = useReducedMotion();

  const changeTheme = (next, event) => {
    const apply = () => {
      const dark = next === 'dark' || (next === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', dark);
      flushSync(() => {
        setTheme(next);
        setIsDark(dark);
        setMenuOpen(false);
      });
    };
    if (reduced || !document.startViewTransition) {
      apply();
      return;
    }
    const rect =
      event?.currentTarget?.getBoundingClientRect() || brandAnchor.current?.getBoundingClientRect();
    const x = event?.detail ? event.clientX : (rect?.x || 0) + (rect?.width || 40) / 2;
    const y = event?.detail ? event.clientY : (rect?.y || 0) + (rect?.height || 40) / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 420,
            easing: 'cubic-bezier(.2,.7,.2,1)',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      )
      .catch(() => {});
  };

  const navigationTimer = useRef(null);
  const pendingNavigation = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const anchorCleanup = useRef(null);

  const alignSection = useCallback((section) => {
    anchorCleanup.current?.();
    let active = true;
    const align = () => {
      if (active && section.isConnected) section.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    align();
    const observer = new ResizeObserver(align);
    const content = document.getElementById('main-content');
    if (content) observer.observe(content);
    const cancel = () => {
      if (!active) return;
      active = false;
      observer.disconnect();
      clearTimeout(timer);
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        window.removeEventListener(type, cancel);
      }
    };
    const timer = setTimeout(cancel, 8000);
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(type, cancel, { passive: true });
    }
    document.fonts.ready.then(align);
    anchorCleanup.current = cancel;
  }, []);

  useEffect(() => () => anchorCleanup.current?.(), []);

  const finishNavigation = useCallback(() => {
    const url = pendingNavigation.current;
    if (!url) {
      const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
      if (target) {
        if (target.tagName === 'DETAILS') target.open = true;
        alignSection(target);
      }
      return;
    }
    pendingNavigation.current = null;
    setRouteChanging(false);
    setExplosion((value) => (value ? { ...value, phase: 'reveal' } : null));
    const section = url.hash && document.getElementById(url.hash.slice(1));
    if (section?.tagName === 'DETAILS') section.open = true;
    const focusTarget = section || document.querySelector('main h1');
    if (focusTarget) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }
    if (section) alignSection(section);
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [alignSection]);

  useEffect(() => {
    window.addEventListener('hashchange', finishNavigation);
    return () => window.removeEventListener('hashchange', finishNavigation);
  }, [finishNavigation]);

  const navigate = useCallback(
    (target, event) => {
      if (pendingNavigation.current) return;
      anchorCleanup.current?.();
      const url = new URL(target, window.location.origin);
      if (url.origin !== window.location.origin) {
        window.open(url.href, '_blank', 'noopener,noreferrer');
        return;
      }
      const destination = url.pathname.replace(/\/$/, '');
      const samePage = routeKey(destination) === pageKey;
      pendingNavigation.current = url;
      setRouteChanging(true);
      window.clearTimeout(navigationTimer.current);
      const perform = () => {
        document.getElementById('main-content')?.focus({ preventScroll: true });
        window.history.pushState({}, '', `${url.pathname}${url.hash}`);
        setPath(url.pathname);
        setMenuOpen(false);
        setDesktopExpanded(false);
        setSearchOpen(false);
        if (samePage) navigationTimer.current = window.setTimeout(finishNavigation, 0);
      };
      if (reduced) {
        coveredNavigation.current = false;
        perform();
        return;
      }
      coveredNavigation.current = true;
      const bounds = (event?.currentTarget || document.activeElement)?.getBoundingClientRect();
      const x = event?.detail ? event.clientX : bounds ? bounds.x + bounds.width / 2 : innerWidth / 2;
      const y = event?.detail ? event.clientY : bounds ? bounds.y + bounds.height / 2 : innerHeight / 2;
      const scale = Math.max(400, Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) / 5 + 2);
      commitNavigation.current = perform;
      setExplosion({
        id: performance.now(),
        x,
        y,
        scale,
        origin: {
          left: bounds?.left ?? x - 24,
          top: bounds?.top ?? y - 24,
          width: bounds?.width ?? 48,
          height: bounds?.height ?? 48,
        },
        color: url.pathname.includes('computer') ? '#1e4a4d' : '#202d55',
        phase: 'cover',
      });
    },
    [pageKey, finishNavigation, reduced]
  );

  useEffect(() => {
    const press = (event) => {
      if (!reduced && event.pointerType === 'touch' && event.target.closest('button,a[href]')) {
        navigator.vibrate?.(8);
      }
    };
    document.addEventListener('pointerup', press, { passive: true });
    return () => document.removeEventListener('pointerup', press);
  }, [reduced]);

  useEffect(() => {
    const pop = () => {
      commitNavigation.current = null;
      pendingNavigation.current = null;
      setExplosion(null);
      setRouteChanging(false);
      setPath(window.location.pathname);
      setMenuOpen(false);
    };
    const keys = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (document.querySelector('[aria-modal="true"]')) return;
        setAssistantOpen(false);
        setMenuOpen(false);
        setSearchOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('popstate', pop);
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('popstate', pop);
      window.removeEventListener('keydown', keys);
      window.clearTimeout(navigationTimer.current);
    };
  }, []);

  useEffect(() => {
    const meta = ROUTE_META[pageKey] || ROUTE_META.home;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    const hash = window.location.hash;
    const timer =
      hash &&
      window.setTimeout(
        () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' }),
        reduced ? 0 : 180
      );
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [pageKey, reduced]);

  const internal = (href) => (event) => {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      navigate(href, event);
    }
  };
  const openSearch = () => {
    setAssistantOpen(false);
    setMenuOpen(false);
    setDesktopExpanded(false);
    setSearchOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell" data-page={pageKey}>
        <div className="site-atmosphere" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header
          className={`site-header header-v7 header-v8 header-v11 ${
            menuOpen || desktopExpanded ? 'is-menu-open' : ''
          }`}
        >
          <div className="header-inner">
            <div className="brand">
              <a className="desktop-brand-logo" href="/" onClick={internal('/')} aria-label="SNJB home">
                <img src="/images/emblem.webp" alt="" width="48" height="48" />
              </a>
              <button
                ref={brandAnchor}
                className="brand-menu-button"
                aria-label="Open SNJB menu"
                title="Quick access · Appearance"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => {
                  setAssistantOpen(false);
                  setSearchOpen(false);
                  setMenuOpen((value) => !value);
                }}
              >
                <img src="/images/emblem.webp" alt="" width="46" height="46" />
                <span className="brand-menu-chevron" aria-hidden="true">
                  <ChevronDown size={12} />
                </span>
              </button>
              <a href="/" className="brand-wordmark" onClick={internal('/')} aria-label="SNJB homepage">
                SNJB
              </a>
            </div>
            <DesktopNavigation
              navigate={navigate}
              theme={theme}
              onThemeChange={changeTheme}
              motionEnabled={motionEnabled}
              onMotionChange={setMotionEnabled}
              onExpanded={setDesktopExpanded}
              pageKey={pageKey}
              searchOpen={searchOpen}
            />
            <button
              className="icon-button search-trigger"
              aria-label="Search programmes and resources"
              onClick={openSearch}
            >
              <Search size={22} strokeWidth={2.25} />
              <span>Search</span>
              <kbd>{/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'}</kbd>
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="route-surface"
              key={pageKey}
              initial={reduced ? false : { opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: reduced ? 0 : 0.14 }}
            >
              <Suspense
                fallback={
                  <div className="route-loading" role="status">
                    <span className="route-loading-orbit" aria-hidden="true" />
                    Opening the page…
                  </div>
                }
              >
                {pageKey === 'campus' || pageKey === 'apply' ? (
                  <VisitorPage kind={pageKey} navigate={navigate} />
                ) : directory ? (
                  <ResourceDirectory navigate={navigate} />
                ) : audit ? (
                  <AuditPage navigate={navigate} />
                ) : department ? (
                  <ComputerEngineering onAsk={() => setAssistantOpen(true)} navigate={navigate} />
                ) : otherDept ? (
                  <DepartmentPage slug={pageKey} onAsk={() => setAssistantOpen(true)} navigate={navigate} />
                ) : (
                  <Home navigate={navigate} onAsk={() => setAssistantOpen(true)} motionEnabled={motionEnabled} />
                )}
                <PageReady onReady={finishNavigation} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer navigate={navigate} />

        <motion.button
          className="assistant-launcher"
          onClick={() => setAssistantOpen(true)}
          aria-label="Open SNJB guide"
          whileTap={reduced ? undefined : { scale: 0.95 }}
        >
          <Sparkles size={21} strokeWidth={1.6} />
          <span>Ask SNJB</span>
        </motion.button>
        <NavigationHub
          open={menuOpen}
          onClose={closeMenu}
          navigate={navigate}
          theme={theme}
          onThemeChange={changeTheme}
          anchorRef={brandAnchor}
          motionEnabled={motionEnabled}
          onMotionChange={setMotionEnabled}
        />
        <BottomNavigation
          pageKey={pageKey}
          navigate={navigate}
          transitioning={routeChanging}
          hidden={menuOpen || searchOpen || assistantOpen}
        />
        <Assistant
          open={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          context={department || otherDept ? 'computer-engineering' : directory ? 'explore' : 'engineering'}
          navigate={navigate}
        />
        <SearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          navigate={navigate}
          onAsk={() => {
            setSearchOpen(false);
            setAssistantOpen(true);
          }}
        />
        {createPortal(
          <AnimatePresence>
            {explosion && (
              <motion.div
                key={`glass-${explosion.id}`}
                className="navigation-route-glass"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: explosion.phase === 'reveal' ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            {explosion && (
              <motion.div
                key={explosion.id}
                className="navigation-app-sheet"
                aria-hidden="true"
                style={{ '--route-tint': explosion.color }}
                initial={{ ...explosion.origin, borderRadius: 28, opacity: 1 }}
                animate={{
                  left: 0,
                  top: 0,
                  width: '100vw',
                  height: '100dvh',
                  borderRadius: 0,
                  opacity: explosion.phase === 'reveal' ? 0 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: explosion.phase === 'reveal' ? 0.24 : 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                onAnimationComplete={() => {
                  if (explosion.phase === 'cover') {
                    const commit = commitNavigation.current;
                    commitNavigation.current = null;
                    commit?.();
                  } else setExplosion(null);
                }}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </MotionConfig>
  );
}

function PageReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function Footer({ navigate }) {
  const link = (url) => (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(url, event);
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-masthead">
          <div className="footer-brand-stack">
            <p>Late Sau. Kantabai Bhavarlalji Jain</p>
            <div className="footer-brand-line">
              <img src="/images/emblem.webp" alt="SNJB emblem" width="76" height="76" />
              <strong className="footer-snjb">SNJB</strong>
            </div>
            <h2>College of Engineering</h2>
            <small className="footer-coe">COE · Chandwad · Autonomous (SPPU)</small>
            <span>Vision Through Knowledge. Life Through Character.</span>
          </div>
          <a className="button button-outline" href="/apply" onClick={link('/apply')}>
            Admissions 2026–27
            <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="footer-top">
          <div className="footer-identity">
            <p>
              Engineering since 2004.
              <br />
              DTE Choice Code: 05173
            </p>
            <address>
              <MapPin size={16} />
              Neminagar, Chandwad – 423101
              <br />
              District Nashik, Maharashtra, India
            </address>
          </div>
          <div className="footer-group">
            <h3>Departments</h3>
            <a href="/computer-engineering" onClick={link('/computer-engineering')}>
              Computer Engineering
            </a>
            <a href="/ai-data-science" onClick={link('/ai-data-science')}>
              AI &amp; Data Science
            </a>
            <a href="/civil-engineering" onClick={link('/civil-engineering')}>
              Civil Engineering
            </a>
            <a href="/electronics-telecommunication" onClick={link('/electronics-telecommunication')}>
              E&amp;TC Engineering
            </a>
            <a href="/mechanical-engineering" onClick={link('/mechanical-engineering')}>
              Mechanical Engineering
            </a>
            <a href="/mba" onClick={link('/mba')}>
              MBA (Management)
            </a>
          </div>
          <div className="footer-group">
            <h3>For students &amp; visitors</h3>
            <a href="/explore" onClick={link('/explore')}>
              Complete resource directory
            </a>
            <a href="/student-life" onClick={link('/student-life')}>
              Campus life &amp; student services
            </a>
            <a href="https://mysnjb.edupluscampus.com/" target="_blank" rel="noreferrer">
              Student ERP portal
            </a>
            <a href={`${official}/syllabi-autonomy`} target="_blank" rel="noreferrer">
              Autonomous syllabi
            </a>
            <a href="https://opac.snjb.org/" target="_blank" rel="noreferrer">
              Library OPAC catalogue
            </a>
            <a href={`${official}/student-corner/scholarships`} target="_blank" rel="noreferrer">
              Scholarships
            </a>
          </div>
          <div className="footer-group">
            <h3>Get in touch</h3>
            <a href="tel:+912556253750">+91 2556 253750</a>
            <a href="mailto:principalcoe@snjb.org">principalcoe@snjb.org</a>
            <a href={`${official}/about-us/contact-us`} target="_blank" rel="noreferrer">
              Contacts &amp; directions
              <ArrowUpRight size={13} />
            </a>
            <div className="footer-social">
              <a href="https://www.instagram.com/snjbcoechandwad/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://www.youtube.com/@snjbkbjaincollegeofenginee1817" target="_blank" rel="noreferrer">
                YouTube
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} SNJB’s Late Sau. K. B. Jain College of Engineering, Chandwad
          </span>
          <div>
            <a href={`${official}/about-us/mandatory-disclosure`} target="_blank" rel="noreferrer">
              Mandatory Disclosures
            </a>
            <a href={`${official}/iqac/nba`} target="_blank" rel="noreferrer">
              NAAC A+ &amp; NBA
            </a>
            <a href="/audit" onClick={link('/audit')}>
              Source &amp; audit registry
            </a>
            <a href={`${official}/about-us/contact-us`} target="_blank" rel="noreferrer">
              Student support
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;
