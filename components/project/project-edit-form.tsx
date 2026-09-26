'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { ProjectStage } from '@/lib/types';
import { updateProject } from '@/lib/supabase/data';
import { useProject } from '@/lib/supabase/hooks';
import { useUser } from '@/lib/supabase/use-user';

const stageOptions: Array<{ value: ProjectStage; label: string }> = [
  { value: ProjectStage.IDEA_PRIVATE, label: 'Private Idea' },
  { value: ProjectStage.IDEA_PUBLIC, label: 'Public Idea' },
  { value: ProjectStage.BUILDING, label: 'Building' },
  { value: ProjectStage.LAUNCHED, label: 'Launched' },
  { value: ProjectStage.MAINTAINED, label: 'Maintained' },
];

function ChipInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const value = draft.trim().replace(/,$/, '');
    if (value && !items.includes(value)) {
      onChange([...items, value]);
    }
    setDraft('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="mb-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((i) => i !== item))}
              aria-label={`Remove ${item}`}
              className="text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ProjectEditForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status } = useUser();
  const { data: project, isLoading } = useProject(id);

  const isOwner = Boolean(user && project && project.owner.id === user.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<ProjectStage>(ProjectStage.BUILDING);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [repoUrl, setRepoUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rolesWanted, setRolesWanted] = useState<string[]>([]);

  useEffect(() => {
    if (!project) return;
    setTitle(project.title);
    setDescription(project.description ?? '');
    setStage(project.stage);
    setVisibility(project.visibility === 'private' ? 'private' : 'public');
    setRepoUrl(project.repoUrl ?? '');
    setTags(project.tags);
    setRolesWanted(project.rolesWanted);
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProject(id, {
        title: title.trim(),
        description: description.trim() || null,
        stage,
        visibility,
        repoUrl: repoUrl.trim() || null,
        tags,
        rolesWanted,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      router.push(`/projects/${id}`);
    },
  });

  if (isLoading || status === 'loading') {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-96 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
      </div>
    );
  }

  if (!project || !isOwner) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project ? 'Not authorized' : 'Project not found'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Only the project owner can edit this project.
          </p>
          <Link
            href={`/projects/${id}`}
            className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
          >
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors';
  const canSubmit = title.trim().length > 0 && !saveMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Project
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Edit Project</h1>

      <form
        className="mt-6 space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) saveMutation.mutate();
        }}
      >
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this project do?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stage
            </label>
            <select
              id="edit-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as ProjectStage)}
              className={inputClass}
            >
              {stageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <select
              id="edit-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className={inputClass}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-repo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repository URL
          </label>
          <input
            id="edit-repo"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className={inputClass}
          />
        </div>

        <ChipInput label="Tags" items={tags} onChange={setTags} placeholder="Add a tag, press Enter" />
        <ChipInput
          label="Roles Wanted"
          items={rolesWanted}
          onChange={setRolesWanted}
          placeholder="Add a role, press Enter"
        />

        {saveMutation.isError && (
          <p className="text-sm text-red-500">Failed to save changes. Please try again.</p>
        )}

        <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <Link
            href={`/projects/${id}`}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
