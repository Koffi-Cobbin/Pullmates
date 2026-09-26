'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createProjectUpdate } from '@/lib/supabase/data';
import { useUser } from '@/lib/supabase/use-user';

const MAX_LENGTH = 2000;

export default function UpdateComposer({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const postMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not signed in');
      return createProjectUpdate({ projectId, authorId: user.id, body: body.trim() });
    },
    onSuccess: () => {
      setBody('');
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.updates(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <label
        htmlFor="update-composer"
        className="block text-sm font-semibold text-gray-900 dark:text-white"
      >
        Post an update
      </label>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Share progress, a release, or what you&apos;re looking for next.
      </p>
      <textarea
        id="update-composer"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_LENGTH}
        placeholder="What's new with this project?"
        className="mt-3 w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {body.length}/{MAX_LENGTH}
        </span>
        <div className="flex items-center gap-3">
          {postMutation.isError && (
            <span className="text-xs text-red-500">Failed to post. Try again.</span>
          )}
          <button
            type="button"
            onClick={() => {
              const trimmed = body.trim();
              if (trimmed && !postMutation.isPending) postMutation.mutate();
            }}
            disabled={!body.trim() || postMutation.isPending}
            className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm disabled:opacity-60"
          >
            {postMutation.isPending ? 'Posting…' : 'Post Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
