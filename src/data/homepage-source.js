// The visible journal and the source archive share one on-demand snapshot.
// A failed request is released so either section can retry it.
let snapshotRequest;
let summaryRequest;

export function loadHomepageSummary() {
  if (!summaryRequest) summaryRequest = fetch('/data/homepage-summary.json')
    .then(response => { if (!response.ok) throw new Error('Homepage summary unavailable'); return response.json(); })
    .then(summary => { if (!['eventsVisible', 'notices', 'testimonials', 'recruiters'].every(key => Array.isArray(summary[key]))) throw new Error('Invalid homepage summary'); return summary; })
    .catch(error => { summaryRequest = undefined; throw error; });
  return summaryRequest;
}

export function loadHomepageSource() {
  if (!snapshotRequest) {
    snapshotRequest = fetch('/data/homepage-content.json').then(response => {
      if (!response.ok) throw new Error(`Homepage snapshot returned ${response.status}`);
      return response.json();
    }).then(snapshot => {
      if (snapshot.schemaVersion !== 1 || !snapshot.metadata?.sourceUrl ||
          !['eventsVisible', 'testimonials', 'recruiters'].every(key => Array.isArray(snapshot[key]))) {
        throw new Error('Invalid homepage snapshot');
      }
      return snapshot;
    }).catch(error => {
      snapshotRequest = undefined;
      throw error;
    });
  }
  return snapshotRequest;
}
