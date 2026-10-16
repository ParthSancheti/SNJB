import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export default function CinematicHero({
  title,
  eyebrow,
  tagline,
  description,
  poster = '/media/campus-poster-desktop-v10.webp',
  posterMobile,
  posterAlt = 'SNJB campus in Chandwad',
  actions = [],
  id,
  video = false,
  motionEnabled = true,
  mediaCaption,
  navigate,
}) {
  const section = useRef(null);
  const player = useRef(null);
  const inView = useRef(true);
  const synchronize = useRef(null);
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(() => matchMedia('(max-width:767px)').matches);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const source = mobile ? '/media/campus-mobile-v10.mp4' : '/media/campus-desktop-v10.mp4';

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.96, 0.92]);
  const radius = useTransform(scrollYProgress, [0, 0.4, 1], ['0px', '22px', '44px']);
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 0.8, 0.35]);
  const copyY = useTransform(scrollYProgress, [0, 0.65], [0, -28]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.45, 0.75], [1, 1, 0]);

  useEffect(() => {
    const query = matchMedia('(max-width:767px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setEnabled(Boolean(video && motionEnabled && !reduced && !navigator.connection?.saveData));
  }, [video, motionEnabled, reduced]);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    setSlow(false);
  }, [source, enabled]);

  useEffect(() => {
    if (!enabled || failed || ready) return;
    const timer = setTimeout(() => setSlow(true), 4500);
    return () => clearTimeout(timer);
  }, [enabled, failed, ready]);

  useEffect(() => {
    if (!enabled || failed || !player.current) return;
    const element = player.current;
    const sync = () => {
      const box = section.current?.getBoundingClientRect();
      inView.current = Boolean(
        box && Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) >= Math.min(box.height, innerHeight) * 0.18
      );
      if (inView.current && !document.hidden && !reduced) {
        element.play().catch(() => {});
      } else {
        element.pause();
      }
    };
    synchronize.current = sync;
    const observer = new IntersectionObserver(sync, { threshold: [0, 0.18, 0.5, 1] });
    observer.observe(section.current);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    element.addEventListener('canplay', sync);
    sync();
    return () => {
      synchronize.current = null;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      element.removeEventListener('canplay', sync);
      element.pause();
    };
  }, [enabled, failed, source, reduced]);

  const link = (href) => (event) => {
    if (navigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(href, event);
    }
  };

  return (
    <section
      className={`cinematic-hero hero-v7 ${video ? 'has-film hero-v10' : 'has-photograph'}`}
      id={id}
      ref={section}
    >
      <motion.div
        className="hero-film-surface"
        style={reduced ? {} : { scale, borderRadius: radius, opacity }}
      >
        <picture>
          {posterMobile && <source media="(max-width:767px)" srcSet={posterMobile} />}
          <img
            className="cinematic-poster"
            src={poster}
            alt={posterAlt}
            decoding="async"
            fetchPriority="high"
            style={video && !mobile ? { objectPosition: 'left center' } : undefined}
          />
        </picture>
        {video && enabled && !failed && (
          <video
            key={source}
            ref={player}
            className={`cinematic-video ${ready ? 'is-ready' : ''}`}
            src={source}
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            style={!mobile ? { objectPosition: 'left center' } : undefined}
            onLoadedData={() => {
              setReady(true);
              setSlow(false);
              synchronize.current?.();
            }}
            onError={() => {
              setFailed(true);
              setSlow(false);
              setReady(false);
            }}
          />
        )}
        <div className="cinematic-shade" />
      </motion.div>
      <motion.div className="cinematic-copy" style={reduced ? {} : { y: copyY, opacity: copyOpacity }}>
        <p className="cinematic-eyebrow">
          <span />
          {eyebrow}
        </p>
        <h1>
          {title.split('\n').map((line, index) => (
            <span key={line}>
              {line}
              {index < title.split('\n').length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        {tagline && (
          <div className="cinematic-tagline">
            <p lang="sa">ज्ञानेन दर्शनं, चरित्रेण जीवनम्</p>
            <span>{tagline}</span>
          </div>
        )}
        {description && <p className="cinematic-description">{description}</p>}
        <div className="cinematic-actions">
          {actions.map((action, idx) => (
            <motion.a
              key={action.href}
              className={`button ${idx === 0 ? 'button-hero-primary' : 'button-glass'} liquid-action`}
              href={action.href}
              onClick={link(action.href)}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              {action.label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </motion.a>
          ))}
        </div>
      </motion.div>
      {mediaCaption && <span className="hero-v7-caption">{mediaCaption}</span>}
      {slow && !ready && !failed && (
        <span className="hero-v7-slow" role="status">
          Campus film is loading slowly
        </span>
      )}
    </section>
  );
}
