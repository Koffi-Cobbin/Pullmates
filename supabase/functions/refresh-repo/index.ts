// =============================================================================
// refresh-repo — Supabase Edge Function
// POST { projectId } with a user JWT: re-fetch the project's GitHub repository
// data (stars, forks, languages, topics, open "help wanted" issues, last push)
// and store it in projects.repo_synced_data.
//
// Auth: verify_jwt is disabled in config.toml so CORS preflights reach us;
// authorization is enforced here — a valid user JWT is required and only the
// project owner may sync (RLS on the update provides a second guard).
//
// Optional secret: GITHUB_TOKEN (raises GitHub API rate limit from 60/hr to 5,000/hr).
// =============================================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const GITHUB_API = "https://api.github.com";
const INTERESTING_LABELS = new Set(["help wanted", "good first issue"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  let candidate = url.trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.hostname.toLowerCase() !== "github.com") return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  let repo = segments[1];
  if (repo.toLowerCase().endsWith(".git")) repo = repo.slice(0, -4);

  if (!/^[A-Za-z0-9._-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) return null;
  return { owner, repo };
}

interface GitHubRepoResponse {
  full_name: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string | null;
}

interface GitHubIssueResponse {
  title: string;
  html_url: string;
  labels: Array<{ name?: string } | string>;
}

async function ghGet<T>(path: string): Promise<T | null> {
  const token = Deno.env.get("GITHUB_TOKEN");
  try {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) return null;
    return await response.json() as T;
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

function normalizeIssueLabels(labels: GitHubIssueResponse["labels"]): string[] {
  return labels
    .map((label) => (typeof label === "string" ? label : (label.name ?? "")))
    .filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  let projectId = "";
  try {
    const body = await req.json();
    projectId = typeof body?.projectId === "string" ? body.projectId : "";
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!projectId) {
    return json({ error: "projectId is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Unauthorized" }, 401);
  }
  const user = userData.user;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, owner_id, repo_url")
    .eq("id", projectId)
    .maybeSingle();
  if (projectError) {
    return json({ error: projectError.message }, 500);
  }
  if (!project) {
    return json({ error: "Project not found" }, 404);
  }
  if (project.owner_id !== user.id) {
    return json({ error: "Only the project owner can sync this repository" }, 403);
  }

  const parsed = project.repo_url ? parseGitHubRepoUrl(project.repo_url) : null;
  if (!parsed) {
    return json({ error: "Project has no valid GitHub repository URL" }, 400);
  }

  const encoded = `${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  const repoData = await ghGet<GitHubRepoResponse>(`/repos/${encoded}`);
  if (!repoData) {
    return json({ error: "Failed to fetch repository from GitHub (missing, private, or rate-limited)" }, 502);
  }

  const [languages, issues] = await Promise.all([
    ghGet<Record<string, number>>(`/repos/${encoded}/languages`),
    ghGet<GitHubIssueResponse[]>(`/repos/${encoded}/issues?state=open&per_page=50&sort=updated`),
  ]);

  const openIssues = (issues ?? [])
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

  const payload = {
    name: repoData.name,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    language: repoData.language,
    languageBreakdown,
    lastCommitAt: repoData.pushed_at,
    openIssues,
    topics: repoData.topics ?? [],
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update({ repo_synced_data: payload })
    .eq("id", projectId);
  if (updateError) {
    return json({ error: updateError.message }, 500);
  }

  return json({ ok: true, data: payload });
});
