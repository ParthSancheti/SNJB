import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, BookOpen, Building2, Check, Compass, FileText, GraduationCap, MapPin, Phone, Route, School, Wallet } from 'lucide-react';
import { CampusResources, PostgraduateRoutes } from './Home.jsx';
import HomeContentSpotlight from '../components/HomeContentSpotlight.jsx';
import publishedIntake from '../data/admissions-v10.json';
import './visitor-v12.css';

const source = 'https://snjb.org/engineering';
const external = { target: '_blank', rel: 'noopener noreferrer' };
const routes = [
  ['First-year B.Tech', 'Start after Class 12. Check the published eligibility, documents and admission process.', `${source}/admissions/fy-btech`, GraduationCap],
  ['Direct second year', 'Choose the route for eligible diploma and other qualifying applicants.', `${source}/admissions/direct-second-year-engineering`, Route],
  ['Postgraduate study', 'Find the published M.Tech information and admission notices.', `${source}/mtech`, BookOpen],
];

function ResourceLinks({ campus }) {
  const links = campus ? [
    ['Hostel information', 'Accommodation details from the college.', `${source}/admissions/hostels`, Building2],
    ['360° campus tour', 'Take a look around before your visit.', 'https://snjb.org/tour/', Compass],
    ['College contacts', 'Find the relevant college office.', `${source}/about-us/contact-us`, Phone],
  ] : [
    ['Fees · 2026–27', 'Published fee information for the academic year.', `${source}/fra-fees-structure-ay2026-27`, Wallet],
    ['Scholarships', 'Check the published schemes and conditions.', `${source}/student-corner/scholarships`, GraduationCap],
    ['Hostel information', 'Explore the published accommodation details.', `${source}/admissions/hostels`, Building2],
    ['College contacts', 'Find the right team for your question.', `${source}/about-us/contact-us`, Phone],
  ];
  return <section className="visitor-links" aria-labelledby="visitor-links-title">
    <div className="visitor-section-heading"><p className="h8-eyebrow">{campus ? 'BEFORE YOU VISIT' : 'THE PRACTICAL DETAILS'}</p><h2 id="visitor-links-title">{campus ? 'A little planning. A better visit.' : 'Before you apply.'}</h2></div>
    <div className="visitor-link-grid">{links.map(([label, description, href, Icon]) => <a key={href} href={href} {...external}><span className="visitor-link-icon"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div>
    {!campus && <a className="visitor-office" href="tel:+912556253750"><Phone size={19} aria-hidden="true" /><span><small>College office</small><strong>+91 2556 253750</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>}
  </section>;
}

export default function VisitorPage({ kind, navigate }) {
  const [route, setRoute] = useState(0);
  const reduced = useReducedMotion();
  const campus = kind === 'campus';
  const SelectedIcon = routes[route][3];
  const internal = event => { if (!event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate('/explore', event); } };
  return <article className={`visitor-page visitor-v12 homepage-v8 homepage-v10 visitor-${kind}`}>
    <div className="h8-container">
      <header className="visitor-intro">
        <p className="h8-eyebrow"><span className="visitor-page-symbol">{campus ? <School size={16} aria-hidden="true" /> : <GraduationCap size={16} aria-hidden="true" />}</span>{campus ? 'LIFE AT SNJB' : 'YOUR NEXT CHAPTER'}</p>
        <h1>{campus ? <>A place to learn.<br /><span>A place to belong.</span></> : <>Find your place.<br /><span>Build your future.</span></>}</h1>
        <p>{campus ? 'Find your community, your everyday essentials and the stories that bring college life together.' : 'Choose your study route. Find the official details. Take the next step with clarity.'}</p>
      </header>
      {campus ? <>
        <figure className="visitor-banner"><img src="/images/campus-wide.webp" alt="Published photograph of SNJB College of Engineering’s circular campus building" width="1349" height="533" fetchPriority="high" /><figcaption><MapPin size={16} aria-hidden="true" /><span>Chandwad, Nashik</span><small>Published SNJB photograph</small></figcaption></figure>
        <section className="visitor-v12-services" aria-labelledby="campus-essentials-title"><div className="visitor-section-heading"><p className="h8-eyebrow">MAKE IT YOUR CAMPUS</p><h2 id="campus-essentials-title">People. Places. Possibilities.</h2><p>A starting point for the things that matter outside the classroom.</p></div><CampusResources /><p className="visitor-photo-note">Student service photographs are from SNJB’s published campus, library and project laboratory records.</p></section>
        <ResourceLinks campus />
        <section className="visitor-journal" aria-labelledby="visitor-journal-title"><div className="visitor-section-heading"><p className="h8-eyebrow">THE COMMUNITY</p><h2 id="visitor-journal-title">Life, as it happens.</h2><p>Published events, college notices and voices from the SNJB community.</p></div><HomeContentSpotlight mode="journal" /></section>
      </> : <>
        <section className="visitor-application" aria-labelledby="visitor-admission-heading">
          <div className="visitor-application-heading"><span className="visitor-step-number">01</span><div><p className="h8-eyebrow">START WITH YOUR ROUTE</p><h2 id="visitor-admission-heading">What comes next for you?</h2></div></div>
          <div className="h8-segmented" role="group" aria-label="Choose your admission route">{routes.map(([name, , , Icon], i) => <button key={name} aria-pressed={route === i} onClick={() => setRoute(i)}><Icon size={18} aria-hidden="true" /><span>{name}</span>{route === i && <Check size={14} className="visitor-route-check" aria-hidden="true" />}</button>)}</div>
          <AnimatePresence mode="wait" initial={false}><motion.div className="visitor-route" key={route} initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : .16 }}>
            <span className="visitor-route-symbol"><SelectedIcon size={27} strokeWidth={1.7} aria-hidden="true" /></span><div><h2>{routes[route][0]}</h2><p>{routes[route][1]}</p><a className="button button-outline" href={routes[route][2]} {...external}>Official admission information<ArrowUpRight size={18} aria-hidden="true" /></a></div>
          </motion.div></AnimatePresence>
          <p className="h8-note"><FileText size={15} aria-hidden="true" /><span>This preview does not accept applications. Check the official college and admission authority for eligibility, deadlines and the applicable process.</span></p>
        </section>
        <section className="visitor-intake" aria-labelledby="visitor-intake-title"><div className="visitor-section-heading"><p className="h8-eyebrow">KNOW YOUR OPTIONS</p><h2 id="visitor-intake-title">Five fields. Your starting point.</h2><p>Published programme intake, including TFWS. These figures are not a count of available seats.</p></div><div className="visitor-published-intake"><p className="visitor-intake-year"><GraduationCap size={18} aria-hidden="true" />Published B.Tech intake · {publishedIntake.academicYear}</p><ul>{publishedIntake.rows.map(row => <li key={row.name}><span>{row.name}</span><strong>{row.totalIncludingTFWS}<small>including TFWS</small></strong></li>)}</ul><a href={publishedIntake.source} {...external}>Official intake & admission details<ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
        <ResourceLinks campus={false} />
        <section className="visitor-postgraduate" aria-label="Postgraduate and research routes"><PostgraduateRoutes /></section>
      </>}
      <a className="visitor-directory" href="/explore" onClick={internal}><span className="visitor-link-icon"><Compass size={24} aria-hidden="true" /></span><span>Looking for something else?<strong>Open the college directory.</strong></span><ArrowUpRight size={20} aria-hidden="true" /></a>
    </div>
  </article>;
}
