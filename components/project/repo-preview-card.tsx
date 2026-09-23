'use client';

import { useState } from 'react';
import type { GitHubPreview } from '@/lib/github';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RepoPreviewCardProps {
  preview: GitHubPreview;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BAR_COLORS = [
  'bg-blue-500',
  'bg-yellow-400',
  'bg-pink-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
];

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RepoPreviewCard({ preview }: RepoPreviewCardProps) {
  const [readmeExpanded, setReadmeExpanded] = useState(false);

  const languageEntries = Object.entries(preview.languageBreakdown);
  const lastActivity = formatRelative(preview.lastCommitAt);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <a
              href={preview.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {preview.fullName}
            </a>
          </div>
          {preview.description && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{preview.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
          Linked
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1.5" title="Stars">
          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07 3.292a1 1 0 00-.364 1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {preview.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5" title="Forks">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 3v12m0 0a3 3 0 103-3M6 15a3 3 0 11-3-3h3m12-6a3 3 0 11-3 3V6a3 3 0 113 3v6a3 3 0 11-3-3"
            />
          </svg>
          {preview.forks.toLocaleString()}
        </span>
        {preview.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            {preview.language}
          </span>
        )}
        {preview.license && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{preview.license}</span>
        )}
        {lastActivity && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Active {lastActivity}</span>
        )}
      </div>

      {/* Language breakdown */}
      {languageEntries.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            {languageEntries.map(([lang, pct], i) => (
              <div
                key={lang}
                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${pct}%` }}
                title={`${lang}: ${pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {languageEntries.map(([lang, pct], i) => (
              <span key={lang} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
                {lang} {pct}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {preview.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {preview.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* README excerpt */}
      {preview.readmeExcerpt && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            README
          </h4>
          <pre
            className={`rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono ${
              readmeExpanded ? 'max-h-64 overflow-y-auto' : 'max-h-28 overflow-hidden'
            }`}
          >
            {preview.readmeExcerpt}
          </pre>
          {preview.readmeExcerpt.length > 200 && (
            <button
              type="button"
              onClick={() => setReadmeExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
            >
              {readmeExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Ways to contribute */}
      {preview.openIssues.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Ways to contribute
          </h4>
          <ul className="space-y-2">
            {preview.openIssues.map((issue) => (
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
                          label.toLowerCase() === 'help wanted'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                            : label.toLowerCase() === 'good first issue'
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
    </div>
  );
}
