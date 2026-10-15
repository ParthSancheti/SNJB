import { useEffect, useRef, useState } from 'react';

// A carousel owns its timer, but the visitor always owns the motion.
export default function useAmbientAutoplay({ onAdvance, interval = 5000, enabled = true, reading = false }) {
  const ref = useRef(null);
  const advance = useRef(onAdvance);
  const pointerHeld = useRef(false);
  const [interacting, setInteracting] = useState(false);
  const [clock, setClock] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const [motionAllowed, setMotionAllowed] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.backgroundMotion !== 'off');
  const [covered, setCovered] = useState(false);
  advance.current = onAdvance;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionAllowed(!preference.matches && document.documentElement.dataset.backgroundMotion !== 'off');
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    const releasePointer = () => {
      if (!pointerHeld.current) return;
      pointerHeld.current = false;
      setInteracting(false);
      setClock(value => value + 1);
    };
    const updateCover = () => {
      setCovered(Boolean(document.querySelector('dialog[open], [aria-modal="true"], .desktop-mega, .navigation-app-sheet')));
      // A focused quote can be replaced by an explicit swipe without emitting blur.
      setFocused(Boolean(ref.current?.contains(document.activeElement)));
    };
    const observer = new MutationObserver(updatePreference);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-background-motion'] });
    const covers = new MutationObserver(updateCover);
    covers.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'aria-modal'] });
    const visibility = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { threshold: .12 });
    if (ref.current) visibility.observe(ref.current);
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', releasePointer);
    updatePreference();
    updateCover();
    return () => {
      observer.disconnect();
      covers.disconnect();
      visibility.disconnect();
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      window.removeEventListener('blur', releasePointer);
    };
  }, []);

  const playing = enabled && motionAllowed && documentVisible && inView && !covered && !interacting && !hovered && !focused && !reading;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => advance.current(), interval);
    return () => window.clearInterval(timer);
  }, [playing, interval, clock]);

  return {
    ref,
    playing,
    motionAllowed,
    // A swipe restarts the viewing time; it never leaves an invisible pause behind.
    restart: () => setClock(value => value + 1),
    interactionProps: {
      onPointerDown: () => { pointerHeld.current = true; setInteracting(true); },
      onPointerEnter: event => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHovered(true); },
      onPointerLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
    },
  };
}
