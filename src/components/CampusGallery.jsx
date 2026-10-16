import { useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Photo } from './ui.jsx';
import useAmbientAutoplay from '../hooks/useAmbientAutoplay.js';
import EdgeCarouselControls from './EdgeCarouselControls.jsx';

const items = [
  ['/images/orientation.webp', 'SNJB auditorium orientation and felicitation ceremony'],
  ['/images/campus-life.webp', 'SNJB student tree-plantation and green campus drive'],
  ['/images/computer-lab.webp', 'SNJB computing laboratory session'],
  ['/images/library.webp', 'SNJB central library reading hall'],
];

function CampusPhotograph({ src, alt, direction, reduced, onInspect }) {
  const present = useIsPresent();
  return (
    <motion.figure
      inert={!present}
      aria-hidden={!present || undefined}
      initial={reduced ? false : { y: `${direction * 30}%`, opacity: 0, filter: 'blur(9px)' }}
      animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
      exit={reduced ? { opacity: 0 } : { y: `${direction * -30}%`, opacity: 0, filter: 'blur(9px)' }}
      transition={{ duration: reduced ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <Photo src={src} alt={alt} width="1000" height="750" onInspect={onInspect} />
    </motion.figure>
  );
}

export default function CampusGallery({ onInspect }) {
  const [index, setIndex] = useState(0);
  const swipe = useRef(null);
  const reduced = useReducedMotion();
  const move = (direction) => setIndex((value) => (value + direction + items.length) % items.length);
  const autoplay = useAmbientAutoplay({ onAdvance: () => move(1), interval: 3000 });
  const manualMove = (direction) => {
    autoplay.restart();
    move(direction);
  };

  return (
    <section
      className="campus-gallery campus-v12"
      ref={autoplay.ref}
      {...autoplay.interactionProps}
      aria-label="Campus photographs. Swipe or use left and right arrow keys."
      aria-roledescription="carousel"
      data-autoplay={autoplay.playing ? 'playing' : 'paused'}
      data-slide-index={index}
      data-slide-count={items.length}
      data-autoplay-interval="3000"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();
          manualMove(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <EdgeCarouselControls onPrevious={() => manualMove(-1)} onNext={() => manualMove(1)} label="campus photographs">
        <div
          className="campus-v12-columns"
          onTouchStart={(event) => {
            swipe.current = [event.touches[0].clientX, event.touches[0].clientY];
          }}
          onTouchEnd={(event) => {
            if (!swipe.current) return;
            const [x, y] = swipe.current;
            const deltaX = event.changedTouches[0].clientX - x;
            const deltaY = event.changedTouches[0].clientY - y;
            if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
              manualMove(deltaX < 0 ? 1 : -1);
            }
            swipe.current = null;
          }}
          onTouchCancel={() => {
            swipe.current = null;
          }}
        >
          {[1, -1].map((direction, column) => {
            const [src, alt] = items[(index + column) % items.length];
            return (
              <div className="campus-v12-window" key={column}>
                <AnimatePresence initial={false}>
                  <CampusPhotograph
                    key={src}
                    src={src}
                    alt={alt}
                    direction={direction}
                    reduced={reduced}
                    onInspect={onInspect}
                  />
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </EdgeCarouselControls>
    </section>
  );
}
