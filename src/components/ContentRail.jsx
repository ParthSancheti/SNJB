import { useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import useAmbientAutoplay from '../hooks/useAmbientAutoplay.js';
import './media-motion-v12.css';

export default function ContentRail({ title, label, children, count, className = '', id }) {
  const track = useRef(null);
  const [position, setPosition] = useState(1);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = useReducedMotion();

  const stride = () => {
    const node = track.current;
    return node?.children[1] ? node.children[1].offsetLeft - node.children[0].offsetLeft : node?.clientWidth || 0;
  };
  const update = () => {
    const node = track.current;
    if (node) setPosition(Math.min(count, Math.max(1, Math.round(node.scrollLeft / (stride() || 1)) + 1)));
  };
  const move = (direction) => {
    const node = track.current;
    if (!node) return;
    const limit = Math.max(0, node.scrollWidth - node.clientWidth);
    const atEnd = node.scrollLeft >= limit - 4;
    const atStart = node.scrollLeft < 4;
    const wrap = (direction > 0 && atEnd) || (direction < 0 && atStart);
    node.scrollTo({
      left: direction > 0 && atEnd ? 0 : direction < 0 && atStart ? limit : Math.max(0, Math.min(limit, node.scrollLeft + direction * stride())),
      behavior: reduced || wrap ? 'instant' : 'smooth',
    });
    if (wrap && !reduced) {
      node.animate(
        [
          { opacity: 0.3, filter: 'blur(3px)' },
          { opacity: 1, filter: 'blur(0px)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    }
  };
  const autoplay = useAmbientAutoplay({
    onAdvance: () => move(1),
    interval: 5000,
    enabled: count > 1 && !userPaused,
  });
  const manualMove = (direction) => {
    autoplay.restart();
    move(direction);
  };

  return (
    <section
      ref={autoplay.ref}
      {...autoplay.interactionProps}
      className={`content-rail rail-autoplay ${className}`}
      id={id}
      aria-label={title}
      aria-roledescription="carousel"
      data-autoplay={autoplay.playing ? 'playing' : 'paused'}
      data-slide-index={position - 1}
      data-slide-count={count}
    >
      <div className="rail-heading">
        <div>
          {label && <p className="h8-eyebrow">{label}</p>}
          <h3>{title}</h3>
        </div>
        {count > 1 && (
          <div className="rail-user-controls" role="group" aria-label={`${title} controls`}>
            <span className="rail-counter" aria-live="polite">
              {position} / {count}
            </span>
            <button type="button" onClick={() => manualMove(-1)} aria-label={`Previous ${title} slide`}>
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((value) => !value)}
              aria-pressed={userPaused}
              aria-label={userPaused ? `Resume ${title} rotation` : `Pause ${title} rotation`}
            >
              {userPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => manualMove(1)} aria-label={`Next ${title} slide`}>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div
        className="rail-track"
        ref={track}
        onScroll={update}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > 1 || event.shiftKey) autoplay.restart();
        }}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            manualMove(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
        tabIndex={0}
        aria-label={`${title} slides. Swipe or use left and right arrow keys.`}
      >
        {children}
      </div>
      <span className="ambient-slide-progress" key={position} aria-hidden="true" />
    </section>
  );
}
