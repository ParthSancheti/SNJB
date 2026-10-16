import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Route,
  School,
  Send,
  Wallet,
} from 'lucide-react';
import { CampusResources, PostgraduateRoutes } from './Home.jsx';
import HomeContentSpotlight from '../components/HomeContentSpotlight.jsx';
import publishedIntake from '../data/admissions-v10.json';
import './visitor-v12.css';

const source = 'https://snjb.org/engineering';
const external = { target: '_blank', rel: 'noopener noreferrer' };
const routes = [
  [
    'First-year B.Tech',
    'Start after Class 12 (MHT-CET / JEE Main). Check DTE institute code 05173 eligibility, documents and CAP admission schedule.',
    `${source}/admissions/fy-btech`,
    GraduationCap,
  ],
  [
    'Direct second year',
    'Lateral-entry B.Tech route for eligible diploma and B.Sc. qualifiers.',
    `${source}/admissions/direct-second-year-engineering`,
    Route,
  ],
  [
    'MBA & Postgraduate study',
    'Explore SNJB’s NBA-accredited MBA programme, M.Tech specialisations and Ph.D. research centre.',
    `${source}/mtech`,
    BookOpen,
  ],
];

function AdmissionEnquiryForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    route: 'First-year B.Tech (FY B.Tech)',
    branch: 'Computer Engineering',
    exam: 'MHT-CET',
    city: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      next.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) setSubmitted(true);
  };

  const whatsappText = encodeURIComponent(
    `Hello SNJB Admissions Team, I am ${form.name} from ${form.city || 'Maharashtra'}. I would like to enquire about ${form.route} (${form.branch}, Exam: ${form.exam}). ${form.message}`
  );
  const mailtoHref = `mailto:principalcoe@snjb.org?subject=${encodeURIComponent(
    `Admission Enquiry AY 2026-27: ${form.route} - ${form.name}`
  )}&body=${whatsappText}`;

  return (
    <section className="visitor-enquiry-section" id="enquiry-form" aria-labelledby="enquiry-heading">
      <div className="visitor-application">
        <div className="visitor-application-heading">
          <span className="visitor-step-number">02</span>
          <div>
            <p className="h8-eyebrow">ADMISSIONS DESK · AY 2026–27</p>
            <h2 id="enquiry-heading">Request admission guidance or a campus callback</h2>
          </div>
        </div>

        {submitted ? (
          <div className="visitor-enquiry-success" role="status" aria-live="polite">
            <CheckCircle2 size={28} aria-hidden="true" />
            <div>
              <h3>Enquiry summary prepared for {form.name}</h3>
              <p>
                Route: <strong>{form.route}</strong> · Preferred Discipline: <strong>{form.branch}</strong> · Entrance Exam: <strong>{form.exam}</strong>
              </p>
              <p className="h8-note">
                Connect directly with the SNJB Admission Cell using your pre-filled summary below, or call Prof. Pankaj Desai (+91 97304 78001):
              </p>
              <div className="visitor-enquiry-handoff">
                <a
                  className="button button-primary"
                  href={`https://wa.me/919730478001?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare size={17} aria-hidden="true" />
                  <span>Send via WhatsApp Admission Desk</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <a className="button button-outline" href={mailtoHref}>
                  <Mail size={17} aria-hidden="true" />
                  <span>Send Official Email Enquiry</span>
                </a>
                <button
                  type="button"
                  className="arrow-link"
                  onClick={() => setSubmitted(false)}
                >
                  Edit enquiry details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="visitor-enquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="visitor-form-grid">
              <label>
                <span>Full name *</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aarav Kulkarni"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <small className="visitor-field-error">{errors.name}</small>}
              </label>
              <label>
                <span>Mobile / WhatsApp number *</span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <small className="visitor-field-error">{errors.phone}</small>}
              </label>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <small className="visitor-field-error">{errors.email}</small>}
              </label>
              <label>
                <span>City / District</span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Nashik, Pune, Malegaon"
                />
              </label>
              <label>
                <span>Admission route</span>
                <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
                  <option>First-year B.Tech (FY B.Tech)</option>
                  <option>Direct Second Year B.Tech (DSE)</option>
                  <option>MBA (Management)</option>
                  <option>M.Tech (Postgraduate)</option>
                  <option>Ph.D. Research Centre</option>
                </select>
              </label>
              <label>
                <span>Preferred programme / branch</span>
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                  <option>Computer Engineering</option>
                  <option>Artificial Intelligence &amp; Data Science</option>
                  <option>Mechanical Engineering</option>
                  <option>Electronics &amp; Telecommunication</option>
                  <option>Civil Engineering</option>
                  <option>MBA</option>
                </select>
              </label>
              <label>
                <span>Qualifying entrance exam</span>
                <select value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })}>
                  <option>MHT-CET</option>
                  <option>JEE Main</option>
                  <option>Diploma Merit (DSE)</option>
                  <option>MAH-MBA-CET / CAT / CMAT</option>
                  <option>GATE (M.Tech)</option>
                </select>
              </label>
              <label>
                <span>Questions (Hostel, TFWS, Scholarship, Cutoff)</span>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Optional question for the admission coordinator"
                />
              </label>
            </div>
            <div className="visitor-form-footer">
              <button type="submit" className="button button-primary">
                <Send size={17} aria-hidden="true" />
                <span>Prepare admission enquiry</span>
              </button>
              <p className="h8-note">
                <FileText size={15} aria-hidden="true" />
                <span>
                  Local enquiry helper · Generates an instant WhatsApp or email handoff to SNJB’s official admission desk without storing personal data on third-party servers.
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function ResourceLinks({ campus }) {
  const links = campus
    ? [
        ['Hostel information', 'Accommodation details from the college.', `${source}/admissions/hostels`, Building2],
        ['360° campus tour', 'Take a look around before your visit.', 'https://snjb.org/tour/', Compass],
        ['College contacts', 'Find the relevant college office.', `${source}/about-us/contact-us`, Phone],
      ]
    : [
        ['Fees · 2026–27', 'Published FRA fee information for the academic year.', `${source}/fra-fees-structure-ay2026-27`, Wallet],
        ['Scholarships', 'Check the published schemes and conditions.', `${source}/student-corner/scholarships`, GraduationCap],
        ['Hostel information', 'Explore the published accommodation details.', `${source}/admissions/hostels`, Building2],
        ['College contacts', 'Find the right team for your question.', `${source}/about-us/contact-us`, Phone],
      ];
  return (
    <section className="visitor-links" aria-labelledby="visitor-links-title">
      <div className="visitor-section-heading">
        <p className="h8-eyebrow">{campus ? 'BEFORE YOU VISIT' : 'THE PRACTICAL DETAILS'}</p>
        <h2 id="visitor-links-title">{campus ? 'A little planning. A better visit.' : 'Before you apply.'}</h2>
      </div>
      <div className="visitor-link-grid">
        {links.map(([label, description, href, Icon]) => (
          <a key={href} href={href} {...external}>
            <span className="visitor-link-icon">
              <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        ))}
      </div>
      {!campus && (
        <a className="visitor-office" href="tel:+912556253750">
          <Phone size={19} aria-hidden="true" />
          <span>
            <small>College office · Neminagar, Chandwad</small>
            <strong>+91 2556 253750</strong>
          </span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      )}
    </section>
  );
}

export default function VisitorPage({ kind, navigate }) {
  const [route, setRoute] = useState(0);
  const reduced = useReducedMotion();
  const campus = kind === 'campus';
  const SelectedIcon = routes[route][3];
  const internal = (href) => (event) => {
    if (!event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(href, event);
    }
  };

  return (
    <article className={`visitor-page visitor-v12 homepage-v8 homepage-v10 visitor-${kind}`}>
      <div className="h8-container">
        <header className="visitor-intro">
          <p className="h8-eyebrow">
            <span className="visitor-page-symbol">
              {campus ? <School size={16} aria-hidden="true" /> : <GraduationCap size={16} aria-hidden="true" />}
            </span>
            {campus ? 'LIFE AT SNJB' : 'ADMISSIONS · AY 2026–27 · DTE INSTITUTE CODE 05173'}
          </p>
          <h1>
            {campus ? (
              <>
                A place to learn.
                <br />
                <span>A place to belong.</span>
              </>
            ) : (
              <>
                Find your place.
                <br />
                <span>Build your future.</span>
              </>
            )}
          </h1>
          <p>
            {campus
              ? 'Find your community, your everyday essentials and the stories that bring college life together.'
              : 'Choose your study route, check published AY 2026–27 seat intake, or connect with the SNJB Admission Cell.'}
          </p>
        </header>
        {campus ? (
          <>
            <figure className="visitor-banner">
              <img
                src="/images/campus-wide.webp"
                alt="Published photograph of SNJB College of Engineering’s circular campus building"
                width="1349"
                height="533"
                fetchPriority="high"
              />
              <figcaption>
                <MapPin size={16} aria-hidden="true" />
                <span>Chandwad, Nashik</span>
                <small>Published SNJB photograph</small>
              </figcaption>
            </figure>
            <section className="visitor-v12-services" aria-labelledby="campus-essentials-title">
              <div className="visitor-section-heading">
                <p className="h8-eyebrow">MAKE IT YOUR CAMPUS</p>
                <h2 id="campus-essentials-title">People. Places. Possibilities.</h2>
                <p>A starting point for the things that matter outside the classroom.</p>
              </div>
              <CampusResources />
              <p className="visitor-photo-note">
                Student service photographs are from SNJB’s published campus, library and project laboratory records.
              </p>
            </section>
            <ResourceLinks campus />
            <section className="visitor-journal" aria-labelledby="visitor-journal-title">
              <div className="visitor-section-heading">
                <p className="h8-eyebrow">THE COMMUNITY</p>
                <h2 id="visitor-journal-title">Life, as it happens.</h2>
                <p>Published events, college notices and voices from the SNJB community.</p>
              </div>
              <HomeContentSpotlight mode="journal" />
            </section>
          </>
        ) : (
          <>
            <section className="visitor-application" aria-labelledby="visitor-admission-heading">
              <div className="visitor-application-heading">
                <span className="visitor-step-number">01</span>
                <div>
                  <p className="h8-eyebrow">START WITH YOUR ROUTE</p>
                  <h2 id="visitor-admission-heading">What comes next for you?</h2>
                </div>
              </div>
              <div className="h8-segmented" role="group" aria-label="Choose your admission route">
                {routes.map(([name, , , Icon], i) => (
                  <button key={name} aria-pressed={route === i} onClick={() => setRoute(i)}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{name}</span>
                    {route === i && <Check size={14} className="visitor-route-check" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className="visitor-route"
                  key={route}
                  initial={reduced ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: reduced ? 0 : 0.16 }}
                >
                  <span className="visitor-route-symbol">
                    <SelectedIcon size={27} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <div>
                    <h2>{routes[route][0]}</h2>
                    <p>{routes[route][1]}</p>
                    <a className="button button-outline" href={routes[route][2]} {...external}>
                      Official admission circular
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </section>

            <AdmissionEnquiryForm />

            <section className="visitor-intake" aria-labelledby="visitor-intake-title">
              <div className="visitor-section-heading">
                <p className="h8-eyebrow">KNOW YOUR OPTIONS</p>
                <h2 id="visitor-intake-title">Five B.Tech fields. 568 total seats.</h2>
                <p>AY 2026–27 capacity: 540 approved base seats + 28 TFWS seats. Branch links open official department resources. These are intake capacities, not live vacancies.</p>
              </div>
              <div className="visitor-published-intake">
                <p className="visitor-intake-year">
                  <GraduationCap size={18} aria-hidden="true" />
                  Published B.Tech intake · {publishedIntake.academicYear}
                </p>
                <ul>
                  {publishedIntake.rows.map((row) => {
                    const slugMap = {
                      'AI & Data Science': '/ai-data-science',
                      'Civil Engineering': '/civil-engineering',
                      'Computer Engineering': '/computer-engineering',
                      'Electronics & Telecom': '/electronics-telecommunication',
                      'Mechanical Engineering': '/mechanical-engineering',
                    };
                    const branchHref = slugMap[row.name] || '/explore';
                    return (
                      <li key={row.name}>
                        <a href={branchHref} onClick={internal(branchHref)} className="visitor-intake-branch-link">
                          <span>{row.name}</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </a>
                        <strong>
                          {row.totalIncludingTFWS}
                          <small>
                            {row.totalIncludingTFWS - row.tfws} base + {row.tfws} TFWS
                          </small>
                        </strong>
                      </li>
                    );
                  })}
                </ul>
                <a href={publishedIntake.source} {...external}>
                  Official intake &amp; CAP admission details
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <p className="intake-authorities">
                  Cross-check: <a href={publishedIntake.authorities.aicte} {...external}>AICTE approval</a>
                  {' · '}<a href={publishedIntake.authorities.cet} {...external}>Maharashtra CET seat matrix</a>
                </p>
              </div>
            </section>
            <ResourceLinks campus={false} />
            <section className="visitor-postgraduate" aria-label="Postgraduate and research routes">
              <PostgraduateRoutes navigate={navigate} />
            </section>
          </>
        )}
        <a className="visitor-directory" href="/explore" onClick={internal('/explore')}>
          <span className="visitor-link-icon">
            <Compass size={24} aria-hidden="true" />
          </span>
          <span>
            Looking for something else?
            <strong>Open the college directory.</strong>
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
