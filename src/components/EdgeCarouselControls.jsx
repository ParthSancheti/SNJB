import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './edge-carousel-controls.css';

// Keep the content clear. Navigation appears at the track edge or for keyboard users.
export default function EdgeCarouselControls({ children, onPrevious, onNext, label, className = '', enabled = true }) {
  const [edge, setEdge] = useState('');

  const revealEdge = (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = event.clientX - bounds.left;
    const reach = Math.min(64, bounds.width * 0.14);
    const next = position <= reach ? 'previous' : position >= bounds.width - reach ? 'next' : '';
    setEdge((current) => current === next ? current : next);
  };

  return (
    <div
      className={`edge-carousel-frame ${className}`}
      data-revealed-edge={edge || undefined}
      onPointerMove={revealEdge}
      onPointerLeave={() => setEdge('')}
    >
      {children}
      {enabled && (
        <>
          <button
            type="button"
            className="edge-carousel-button edge-carousel-previous"
            data-carousel-edge="previous"
            aria-label={`Previous ${label}`}
            onClick={onPrevious}
          >
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="edge-carousel-button edge-carousel-next"
            data-carousel-edge="next"
            aria-label={`Next ${label}`}
            onClick={onNext}
          >
            <ChevronRight size={19} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
