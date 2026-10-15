import { useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Photo } from './ui.jsx';
import useAmbientAutoplay from '../hooks/useAmbientAutoplay.js';

const items = [
  ['/images/orientation.webp', 'AI-treated SNJB orientation photograph'],
  ['/images/campus-life.webp', 'AI-treated SNJB tree-plantation photograph'],
  ['/images/computer-lab.webp', 'AI-treated SNJB computer laboratory photograph'],
  ['/images/library.webp', 'Published SNJB library photograph'],
];

function CampusPhotograph({ src, alt, direction, reduced }) {
  const present = useIsPresent();
  return <motion.figure inert={!present} aria-hidden={!present || undefined} initial={reduced ? false : { y: `${direction * 30}%`, opacity: 0, filter: 'blur(9px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }} exit={reduced ? { opacity: 0 } : { y: `${direction * -30}%`, opacity: 0, filter: 'blur(9px)' }} transition={{ duration: reduced ? 0 : 1.15, ease: [.22, 1, .36, 1] }}>
    <Photo src={src} alt={alt} width="1000" height="750" />
  </motion.figure>;
}

export default function CampusGallery() {
  const [index, setIndex] = useState(0);
  const swipe = useRef(null);
  const reduced = useReducedMotion();
  const move = direction => setIndex(value => (value + direction + items.length) % items.length);
  const autoplay = useAmbientAutoplay({ onAdvance: () => move(1), interval: 5000 });
  const manualMove = direction => { autoplay.restart(); move(direction); };
  return <section className="campus-gallery campus-v12" ref={autoplay.ref} {...autoplay.interactionProps} aria-label="Campus photographs. Swipe or use left and right arrow keys." aria-roledescription="carousel" data-autoplay={autoplay.playing ? 'playing' : 'paused'} data-slide-index={index} data-slide-count={items.length} tabIndex={0} onKeyDown={event => { if(event.target===event.currentTarget && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();manualMove(event.key==='ArrowRight'?1:-1);} }}>
    <div className="campus-v12-columns" onTouchStart={event => { swipe.current = [event.touches[0].clientX, event.touches[0].clientY]; }} onTouchEnd={event => { if (!swipe.current) return; const [x, y] = swipe.current; const deltaX = event.changedTouches[0].clientX - x, deltaY = event.changedTouches[0].clientY - y; if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) manualMove(deltaX < 0 ? 1 : -1); swipe.current = null; }} onTouchCancel={() => { swipe.current = null; }}>
      {[1, -1].map((direction, column) => {
        const [src, alt] = items[(index + column) % items.length];
        return <div className="campus-v12-window" key={column}>
          <AnimatePresence initial={false}>
            <CampusPhotograph key={src} src={src} alt={alt} direction={direction} reduced={reduced} />
          </AnimatePresence>
        </div>;
      })}
    </div>
    <span className="ambient-slide-progress" key={index} aria-hidden="true"/>
  </section>;
}
