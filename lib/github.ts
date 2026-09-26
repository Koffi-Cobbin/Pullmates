/**
 * GitHub repo URL parsing + preview fetching helpers.
 * Fetches the GitHub REST API directly from the browser (Firebase Hosting static deploy).
 *
 * @module lib/github
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubPreviewIssue {
  title: string;
  url: string;
  labels: string[];
}

export interface GitHubPreview {
  owner: string;
  repo: string;
  fullName: string;
  htmlUrl: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  languageBreakdown: Record<string, number>;
  topics: string[];
  license: string | null;
  lastCommitAt: string | null;
  openIssues: GitHubPreviewIssue[];
  readmeExcerpt: string | null;
}

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
}

// ---------------------------------------------------------------------------
// URL parsing (pure)
// ---------------------------------------------------------------------------

/**
 * Parse a GitHub repository URL into owner/repo.
 * Accepts:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/
 * - https://github.com/owner/repo/tree/main
 * - http://github.com/owner/repo.git
 * - github.com/owner/repo
 */
export function parseGitHubRepoUrl(url: string): ParsedGitHubRepo | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.hostname.toLowerCase() !== 'github.com') return null;

  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  let repo = segments[1];

  // Strip trailing .git
  if (repo.toLowerCase().endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  if (!owner || !repo) return null;
  // GitHub usernames/repo names: alphanumerics, hyphens, underscores, dots
  if (!/^[A-Za-z0-9._-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) {
    return null;
  }

  return { owner, repo };
}

// ---------------------------------------------------------------------------
// GitHub REST fetching (browser)
// ---------------------------------------------------------------------------

const GITHUB_API = 'https://api.github.com';
const INTERESTING_LABELS = new Set(['help wanted', 'good first issue']);

interface GitHubRepoResponse {
  full_name: string;
  html_url: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id?: string; name?: string } | null;
  pushed_at: string | null;
}

interface GitHubIssueResponse {
  title: string;
  html_url: string;
  labels: Array<{ name?: string } | string>;
}

function githubHeaders(): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  };
}

async function githubGet<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() });

  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

async function githubGetRaw(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        ...githubHeaders(),
        Accept: 'application/vnd.github.raw+json',
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function computeLanguageBreakdown(languages: Record<string, number>): Record<string, number> {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return {};

  const breakdown: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(languages)) {
    breakdown[lang] = Math.max(1, Math.round((bytes / total) * 100));
  }
  return breakdown;
}

function normalizeIssueLabels(labels: GitHubIssueResponse['labels']): string[] {
  return labels
    .map((label) => (typeof label === 'string' ? label : (label.name ?? '')))
    .filter(Boolean);
}

function truncateReadme(text: string, maxChars = 600): string {
  const collapsed = text.replace(/\r\n/g, '\n').trim();
  if (collapsed.length <= maxChars) return collapsed;
  return `${collapsed.slice(0, maxChars).trimEnd()}…`;
}

/**
 * Map a GitHub preview to the `projects.repo_synced_data` jsonb shape
 * (mirrors the seed snapshot / detail-page RepoSyncedData interface).
 */
export function previewToSyncedData(p: GitHubPreview): Record<string, unknown> {
  return {
    name: p.name,
    description: p.description,
    stars: p.stars,
    forks: p.forks,
    language: p.language,
    languageBreakdown: p.languageBreakdown,
    lastCommitAt: p.lastCommitAt,
    openIssues: p.openIssues,
    topics: p.topics,
  };
}

/**
 * Fetch a normalized GitHub preview for a public repository.
 * Throws with `.status` set to 400 | 404 | 429 | 502 on failure.
 *
 * Unauthenticated requests: 60/hour per IP (GitHub REST rate limit).
 */
export async function fetchGitHubPreview(repoUrl: string): Promise<GitHubPreview> {
  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed) {
    const error = new Error('Invalid GitHub repository URL') as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const { owner, repo } = parsed;
  const encoded = `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  let repoData: GitHubRepoResponse;
  try {
    repoData = await githubGet<GitHubRepoResponse>(`/repos/${encoded}`);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      const error = new Error('Repository not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    if (status === 403 || status === 429) {
      const error = new Error('GitHub rate limit exceeded — try again later') as Error & {
        status?: number;
      };
      error.status = 429;
      throw error;
    }
    const error = new Error('Failed to reach GitHub') as Error & { status?: number };
    error.status = 502;
    throw error;
  }

  // Secondary fetches — failures degrade gracefully (don't fail whole preview)
  const [languages, issues, readme] = await Promise.all([
    githubGet<Record<string, number>>(`/repos/${encoded}/languages`).catch(() => null),
    githubGet<GitHubIssueResponse[]>(
      `/repos/${encoded}/issues?state=open&per_page=50&sort=updated`
    ).catch(() => null),
    githubGetRaw(`/repos/${encoded}/readme`),
  ]);

  const openIssues: GitHubPreviewIssue[] = (issues ?? [])
    .map((issue) => ({
      title: issue.title,
      url: issue.html_url,
      labels: normalizeIssueLabels(issue.labels),
    }))
    .filter((issue) => issue.labels.some((label) => INTERESTING_LABELS.has(label.toLowerCase())))
    .slice(0, 6);

  const languageBreakdown = languages
    ? computeLanguageBreakdown(languages)
    : repoData.language
      ? { [repoData.language]: 100 }
      : {};

  return {
    owner,
    repo,
    fullName: repoData.full_name,
    htmlUrl: repoData.html_url,
    name: repoData.name,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    language: repoData.language,
    languageBreakdown,
    topics: repoData.topics ?? [],
    license: repoData.license?.spdx_id || repoData.license?.name || null,
    lastCommitAt: repoData.pushed_at,
    openIssues,
    readmeExcerpt: readme ? truncateReadme(readme) : null,
  };
}
