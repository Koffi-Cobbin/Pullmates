'use client';

import Link from 'next/link';
import { use, useMemo, useState } from 'react';
import { mockProjects, mockUpdates, mockComments, mockReactions, mockCurrentUser } from '@/lib/mock-data';
import { ProjectStage } from '@/lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stageBadgeStyles: Record<ProjectStage, string> = {
  [ProjectStage.IDEA_PRIVATE]: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  [ProjectStage.IDEA_PUBLIC]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  [ProjectStage.BUILDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  [ProjectStage.LAUNCHED]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  [ProjectStage.MAINTAINED]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};

const stageLabels: Record<ProjectStage, string> = {
  [ProjectStage.IDEA_PRIVATE]: 'Private Idea',
  [ProjectStage.IDEA_PUBLIC]: 'Public Idea',
  [ProjectStage.BUILDING]: 'Building',
  [ProjectStage.LAUNCHED]: 'Launched',
  [ProjectStage.MAINTAINED]: 'Maintained',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

interface RepoSyncedData {
  name?: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  languageBreakdown?: Record<string, number>;
  lastCommitAt?: string;
  openIssues?: Array<{ title: string; url: string; labels: string[] }>;
  topics?: string[];
}

const reactionTypes = [
  { type: 'thumbsup', label: '👍', name: 'Thumbs up' },
  { type: 'rocket', label: '🚀', name: 'Rocket' },
  { type: 'bulb', label: '💡', name: 'Idea' },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  return <ProjectDetailClient id={id} />;
}

function ProjectDetailClient({ id }: { id: string }) {
  const project = useMemo(() => mockProjects.find((p) => p.id === id), [id]);

  const isOwner = project?.owner.id === mockCurrentUser.id;
  const canView =
    project && (project.visibility === 'public' || isOwner);

  // --- Local interactive state ---
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(() => {
    if (!project) return {};
    const counts: Record<string, number> = { thumbsup: 0, rocket: 0, bulb: 0 };
    mockReactions
      .filter((r) => r.targetType === 'project' && r.targetId === project.id)
      .forEach((r) => {
        counts[r.reactionType] = (counts[r.reactionType] ?? 0) + 1;
      });
    return counts;
  });
  const [activeReactions, setActiveReactions] = useState<Set<string>>(() => new Set());
  const [joinState, setJoinState] = useState<'idle' | 'pending'>('idle');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  if (!canView || !project) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.867v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Project not found</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This project doesn&apos;t exist or isn&apos;t available.
          </p>
          <Link
            href="/feed"
            className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const repo = project.repoSyncedData as RepoSyncedData | null;
  const updates = mockUpdates
    .filter((u) => u.project === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const toggleReaction = (type: string) => {
    setActiveReactions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
        setReactionCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] ?? 0) - 1) }));
      } else {
        next.add(type);
        setReactionCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + 1 }));
      }
      return next;
    });
  };

  const submitJoinRequest = () => {
    setJoinState('pending');
    setShowJoinForm(false);
    setJoinMessage('');
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Feed
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ------------------------------------------------ main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageBadgeStyles[project.stage]}`}
                  >
                    {stageLabels[project.stage]}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.visibility === 'public'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {project.visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {project.description}
                </p>
              </div>
              {isOwner && (
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>

            {/* Owner + dates */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400">
              <Link
                href={`/profile/${project.owner.username}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={
                    project.owner.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner.username}`
                  }
                  alt={project.owner.username}
                  className="h-7 w-7 rounded-full"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">@{project.owner.username}</span>
              </Link>
              <span>Created {formatDate(project.createdAt)}</span>
              <span>Updated {formatRelative(project.updatedAt)}</span>
            </div>

            {/* Action bar: reactions + join */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2">
                {reactionTypes.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => toggleReaction(r.type)}
                    aria-label={r.name}
                    aria-pressed={activeReactions.has(r.type)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      activeReactions.has(r.type)
                        ? 'border-orange-300 bg-orange-50 dark:border-orange-500/50 dark:bg-orange-900/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } text-gray-700 dark:text-gray-300`}
                  >
                    <span>{r.label}</span>
                    <span className="font-medium tabular-nums">{reactionCounts[r.type] ?? 0}</span>
                  </button>
                ))}
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2">
                  {joinState === 'idle' ? (
                    <button
                      type="button"
                      onClick={() => setShowJoinForm((v) => !v)}
                      className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
                    >
                      Request to join
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-yellow-200 dark:border-yellow-500/40 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Pending
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Join message form */}
            {showJoinForm && (
              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                <label
                  htmlFor="join-message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="join-message"
                  rows={3}
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="What do you bring to the team?"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitJoinRequest}
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Updates feed */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Updates</h2>
            {updates.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No updates yet. Check back soon for progress notes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => {
                  const comments = mockComments
                    .filter((c) => c.update === update.id)
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                  return (
                    <article
                      key={update.id}
                      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            update.author.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author.username}`
                          }
                          alt={update.author.username}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${update.author.username}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          >
                            @{update.author.username}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(update.createdAt)} · {formatRelative(update.createdAt)}
                          </p>
                        </div>
                        {update.linkedCommitSha && (
                          <span className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 font-mono text-xs text-gray-600 dark:text-gray-300">
                            {update.linkedCommitSha.slice(0, 7)}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {update.body}
                      </p>

                      {/* Comments */}
                      {comments.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <img
                                src={
                                  comment.author.avatarUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`
                                }
                                alt={comment.author.username}
                                className="h-6 w-6 rounded-full mt-0.5"
                              />
                              <div className="flex-1 min-w-0 rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                                    @{comment.author.username}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatRelative(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ------------------------------------------------ side column */}
        <div className="space-y-6">
          {/* Tags & roles */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Roles Wanted</h3>
              {project.rolesWanted.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.rolesWanted.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        />
                      </svg>
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No roles open right now.</p>
              )}
            </div>
          </div>

          {/* Repository card */}
          {repo ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Repository</h3>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    View on GitHub →
                  </a>
                )}
              </div>

              {repo.name && (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{repo.name}</p>
              )}
              {repo.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{repo.description}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                {typeof repo.stars === 'number' && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07 3.292a1 1 0 00-.364 1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {repo.stars}
                  </span>
                )}
                {typeof repo.forks === 'number' && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 3v12m0 0a3 3 0 103-3M6 15a3 3 0 11-3-3h3m12-6a3 3 0 11-3 3V6a3 3 0 113 3v6a3 3 0 11-3-3"
                      />
                    </svg>
                    {repo.forks}
                  </span>
                )}
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    {repo.language}
                  </span>
                )}
              </div>

              {/* Language breakdown */}
              {repo.languageBreakdown && Object.keys(repo.languageBreakdown).length > 0 && (
                <div className="space-y-2">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    {Object.entries(repo.languageBreakdown).map(([lang, pct], i) => (
                      <div
                        key={lang}
                        className={`h-full ${
                          ['bg-blue-500', 'bg-yellow-400', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'][i % 5]
                        }`}
                        style={{ width: `${pct}%` }}
                        title={`${lang}: ${pct}%`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {Object.entries(repo.languageBreakdown).map(([lang, pct], i) => (
                      <span key={lang} className="flex items-center gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            ['bg-blue-500', 'bg-yellow-400', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'][i % 5]
                          }`}
                        />
                        {lang} {pct}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Open issues */}
              {repo.openIssues && repo.openIssues.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Ways to contribute
                  </h4>
                  <ul className="space-y-2">
                    {repo.openIssues.map((issue) => (
                      <li key={issue.url}>
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 hover:border-orange-200 dark:hover:border-orange-500/40 transition-colors"
                        >
                          <span className="block text-xs font-medium text-gray-900 dark:text-white">
                            {issue.title}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            {issue.labels.map((label) => (
                              <span
                                key={label}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  label === 'help wanted'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                    : label === 'good first issue'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {label}
                              </span>
                            ))}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {repo.lastCommitAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last commit {formatRelative(repo.lastCommitAt)}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No repository linked</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This project doesn&apos;t have a GitHub repo yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
