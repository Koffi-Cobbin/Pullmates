/**
 * POST /api/github-preview
 * Body: { repoUrl: string }
 * Returns: { preview: GitHubPreview } or { error: string }
 *
 * Server-side proxy to GitHub REST so the browser never calls GitHub directly.
 * Later, this can delegate to the Django backend endpoint
 * (POST /api/github/preview/) without changing the client contract.
 *
 * @module app/api/github-preview/route
 */

import { NextResponse } from 'next/server';
import { getGitHubPreview, parseGitHubRepoUrl } from '@/lib/github';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const repoUrl =
    typeof body === 'object' && body !== null && 'repoUrl' in body
      ? (body as { repoUrl?: unknown }).repoUrl
      : undefined;

  if (typeof repoUrl !== 'string' || !repoUrl.trim()) {
    return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });
  }

  if (!parseGitHubRepoUrl(repoUrl)) {
    return NextResponse.json(
      { error: 'Enter a valid GitHub repository URL (https://github.com/owner/repo)' },
      { status: 400 }
    );
  }

  try {
    const preview = await getGitHubPreview(repoUrl);
    return NextResponse.json({ preview });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    const message = err instanceof Error ? err.message : 'Failed to fetch repository preview';
    return NextResponse.json({ error: message }, { status });
  }
}
