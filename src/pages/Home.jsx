import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeIndianRupee,
  BedDouble,
  BookOpen,
  BrainCircuit,
  Building2,
  ChevronDown,
  Code2,
  Cog,
  Compass,
  Construction,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Library,
  MapPin,
  Minus,
  Phone,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import { Reveal, ArrowLink, Button } from '../components/ui.jsx';
import CinematicHero from '../components/CinematicHero.jsx';
import PlacementChart from '../components/PlacementChart.jsx';
import ContentRail from '../components/ContentRail.jsx';
import CampusGallery from '../components/CampusGallery.jsx';
import NewsStrip from '../components/NewsStrip.jsx';
import HomeContentSpotlight from '../components/HomeContentSpotlight.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import publishedOutcomes from '../data/outcomes.json';
import publishedIntake from '../data/admissions-v10.json';
import { resolveDeliveryImage } from '../data/visual-assets.js';
import './home-refinement.css';

const official = 'https://snjb.org/engineering';
const externalProps = { target: '_blank', rel: 'noopener noreferrer' };

const branches = [
  ['Computer Engineering', 'Software, systems and computing · NBA Accredited.', '/computer-engineering', 'computer', '189 seats · 37 faculty & staff'],
  ['Artificial Intelligence & Data Science', 'Machine learning, analytics and intelligent systems.', '/ai-data-science', 'data', '158 seats · Autonomous B.Tech'],
  ['Civil Engineering', 'Structures, infrastructure and built environment · NBA Accredited.', '/civil-engineering', 'civil', '63 seats · UG & M.Tech'],
  ['Electronics & Telecommunication', 'Embedded hardware, VLSI and communication · NBA Accredited.', '/electronics-telecommunication', 'electronics', '63 seats · UG & M.Tech'],
  ['Mechanical Engineering', 'Design, thermal systems, robotics and CAD/CAM · NBA Accredited.', '/mechanical-engineering', 'mechanical', '95 seats · B.Tech'],
  ['First-Year Engineering', 'Applied sciences, engineering mathematics and induction foundation.', '/first-year-engineering', 'science', 'Common Year 1 · All branches'],
];

const resources = [
  {
    title: 'AICTE IDEA Lab',
    description: 'Explore 24×7 prototyping, hardware fabrication and innovation activities.',
    label: 'Explore the IDEA Lab',
    Icon: Wrench,
    href: `${official}/home-idea-lab`,
    image: '/images/project-lab.webp',
    note: 'Published SNJB project laboratory',
  },
  {
    title: 'Student projects',
    description: 'Documented assistive technology, robotics and IoT innovations.',
    label: 'View student work',
    Icon: FlaskConical,
    href: '/computer-engineering#dept-projects',
    image: '/images/computer-lab.webp',
    note: 'SNJB computing laboratory',
  },
  {
    title: 'Syllabi & curriculum',
    description: 'Autonomous UG and PG course structures by admission cohort.',
    label: 'Find your syllabus',
    Icon: BookOpen,
    href: `${official}/syllabi-autonomy`,
    image: '/images/programming-lab.webp',
    note: 'Published SNJB laboratory photograph',
  },
  {
    title: 'Central library',
    description: 'Search the OPAC catalogue, digital journals and reading rooms.',
    label: 'Search the library',
    Icon: Library,
    href: 'https://opac.snjb.org/',
    image: '/images/library.webp',
    note: 'Published SNJB library photograph',
  },
];

const campusServices = [
  [
    'Student life',
    'Associations, sport and service.',
    [
      ['Student council', `${official}/student-corner/student-council`],
      ['Sports', `${official}/student-corner/sports-section`],
      ['NSS', `${official}/student-corner/nss`],
      ['SPACE · Computer students', `${official}/computer-engineering/students-association-computer`],
    ],
  ],
  [
    'Your everyday resources',
    'Academic tools, support and wellbeing.',
    [
      ['Academic calendar', `${official}/academics/academic-calendar-academics`],
      ['Scholarships', `${official}/student-corner/scholarships`],
      ['Student welfare', `${official}/student-corner/student-welfare`],
      ['Student ERP', 'https://mysnjb.edupluscampus.com/'],
    ],
  ],
  [
    'Stay connected',
    'Learning, alumni and new ideas.',
    [
      ['Research & development', `${official}/research-ipr`],
      ['Alumni portal', 'https://alumni.snjb.org/'],
      ['NPTEL local chapter', `${official}/student-corner/nptel-swayam-local-chapter`],
      ['Impetus magazine', `${official}/uploads/media/2026/04/Impetus_2024-25.pdf`],
    ],
  ],
];

const routes = {
  first: {
    title: 'First-year B.Tech',
    text: 'Check current eligibility, DTE institute code 05173 seat distribution, required documents and CAP admission schedule.',
    href: `${official}/admissions/fy-btech`,
  },
  direct: {
    title: 'Direct second year',
    text: 'Find the lateral-entry admission process for eligible diploma and B.Sc. graduates.',
    href: `${official}/admissions/direct-second-year-engineering`,
  },
  pg: {
    title: 'Postgraduate & MBA study',
    text: 'Explore SNJB’s NBA-accredited MBA programme and M.Tech specialisations.',
    href: '/mba',
  },
};

const faqs = [
  [
    'Which engineering and management programmes can I explore right here?',
    'All five undergraduate B.Tech branches (Computer, AI & Data Science, Civil, E&TC, Mechanical), First-Year Engineering and the NBA-accredited MBA programme have dedicated pages linking their official department resources. Computer Engineering includes the detailed faculty, curriculum and laboratory experience.',
  ],
  [
    'Where do I check eligibility, DTE code and the admission process?',
    'SNJB’s DTE institute code is 05173. Open the Admissions page (/apply) to submit an enquiry or inspect the official FY B.Tech, Direct Second Year, M.Tech, MBA and Ph.D. circulars.',
  ],
  [
    'Where can I find FRA-approved fees and scholarships?',
    'Use the AY 2026–27 FRA Fee Structure link and Scholarships portal in the Admissions section below to review category-wise tuition, TFWS seats and government scholarship schemes.',
  ],
  [
    'How do I browse all 333 official documents, exam notices and committees?',
    'Open Explore (/explore) or press Ctrl+K / ⌘K from anywhere to search all nine institutional categories—including Examination Cell, NAAC/NBA/NIRF disclosures and statutory committees.',
  ],
];

export function InstitutionalPurpose() {
  return (
    <section className="h11-purpose purpose-v12" id="vision-mission" aria-labelledby="purpose-title">
      <header>
        <p className="h8-eyebrow">WHAT GUIDES US</p>
        <h3 id="purpose-title">Knowledge with purpose.</h3>
      </header>
      <div className="purpose-v12-vision">
        <h4 className="purpose-vision-heading">
          <Target size={21} aria-hidden="true" />
          <span>Our vision</span>
        </h4>
        <p>
          Transform young aspirant learners towards creativity and professionalism for societal growth through quality technical education.
        </p>
        <span aria-hidden="true">ज्ञान</span>
      </div>
      <div className="purpose-v12-mission">
        <h4>
          <Compass size={20} aria-hidden="true" />
          Our mission
        </h4>
        <ol>
          {[
            'To transfer the suitable technology, particularly for rural development.',
            'To enhance diverse career opportunities among students for building nation.',
            'To acquire the environment of learning to bridge the gap between industry and academics.',
            'To share values, ideas, beliefs by encouraging faculties and students for welfare of society.',
          ].map((text, i) => (
            <li key={text}>
              <span aria-hidden="true">0{i + 1}</span>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function InstitutionalLeadership() {
  return (
    <div className="h13-leadership-strip" aria-label="Institutional leadership and governance">
      <article className="h13-leader-card">
        <img
          src="/images/directory/01-dr-m-r-sanghavi.webp"
          alt="Dr. M. R. Sanghavi"
          width="64"
          height="64"
          loading="lazy"
        />
        <div>
          <span className="h8-eyebrow">ACADEMIC LEADERSHIP</span>
          <h4>Principal’s &amp; Director’s Desk</h4>
          <p>
            Guided by experienced academic leadership and Dr. M. R. Sanghavi (Professor &amp; Joint Director), fostering autonomous excellence at Neminagar, Chandwad.
          </p>
          <div className="h13-leader-links">
            <a href={`${official}/about-us/principals-desk`} {...externalProps}>
              Director’s &amp; Principal’s Desk
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a href={`${official}/about-us/coordinators-message`} {...externalProps}>
              Coordinator’s Message
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
      <article className="h13-governance-card">
        <div>
          <span className="h8-eyebrow">AUTONOMOUS GOVERNANCE</span>
          <h4>Statutory &amp; Academic Bodies</h4>
          <p>
            Affiliated to Savitribai Phule Pune University, recognized under UGC Section 12B, and accredited with NAAC A+ and NBA programmes.
          </p>
          <div className="h13-leader-links">
            <a href={`${official}/about-us/governing-body`} {...externalProps}>
              Governing Body
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a href={`${official}/about-us/academic-council`} {...externalProps}>
              Academic Council
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a href={`${official}/about-us/mandatory-disclosure`} {...externalProps}>
              Mandatory Disclosures
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

function FieldIcon({ field }) {
  const Icon =
    {
      computer: Code2,
      data: BrainCircuit,
      civil: Construction,
      electronics: Radio,
      mechanical: Cog,
      science: FlaskConical,
    }[field] || GraduationCap;
  return (
    <span className="field-icon-v12">
      <Icon size={21} aria-hidden="true" />
    </span>
  );
}

function PublishedRecognitions({ onInspect }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let live = true;
    fetch('/data/homepage-recognitions-v10.json')
      .then((response) => {
        if (!response.ok) throw new Error('Records unavailable');
        return response.json();
      })
      .then((value) => {
        if (value.entries.length !== 9) throw new Error('Incomplete records');
        if (live) {
          setData(value);
          setError(false);
        }
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [retry]);

  return (
    <div className="h11-recognition-history">
      {data ? (
        <ContentRail
          title="Our recognition, through the years."
          label="ALL 9 PUBLISHED ACHIEVEMENTS · 2020–2026"
          count={data.entries.length}
          className="recognition-rail"
        >
          {data.entries.map((entry) => (
            <article key={entry.title}>
              <a
                href={entry.sourceImage}
                onClick={(event) => {
                  if (onInspect && event.button === 0 && !event.metaKey && !event.ctrlKey) {
                    event.preventDefault();
                    onInspect({
                      src: entry.imagePath,
                      title: entry.title,
                      alt: entry.title,
                      sourceUrl: entry.sourceImage,
                      caption: 'Published SNJB institutional recognition record',
                    });
                  }
                }}
                {...externalProps}
              >
                <img src={entry.imagePath} alt="" width="90" height="75" loading="lazy" decoding="async" />
                <h4>{entry.title}</h4>
                <span>
                  Inspect certificate
                  <ArrowUpRight size={16} />
                </span>
              </a>
            </article>
          ))}
        </ContentRail>
      ) : (
        <p role="status">
          {error ? 'Recognition records couldn’t load.' : 'Loading published recognition records…'}
          {error && <button onClick={() => setRetry((value) => value + 1)}>Try again</button>}
        </p>
      )}
      <p className="h8-note">
        As published by SNJB. Click any recognition card to inspect the certificate or open its official source file.
      </p>
    </div>
  );
}

export function CampusResources() {
  return (
    <div className="h10-campus-services services-v12" aria-label="Campus life and student services">
      {campusServices.map(([title, description, links], i) => (
        <section key={title}>
          <div className="services-v12-photo">
            <img
              src={['/images/campus-life.webp', '/images/library.webp', '/images/project-lab.webp'][i]}
              alt={
                [
                  'Published SNJB student tree-plantation activity',
                  'Published SNJB library photograph',
                  'Published SNJB project laboratory photograph',
                ][i]
              }
              width="700"
              height="460"
              loading="lazy"
            />
          </div>
          <header>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <Compass size={18} aria-hidden="true" />
          </header>
          <div>
            {links.map(([label, href]) => {
              const Icon = [HeartHandshake, BookOpen, Sparkles][i];
              return (
                <a href={href} key={label} {...externalProps}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PostgraduateRoutes({ navigate }) {
  const internal = (href) => (event) => {
    if (navigate && href.startsWith('/') && !event.button && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      navigate(href, event);
    }
  };
  return (
    <div className="h8-postgraduate h10-postgraduate">
      <div className="h10-pg-intro">
        <p className="h8-eyebrow">Postgraduate &amp; research</p>
        <h3>Go further in your field.</h3>
        <p>Explore SNJB’s NBA-accredited MBA department, M.Tech programmes and doctoral research centre.</p>
      </div>
      <div className="h10-pg-routes">
        {[
          [
            'MBA (Master of Business Administration)',
            'NBA Accredited · 81 placements in AY 2025–26 · Explore department, faculty, BoS and admissions.',
            '/mba',
          ],
          [
            'M.Tech (Postgraduate Engineering)',
            'Civil, Computer, E&TC and Mechanical · Check published intake, syllabi and admission notices.',
            `${official}/mtech`,
          ],
          [
            'Ph.D. Research Centre',
            'SPPU-recognized research centre · Check approved supervisors, domains and admission circulars.',
            `${official}/phd`,
          ],
        ].map(([name, description, href]) => (
          <a
            href={href}
            key={name}
            onClick={href.startsWith('/') ? internal(href) : undefined}
            {...(href.startsWith('/') ? {} : externalProps)}
          >
            <span>
              <h4>{name}</h4>
              <p>{description}</p>
            </span>
            {href.startsWith('/') ? (
              <ArrowRight size={20} aria-hidden="true" />
            ) : (
              <ArrowUpRight size={20} aria-hidden="true" />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export function UndergraduateIntake() {
  return (
    <details className="h10-ug-intake">
      <summary>
        <span>Published B.Tech intake · {publishedIntake.academicYear} (568 total seats incl. TFWS)</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <ul>
        {publishedIntake.rows.map((row) => (
          <li key={row.name}>
            <span>{row.name}</span>
            <strong>
              {row.totalIncludingTFWS}
              <small>including {row.tfws} TFWS</small>
            </strong>
          </li>
        ))}
      </ul>
      <p className="h8-note">
        AY 2026–27 capacity: 540 approved base seats + 28 TFWS seats = 568. DTE institute code 05173. Check the official admission record for category splits and current seat availability.
      </p>
      <ArrowLink href={publishedIntake.source} external>
        Official FY B.Tech intake &amp; admission details
      </ArrowLink>
      <p className="h8-note intake-authorities">
        Cross-check: <a href={publishedIntake.authorities.aicte} {...externalProps}>AICTE approval</a>
        {' · '}<a href={publishedIntake.authorities.cet} {...externalProps}>Maharashtra CET seat matrix</a>
      </p>
    </details>
  );
}

function PlacementDetails({ year, scope, rows }) {
  return (
    <details className="h10-placement-details">
      <summary>
        <span>See the department breakdown</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <p className="h8-note">
        {year} · {scope === 'engineering' ? 'Five engineering departments' : 'All departments, including MBA'}. Maximum package amounts are shown in rupees, as labelled in the source.
      </p>
      <div className="h10-placement-table" role="region" aria-label={`Department placement details ${year}`} tabIndex={0}>
        <table>
          <caption className="sr-only">Published department placement counts and maximum packages for {year}</caption>
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Placed</th>
              <th scope="col">Offers</th>
              <th scope="col">Maximum package</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sourceName}>
                <th scope="row">{row.name}</th>
                <td>{row.placements}</td>
                <td>{row.offers ?? '—'}</td>
                <td>₹{row.maximumPackageRupees.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.some((row) => row.offers === null) && (
        <p className="h8-note">— Offer counts were not published for this year.</p>
      )}
    </details>
  );
}

function CollegePlacementHistory() {
  return (
    <details className="h10-placement-history">
      <summary>
        College placement totals, 2022–2026
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="h10-trend-grid">
        {publishedOutcomes.annualTrend.map((record) => (
          <div key={record.year}>
            <span>
              {record.year}
              {record.sourceMarker}
            </span>
            <strong>{record.placements}</strong>
            <small>Reported placements</small>
          </div>
        ))}
      </div>
      <p className="h8-note">
        College totals include MBA. The annual source marks 2025–26 with an asterisk and does not explain that marker.
      </p>
      <ArrowLink href={publishedOutcomes.annualSource} external>
        Annual placement record
      </ArrowLink>
    </details>
  );
}

function CareerOutcomes({ internal }) {
  const reduced = useReducedMotion();
  const [year, setYear] = useState('2025–26');
  const [scope, setScope] = useState('engineering');
  const record = publishedOutcomes.years[year];
  const outcome = scope === 'engineering' ? record.engineering : record;
  const rows = record.departments.filter((row) => scope === 'college' || row.sourceName !== 'MBA');
  const maximum = Math.max(...rows.map((row) => row.maximumPackageRupees));

  return (
    <section className="h8-section h8-outcomes" id="outcomes">
      <div className="h8-container">
        <Reveal>
          <Heading number="04" label="Careers & placements" title="See where it can lead.">
            <label className="h8-year">
              <span>Academic year</span>
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                aria-label="Placement academic year"
              >
                <option>2025–26</option>
                <option>2024–25</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </Heading>
          <p className="h8-section-intro">
            Explore the published outcomes for your field, alongside the Training &amp; Placement Cell that helps you prepare.
          </p>
        </Reveal>
        <div className="outcomes-v12-composition">
          <div className="h8-outcome-layout">
            <Reveal className="h8-outcome-record">
              <div className="h10-outcome-scope" role="group" aria-label="Placement programme scope">
                <button aria-pressed={scope === 'engineering'} onClick={() => setScope('engineering')}>
                  Engineering (5 branches)
                </button>
                <button aria-pressed={scope === 'college'} onClick={() => setScope('college')}>
                  Entire college (+MBA)
                </button>
              </div>
              <p className="h8-record-year">
                {scope === 'engineering' ? 'Five engineering departments' : 'All departments · includes MBA'} · {year}
                {record.sourceMarker}
              </p>
              <motion.div
                key={`${year}-${scope}`}
                className="h8-outcome-numbers"
                initial={false}
                animate={
                  reduced
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: [0.25, 1], y: [7, 0], filter: ['blur(3px)', 'blur(0px)'] }
                }
                transition={{ duration: 0.24 }}
                aria-live="polite"
                aria-atomic="true"
              >
                <div>
                  <strong>{outcome.placements}</strong>
                  <span>Reported placements</span>
                </div>
                <div>
                  <strong>{outcome.offers ?? '—'}</strong>
                  <span>{outcome.offers === null ? 'Offer total not published' : 'Reported offers'}</span>
                </div>
              </motion.div>
              <div className="h10-maximum-package">
                <strong>₹{(maximum / 100000).toLocaleString('en-IN')} lakh</strong>
                <span>
                  Maximum published package
                  <br />
                  {scope === 'engineering' ? 'Engineering departments' : 'All departments, including MBA'}
                </span>
              </div>
              <p className="h8-note">
                {scope === 'engineering' ? 'Five engineering branches; MBA excluded.' : 'College totals include MBA.'}{' '}
                Placements and offers are separate published counts.
              </p>
              <PlacementDetails year={year} scope={scope} rows={rows} />
              <ArrowLink href={publishedOutcomes.source} external>
                Verify the published statistics
              </ArrowLink>
            </Reveal>
            <Reveal className="h8-career" delay={0.06}>
              <p className="h8-eyebrow">Training &amp; Placement Cell</p>
              <h3>Prepare for what’s next.</h3>
              <p className="h8-body">
                Aptitude preparation, mock interviews, industry internships and corporate recruitment drives coordinated on campus.
              </p>
              <ArrowLink href={`${official}/placements/about-placement-cell`} external>
                Meet the placement cell
              </ArrowLink>
              <a
                className="h8-career-department"
                href="/computer-engineering#dept-careers"
                onClick={internal('/computer-engineering#dept-careers')}
              >
                Computer Engineering outcomes
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a className="h8-career-department" href="mailto:tpocoe@snjb.org">
                <span>
                  Talk to the placement team
                  <small>tpocoe@snjb.org</small>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <CollegePlacementHistory />
            </Reveal>
          </div>
          <PlacementChart rows={rows} year={year} />
        </div>
        <p className="h8-note h10-outcomes-note">
          Verified against SNJB’s department and annual placement records. * The annual source marks 2025–26 with an asterisk as an active reporting cycle.
        </p>
        <HomeContentSpotlight mode="recruiters" />
      </div>
    </section>
  );
}

function Heading({ number, label, title, children }) {
  return (
    <div className="h8-heading">
      <div>
        <p className="h8-eyebrow">
          {number} / {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Home({ navigate, onAsk, motionEnabled = true }) {
  const [level, setLevel] = useState('ug');
  const [route, setRoute] = useState('first');
  const [faq, setFaq] = useState(null);
  const [inspectedMedia, setInspectedMedia] = useState(null);
  const reduced = useReducedMotion();

  const internal = (href) => (event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href, event);
  };

  return (
    <div className="homepage homepage-v8 homepage-v10 homepage-v12">
      <CinematicHero
        navigate={navigate}
        title={'SNJB\nCollege of Engineering'}
        motionEnabled={motionEnabled}
        eyebrow="Neminagar, Chandwad · Nashik · Since 2004"
        tagline="Vision Through Knowledge. Life Through Character."
        poster="/media/campus-poster-desktop-v10.webp"
        posterMobile="/media/campus-poster-mobile-v10.webp"
        posterAlt="SNJB campus aerial view in Chandwad, Nashik"
        video
        actions={[
          { label: 'Explore Programmes', href: '#programmes' },
          { label: 'Admissions 2026–27', href: '/apply' },
        ]}
        mediaCaption="SNJB Jain Gurukul Campus · Chandwad, Nashik"
      />

      <div className="h8-container h8-wayfinding-wrap">
        <nav className="h8-wayfinding" aria-label="Popular college resources">
          {[
            ['Programmes', '6 UG & PG departments.', GraduationCap, '/#programmes'],
            ['Admissions', 'Enquire & check routes.', Send, '/apply'],
            ['Fees 2026–27', 'FRA-approved fee structure.', FileText, `${official}/fra-fees-structure-ay2026-27`],
            ['All resources', 'Complete 333-link directory.', Compass, '/explore'],
          ].map(([name, description, Icon, href]) => (
            <a
              key={name}
              href={href}
              {...(href.startsWith('/') ? { onClick: internal(href) } : externalProps)}
            >
              <Icon size={25} />
              <span>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </nav>
        <NewsStrip navigate={navigate} />
      </div>

      <section className="h8-section h8-campus" id="campus">
        <div className="h8-container">
          <Reveal>
            <Heading number="01" label="Our college" title="A real sense of place.">
              <a className="h11-tour-pill" href="https://snjb.org/tour/" {...externalProps}>
                <Compass size={20} />
                Explore the 360° tour
                <ArrowUpRight size={18} />
              </a>
            </Heading>
          </Reveal>
          <div className="h8-campus-layout">
            <Reveal className="h8-campus-copy">
              <div id="about">
                <p className="h8-place">Chandwad, Nashik · Maharashtra · DTE institute code 05173</p>
                <h3>
                  SNJB’s Late Sau. K. B. Jain
                  <br />
                  College of Engineering.
                </h3>
                <p className="h8-body">
                  An autonomous institute in the Jain Gurukul campus, affiliated to Savitribai Phule Pune University. Established in 2004, with MBA added in 2010 and AI &amp; Data Science in 2020.
                </p>
                <div className="h8-credentials">
                  <span>NAAC A+ Accredited</span>
                  <span>NBA Accredited Programmes</span>
                  <span>UGC 12B Recognized</span>
                  <span>AICTE Approved</span>
                </div>
                <a className="h11-tour-pill h11-know" href={`${official}/about-us/about-engineering`} {...externalProps}>
                  About SNJB Engineering
                  <ArrowUpRight size={17} />
                </a>
              </div>
            </Reveal>
            <Reveal className="h8-campus-photos" delay={0.06}>
              <CampusGallery onInspect={setInspectedMedia} />
            </Reveal>
          </div>
          <Reveal>
            <InstitutionalLeadership />
          </Reveal>
          <InstitutionalPurpose />
          <Reveal>
            <PublishedRecognitions onInspect={setInspectedMedia} />
          </Reveal>
        </div>
      </section>

      <section className="h8-section h8-study" id="programmes">
        <div className="h8-container">
          <Reveal>
            <Heading number="02" label="Study" title="Find your field.">
              <div className="h8-segmented" aria-label="Programme level">
                <button aria-pressed={level === 'ug'} onClick={() => setLevel('ug')}>
                  Undergraduate
                </button>
                <button aria-pressed={level === 'pg'} onClick={() => setLevel('pg')}>
                  Postgraduate &amp; Ph.D.
                </button>
              </div>
            </Heading>
            <p className="h8-section-intro">
              Choose a field to explore its official department resources. Go deeper into faculty, laboratories and curriculum in our Computer Engineering showcase.
            </p>
          </Reveal>
          {level === 'ug' ? (
            <div className="h8-programmes">
              {branches.map(([name, description, href, photo, badge], index) => (
                <Reveal key={name} delay={index * 0.025}>
                  <motion.a
                    href={href}
                    className={`h8-programme ${index === 0 ? 'h8-programme-featured' : ''}`}
                    onClick={internal(href)}
                    whileHover={reduced ? undefined : { y: -3 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <span className="h8-programme-image">
                      <img
                        src={resolveDeliveryImage(
                          photo === 'science' ? '/images/orientation.webp' : `/subjects/${photo}.webp`
                        )}
                        alt=""
                        width="80"
                        height="80"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="h8-programme-copy">
                      <FieldIcon field={photo} />
                      <h3>{name}</h3>
                      <p>{description}</p>
                      <span className="h8-local-label">{badge}</span>
                    </span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </motion.a>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <PostgraduateRoutes navigate={navigate} />
            </Reveal>
          )}
          {level === 'ug' && <UndergraduateIntake />}
        </div>
      </section>

      <section className="h8-section h8-learning" id="learning">
        <div className="h8-container">
          <Reveal>
            <Heading number="03" label="Learning & discovery" title="Make room for ideas.">
              <ArrowLink href="/computer-engineering#dept-labs" onClick={internal('/computer-engineering#dept-labs')}>
                Explore the laboratories
              </ArrowLink>
            </Heading>
            <p className="h8-section-intro">
              Start with the spaces and academic tools you’ll use every day—from the AICTE IDEA Lab and project studios to autonomous syllabi and the OPAC library.
            </p>
          </Reveal>
          <div className="h8-learning-grid">
            {resources.map(({ title, description, label, Icon, href, image, note }, index) => (
              <Reveal key={title} delay={index * 0.03}>
                <a
                  href={href}
                  {...(href.startsWith('/') ? { onClick: internal(href) } : externalProps)}
                  className={`h8-resource-card h11-resource-${index}`}
                >
                  <img
                    className="h11-resource-image"
                    src={resolveDeliveryImage(image)}
                    alt=""
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                  <small className="h11-image-note">{note}</small>
                  <span className="h8-resource-icon">
                    <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="h8-resource-action">
                    {label}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
          <CampusResources />
        </div>
      </section>

      <CareerOutcomes internal={internal} />

      <section className="h8-section h8-updates" id="updates">
        <div className="h8-container">
          <Reveal>
            <Heading number="05" label="Campus journal" title="The people. The moments.">
              <p className="h8-section-intro">Dates, stories and voices from the SNJB community.</p>
            </Heading>
          </Reveal>
          <HomeContentSpotlight mode="journal" />
        </div>
      </section>

      <section className="h8-section h8-admissions" id="admissions">
        <div className="h8-container">
          <Reveal>
            <div className="h8-admission-panel">
              <div className="h8-admission-main">
                <p className="h8-eyebrow">06 / Admissions · AY 2026–27</p>
                <h2>
                  Find your place.
                  <br />
                  Build your future.
                </h2>
                <p className="h8-body">
                  Choose your entry pathway, submit an admission enquiry, or inspect the official CAP and institute-level notices.
                </p>
                <div className="h8-admission-tabs" aria-label="Admission route">
                  {[
                    ['first', 'First year B.Tech'],
                    ['direct', 'Direct second year'],
                    ['pg', 'MBA & Postgraduate'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={route === value}
                      onPointerEnter={(event) => {
                        if (event.pointerType === 'mouse') setRoute(value);
                      }}
                      onFocus={() => setRoute(value)}
                      onClick={() => setRoute(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <motion.div
                  key={route}
                  className="h8-admission-route"
                  initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.22 }}
                >
                  <h3>{routes[route].title}</h3>
                  <p>{routes[route].text}</p>
                  <div className="h13-admission-actions">
                    <Button href="/apply" onClick={internal('/apply')}>
                      Enquire &amp; apply online
                    </Button>
                    <ArrowLink
                      href={routes[route].href}
                      onClick={routes[route].href.startsWith('/') ? internal(routes[route].href) : undefined}
                      external={!routes[route].href.startsWith('/')}
                    >
                      {routes[route].href.startsWith('/') ? 'Open MBA department' : 'Official admission circular'}
                    </ArrowLink>
                  </div>
                </motion.div>
              </div>
              <div className="h8-admission-resources">
                <h3>Before you apply.</h3>
                {[
                  ['Interactive enquiry form', '/apply', Send],
                  ['Fees · AY 2026–27 (FRA)', `${official}/fra-fees-structure-ay2026-27`, BadgeIndianRupee],
                  ['Scholarships & financial aid', `${official}/student-corner/scholarships`, HeartHandshake],
                  ['Boys & girls hostels', `${official}/admissions/hostels`, BedDouble],
                  ['Campus contacts & directions', `${official}/about-us/contact-us`, MapPin],
                ].map(([label, href, Icon]) => (
                  <a
                    href={href}
                    key={label}
                    {...(href.startsWith('/') ? { onClick: internal(href) } : externalProps)}
                  >
                    <Icon size={19} aria-hidden="true" />
                    <span>{label}</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                ))}
                <div className="h8-admission-contact">
                  <span>Admissions &amp; College Office</span>
                  <a href="tel:+912556253750">
                    <Phone size={18} aria-hidden="true" />
                    +91 2556 253750
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                  <small>FY B.Tech Coordinator (Prof. Pankaj Desai): +91 97304 78001</small>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="h8-faq">
            <Reveal>
              <p className="h8-eyebrow">A little clarity</p>
              <h3>Where do I start?</h3>
              <button className="arrow-link" onClick={onAsk}>
                Open the SNJB guide
                <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            </Reveal>
            <div>
              {faqs.map(([question, answer], index) => (
                <div className="h8-faq-item" key={question}>
                  <button
                    onClick={() => setFaq(faq === index ? null : index)}
                    aria-expanded={faq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{question}</span>
                    {faq === index ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                  </button>
                  <div id={`faq-answer-${index}`} hidden={faq !== index}>
                    <p>{answer}</p>
                    {index === 3 && (
                      <ArrowLink href="/explore" onClick={internal('/explore')}>
                        All college resources
                      </ArrowLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Reveal>
            <div className="h8-resource-directory">
              <div>
                <Compass size={23} aria-hidden="true" />
                <h3>One college. Everything connected.</h3>
                <p>
                  Browse all 333 official navigation destinations across academics, examinations, NAAC/NBA/NIRF disclosures, departments and student support.
                </p>
              </div>
              <Button href="/explore" onClick={internal('/explore')} variant="outline">
                All college resources
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <ImageViewer item={inspectedMedia} onClose={() => setInspectedMedia(null)} />
    </div>
  );
}
