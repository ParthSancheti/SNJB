import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageViewer({ item, onClose }) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  const [zoomed, setZoomed] = useState(false);
  close.current = onClose;
  useEffect(() => {
    if (!item || !dialog.current) return;
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    setZoomed(false);
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [item]);
  return <dialog ref={dialog} className={`photo-viewer snjb-lightbox-dialog ${zoomed ? 'is-zoomed' : ''}`} style={{ display: item ? 'flex' : 'none' }}
    aria-labelledby="photo-viewer-title" onCancel={event => { event.preventDefault(); close.current?.(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close.current?.();
    }}>
    <header className="photo-viewer-head"><h2 id="photo-viewer-title">{item?.title || 'A closer look.'}</h2>
      <div className="photo-viewer-actions">
        <button type="button" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>{zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />}{zoomed ? 'Fit to screen' : 'Zoom in'}</button>
        {item?.sourceUrl && /^https?:/.test(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Original source<ArrowUpRight size={16} aria-hidden="true" /></a>}
        <button type="button" className="photo-viewer-close" aria-label="Close photograph" onClick={() => close.current?.()}><X size={19} aria-hidden="true" /></button>
      </div>
    </header>
    <div className="photo-viewer-stage" tabIndex={0} aria-label="Photograph; scroll to explore when zoomed">{item && <img src={item.src} alt={item.alt || item.title || ''} />}</div>
    {(item?.caption || item?.alt) && <p className="photo-viewer-caption">{item.caption || item.alt}</p>}
  </dialog>;
}
