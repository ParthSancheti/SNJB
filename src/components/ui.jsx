import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { resolveDeliveryImage, isCampaignImage } from '../data/visual-assets.js';

export const standardSpring = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };
export function Reveal({ children, className = '', delay = 0, as = 'div', ...rest }) {
  const reduced = useReducedMotion();
  const Component = as === 'section' ? motion.section : motion.div;
  return <Component className={className} initial={reduced ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: reduced ? 0 : .4, ease: [.22, 1, .36, 1], delay: Math.min(delay, .12) }} {...rest}>{children}</Component>;
}
export function SectionHeading({ eyebrow, title, description, children, light = false, className = '' }) {
  return <div className={`section-heading ${light ? 'is-light' : ''} ${className}`}><div>{eyebrow && <p className="section-label"><span />{eyebrow}</p>}<h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{children}</div>;
}
export function ArrowLink({ children, href, onClick, className = '', external = false }) {
  return <a href={href} onClick={onClick} className={`arrow-link ${className}`} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}<ArrowUpRight size={18} aria-hidden="true" /></a>;
}
export function Button({ children, href, onClick, variant = 'primary', className = '', arrow = true, external = false, ...rest }) {
  const reduced = useReducedMotion();
  const Component = href ? motion.a : motion.button;
  return <Component href={href} onClick={onClick} className={`button button-${variant} ${className}`} whileTap={reduced ? undefined : { scale: .98 }} transition={standardSpring} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}{arrow && <ArrowUpRight size={18} aria-hidden="true" />}</Component>;
}
export function Tag({ children, className = '' }) { return <span className={`tag ${className}`}>{children}</span>; }
export function BentoCard({ children, className = '', ...rest }) {
  const reduced = useReducedMotion();
  return <motion.article className={`bento-card ${className}`} whileHover={reduced ? undefined : { scale: 1.02, y: -2 }} transition={standardSpring} {...rest}>{children}</motion.article>;
}
export function Photo({ src, alt, className = '', eager = false, ...rest }) {
  const source = src;
  src = resolveDeliveryImage(src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const preview = src.startsWith('/images/') ? src.replace(/\.webp$/, '-preview.webp') : src;
  const small = src.startsWith('/images/') || src.startsWith('/media/campus-aerial') ? src.replace(/\.webp$/, '-small.webp') : null;
  return <div className={`photo-frame ${className} ${loaded ? 'is-loaded' : ''} ${failed ? 'has-error' : ''}`} aria-busy={!loaded && !failed} data-image-treatment={isCampaignImage(source) ? 'GPT Image' : undefined}>
    {!loaded && !failed && <img className="photo-preview" src={preview} alt="" aria-hidden="true" loading={eager ? 'eager' : 'lazy'} />}
    {!failed && <img className="photo" src={src} srcSet={small ? `${small} 600w, ${src} ${rest.width || 1200}w` : undefined} sizes="(max-width: 767px) 100vw, 60vw" alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} {...rest} />}
    {!loaded && !failed && <span className="photo-loading-sheen" aria-hidden="true" />}
    {failed && <div className="photo-fallback"><span>{alt}</span></div>}
  </div>;
}
