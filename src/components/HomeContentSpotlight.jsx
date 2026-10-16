import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import ContentRail from './ContentRail.jsx';
import EdgeCarouselControls from './EdgeCarouselControls.jsx';
import { Reveal } from './ui.jsx';
import { loadHomepageSummary } from '../data/homepage-source.js';
import useAmbientAutoplay from '../hooks/useAmbientAutoplay.js';
import './home-content-spotlight.css';

const SOURCE = 'https://snjb.org/engineering/';

function EventRow({ event }) {
  return (
    <details className="hcs-event">
      <summary>
        <img
          src={event.images[0].localPath || event.images[0].sourceUrl}
          alt=""
          width="64"
          height="64"
          loading="lazy"
          decoding="async"
        />
        <span>
          <small>{event.date}</small>
          <strong>{event.title}</strong>
        </span>
        <Plus size={17} aria-hidden="true" />
      </summary>
      <div className="hcs-event-body">
        <p>{event.description}</p>
        <div className="hcs-event-photos">
          {event.images.map((image) => (
            <figure key={image.id}>
              <img
                src={image.localPath || image.sourceUrl}
                alt={image.originalAlt}
                width={image.dimensions?.[0] || 640}
                height={image.dimensions?.[1] || 480}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </div>
    </details>
  );
}

function Testimonial({ testimonial, onRead }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <figure className={`hcs-testimonial ${expanded ? 'is-expanded' : ''}`}>
      <figcaption>
        <img
          src={testimonial.image.localPath || testimonial.image.sourceUrl}
          alt={testimonial.image.originalAlt}
          width="46"
          height="46"
          loading="lazy"
          decoding="async"
        />
        <span>
          <strong>{testimonial.name}</strong>
          <small>{testimonial.attribution}</small>
        </span>
      </figcaption>
      <blockquote id={id}>
        <p>{testimonial.quote}</p>
      </blockquote>
      <button
        className="hcs-text-action"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => {
          onRead(testimonial.id, !expanded);
          setExpanded((value) => !value);
        }}
      >
        {expanded ? 'Show less' : 'Read the full quote'}
        <Plus size={14} className={expanded ? 'is-open' : ''} aria-hidden="true" />
      </button>
    </figure>
  );
}

function CommunityVoices({ testimonials }) {
  const [index, setIndex] = useState(0);
  const [readingIds, setReadingIds] = useState(() => new Set());
  const swipe = useRef(null);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const reduced = useReducedMotion();

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => {
      setWide(query.matches);
      setReadingIds(new Set());
    };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const visible = wide
    ? [testimonials[index], testimonials[(index + 1) % testimonials.length]]
    : [testimonials[index]];
  const move = (direction) => {
    setReadingIds(new Set());
    setIndex((value) => (value + direction * (wide ? 2 : 1) + testimonials.length) % testimonials.length);
  };
  const autoplay = useAmbientAutoplay({
    onAdvance: () => move(1),
    interval: 5000,
    enabled: testimonials.length > 1,
    reading: readingIds.size > 0,
  });
  const manualMove = (direction) => {
    autoplay.restart();
    move(direction);
  };
  const read = (id, expanded) =>
    setReadingIds((value) => {
      const next = new Set(value);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <section
      className="hcs-voices voices-v12"
      ref={autoplay.ref}
      {...autoplay.interactionProps}
      id="testimonials"
      aria-labelledby="homepage-voices-title"
      aria-roledescription="carousel"
      aria-description="Swipe or use left and right arrow keys to browse community voices."
      data-autoplay={autoplay.playing ? 'playing' : 'paused'}
      data-slide-index={index}
      data-slide-count={testimonials.length}
      data-autoplay-interval="5000"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();
          manualMove(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="hcs-block-heading">
        <div>
          <p className="section-label">Community voices</p>
          <h3 id="homepage-voices-title">In their own words.</h3>
        </div>
      </div>
      <EdgeCarouselControls onPrevious={() => manualMove(-1)} onNext={() => manualMove(1)} label="alumni voice" enabled={testimonials.length > 1}>
        <motion.div
          onTouchStart={(event) => {
            swipe.current = [event.touches[0].clientX, event.touches[0].clientY];
          }}
          onTouchEnd={(event) => {
            if (swipe.current !== null) {
              const [x, y] = swipe.current;
              const dx = event.changedTouches[0].clientX - x;
              const dy = event.changedTouches[0].clientY - y;
              if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) manualMove(dx < 0 ? 1 : -1);
              swipe.current = null;
            }
          }}
          onTouchCancel={() => {
            swipe.current = null;
          }}
          className="hcs-quote-grid"
          key={`${index}-${wide}`}
          initial={reduced ? false : { opacity: 0.2, y: 12, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {visible.map((testimonial) => (
            <Testimonial key={testimonial.id} testimonial={testimonial} onRead={read} />
          ))}
        </motion.div>
      </EdgeCarouselControls>
    </section>
  );
}

function Recruiters({ recruiters }) {
  return (
    <div className="hcs-recruiters" id="recruiters">
      <ContentRail
        title="Connections beyond campus."
        label="OUR RECRUITERS"
        count={recruiters.length}
        className="recruiter-rail"
      >
        {recruiters.map((recruiter) => (
          <div key={recruiter.image.id}>
            <img
              src={recruiter.image.localPath || recruiter.image.sourceUrl}
              alt={recruiter.name}
              title={recruiter.name}
              width="120"
              height="64"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </ContentRail>
      <p className="hcs-source-note">
        Published recruiter partners from SNJB’s placement records.{' '}
        <a href={`${SOURCE}placements/our-recruiters`} target="_blank" rel="noreferrer">
          Official recruiter directory
          <ArrowUpRight size={12} />
        </a>
      </p>
    </div>
  );
}

export default function HomeContentSpotlight({ mode = 'all' }) {
  const element = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const showJournal = mode !== 'recruiters';
  const showRecruiters = mode !== 'journal';

  useEffect(() => {
    const controller = new AbortController();
    let requested = false;
    const load = async () => {
      if (requested) return;
      requested = true;
      setError(false);
      try {
        const snapshot = await loadHomepageSummary();
        if (!controller.signal.aborted) setData(snapshot);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    };
    const idle = window.requestIdleCallback ? requestIdleCallback(load, { timeout: 1200 }) : setTimeout(load, 0);
    if (['#events', '#testimonials', '#recruiters'].includes(window.location.hash)) load();
    const observer = window.IntersectionObserver
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              load();
              observer.disconnect();
            }
          },
          { rootMargin: '700px' }
        )
      : null;
    if (element.current) observer?.observe(element.current);
    return () => {
      observer?.disconnect();
      controller.abort();
      if (window.cancelIdleCallback) cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [retry]);

  useEffect(() => {
    if (data && ['#events', '#testimonials', '#recruiters'].includes(window.location.hash)) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    }
  }, [data]);

  return (
    <div className={`home-content-spotlight hcs-mode-${mode}`} ref={element}>
      {!data && (
        <>
          {showJournal && (
            <>
              <span id="events" />
              <span id="testimonials" />
            </>
          )}
          {showRecruiters && <span id="recruiters" />}
          <div className="hcs-loading" role="status">
            {error ? (
              <>
                <p>{showJournal ? 'Campus updates' : 'Recruiter records'} couldn’t load.</p>
                <button className="hcs-text-action" onClick={() => setRetry((value) => value + 1)}>
                  Try again
                  <ArrowRight size={16} />
                </button>
                <a href={SOURCE} target="_blank" rel="noreferrer">
                  Visit the official homepage
                </a>
              </>
            ) : (
              <p>{showJournal ? 'Campus moments and community voices.' : 'Published recruiter records.'}</p>
            )}
          </div>
        </>
      )}
      {data && (
        <>
          {showJournal && (
            <>
              <Reveal>
                <section className="hcs-campus-updates" id="events" aria-labelledby="homepage-events-title">
                  <div className="hcs-events">
                    <div className="hcs-block-heading">
                      <div>
                        <p className="section-label">Campus journal</p>
                        <h3 id="homepage-events-title">What’s happening.</h3>
                      </div>
                      <span className="hcs-source-note">Published events</span>
                    </div>
                    {[...data.eventsVisible].reverse().map((event) => (
                      <EventRow event={event} key={event.sourceEntryIds.join('-')} />
                    ))}
                  </div>
                  <aside className="hcs-notice-board" aria-labelledby="homepage-notices-title">
                    <p className="section-label">Notice board</p>
                    <h3 id="homepage-notices-title">Keep in the loop.</h3>
                    <ul>
                      {data.notices.map((notice) => (
                        <li key={`${notice.title}-${notice.dateParts.join('-')}`}>
                          <span>{notice.dateParts.join(' · ')}</span>
                          <strong>{notice.title}</strong>
                        </li>
                      ))}
                    </ul>
                    <a href={SOURCE} target="_blank" rel="noreferrer" className="hcs-text-action">
                      Official notice board
                      <ArrowUpRight size={15} />
                    </a>
                  </aside>
                </section>
              </Reveal>
              <Reveal>
                <CommunityVoices testimonials={data.testimonials} />
              </Reveal>
            </>
          )}
          {showRecruiters && (
            <Reveal>
              <Recruiters recruiters={data.recruiters} />
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}
