'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectStage } from '@/lib/types';
import { parseGitHubRepoUrl, fetchGitHubPreview, type GitHubPreview } from '@/lib/github';
import RepoPreviewCard from '@/components/project/repo-preview-card';
import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthGuard from '@/components/auth-guard';
import { queryKeys } from '@/lib/query-keys';
import { createProject } from '@/lib/supabase/data';
import { useUser } from '@/lib/supabase/use-user';

const stageOptions = [
  { value: ProjectStage.IDEA_PRIVATE, label: 'Private Idea', description: 'Only you can see this project' },
  { value: ProjectStage.IDEA_PUBLIC, label: 'Public Idea', description: 'Visible to everyone, looking for collaborators' },
  { value: ProjectStage.BUILDING, label: 'Building', description: 'Actively development in progress' },
  { value: ProjectStage.LAUNCHED, label: 'Launched', description: 'Project is live and available' },
  { value: ProjectStage.MAINTAINED, label: 'Maintained', description: 'Ongoing maintenance and updates' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors';

export default function NewProjectPage() {
  return (
    <AuthGuard>
      <NewProjectContent />
    </AuthGuard>
  );
}

function NewProjectContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<string>(ProjectStage.IDEA_PUBLIC);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [repoUrl, setRepoUrl] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  // GitHub auto-fill
  const [preview, setPreview] = useState<GitHubPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [autoFilledFrom, setAutoFilledFrom] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not signed in');
      return createProject({
        ownerId: user.id,
        title: title.trim(),
        description: description.trim() || null,
        stage: stage as ProjectStage,
        visibility,
        repoUrl: repoUrl.trim() || null,
        tags,
        rolesWanted: roles,
      });
    },
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      router.push(`/projects/${project.id}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || createMutation.isPending) return;
    createMutation.mutate();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addRole = () => {
    if (roleInput.trim() && !roles.includes(roleInput.trim())) {
      setRoles([...roles, roleInput.trim()]);
      setRoleInput('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter(role => role !== roleToRemove));
  };

  const clearPreview = () => {
    setPreview(null);
    setPreviewError(null);
    setAutoFilledFrom(null);
  };

  const applyAutoFill = (data: GitHubPreview, sourceUrl: string) => {
    // Title: only if empty
    if (!title.trim()) {
      setTitle(data.name);
    }
    // Description: only if empty
    if (!description.trim() && data.description) {
      setDescription(data.description);
    }
    // Tags: merge topics + primary language (no dupes, case-insensitive)
    const suggestions = [
      ...(data.language ? [data.language] : []),
      ...data.topics,
    ];
    setTags((prev) => {
      const existing = new Set(prev.map((t) => t.toLowerCase()));
      const merged = [...prev];
      for (const suggestion of suggestions) {
        const key = suggestion.toLowerCase();
        if (!existing.has(key)) {
          merged.push(suggestion);
          existing.add(key);
        }
      }
      return merged;
    });
    setAutoFilledFrom(sourceUrl);
  };

  const fetchPreview = async () => {
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      clearPreview();
      return;
    }
    if (!parseGitHubRepoUrl(trimmed)) {
      setPreviewError('Enter a valid GitHub repository URL (https://github.com/owner/repo)');
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await fetchGitHubPreview(trimmed);
      setPreview(data);
      applyAutoFill(data, trimmed);
    } catch (err) {
      setPreview(null);
      setAutoFilledFrom(null);
      setPreviewError(err instanceof Error ? err.message : 'Failed to fetch repository');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRepoUrlChange = (value: string) => {
    setRepoUrl(value);
    // Clear stale preview when URL changes
    if (preview || previewError) {
      clearPreview();
    }
  };

  const handleRepoUrlBlur = () => {
    const trimmed = repoUrl.trim();
    if (trimmed && parseGitHubRepoUrl(trimmed) && autoFilledFrom !== trimmed) {
      void fetchPreview();
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Feed
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share your project idea and find collaborators to build with.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Project"
            required
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project, its goals, and what you're building..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Stage */}
        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Stage
          </label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className={inputClass}
          >
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
            </label>
          </div>
        </div>

        {/* Repository URL + GitHub Auto-Fill */}
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repository URL{' '}
            <span className="font-normal text-gray-500 dark:text-gray-400">(GitHub auto-fill)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => handleRepoUrlChange(e.target.value)}
              onBlur={handleRepoUrlBlur}
              placeholder="https://github.com/username/repo"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void fetchPreview()}
              disabled={previewLoading || !repoUrl.trim()}
              className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching
                </span>
              ) : (
                'Fetch'
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Paste a public GitHub repo to auto-fill title, description, tags, and preview stats.
          </p>

          {/* Preview error */}
          {previewError && (
            <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {previewError}
            </div>
          )}

          {/* Preview loading skeleton */}
          {previewLoading && !preview && (
            <div className="mt-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse space-y-3">
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-16 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          )}

          {/* Preview card */}
          {preview && (
            <div className="mt-3">
              <RepoPreviewCard preview={preview} />
              <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                ✓ Auto-filled{autoFilledFrom ? ' — title/description only if empty; tags merged' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className={`flex-1 ${inputClass} px-4 py-2 text-sm`}
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Press Enter or click Add to add a tag</p>
        </div>

        {/* Roles Wanted */}
        <div>
          <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Roles Wanted
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-pink-100 dark:bg-pink-900/50 px-3 py-1 text-sm font-medium text-pink-700 dark:text-pink-300"
              >
                {role}
                <button
                  type="button"
                  onClick={() => removeRole(role)}
                  className="ml-1 hover:text-pink-900 dark:hover:text-pink-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="roles"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              placeholder="Add a role..."
              className={`flex-1 ${inputClass} px-4 py-2 text-sm`}
            />
            <button
              type="button"
              onClick={addRole}
              className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">What roles are you looking for?</p>
        </div>

        {/* Actions */}
        {createMutation.isError && (
          <p className="text-sm text-red-500 text-right">
            Failed to create project. Please try again.
          </p>
        )}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/feed"
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || createMutation.isPending}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm disabled:opacity-60"
          >
            {createMutation.isPending ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
