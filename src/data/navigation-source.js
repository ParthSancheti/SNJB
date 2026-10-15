let pendingDirectory;
export function loadNavigationSource() {
  if (!pendingDirectory) pendingDirectory = fetch('/data/navigation-directory.json')
    .then(response => { if (!response.ok) throw new Error('Directory unavailable'); return response.json(); })
    .then(data => { if (!Array.isArray(data.groups) || !data.groups.length) throw new Error('Invalid directory'); return data; })
    .catch(error => { pendingDirectory = undefined; throw error; });
  return pendingDirectory;
}
