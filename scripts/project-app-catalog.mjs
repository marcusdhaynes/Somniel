// Public, deployed GitHub Pages applications belonging to the Somniel account.
// This intentionally excludes private repositories and does not require a browser token.
const OWNER = 'marcusdhaynes';
const EXCLUDED = new Set(['somniel','somniel-holdings','inbox-reborn']);
const REPO_NAME = /^[A-Za-z0-9_.-]+$/;
export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
export function safeHomepage(value, repoName) {
  const fallback = 'https://' + OWNER + '.github.io/' + encodeURIComponent(repoName) + '/';
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return fallback;
    // Explicit external homepages are allowed for links, never used for build screenshots.
    if (parsed.hostname === OWNER + '.github.io' ||
        (parsed.hostname !== 'localhost' && parsed.hostname.includes('.') && !parsed.hostname.endsWith('.local'))) {
      return parsed.toString();
    }
  } catch {}
  return fallback;
}
export function catalogFromRepos(repos) {
  return repos.filter(repo => repo && !repo.private && repo.has_pages &&
    !repo.archived && !repo.fork && repo.size > 0 &&
    REPO_NAME.test(repo.name) && !EXCLUDED.has(repo.name.toLowerCase()))
    .map(repo => ({
      repo: repo.name,
      name: repo.name.replace(/[-_]/g, ' '),
      description: repo.description || 'Explore this application.',
      url: safeHomepage(repo.homepage, repo.name),
      pushedAt: repo.pushed_at || '',
    })).sort((a,b) => a.name.localeCompare(b.name));
}
export function catalogSignature(apps) {
  return apps.map(app => [app.repo.toLowerCase(), app.pushedAt || '', app.url]
    .join(':')).sort().join('|');
}
export async function fetchPublicApps({ token = process.env.GITHUB_TOKEN, pages = 4 } = {}) {
  const repos = [];
  for (let page = 1; page <= pages; page++) {
    const url = 'https://api.github.com/users/' + OWNER + '/repos?per_page=100&type=owner&sort=pushed&page=' + page;
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json',
        'User-Agent': 'Somniel-App-Preview-Bot',
        ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      signal: AbortSignal.timeout(18000)
    });
    if (!response.ok) throw new Error('GitHub repository discovery returned HTTP ' + response.status);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Unexpected GitHub repository payload');
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return catalogFromRepos(repos);
}
