'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createComment } from '@/lib/supabase/data';
import { useUser } from '@/lib/supabase/use-user';

const MAX_LENGTH = 1000;

export default function CommentComposer({
  projectId,
  updateId,
}: {
  projectId: string;
  updateId: string;
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const postMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not signed in');
      return createComment({
        projectId,
        updateId: updateId || null,
        authorId: user.id,
        body: body.trim(),
      });
    },
    onSuccess: () => {
      setBody('');
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments(projectId) });
    },
  });

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
        alt="you"
        className="h-6 w-6 rounded-full mt-0.5"
      />
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const trimmed = body.trim();
              if (trimmed && !postMutation.isPending) postMutation.mutate();
            }
          }}
          maxLength={MAX_LENGTH}
          placeholder="Write a comment…"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = body.trim();
            if (trimmed && !postMutation.isPending) postMutation.mutate();
          }}
          disabled={!body.trim() || postMutation.isPending}
          className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
        >
          {postMutation.isPending ? 'Posting…' : 'Comment'}
        </button>
      </div>
      {postMutation.isError && (
        <span className="self-center text-xs text-red-500">Failed</span>
      )}
    </div>
  );
}
