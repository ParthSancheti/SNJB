import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, BookOpen, ChevronDown, Compass, FlaskConical, GraduationCap, Library, FileText, Send, Minus, Plus, Wrench, Code2, BrainCircuit, Construction, Radio, Cog, Target, HeartHandshake, Sparkles, CalendarDays, BadgeIndianRupee, BedDouble, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { Reveal, ArrowLink, Button, Photo } from '../components/ui.jsx';
import CinematicHero from '../components/CinematicHero.jsx';
import PlacementChart from '../components/PlacementChart.jsx';
import ContentRail from '../components/ContentRail.jsx';
import CampusGallery from '../components/CampusGallery.jsx';
import NewsStrip from '../components/NewsStrip.jsx';
import HomeSourceArchive from '../components/HomeSourceArchive.jsx';
import HomeContentSpotlight from '../components/HomeContentSpotlight.jsx';
import publishedOutcomes from '../data/outcomes.json';
import publishedIntake from '../data/admissions-v10.json';
import { resolveDeliveryImage } from '../data/visual-assets.js';
import './home-refinement.css';

const official = 'https://snjb.org/engineering';
const externalProps = { target: '_blank', rel: 'noopener noreferrer' };
const branches = [
  ['Computer Engineering', 'Software, systems and computing.', '/computer-engineering', 'computer'],
  ['Artificial Intelligence & Data Science', 'Intelligence, data and emerging applications.', `${official}/artificial-intelligence-data-science/vision-and-mission-aids`, 'data'],
  ['Civil Engineering', 'Structures, infrastructure and the built environment.', `${official}/civil-engineering/vision-and-mission-civil`, 'civil'],
  ['Electronics & Telecommunication', 'Electronics, signals and communication systems.', `${official}/electronics-telecommunication/vision-and-mission-entc`, 'electronics'],
  ['Mechanical Engineering', 'Design, manufacturing and mechanical systems.', `${official}/mechanical-engineering/vision-and-mission-mechanical`, 'mechanical'],
];
const photoCredits = [
  ['Computer · Godfrey Atima', 'https://www.pexels.com/photo/programming-code-on-computer-screen-5223887/'],
  ['Data · Lukas Blazek', 'https://www.pexels.com/photo/turned-on-laptop-computer-577195/'],
  ['Civil · Chris F', 'https://www.pexels.com/photo/concrete-bridge-over-river-8331319/'],
  ['Electronics · ClickerHappy', 'https://www.pexels.com/photo/shallow-focus-photography-of-black-circuit-board-1448561/'],
  ['Mechanical · Freek Wolsink', 'https://www.pexels.com/photo/industrial-robot-arm-in-a-manufacturing-facility-34207359/'],
];
const recognition = [
  { title: 'NAAC A+', detail: 'Accreditation published in 2023', image: '/images/homepage-source/7NAAC-4657eb80d6.jpg', href: `${official}/naac/criterion-i` },
  { title: 'NBA accreditation', detail: 'Civil, E&TC and MBA · 2025', image: '/images/homepage-source/3NBA-4ff8482b69.jpg', href: `${official}/iqac/nba` },
  { title: 'UGC recognition', detail: 'Section 12B recognition · 2026', image: '/images/homepage-source/2UGC-69a495e2cb.png', href: `${official}/approvals-regulations-and-achievements/ugc` },
];
const resources = [
  { title: 'IDEA Lab', description: 'Explore published lab activities.', label: 'Explore the lab', Icon: Wrench, href: `${official}/home-idea-lab` },
  { title: 'Student projects', description: 'Published work from Computer Engineering.', label: 'View projects', Icon: FlaskConical, href: '/computer-engineering#dept-projects' },
  { title: 'Syllabi & curriculum', description: 'Find your cohort’s academic resources.', label: 'Find your syllabus', Icon: BookOpen, href: `${official}/syllabi-autonomy` },
  { title: 'College library', description: 'Search the college’s library collection.', label: 'Search the library', Icon: Library, href: 'https://opac.snjb.org/' },
];
const campusServices = [
  ['Student life', 'Associations, sport and service.', [
    ['Student council', `${official}/student-corner/student-council`],
    ['Sports', `${official}/student-corner/sports-section`],
    ['NSS', `${official}/student-corner/nss`],
    ['SPACE · Computer students', `${official}/computer-engineering/students-association-computer`],
  ]],
  ['Your everyday resources', 'Academic tools, support and wellbeing.', [
    ['Academic calendar', `${official}/academics/academic-calendar-academics`],
    ['Scholarships', `${official}/student-corner/scholarships`],
    ['Student welfare', `${official}/student-corner/student-welfare`],
    ['Student ERP', 'https://mysnjb.edupluscampus.com/'],
  ]],
  ['Stay connected', 'Learning, alumni and new ideas.', [
    ['Research & development', `${official}/research-ipr`],
    ['Alumni portal', 'https://alumni.snjb.org/'],
    ['NPTEL local chapter', `${official}/student-corner/nptel-swayam-local-chapter`],
    ['Impetus magazine', `${official}/uploads/media/2026/04/Impetus_2024-25.pdf`],
  ]],
];
const routes = {
  first: { title: 'First-year B.Tech', text: 'Check current eligibility, required documents and the published admission process.', href: `${official}/admissions/fy-btech` },
  direct: { title: 'Direct second year', text: 'Find the admission process for eligible diploma and other qualifying applicants.', href: `${official}/admissions/direct-second-year-engineering` },
  pg: { title: 'Postgraduate study', text: 'Explore the college’s published M.Tech and MBA information.', href: `${official}/mtech` },
};
const faqs = [
  ['Which engineering programmes can I explore?', 'Explore the five undergraduate branches above. Each programme links to its department information, with faculty, academic resources and activities to discover.'],
  ['Where do I check eligibility and the admission process?', 'Use the current FY B.Tech information or the Direct Second Year Engineering page for your route. Confirm the applicable academic year and admission authority requirements.'],
  ['Where can I find approved fees and scholarships?', 'The links here open the college’s AY 2026–27 fee resources and scholarship information. Check the published eligibility and conditions for your route.'],
  ['How do I find a resource that is not on this page?', 'Open All college resources to browse academic information, departments, approvals, examinations, student support and official documents. You can also use the search in the header.'],
];
export function InstitutionalPurpose() {
  return <section className="h11-purpose purpose-v12" id="vision-mission" aria-labelledby="purpose-title"><header><p className="h8-eyebrow">WHAT GUIDES US</p><h3 id="purpose-title">Knowledge with purpose.</h3></header><div className="purpose-v12-vision"><h4 className="purpose-vision-heading"><Target size={21} aria-hidden="true"/><span>Our vision</span></h4><p>Transform young aspirant learners towards creativity and professionalism for societal growth through quality technical education.</p><span aria-hidden="true">ज्ञान</span></div><div className="purpose-v12-mission"><h4><Compass size={20} aria-hidden="true"/>Our mission</h4><ol>{[
    'To transfer the suitable technology, particularly for rural development.',
    'To enhance diverse career opportunities among students for building nation.',
    'To acquire the environment of learning to bridge the gap between industry and academics.',
    'To share values, ideas, beliefs by encouraging faculties and students for welfare of society.'
  ].map((text,i)=><li key={text}><span aria-hidden="true">0{i+1}</span><p>{text}</p></li>)}</ol></div></section>;
}
function FieldIcon({field}){const Icon={computer:Code2,data:BrainCircuit,civil:Construction,electronics:Radio,mechanical:Cog}[field]||GraduationCap;return <span className="field-icon-v12"><Icon size={21} aria-hidden="true"/></span>}
function PublishedRecognitions() {
  const [data,setData]=useState(null), [error,setError]=useState(false), [retry,setRetry]=useState(0);
  useEffect(()=>{let live=true;fetch('/data/homepage-recognitions-v10.json').then(response=>{if(!response.ok)throw new Error('Records unavailable');return response.json()}).then(value=>{if(value.entries.length!==9)throw new Error('Incomplete records');if(live){setData(value);setError(false)}}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[retry]);
  return <div className="h11-recognition-history">{data?<ContentRail title="Our recognition, through the years." label="ALL 9 PUBLISHED ACHIEVEMENTS · 2020–2026" count={data.entries.length} className="recognition-rail">{data.entries.map(entry=><article key={entry.title}><a href={entry.sourceImage} {...externalProps}><img src={entry.imagePath} alt="" width="90" height="75" loading="lazy" decoding="async"/><h4>{entry.title}</h4><span>View published record<ArrowUpRight size={16}/></span></a></article>)}</ContentRail>:<p role="status">{error?'Recognition records couldn’t load.':'Loading published recognition records…'}{error&&<button onClick={()=>setRetry(value=>value+1)}>Try again</button>}</p>}<p className="h8-note">As published by SNJB. Historical recognition does not imply current accreditation for every programme.</p></div>;
}
export function CampusResources() {
  return <div className="h10-campus-services services-v12" aria-label="Campus life and student services">{campusServices.map(([title, description, links],i) => <section key={title}><div className="services-v12-photo"><img src={['/images/campus-life.webp','/images/library.webp','/images/project-lab.webp'][i]} alt={['Published SNJB student tree-plantation activity','Published SNJB library photograph','Published SNJB project laboratory photograph'][i]} width="700" height="460" loading="lazy"/></div><header><span><strong>{title}</strong><small>{description}</small></span><Compass size={18} aria-hidden="true" /></header><div>{links.map(([label, href],j) => {const Icon=[HeartHandshake,BookOpen,Sparkles][i];return <a href={href} key={label} {...externalProps}><Icon size={16} aria-hidden="true"/><span>{label}</span><ArrowUpRight size={16} aria-hidden="true" /></a>})}</div></section>)}</div>;
}
export function PostgraduateRoutes() {
  return <div className="h8-postgraduate h10-postgraduate"><div className="h10-pg-intro"><p className="h8-eyebrow">Postgraduate & research</p><h3>Go further in your field.</h3><p>Choose a route, then check its current eligibility and admission notice.</p></div><div className="h10-pg-routes">{[
    ['M.Tech', 'Civil, Computer, E&TC and Mechanical · see published intake and admission information.', `${official}/mtech`],
    ['MBA', 'Management study · see eligibility, documents and the admission process.', `${official}/admissions/mba`],
    ['Ph.D.', 'Research centre · see supervisors, subject areas and admission circulars.', `${official}/phd`],
  ].map(([name, description, href]) => <a href={href} {...externalProps} key={name}><span><h4>{name}</h4><p>{description}</p></span><ArrowUpRight size={20} aria-hidden="true" /></a>)}</div></div>;
}
export function UndergraduateIntake() {
  return <details className="h10-ug-intake"><summary><span>Published B.Tech intake · {publishedIntake.academicYear}</span><ChevronDown size={17} aria-hidden="true" /></summary><ul>{publishedIntake.rows.map(row => <li key={row.name}><span>{row.name}</span><strong>{row.totalIncludingTFWS}<small>including TFWS</small></strong></li>)}</ul><p className="h8-note">Sanctioned intake, not available seats. Use the current FY B.Tech page for the category breakdown and admission process.</p><ArrowLink href={publishedIntake.source} external>Intake & admission details</ArrowLink></details>;
}
function PlacementDetails({ year, scope, rows }) {
  return <details className="h10-placement-details"><summary><span>See the department breakdown</span><ChevronDown size={17} aria-hidden="true" /></summary><p className="h8-note">{year} · {scope === 'engineering' ? 'Five engineering departments' : 'All departments, including MBA'}. Maximum package amounts are shown in rupees, as labelled in the source.</p><div className="h10-placement-table" role="region" aria-label={`Department placement details ${year}`} tabIndex={0}><table><caption className="sr-only">Published department placement counts and maximum packages for {year}</caption><thead><tr><th scope="col">Department</th><th scope="col">Placed</th><th scope="col">Offers</th><th scope="col">Maximum package</th></tr></thead><tbody>{rows.map(row => <tr key={row.sourceName}><th scope="row">{row.name}</th><td>{row.placements}</td><td>{row.offers ?? '—'}</td><td>₹{row.maximumPackageRupees.toLocaleString('en-IN')}</td></tr>)}</tbody></table></div>{rows.some(row => row.offers === null) && <p className="h8-note">— Offer counts were not published for this year.</p>}</details>;
}
function CollegePlacementHistory() {
  return <details className="h10-placement-history"><summary>College placement totals, 2022–2026<ChevronDown size={17} aria-hidden="true" /></summary><div className="h10-trend-grid">{publishedOutcomes.annualTrend.map(record => <div key={record.year}><span>{record.year}{record.sourceMarker}</span><strong>{record.placements}</strong><small>Reported placements</small></div>)}</div><p className="h8-note">College totals include MBA. The annual source marks 2025–26 with an asterisk and does not explain that marker.</p><ArrowLink href={publishedOutcomes.annualSource} external>Annual placement record</ArrowLink></details>;
}
function CareerOutcomes({ internal }) {
  const reduced=useReducedMotion();
  const [year, setYear] = useState('2025–26');
  const [scope, setScope] = useState('engineering');
  const record = publishedOutcomes.years[year];
  const outcome = scope === 'engineering' ? record.engineering : record;
  const rows = record.departments.filter(row => scope === 'college' || row.sourceName !== 'MBA');
  const maximum = Math.max(...rows.map(row => row.maximumPackageRupees));
  return <section className="h8-section h8-outcomes" id="outcomes"><div className="h8-container">
    <Reveal><Heading number="04" label="Careers & placements" title="See where it can lead."><label className="h8-year"><span>Academic year</span><select value={year} onChange={event => setYear(event.target.value)} aria-label="Placement academic year"><option>2025–26</option><option>2024–25</option></select><ChevronDown size={16} aria-hidden="true" /></label></Heading><p className="h8-section-intro">Explore the published outcomes for your field, alongside the people who help you prepare.</p></Reveal>
    <div className="outcomes-v12-composition"><div className="h8-outcome-layout"><Reveal className="h8-outcome-record">
      <div className="h10-outcome-scope" role="group" aria-label="Placement programme scope"><button aria-pressed={scope === 'engineering'} onClick={() => setScope('engineering')}>Engineering</button><button aria-pressed={scope === 'college'} onClick={() => setScope('college')}>Entire college</button></div>
      <p className="h8-record-year">{scope === 'engineering' ? 'Five engineering departments' : 'All departments · includes MBA'} · {year}{record.sourceMarker}</p>
      <motion.div key={`${year}-${scope}`} className="h8-outcome-numbers" initial={false} animate={reduced?{opacity:1,y:0,filter:'blur(0px)'}:{opacity:[.25,1],y:[7,0],filter:['blur(3px)','blur(0px)']}} transition={{duration:.24}} aria-live="polite" aria-atomic="true"><div><strong>{outcome.placements}</strong><span>Reported placements</span></div><div><strong>{outcome.offers ?? '—'}</strong><span>{outcome.offers === null ? 'Offer total not published' : 'Reported offers'}</span></div></motion.div>
      <div className="h10-maximum-package"><strong>₹{(maximum / 100000).toLocaleString('en-IN')} lakh</strong><span>Maximum published package<br />{scope === 'engineering' ? 'Engineering departments' : 'All departments, including MBA'}</span></div>
      <p className="h8-note">{scope === 'engineering' ? 'Five engineering branches; MBA excluded.' : 'College totals include MBA.'} Placements and offers are separate published counts.</p>
      <PlacementDetails year={year} scope={scope} rows={rows} />
      <ArrowLink href={publishedOutcomes.source} external>Verify the published statistics</ArrowLink>
    </Reveal><Reveal className="h8-career" delay={.06}>
      <p className="h8-eyebrow">Training & Placement Cell</p><h3>Prepare for what’s next.</h3><p className="h8-body">Explore training support, published outcomes and the college’s placement contacts.</p>
      <ArrowLink href={`${official}/placements/about-placement-cell`} external>Meet the placement cell</ArrowLink>
      <a className="h8-career-department" href="/computer-engineering#dept-careers" onClick={internal('/computer-engineering#dept-careers')}>Computer Engineering outcomes<ArrowUpRight size={17} aria-hidden="true" /></a>
      <a className="h8-career-department" href="mailto:tpocoe@snjb.org"><span>Talk to the placement team<small>tpocoe@snjb.org</small></span><ArrowUpRight size={17} aria-hidden="true" /></a>
      <CollegePlacementHistory />
    </Reveal></div><PlacementChart rows={rows} year={year}/></div>
    <p className="h8-note h10-outcomes-note">Checked against SNJB’s department and annual records on 14 October 2026. These counts are not a placement rate. * The annual source marks 2025–26 with an asterisk without explaining it.</p>
    <HomeContentSpotlight mode="recruiters" />
  </div></section>;
}
function CampaignPhotography() {
  return <details className="h8-image-treatment"><summary>Campaign photography · AI lighting treatment<ChevronDown size={15} aria-hidden="true" /></summary><p>AI-treated campaign versions of SNJB’s published photographs. Fine details may be reinterpreted; these images are not records of facilities.</p><div><a href="/images/orientation.webp" {...externalProps}>Original orientation photograph<ArrowUpRight size={14} aria-hidden="true" /></a><a href="/images/campus-life.webp" {...externalProps}>Original campus photograph<ArrowUpRight size={14} aria-hidden="true" /></a><a href="/campaign/v8/provenance.json" {...externalProps}>Image sources & treatment prompt<ArrowUpRight size={14} aria-hidden="true" /></a></div></details>;
}
function Heading({ number, label, title, children }) {
  return <div className="h8-heading"><div><p className="h8-eyebrow">{number} / {label}</p><h2>{title}</h2></div>{children}</div>;
}

export default function Home({ navigate, onAsk, motionEnabled = true }) {
  const [level, setLevel] = useState('ug');
  const [route, setRoute] = useState('first');
  const [faq, setFaq] = useState(null);
  const reduced = useReducedMotion();
  const internal = href => event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(href, event);
  };
  return <div className="homepage homepage-v8 homepage-v10 homepage-v12">
    <CinematicHero navigate={navigate} title={'SNJB\nCollege of Engineering'} motionEnabled={motionEnabled} eyebrow="Chandwad, Nashik · Since 2004" tagline="Vision Through Knowledge. Life Through Character." poster="/media/campus-poster-desktop-v10.webp" posterMobile="/media/campus-poster-mobile-v10.webp" posterAlt="SNJB campus aerial from the archival 2019 film, with a vibrant warm colour grade" video actions={[{ label: 'Programmes', href: '#programmes' }, { label: 'Admissions', href: '#admissions' }]} mediaCaption="Campus film · 2019 · Vibrant grade" />
    <div className="h8-container h8-wayfinding-wrap"><nav className="h8-wayfinding" aria-label="Popular college resources">{[
      ['Programmes','Find your discipline.',GraduationCap,'/#programmes'],['Admissions','Choose your next step.',Send,'/apply'],['Fees 2026–27','Published fees & details.',FileText,`${official}/fra-fees-structure-ay2026-27`],['All resources','The complete college directory.',Compass,'/explore']
    ].map(([name,description,Icon,href])=><a key={name} href={href} {...(href.startsWith('/')?{onClick:internal(href)}:externalProps)}><Icon size={25}/><span><strong>{name}</strong><small>{description}</small></span><ArrowUpRight size={20}/></a>)}</nav><NewsStrip navigate={navigate}/></div>

    <section className="h8-section h8-campus" id="campus"><div className="h8-container"><Reveal><Heading number="01" label="Our college" title="A real sense of place."><a className="h11-tour-pill" href="https://snjb.org/tour/" {...externalProps}><Compass size={20}/>Explore the 360° tour<ArrowUpRight size={18}/></a></Heading></Reveal><div className="h8-campus-layout"><Reveal className="h8-campus-copy"><div id="about"><p className="h8-place">Chandwad, Nashik · Maharashtra</p><h3>SNJB’s College<br />of Engineering.</h3><p className="h8-body">An autonomous college in the Jain Gurukul campus, affiliated to Savitribai Phule Pune University. Established in 2004, with MBA added in 2010 and AI & Data Science in 2020.</p><div className="h8-credentials"><span>AICTE approved</span><span>Government of Maharashtra approved</span></div><a className="h11-tour-pill h11-know" href={`${official}/about-us/about-engineering`} {...externalProps}>Get to know SNJB<ArrowUpRight size={17}/></a></div></Reveal><Reveal className="h8-campus-photos" delay={.06}><CampusGallery navigate={navigate}/><CampaignPhotography/></Reveal></div><InstitutionalPurpose/><Reveal><PublishedRecognitions/></Reveal></div></section>

    <section className="h8-section h8-study" id="programmes"><div className="h8-container"><Reveal><Heading number="02" label="Study" title="Find your field."><div className="h8-segmented" aria-label="Programme level"><button aria-pressed={level === 'ug'} onClick={() => setLevel('ug')}>Undergraduate</button><button aria-pressed={level === 'pg'} onClick={() => setLevel('pg')}>Postgraduate</button></div></Heading><p className="h8-section-intro">Explore the discipline that interests you. Start with the subject, then meet the department.</p></Reveal>{level === 'ug' ? <div className="h8-programmes">{branches.map(([name, description, href, photo], index) => <Reveal key={name} delay={index * .025}><motion.a href={href} className={`h8-programme ${index === 0 ? 'h8-programme-featured' : ''}`} onClick={index === 0 ? internal(href) : undefined} {...(index === 0 ? {} : externalProps)} whileHover={reduced ? undefined : { y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}><span className="h8-programme-image"><img src={resolveDeliveryImage(`/subjects/${photo}.webp`)} alt="" width="80" height="80" loading="lazy" decoding="async" /></span><span className="h8-programme-copy"><FieldIcon field={photo}/><h3>{name}</h3><p>{description}</p>{index === 0 && <span className="h8-local-label">Faculty, labs and student work</span>}</span><ArrowUpRight size={20} aria-hidden="true" /></motion.a></Reveal>)}</div> : <Reveal><PostgraduateRoutes /></Reveal>}{level === 'ug' && <UndergraduateIntake />}<details className="h8-photo-credits"><summary>About the discipline photographs<ChevronDown size={16} aria-hidden="true" /></summary><p>Representative discipline imagery, AI-treated from photographs outside SNJB. It does not depict SNJB facilities.</p><div><a href="/campaign/v8/subjects/provenance.json" {...externalProps}>Image treatments & sources<ArrowUpRight size={14} aria-hidden="true" /></a>{photoCredits.map(([label, href]) => <a key={label} href={href} {...externalProps}>{label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div></details></div></section>

    <section className="h8-section h8-learning" id="learning"><div className="h8-container"><Reveal><Heading number="03" label="Learning & discovery" title="Make room for ideas."><ArrowLink href="/computer-engineering#dept-labs" onClick={internal('/computer-engineering#dept-labs')}>Explore the laboratories</ArrowLink></Heading><p className="h8-section-intro">Start with the resources you’ll use every day. Explore the lab, see student work, find your syllabus or open the library.</p></Reveal><div className="h8-learning-grid">{resources.map(({ title, description, label, Icon, href }, index) => <Reveal key={title} delay={index * .03}><a href={href} {...(href.startsWith('/') ? { onClick: internal(href) } : externalProps)} className={`h8-resource-card h11-resource-${index}`}><img className="h11-resource-image" src={resolveDeliveryImage(['/images/computer-lab.webp','/images/project-lab.webp','/images/programming-lab.webp','/images/library.webp'][index])} alt="" width="600" height="400" loading="lazy"/><small className="h11-image-note">{index===0?'Computer lab · AI-treated':'Published SNJB photograph'}</small><span className="h8-resource-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p><span className="h8-resource-action">{label}<ArrowUpRight size={17} aria-hidden="true" /></span></a></Reveal>)}</div><CampusResources /></div></section>

    <CareerOutcomes internal={internal} />

    <section className="h8-section h8-updates" id="updates"><div className="h8-container"><Reveal><Heading number="05" label="Campus journal" title="The people. The moments."><p className="h8-section-intro">Dates, stories and voices from the SNJB community.</p></Heading></Reveal><HomeContentSpotlight mode="journal" /></div></section>

    <section className="h8-section h8-admissions" id="admissions"><div className="h8-container"><Reveal><div className="h8-admission-panel"><div className="h8-admission-main"><p className="h8-eyebrow">06 / Admissions</p><h2>Find your place.<br />Build your future.</h2><p className="h8-body">Choose your route. Start with the official details.</p><div className="h8-admission-tabs" aria-label="Admission route">{[['first', 'First year'], ['direct', 'Direct second year'], ['pg', 'Postgraduate']].map(([value, label]) => <button key={value} aria-pressed={route === value} onPointerEnter={event=>{if(event.pointerType==='mouse')setRoute(value)}} onFocus={()=>setRoute(value)} onClick={() => setRoute(value)}>{label}</button>)}</div><motion.div key={route} className="h8-admission-route" initial={reduced?false:{opacity:0,y:8,filter:'blur(4px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:.22}}><h3>{routes[route].title}</h3><p>{routes[route].text}</p><Button href={routes[route].href} external>Admission information</Button>{route === 'pg' && <ArrowLink href={`${official}/admissions/mba`} external>MBA admissions</ArrowLink>}</motion.div></div><div className="h8-admission-resources"><h3>Before you apply.</h3>{[['Eligibility & process', routes[route].href,FileText], ['Fees · AY 2026–27', `${official}/fra-fees-structure-ay2026-27`,BadgeIndianRupee], ['Scholarships & support', `${official}/student-corner/scholarships`,HeartHandshake], ['Hostel information', `${official}/admissions/hostels`,BedDouble], ['College contacts', `${official}/about-us/contact-us`,MapPin]].map(([label, href, Icon]) => <a href={href} key={label} {...externalProps}><Icon size={19} aria-hidden="true"/><span>{label}</span><ArrowUpRight size={18} aria-hidden="true" /></a>)}<div className="h8-admission-contact"><span>College office</span><a href="tel:+912556253750"><Phone size={18} aria-hidden="true"/>+91 2556 253750<ArrowUpRight size={17} aria-hidden="true" /></a><small>Confirm the relevant contact for your admission route.</small></div></div></div></Reveal><div className="h8-faq"><Reveal><p className="h8-eyebrow">A little clarity</p><h3>Where do I start?</h3><button className="arrow-link" onClick={onAsk}>Open the SNJB guide<ArrowUpRight size={17} aria-hidden="true" /></button></Reveal><div>{faqs.map(([question, answer], index) => <div className="h8-faq-item" key={question}><button onClick={() => setFaq(faq === index ? null : index)} aria-expanded={faq === index} aria-controls={`faq-answer-${index}`}><span>{question}</span>{faq === index ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</button><div id={`faq-answer-${index}`} hidden={faq !== index}><p>{answer}</p>{index === 3 && <ArrowLink href="/explore" onClick={internal('/explore')}>All college resources</ArrowLink>}</div></div>)}</div></div><Reveal><div className="h8-resource-directory"><div><Compass size={23} aria-hidden="true" /><h3>One college. Everything connected.</h3><p>All original navigation sections: academics, examinations, approvals, departments and student support.</p></div><Button href="/explore" onClick={internal('/explore')} variant="outline">All college resources</Button></div></Reveal><HomeSourceArchive /></div></section>
  </div>;
}
