import { useEffect, useState } from 'react';
import { ArrowUpRight, FileCheck } from 'lucide-react';
import './supplement-pages.css';

const labels = {
  achievements: 'Recognitions', notices: 'Notices', eventsOriginal: 'Original event records',
  eventsVisible: 'Unique displayed events', testimonials: 'Testimonials', recruiters: 'Recruiters',
  homepageSlides: 'Original homepage slides', links: 'Link records', bodyImages: 'Content images',
};
export default function AuditPage() {
  const [report, setReport] = useState(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setFailed(false);
    fetch('/data/homepage-audit-v10.json').then(response => {
      if (!response.ok) throw new Error('Audit unavailable');
      return response.json();
    }).then(data => { if (live) setReport(data); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [retry]);
  return <section className="supplement-page" aria-labelledby="audit-title">
    <header><p className="supplement-eyebrow"><FileCheck size={18} aria-hidden="true" /> Source records</p>
      <h1 id="audit-title">Content audit.</h1>
      <p>This archived comparison records homepage content preservation. It is not a new live audit of the current official website.</p>
    </header>
    <div className="supplement-glass">
      {!report && <p role="status">{failed ? 'The archived report could not load.' : 'Loading the archived report…'} {failed && <button onClick={() => setRetry(value => value + 1)}>Try again</button>}</p>}
      {report && <>
        <p>Recorded {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(report.reviewedAt))}</p>
        <div className="supplement-table" role="region" aria-label="Archived content comparison" tabIndex={0}>
          <table><caption>Counts recorded in the archived comparison</caption><thead><tr><th scope="col">Content</th><th scope="col">Archived copy</th><th scope="col">Official source at review</th></tr></thead>
            <tbody>{Object.entries(report.archiveCounts).map(([key, count]) => <tr key={key}><th scope="row">{labels[key] || key}</th><td>{count}</td><td>{report.liveCounts[key]}</td></tr>)}</tbody>
          </table>
        </div>
        <p>{report.scope}</p>
        <a className="supplement-directory" href="/data/homepage-audit-v10.json" download>Download the recorded comparison<ArrowUpRight size={18} aria-hidden="true" /></a>
        <a className="supplement-directory" href={report.sourceUrl} target="_blank" rel="noopener noreferrer">Official SNJB homepage<ArrowUpRight size={18} aria-hidden="true" /></a>
      </>}
    </div>
  </section>;
}
