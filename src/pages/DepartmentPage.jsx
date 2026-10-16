import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { loadNavigationSource } from '../data/navigation-source.js';
import './supplement-pages.css';

const names = {
  'ai-data-science': 'Artificial Intelligence & Data Science',
  'civil-engineering': 'Civil Engineering',
  'electronics-telecommunication': 'Electronics & Telecommunication',
  'mechanical-engineering': 'Mechanical Engineering',
  'first-year-engineering': 'First Year Engineering',
  mba: 'MBA',
};
const flatten = nodes => nodes.flatMap(node => [node, ...flatten(node.children || [])]);

function DepartmentLinks({ nodes }) {
  return <ul className="supplement-links">{nodes.map(node => <li key={node.id || node.label}>
    {node.href && /^https?:/.test(node.href)
      ? <a href={node.href} target="_blank" rel="noopener noreferrer"><span>{node.label}</span><ArrowUpRight size={18} aria-hidden="true" /></a>
      : <strong>{node.label}</strong>}
    {!!node.children?.length && <DepartmentLinks nodes={node.children} />}
  </li>)}</ul>;
}

export default function DepartmentPage({ slug, navigate }) {
  const [directory, setDirectory] = useState(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setFailed(false);
    loadNavigationSource().then(data => { if (live) setDirectory(data); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [retry]);
  const candidates = directory ? flatten(directory.groups).filter(node => node.href === `/${slug}` && node.children?.length) : [];
  const department = candidates.find(node => node.label === names[slug]) || candidates[0];
  const follow = event => {
    if (!event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && navigate) {
      event.preventDefault(); navigate('/explore', event);
    }
  };
  return <section className="supplement-page" aria-labelledby="department-title">
    <header><p className="supplement-eyebrow"><BookOpen size={18} aria-hidden="true" /> SNJB · Departments</p>
      <h1 id="department-title">{names[slug] || 'Department resources'}</h1>
      <p>Explore the department’s published resources. Links open the official SNJB pages.</p>
    </header>
    <div className="supplement-glass">
      {!directory && <p role="status">{failed ? 'Department resources could not load.' : 'Loading department resources…'} {failed && <button onClick={() => setRetry(value => value + 1)}>Try again</button>}</p>}
      {directory && (department ? <DepartmentLinks nodes={department.children} /> : <p>Find this department in the complete college directory.</p>)}
    </div>
    <a className="supplement-directory" href="/explore" onClick={follow}>All college resources<ArrowUpRight size={18} aria-hidden="true" /></a>
  </section>;
}
