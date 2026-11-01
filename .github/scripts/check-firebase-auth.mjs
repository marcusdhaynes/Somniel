import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../../firebase-applet-config.json', import.meta.url), 'utf8'));
const expected = ['somniel.com', 'marcusdhaynes.github.io'];
const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
url.searchParams.set('key', config.apiKey);

console.log('Checking public Firebase Authentication configuration...');
console.log('Configured project:', config.projectId);
console.log('Authentication handler:', config.authDomain);

let response, data;
try {
  response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  data = await response.json();
} catch (error) {
  console.error('Could not reach Firebase Authentication:', error.message);
  process.exitCode = 1;
}

if (response) {
  if (!response.ok) {
    console.error('Firebase Authentication configuration request failed:', response.status);
    console.error('Firebase error:', data?.error?.message || 'No details returned');
    console.error('Confirm this is the intended Firebase project and the Identity Toolkit API is enabled for its web API key.');
    process.exitCode = 1;
  } else {
    const domains = Array.isArray(data.authorizedDomains) ? data.authorizedDomains : [];
    console.log('Firebase project identifier returned:', data.projectId || '(not provided)');
    for (const domain of expected) console.log(`${domain}: ${domains.includes(domain) ? 'authorized' : 'NOT AUTHORIZED'}`);
    // somniel.com uses a first-party relay for the Google popup. Only the
    // actual popup origin (GitHub Pages) must be authorized in Firebase.
    if (!domains.includes('marcusdhaynes.github.io')) {
      console.error('Required Google OAuth bridge host is not authorized: marcusdhaynes.github.io');
      process.exitCode = 1;
    } else {
      console.log('OAuth relay origin is authorized; somniel.com uses the secure relay.');
      if (!domains.includes('somniel.com')) {
        console.log('Direct popup on somniel.com is not authorized (relay will be used).');
      }
    }
    // The public API may return the numeric Google project identifier
    // rather than the Firebase project slug; both forms are legitimate.
    if (data.projectId) {
      const actual = String(data.projectId);
      const expectedId = /^\d+$/.test(actual) ? String(config.messagingSenderId) : config.projectId;
      if (actual !== expectedId) {
        console.error('Project identity mismatch: check firebase-applet-config.json');
        process.exitCode = 1;
      }
    }
  }
}
