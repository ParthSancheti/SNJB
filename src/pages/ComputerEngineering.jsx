import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Code2, Cpu, FileText, GraduationCap, Layers3, Plus, Mail, Network, Search, Sparkles, Users, X } from 'lucide-react';
import './department.css';
import directory from '../data/faculty-directory.json';
import preservedContent from '../data/department-content.json';
import EngineeringScene from '../components/EngineeringScene.jsx';
import CinematicHero from '../components/CinematicHero.jsx';

const BASE = 'https://snjb.org/engineering';
const SOURCE = {
  profile: `${BASE}/computer-engineering/vision-and-mission-computer`,
  faculty: `${BASE}/computer-engineering/people-computer`,
  roster: `${BASE}/uploads/computer-engineering/Comp_2026-27_facultylist.pdf`,
  labs: `${BASE}/computer-engineering/laboratories-computer`,
  achievements: `${BASE}/computer-engineering/achievements-computer`,
  publications: `${BASE}/uploads/computer-engineering/Comp_Publications_2025-26.pdf`,
  space: `${BASE}/computer-engineering/students-association-computer`,
  csi: `${BASE}/computer-engineering/csi-student-wing-computer`,
  placements: `${BASE}/placements/dept-placement-statistics`,
  admissions: `${BASE}/admissions/fy-btech`,
  cap: 'https://fe2026.mahacet.org/StaticPages/frmInstituteSummary?InstituteCode=05173',
  curriculum: `${BASE}/syllabi-autonomy`,
};
const SPRING = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };
const chapters = [['overview', 'Overview'], ['curriculum', 'Curriculum'], ['labs', 'Labs'], ['faculty', 'Faculty'], ['projects', 'Projects'], ['careers', 'Careers'], ['community', 'Community'], ['resources', 'Resources']];
const faculty = directory.people.map(person => ({...person, area: person.group === 'faculty' ? 'Faculty' : 'Staff'}));
const curriculum = {
  '2026–30': {
    1: { year: '2026–27', pages: 97, href: `${BASE}/uploads/computer-engineering/FY_BTech_Syllabus_Comp_2026-30.pdf`, label: 'First Year B.Tech · Computer Engineering', topics: ['Problem Solving & Programming', 'Object Oriented Programming', 'Digital Electronics & Logic Design'], note: 'Build foundations in programming, mathematical thinking and engineering practice.' },
  },
  '2025–29': {
    1: { year: '2025–26', pages: 95, href: `${BASE}/uploads/media/2025/07/41AC04.04_FY_COMPUTER.pdf`, label: 'First Year B.Tech · Computer Engineering', topics: ['Course structure', 'Learning outcomes', 'Evaluation scheme'], note: 'Open the approved document for the course sequence and assessment scheme applicable to your admission batch.' },
    2: { year: '2026–27', pages: 79, href: `${BASE}/uploads/computer-engineering/2026-27_SYBTech_COMP_2025-2029.pdf`, label: 'Second Year B.Tech · Computer Engineering', topics: ['Core curriculum', 'Practical learning', 'Evaluation scheme'], note: 'Explore the published second-year curriculum and its practical components in the official syllabus.' },
  },
  '2024–28': {
    2: { year: '2025–26', pages: 81, href: `${BASE}/uploads/media/2026/04/SY_BTech_2025-26-Computer.pdf`, label: 'Second Year B.Tech · Computer Engineering', topics: ['Core curriculum', 'Practical learning', 'Evaluation scheme'], note: 'Use this batch-specific second-year document for your courses and evaluation scheme.' },
    3: { year: '2026–27', pages: 119, href: `${BASE}/uploads/computer-engineering/TYBTech-COMP_2026-27.pdf`, label: 'Third Year B.Tech · Computer Engineering', topics: ['Programme courses', 'Practical learning', 'Evaluation scheme'], note: 'Explore the published third-year curriculum and follow the official registry for associated elective documents.' },
  },
};
const projects = [
  { title: 'Smart glass for visually impaired', category: 'Accessibility', year: '2023', icon: Sparkles, description: 'A documented design record exploring assistive technology.', record: '402134-001 · 14 December 2023', people: 'Soham S. Belokar, Rohit J. Jain, Jayesh B. Suryawanshi, Himanshu N. Ravne and collaborators', tone: 'mist' },
  { title: 'Robot for exploration', category: 'Systems', year: '2023', icon: Cpu, description: 'A department-listed design record connecting computing with physical systems.', record: '400357-001 · 21 November 2023', people: 'Kartik M. Bhavsar, Yash A. Jadhav, Aayusha S. Patil and collaborators', tone: 'peach' },
  { title: 'IoT based smart irrigation system', category: 'Systems', year: '2019', icon: Network, description: 'A historical student innovation listed in the department’s research and IPR records.', record: '201821023889 · Department record', people: 'Nilam Bafana, Khushbu Bafana, Ujwala Pagar · Guide: Prof. R. R. Bhandari', tone: 'teal' },
];
const resources = [
  { title: 'Autonomous syllabi', meta: 'Admission batch · UG', icon: BookOpen, href: SOURCE.curriculum },
  { title: 'Department downloads', meta: 'Academic documents', icon: FileText, href: `${BASE}/computer-engineering/downloads-computer` },
  { title: 'Academic calendar', meta: 'Official academic schedule', icon: GraduationCap, href: `${BASE}/academics/academic-calendar-academics` },
  { title: 'Faculty roster', meta: 'AY 2026–27 · PDF', icon: Users, href: SOURCE.roster },
  { title: 'Programme outcomes', meta: 'PEO · PO · PSO', icon: Layers3, href: SOURCE.profile },
  { title: 'Department library', meta: 'Learning resources', icon: BookOpen, href: `${BASE}/computer-engineering/department-library-computer` },
];

function DepartmentReveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.08 }} transition={reduced ? { duration: 0 } : { ...SPRING, delay: Math.min(delay, .18), opacity: { duration: .3 }, filter: { duration: .4 } }}>{children}</motion.div>;
}
function DepartmentLink({ children, href, className = '' }) {
  return <a href={href} className={`dept-text-link ${className}`} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} aria-hidden="true" /><span className="dept-sr-only"> (opens in a new tab)</span></a>;
}
function DepartmentImage({ src, alt, className = '', eager = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className={`dept-image ${className} ${loaded ? 'is-loaded' : ''} ${failed ? 'has-error' : ''}`}>
    {!loaded && !failed && <div className="dept-image-skeleton" style={{ backgroundImage: `url(${src.replace('.webp', '-preview.webp')})` }} aria-hidden="true" />}
    {!failed && <img src={src} alt={alt} srcSet={className.includes('portrait') ? undefined : `${src.replace('.webp', '-small.webp')} 600w, ${src} 1000w`} sizes="(max-width: 700px) 100vw, 60vw" loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    {failed && <div className="dept-image-fallback"><Code2 size={30} aria-hidden="true" /><span>{alt}</span></div>}
  </div>;
}
function DepartmentHeading({ label, title, text, children }) {
  return <div className="dept-section-heading"><div><p className="dept-eyebrow">{label}</p><h2>{title}</h2>{text && <p className="dept-section-intro">{text}</p>}</div>{children}</div>;
}

export default function ComputerEngineering({ onAsk, navigate }) {
  const reduced = useReducedMotion();
  const [activeChapter, setActiveChapter] = useState('overview');
  const [batch, setBatch] = useState('2026–30');
  const [year, setYear] = useState('1');
  const [facultyQuery, setFacultyQuery] = useState('');
  const [facultyArea, setFacultyArea] = useState('Everyone');
  const [expandedFaculty, setExpandedFaculty] = useState(false);
  const [projectCategory, setProjectCategory] = useState('All work');
  const [resourceQuery, setResourceQuery] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(() => window.location.hash.startsWith('#source-'));
  const document = curriculum[batch][year];
  const shownFaculty = useMemo(() => faculty.filter(person => `${person.name} ${person.role} ${person.interests.join(' ')}`.toLowerCase().includes(facultyQuery.toLowerCase()) && (facultyArea === 'Everyone' || person.area === facultyArea)), [facultyQuery, facultyArea]);
  const shownResources = resources.filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(resourceQuery.toLowerCase()));
  const hover = reduced ? {} : { scale: 1.02 };

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.startsWith('#source-')) setArchiveOpen(true);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveChapter(visible[0].target.id.replace('dept-', ''));
    }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
    chapters.forEach(([id]) => { const section = window.document.getElementById(`dept-${id}`); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  function changeBatch(next) {
    setBatch(next);
    if (!curriculum[next][year]) setYear(String(Object.keys(curriculum[next])[0]));
  }
  function goHome(event) {
    if (navigate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); navigate('/', event); }
  }

  return <div className="department-page department-v8">
    <CinematicHero navigate={navigate} title="Computer Engineering" eyebrow="SNJB / B.Tech · NBA Accredited" description="Study software, systems and connected technology through practical laboratory work and a batch-specific autonomous curriculum." poster="/campaign/learning-desktop.webp" posterMobile="/campaign/learning-phone.webp" posterAlt="SNJB Computer Science Laboratory" actions={[{ label: 'Curriculum', href: '#dept-curriculum' }, { label: 'Laboratories', href: '#dept-labs' }]} id="dept-overview" video={false} mediaCaption="SNJB Computer Engineering · Neminagar, Chandwad" />
    <section className="dept-facts-section" aria-label="Computer Engineering programme overview"><div className="container">
        <nav className="dept-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={goHome}>Engineering</a><span aria-hidden="true">/</span><span>Computer Engineering</span></nav>
        <div className="dept-programme-facts" aria-label="Programme facts">
          <div><small>Undergraduate programme</small><strong>B.Tech</strong><span>Computer Engineering</span></div>
          <div><small>Programme duration</small><strong>4 <span>years</span></strong><span>Full-time undergraduate study</span></div>
          <div><small>Intake · AY 2026–27</small><strong>180 <span>base seats</span></strong><DepartmentLink href={SOURCE.cap}>9 TFWS seats listed separately</DepartmentLink></div>
          <div><small>Academic environment</small><strong>Autonomous</strong><span>NBA Accredited · SPPU Affiliated</span></div>
        </div>
      </div></section>

    <nav className="dept-chapter-nav" aria-label="Computer Engineering page sections"><div className="container"><div className="dept-chapter-links">{chapters.map(([id, label]) => <a key={id} href={`#dept-${id}`} className={activeChapter === id ? 'is-active' : ''} aria-current={activeChapter === id ? 'location' : undefined} onClick={() => setActiveChapter(id)}>{label}</a>)}</div><a className="dept-chapter-contact" href="mailto:sanghavi.kmcoe@snjb.org"><Mail size={16} aria-hidden="true" /><span>Contact department</span></a></div></nav>

    <section className="dept-section dept-curriculum" id="dept-curriculum"><div className="container">
      <DepartmentReveal><DepartmentHeading label="ACADEMICS" title="Curriculum" text="Choose your admission batch and study year to find the corresponding official syllabus."><DepartmentLink href={SOURCE.curriculum}>All autonomous syllabi</DepartmentLink></DepartmentHeading></DepartmentReveal>
      <DepartmentReveal className="dept-curriculum-grid">
        <div className="dept-syllabus-finder"><div className="dept-finder-top"><span className="dept-eyebrow">CURRICULUM FINDER</span><span className="dept-small-badge">UG · B.Tech</span></div><div className="dept-select-row"><label>Admission batch<div className="dept-select-wrap"><select aria-label="Admission batch" value={batch} onChange={event => changeBatch(event.target.value)}>{Object.keys(curriculum).map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></div></label><label>Study year<div className="dept-select-wrap"><select aria-label="Study year" value={year} onChange={event => setYear(event.target.value)}>{[1, 2, 3, 4].map(value => <option key={value} value={value} disabled={!curriculum[batch][value]}>Year {value}{!curriculum[batch][value] ? ' · See registry' : ''}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></div></label></div>
          <AnimatePresence mode="wait"><motion.div key={`${batch}-${year}`} className="dept-syllabus-result" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.16 }} aria-live="polite"><div className="dept-document-meta"><FileText size={19} aria-hidden="true" /><span>Official syllabus · AY {document.year}</span></div><h3>{document.label}</h3><p>{document.note}</p><div className="dept-topic-list">{document.topics.map(topic => <span key={topic}>{topic}</span>)}</div><div className="dept-document-footer"><span>PDF · {document.pages} pages<br /><small>Admission batch {batch}</small></span><a href={document.href} className="dept-button dept-button-teal" target="_blank" rel="noopener noreferrer">Open syllabus<ArrowUpRight size={17} aria-hidden="true" /><span className="dept-sr-only"> (opens in a new tab)</span></a></div></motion.div></AnimatePresence>
          <p className="dept-finder-note">Need another year, minor or honours document? <a href={SOURCE.curriculum} target="_blank" rel="noopener noreferrer">Visit the official syllabus registry <span className="dept-sr-only">(opens in a new tab)</span></a>.</p>
        </div>
        <div className="dept-curriculum-story"><div className="dept-large-icon"><BookOpen size={29} strokeWidth={1.5} aria-hidden="true" /></div><h3>Your batch.<br />Your syllabus.</h3><p>Programming, systems and engineering practice come together through theory, laboratory work and assessment.</p><div className="dept-learning-principles"><span><Check size={15} aria-hidden="true" />Batch-specific documents</span><span><Check size={15} aria-hidden="true" />Published evaluation schemes</span><span><Check size={15} aria-hidden="true" />Direct official sources</span></div><DepartmentLink href={`${BASE}/mtech`}>Explore postgraduate admissions</DepartmentLink></div>
      </DepartmentReveal>
    </div></section>

    <section className="dept-section dept-labs-section" id="dept-labs"><div className="container">
      <DepartmentReveal><DepartmentHeading label="PRACTICAL LEARNING" title="Laboratories" text="A closer look at the real spaces where students learn programming, software and connected systems."><DepartmentLink href={SOURCE.labs}>Explore all laboratories</DepartmentLink></DepartmentHeading></DepartmentReveal>
      <div className="dept-lab-bento">
        <DepartmentReveal className="dept-lab-feature"><motion.article whileHover={hover} transition={SPRING} className="dept-lab-card dept-lab-image-card"><DepartmentImage src="/images/programming-lab.webp" alt="Programming laboratory in the SNJB Computer Engineering department" /><div className="dept-lab-overlay"><span className="dept-photo-label">INSIDE SNJB</span><h3>Programming Laboratory</h3><p>Explore code, solve problems and connect ideas with implementation.</p><DepartmentLink href={SOURCE.labs}>Laboratory information</DepartmentLink></div></motion.article></DepartmentReveal>
        <DepartmentReveal delay={0.05} className="dept-lab-software-wrap"><motion.article whileHover={hover} transition={SPRING} className="dept-lab-card dept-lab-software"><DepartmentImage src="/images/computer-lab.webp" alt="Students and workstations in SNJB’s Computer Science Laboratory" /><div className="dept-lab-story"><span className="dept-card-kicker">COMPUTING ENVIRONMENT</span><h3>Computer Science Laboratory</h3><DepartmentLink href={SOURCE.labs}>Laboratory resources</DepartmentLink></div></motion.article></DepartmentReveal>
        <DepartmentReveal delay={0.08} className="dept-lab-network-wrap"><article className="dept-lab-card dept-lab-network"><Network size={26} strokeWidth={1.4} aria-hidden="true" /><div><span className="dept-card-kicker">NETWORKING LABORATORY</span><h3>Networks, in practice.</h3><p>Published tools include Cisco Packet Tracer and Wireshark.</p><DepartmentLink href={SOURCE.labs}>View laboratory details</DepartmentLink></div></article></DepartmentReveal>
        <DepartmentReveal className="dept-lab-project"><motion.article whileHover={hover} transition={SPRING} className="dept-lab-card dept-lab-project-card"><DepartmentImage src="/images/project-lab.webp" alt="SNJB Computer Engineering project laboratory" /><div><span className="dept-card-kicker">APPLIED LEARNING</span><h3>Project Laboratory</h3><p>Explore the department’s published project facilities.</p><DepartmentLink href={SOURCE.labs}>Explore project facilities</DepartmentLink></div></motion.article></DepartmentReveal>
      </div><p className="dept-source-note">Laboratory descriptions follow the official department inventory. Open the source for equipment specifications.</p>
    </div></section>

    <section className="dept-section" id="dept-faculty"><div className="container">
      <DepartmentReveal><DepartmentHeading label="THE DEPARTMENT" title="Our people" text="All 27 faculty and 10 support staff from the published department directory."><DepartmentLink href={SOURCE.roster}>Faculty roster · 2026–27</DepartmentLink></DepartmentHeading></DepartmentReveal>
      <p className="directory-note">Published web-directory details are preserved. The annual faculty roster may contain newer qualifications or roles.</p><div className="dept-filter-bar"><label className="dept-search-field"><Search size={18} aria-hidden="true" /><span className="dept-sr-only">Search faculty and staff by name or interest</span><input type="search" value={facultyQuery} onChange={event => setFacultyQuery(event.target.value)} placeholder="Search name or expertise" />{facultyQuery && <button type="button" onClick={() => setFacultyQuery('')} aria-label="Clear faculty search"><X size={16} /></button>}</label><label className="dept-expertise-select"><span className="dept-sr-only">Filter faculty and staff</span><select value={facultyArea} onChange={event => setFacultyArea(event.target.value)}>{['Everyone', 'Faculty', 'Staff'].map(area => <option key={area}>{area}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label><span className="dept-filter-count" aria-live="polite">{shownFaculty.length} people</span></div>
      <div className="dept-faculty-grid">{shownFaculty.slice(0, expandedFaculty || facultyQuery || facultyArea !== 'Everyone' ? 37 : 8).map((person, index) => <DepartmentReveal key={person.id} delay={Math.min(index * 0.02,.12)}><article className="dept-faculty-card"><DepartmentImage src={person.image} alt={person.name} className="dept-faculty-portrait" /><div className="dept-faculty-info"><h3>{person.name}</h3><p>{person.role}</p><div className="person-links">{person.email && <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`}>Email<Mail size={14} aria-hidden="true" /></a>}{person.profile && <a href={person.profile} target="_blank" rel="noreferrer" aria-label={`Open ${person.name} profile (opens in a new tab)`}>Profile<ArrowUpRight size={14} aria-hidden="true" /></a>}</div></div><details className="person-record"><summary>Qualifications & published details<ChevronDown size={16} aria-hidden="true" /></summary><dl>{Object.entries(person.fields).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{person.sourceLinks?.[label] ? <a href={person.sourceLinks[label]} {...(!person.sourceLinks[label].startsWith('mailto:') ? {target:'_blank',rel:'noopener noreferrer'} : {})}>{value}{!person.sourceLinks[label].startsWith('mailto:') && <span className="dept-sr-only"> (opens in a new tab)</span>}</a> : value}</dd></div>)}</dl></details></article></DepartmentReveal>)}</div>
      {!shownFaculty.length && <div className="dept-empty-state" role="status"><Search size={26} aria-hidden="true" /><h3>No people match that search.</h3><p>Try another name or browse the complete official directory.</p><button className="dept-button dept-button-outline" onClick={() => { setFacultyQuery(''); setFacultyArea('Everyone'); }}>Reset filters</button></div>}
      <div className="dept-section-bottom">{!expandedFaculty && !facultyQuery && facultyArea === 'Everyone' && <button type="button" className="dept-button dept-button-outline" onClick={() => setExpandedFaculty(true)}>Show all 37 people<ArrowRight size={17} aria-hidden="true" /></button>}<DepartmentLink href={SOURCE.faculty}>Complete faculty directory</DepartmentLink></div>
    </div></section>

    <section className="dept-section dept-projects-section" id="dept-projects"><div className="container">
      <DepartmentReveal><DepartmentHeading label="DOCUMENTED INNOVATION" title="Student work" text="Selected historical department records, with the people, dates and source documents behind each project."><DepartmentLink href={SOURCE.achievements}>Department achievements</DepartmentLink></DepartmentHeading></DepartmentReveal>
      <div className="dept-chip-filter" aria-label="Filter documented projects">{['All work', 'Accessibility', 'Systems'].map(category => <button key={category} type="button" aria-pressed={category === projectCategory} className={category === projectCategory ? 'is-active' : ''} onClick={() => setProjectCategory(category)}>{category}</button>)}</div>
      <div className="dept-project-grid">{projects.filter(project => projectCategory === 'All work' || project.category === projectCategory).map(project => <DepartmentReveal key={project.title}><article className={`dept-project-card dept-project-${project.tone}`}><div className="dept-project-symbol" aria-hidden="true"><project.icon size={25} strokeWidth={1.4} /></div><div className="dept-project-meta"><span>{project.category}</span><span>{project.year} · Historical record</span></div><h3>{project.title}</h3><p>{project.description}</p><details><summary>People & recorded details<ChevronDown size={16} aria-hidden="true" /></summary><div><p>{project.people}</p><small>{project.record}</small></div></details><DepartmentLink href={SOURCE.achievements}>View department record</DepartmentLink></article></DepartmentReveal>)}</div>
      <DepartmentReveal className="dept-research-strip"><div className="dept-research-icon"><FileText size={26} strokeWidth={1.4} aria-hidden="true" /></div><div><p className="dept-eyebrow">RESEARCH & SCHOLARSHIP</p><h3>Research publications</h3><p>Explore the department’s published research summary for academic year 2025–26.</p></div><DepartmentLink href={SOURCE.publications}>Publication summary · PDF</DepartmentLink></DepartmentReveal>
      <p className="dept-source-note">These are published departmental records. A listed application or design number is not presented as proof of a granted patent or a deployed product.</p>
    </div></section>

    <section className="dept-computing-exploration" id="dept-computing" aria-label="Optional interactive computing exploration"><div className="container"><details className="dept-model-disclosure"><summary><Cpu size={23} strokeWidth={1.6} aria-hidden="true" /><span><strong>Explore computing in 3D</strong><small>An interactive teaching model of a processor.</small></span><Plus size={20} aria-hidden="true" /></summary><EngineeringScene mode="computer" /></details></div></section>

    <section className="dept-section dept-careers-section" id="dept-careers"><div className="container"><DepartmentReveal className="dept-careers-grid"><div className="dept-careers-copy"><p className="dept-eyebrow">AFTER GRADUATION</p><h2>Career preparation<br />&amp; outcomes.</h2><p>Connect your learning with career preparation through the college’s Training & Placement Cell.</p><DepartmentLink href={`${BASE}/placements/about-placement-cell`}>Meet the placement cell</DepartmentLink></div><div className="dept-outcome-panel"><div className="dept-outcome-heading"><span className="dept-small-badge">Computer Engineering</span><span>AY 2025–26</span></div><div className="dept-outcome-stats"><div><strong>35</strong><span>Published placements</span></div><div><strong>54</strong><span>Published offers</span></div></div><p>The official table reports offers and placements separately. Definitions and reporting cutoff are not specified; these figures are not a placement rate.</p><DepartmentLink href={SOURCE.placements}>Inspect the published statistics</DepartmentLink></div></DepartmentReveal></div></section>

    <section className="dept-section" id="dept-community"><div className="container">
      <DepartmentReveal><DepartmentHeading label="BEYOND THE CLASSROOM" title="Student community" text="Student associations and published activities from the Computer Engineering department." /></DepartmentReveal>
      <div className="dept-community-grid"><DepartmentReveal><article className="dept-space-card"><DepartmentImage src="/images/campus-life.webp" alt="SNJB Computer Engineering students taking part in a tree-plantation activity" className="dept-community-photo" /><div className="dept-community-body"><div className="dept-community-top"><span className="dept-small-badge">Student association</span><Users size={25} strokeWidth={1.5} aria-hidden="true" /></div><span className="dept-space-wordmark">SPACE<span aria-hidden="true">↗</span></span><h3>Skilled & Progressive Association<br />of Computer Engineering</h3><p>Established in 2006, SPACE brings students together for technical, cultural and social activities beyond academics.</p><div className="dept-community-event"><span className="dept-event-date"><strong>15</strong><small>SEP 2026</small></span><div><small>RECENTLY PUBLISHED ACTIVITY</small><strong>Teacher’s Day celebration</strong><span>SPACE · Computer Engineering</span></div></div><DepartmentLink href={SOURCE.space}>Explore the SPACE community</DepartmentLink></div></article></DepartmentReveal><DepartmentReveal delay={0.06}><article className="dept-csi-card"><div className="dept-community-top"><span className="dept-small-badge">Professional community</span><Network size={25} strokeWidth={1.5} aria-hidden="true" /></div><div className="dept-csi-mark" aria-hidden="true">CSI<span>NASHIK CHAPTER</span></div><h3>Computer Society of India</h3><p>Discover SNJB’s Computer Society of India student wing and its documented technical activities.</p><div className="dept-archive-note"><BookOpen size={19} aria-hidden="true" /><span>Published event archive includes 2017–22. Consult the department for current activities and participation.</span></div><DepartmentLink href={SOURCE.csi}>Read the CSI activity archive</DepartmentLink></article></DepartmentReveal></div>
    </div></section>

    <section className="dept-section dept-resources-section" id="dept-resources"><div className="container">
      <DepartmentReveal><DepartmentHeading label="ACADEMIC ESSENTIALS" title="Resources & Archival Records" text="Direct access to essential documents, academic calendars and all 16 preserved departmental web sections." /></DepartmentReveal>
      <label className="dept-search-field dept-resource-search"><Search size={18} aria-hidden="true" /><span className="dept-sr-only">Search academic resources</span><input type="search" value={resourceQuery} onChange={event => setResourceQuery(event.target.value)} placeholder="Find a resource, table or archival record…" />{resourceQuery && <button type="button" onClick={() => setResourceQuery('')} aria-label="Clear resource search"><X size={16} /></button>}</label>
      <div className="dept-resource-grid">{shownResources.map(item => <a key={item.title} className="dept-resource-card" href={item.href} target="_blank" rel="noopener noreferrer"><span className="dept-resource-icon"><item.icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowUpRight size={20} aria-hidden="true" /><span className="dept-sr-only"> (opens in a new tab)</span></a>)}</div>
      <details className="dept-archival-drawer" open={archiveOpen || Boolean(resourceQuery.trim())} onToggle={event => setArchiveOpen(event.currentTarget.open)}>
        <summary className="dept-archival-summary">
          <span>
            <strong>Complete preserved web records (16 sections · 55 tables · 146 images)</strong>
            <small>Expand to inspect the verbatim HTML tables, BoS records, toppers lists and historical department pages</small>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <div className="dept-preserved-resources">{preservedContent.sections.filter(section=>`${section.title} ${section.text}`.toLowerCase().includes(resourceQuery.toLowerCase())).map(section=><details id={`source-${section.id}`} className="dept-source-panel" key={section.id}><summary><span>{section.title}</span><Plus size={18} aria-hidden="true" /></summary><div className="imported-dept-body" tabIndex={0} role="region" aria-label={`${section.title} published content`} dangerouslySetInnerHTML={{__html:section.html}} /><a className="dept-source-link" href={section.sourceURL} target="_blank" rel="noreferrer">Original published section ↗</a></details>)}</div>
      </details>
      {!shownResources.length && !preservedContent.sections.some(section => `${section.title} ${section.text}`.toLowerCase().includes(resourceQuery.toLowerCase())) && <p className="dept-empty-resource" role="status">No resource matches “{resourceQuery}”. Try “syllabus”, “faculty” or “calendar”.</p>}
      <div className="dept-faq-grid"><div><p className="dept-eyebrow">QUESTIONS</p><h2>Useful to know.</h2><p>Get to know the programme, the documents and the people who can help.</p></div><div className="dept-faq-list">
        <details><summary>Is this Computer Science or Computer Engineering?<ChevronDown size={18} aria-hidden="true" /></summary><p>The official programme is Computer Engineering. Use that name when checking the syllabus and admission choice code. Artificial Intelligence & Data Science is a separate SNJB programme.</p></details>
        <details><summary>Which syllabus should I use?<ChevronDown size={18} aria-hidden="true" /></summary><p>Select your admission batch first, then your study year. A curriculum for another batch may follow a different course or assessment structure. <a href={SOURCE.curriculum} target="_blank" rel="noopener noreferrer">Check the official syllabus registry <span className="dept-sr-only">(opens in a new tab)</span></a>.</p></details>
        <details><summary>Where can I check intake and admissions?<ChevronDown size={18} aria-hidden="true" /></summary><p>The 2026–27 CAP institute record lists 180 base Computer Engineering seats and 9 TFWS seats separately. Check the <a href={SOURCE.cap} target="_blank" rel="noopener noreferrer">government institute record <span className="dept-sr-only">(opens in a new tab)</span></a> and <a href={SOURCE.admissions} target="_blank" rel="noopener noreferrer">SNJB FY B.Tech admissions <span className="dept-sr-only">(opens in a new tab)</span></a> for the applicable process and notices.</p></details>
        <details><summary>Who can I contact about the department?<ChevronDown size={18} aria-hidden="true" /></summary><p>Email the Head of Department at <a href="mailto:sanghavi.kmcoe@snjb.org">sanghavi.kmcoe@snjb.org</a>. For first-year admission enquiries, the current FY B.Tech page lists Prof. Pankaj Desai: <a href="tel:+919730478001">+91 97304 78001</a>.</p></details>
      </div></div>
    </div></section>

    <section className="dept-admissions-cta"><div className="container"><div><p className="dept-eyebrow">AY 2026–27</p><h2>Study Computer<br />Engineering at SNJB.</h2></div><div><a className="dept-button dept-button-primary" href="/apply" onClick={event => { if (navigate && !event.metaKey && !event.ctrlKey && event.button === 0) { event.preventDefault(); navigate('/apply', event); } }}>Admissions & enquiry form<ArrowRight size={18} aria-hidden="true" /></a>{onAsk && <button type="button" className="dept-assistant-action" onClick={() => onAsk('Tell me about Computer Engineering at SNJB')}><Sparkles size={16} aria-hidden="true" />Explore Ask SNJB</button>}<span className="dept-cta-note">Official admission information · AY 2026–27</span></div></div></section>
  </div>;
}
