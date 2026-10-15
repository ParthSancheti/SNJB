import { useEffect, useId, useRef, useState } from 'react';
import { Archive, BadgeCheck, BookOpen, ChevronDown, FileCheck2, Images, Newspaper, Quote, Users } from 'lucide-react';
import { loadHomepageSource } from '../data/homepage-source.js';
import './home-source-archive.css';

const SOURCE_URL = 'https://snjb.org/engineering/';
const SNAPSHOT_URL = '/data/homepage-content.json';
const REVIEW_DATE = '2026-10-14';
const DISCLOSURES = [
  ['institutional', 'About, vision & mission'],
  ['achievements', 'Achievements'],
  ['updates', 'Notices & events'],
  ['testimonials', 'Testimonials'],
  ['recruiters', 'Recruiter logos'],
  ['campus', 'Homepage photographs & virtual tour'],
  ['snapshot', 'Source snapshot & corrections'],
];

function ExternalLink({ href, children, className, ...props }) {
  return <a href={href} target="_blank" rel="noreferrer" className={className} {...props}>{children}</a>;
}

function SourceImage({ image, className = '', label }) {
  const dimensions = image.dimensions || [640, 480];
  return <ExternalLink href={image.sourceUrl} className={`hsa-image ${className}`} aria-label={label || `Open original image: ${image.originalAlt || 'homepage photograph'}`}>
    <img src={image.localPath || image.sourceUrl} alt={image.originalAlt} width={dimensions[0]} height={dimensions[1]} loading="lazy" decoding="async" />
  </ExternalLink>;
}

function Institutional({ data }) {
  const original = data.institutional;
  return <div className="hsa-institutional">
    <div><h4>{original.aboutHeading}</h4>{original.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {original.aboutLinks.filter(link => !link.placeholder).map(link => <ExternalLink href={link.url} key={link.url} className="hsa-text-link">{link.label}</ExternalLink>)}
    </div>
    <div><h4>{original.visionHeading}</h4><p>{original.vision}</p><h4>{original.missionHeading}</h4><ul>{original.mission.map(statement => <li key={statement}>{statement}</li>)}</ul></div>
  </div>;
}

function Achievements({ data }) {
  return <ul className="hsa-achievements">{data.achievements.map(achievement => <li key={achievement.title}>
    <SourceImage image={achievement.image} className="hsa-achievement-image" />
    <div><h4>{achievement.title}</h4><ExternalLink href={achievement.image.sourceUrl} className="hsa-text-link">View published image</ExternalLink></div>
  </li>)}</ul>;
}

function Updates({ data }) {
  return <div>
    <h4>Notice Board</h4>
    <ul className="hsa-notices">{data.notices.map(notice => <li key={`${notice.title}-${notice.dateParts.join('-')}`}><span>{notice.dateParts.join(' · ')}</span><strong>{notice.title}</strong></li>)}</ul>
    <p className="hsa-note">Titles and dates as published on the official homepage. The original notice links are placeholders.</p>
    <h4>Events</h4>
    <div className="hsa-events">{data.eventsVisible.map(event => <article key={`${event.title}-${event.date}`}>
      <div className={`hsa-event-images ${event.images.length > 1 ? 'hsa-image-pair' : ''}`}>{event.images.map(photo => <SourceImage image={photo} key={photo.sourceUrl} />)}</div>
      <div><p className="hsa-date">{event.date}</p><h4>{event.title}</h4><p>{event.description}</p>
        {event.sourceEntryIds.length > 1 && <p className="hsa-note">Two photographs accompany the repeated original event entry.</p>}
      </div>
    </article>)}</div>
  </div>;
}

function Testimonials({ data }) {
  return <div className="hsa-testimonials">{data.testimonials.map(testimonial => <figure key={testimonial.id}>
    <figcaption><SourceImage image={testimonial.image} className="hsa-person-image" /><div><h4>{testimonial.name}</h4><p>{testimonial.attribution}</p></div></figcaption>
    <blockquote><p>{testimonial.quote}</p></blockquote>
  </figure>)}</div>;
}

function Recruiters({ data }) {
  return <div><p className="hsa-note">Original recruiter names and logos as published in this homepage snapshot.</p>
    <ul className="hsa-recruiters">{data.recruiters.map(recruiter => <li key={recruiter.image.sourceUrl}><SourceImage image={recruiter.image} className="hsa-recruiter-image" /><span>{recruiter.name}</span></li>)}</ul>
  </div>;
}

function Campus({ data }) {
  return <div><div className="hsa-campus">{data.homepageSlides.map((slide, index) => <figure key={slide.image.sourceUrl}>
    <SourceImage image={slide.image} label={`Open original homepage photograph ${index + 1}: ${slide.title}`} />
    <figcaption>Original homepage photograph {index + 1} · {slide.title}</figcaption>
  </figure>)}</div><ExternalLink href={data.campusTour.url} className="hsa-text-link">{data.campusTour.heading}</ExternalLink></div>;
}

function Snapshot({ data }) {
  const oldFirstYear = data.correctionLog.find(entry => entry.id === 'first-year-body-link');
  return <div className="hsa-snapshot">
    <p>The complete snapshot retains the original source HTML, all {data.counts.links} original link destinations, four original event entries, image provenance and correction notes.</p>
    <a href={SNAPSHOT_URL} download="snjb-official-homepage-2026-10-14.json" className="hsa-text-link">Download complete source snapshot (JSON)</a>
    {data.correctionLog.map(entry => <div className="hsa-correction" key={entry.id}><h4>{entry.title}</h4><p>{entry.note}</p>
      {entry.id === 'animated-counter-values' && <div className="hsa-table-scroll" tabIndex={0} role="region" aria-label="Original placement counter source values"><table>
        <caption>Original counter markup · undated archival values</caption>
        <thead><tr><th scope="col">Published label</th><th scope="col">Initial HTML text</th><th scope="col">Animation target</th></tr></thead>
        <tbody>{data.placementCountersOriginal.map(counter => <tr key={counter.label}><th scope="row">{counter.label}</th><td>{counter.initialHtmlText}</td><td>{counter.animationTargetDataValue}</td></tr>)}</tbody>
      </table></div>}
    </div>)}
    <h4>{data.admissionsOriginal.heading} · original wording</h4>
    {data.admissionsOriginal.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <ul className="hsa-archival-links">{data.admissionsOriginal.links.map(link => <li key={link.url}><ExternalLink href={link.url}>{link.label}</ExternalLink>
      {link.url === oldFirstYear.originalUrl && <span>Archived original destination · <ExternalLink href={oldFirstYear.navigationUrl}>FY B.Tech destination from the official navigation</ExternalLink></span>}
    </li>)}</ul>
  </div>;
}

const CONTENT = { institutional: Institutional, achievements: Achievements, updates: Updates, testimonials: Testimonials, recruiters: Recruiters, campus: Campus, snapshot: Snapshot };

export default function HomeSourceArchive() {
  const headingId = useId(), listId = useId();
  const [expanded,setExpanded]=useState(false);
  const [data, setData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const request = useRef(null);

  useEffect(() => () => request.current?.abort(), []);

  async function loadArchive() {
    if (data || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(false);
    try {
      const snapshot = await loadHomepageSource();
      if (!controller.signal.aborted) setData(snapshot);
    } catch (failure) {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }

  function handleToggle(id, event) {
    const opened = event.currentTarget.open;
    setOpenSections(previous => ({ ...previous, [id]: opened }));
    if (opened) loadArchive();
  }

  const reviewDate = data?.metadata.reviewedOn || REVIEW_DATE;
  const formattedDate = new Date(`${reviewDate}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return <div className="home-source-archive" role="region" aria-labelledby={headingId}>
    <div className="hsa-heading"><span className="hsa-archive-icon"><Archive size={23} aria-hidden="true"/></span><h3 id={headingId}>Official homepage resources</h3><p>Published text, photographs and links from the official homepage.</p>
      <p className="hsa-provenance">Source: <ExternalLink href={data?.metadata.sourceUrl || SOURCE_URL}>snjb.org/engineering/</ExternalLink><span>Reviewed <time dateTime={reviewDate}>{formattedDate}</time></span></p>
      <button className="hsa-expand-records" aria-expanded={expanded} aria-controls={listId} onClick={()=>setExpanded(value=>!value)}>{expanded?'Close original records':'Explore original records'}<ChevronDown size={17} aria-hidden="true"/></button>
    </div>
    <div className="hsa-disclosures" id={listId} hidden={!expanded}>{DISCLOSURES.map(([id, label]) => {
      const Content = CONTENT[id];
      const Icon={institutional:BookOpen,achievements:BadgeCheck,updates:Newspaper,testimonials:Quote,recruiters:Users,campus:Images,snapshot:FileCheck2}[id];
      const description={institutional:'Identity & institutional purpose',achievements:'9 published records',updates:'2 notices · 3 unique events',testimonials:'10 complete voices',recruiters:'34 published marks',campus:'4 source photographs & tour',snapshot:'Original links & correction notes'}[id];
      return <details key={id} className="hsa-disclosure" onToggle={event => handleToggle(id, event)}>
        <summary><Icon size={18} aria-hidden="true"/><span className="hsa-record-title">{label}<small>{description}</small></span><span className="hsa-plus" aria-hidden="true">+</span></summary>
        {openSections[id] && <div className="hsa-disclosure-body" aria-busy={loading}>
          {data ? <Content data={data} /> : error ? <div className="hsa-load-state" role="alert"><p>The official homepage snapshot could not be loaded.</p><button type="button" onClick={loadArchive}>Try again</button><ExternalLink href={SOURCE_URL}>Open the official homepage</ExternalLink></div> : <p className="hsa-load-state" role="status"><span className="hsa-load-spinner" aria-hidden="true"/>Loading original records…</p>}
        </div>}
      </details>;
    })}</div>
  </div>;
}
