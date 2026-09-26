'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { Notification } from '@/lib/types';
import { markAllNotificationsRead } from '@/lib/supabase/data';
import { useNotifications } from '@/lib/supabase/hooks';
import { useUser } from '@/lib/supabase/use-user';

const typeMeta: Record<string, { icon: string; tint: string }> = {
  join_request: { icon: '🤝', tint: 'bg-blue-50 dark:bg-blue-900/30' },
  new_comment: { icon: '💬', tint: 'bg-purple-50 dark:bg-purple-900/30' },
  join_accepted: { icon: '✅', tint: 'bg-green-50 dark:bg-green-900/30' },
  project_update: { icon: '📣', tint: 'bg-yellow-50 dark:bg-yellow-900/30' },
  reaction: { icon: '👍', tint: 'bg-orange-50 dark:bg-orange-900/30' },
};

const reactionLabels: Record<string, string> = {
  thumbsup: '👍',
  rocket: '🚀',
  bulb: '💡',
};

function describe(n: Notification): { text: string; href: string | null } {
  const p = n.payload as Record<string, string>;
  switch (n.type) {
    case 'join_request':
      return {
        text: `${p.requesterName ?? p.requesterUsername} requested to join ${p.projectTitle}`,
        href: p.projectId ? `/projects/${p.projectId}` : null,
      };
    case 'new_comment':
      return {
        text: `${p.commenterName ?? p.commenterUsername} commented on ${p.projectTitle}: “${p.commentPreview ?? ''}”`,
        href: p.projectId ? `/projects/${p.projectId}` : null,
      };
    case 'join_accepted':
      return {
        text: `${p.ownerName ?? p.ownerUsername} accepted your request to join ${p.projectTitle}`,
        href: p.projectId ? `/projects/${p.projectId}` : null,
      };
    case 'project_update':
      return {
        text: `${p.updaterName ?? p.updaterUsername} posted an update on ${p.projectTitle}`,
        href: p.projectId ? `/projects/${p.projectId}` : null,
      };
    case 'reaction':
      return {
        text: `${p.reactorName ?? p.reactorUsername} reacted ${reactionLabels[p.reactionType] ?? ''} to a project`,
        href: p.targetId ? `/projects/${p.targetId}` : null,
      };
    default:
      return { text: 'New activity', href: null };
  }
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsList() {
  const { user, status } = useUser();
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications(status === 'authenticated');
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAllMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not signed in');
      return markAllNotificationsRead(user.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!markAllMutation.isPending) markAllMutation.mutate();
            }}
            disabled={markAllMutation.isPending}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
          >
            {markAllMutation.isPending ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
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
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No notifications
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Activity on your projects will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] ?? { icon: '🔔', tint: 'bg-gray-50 dark:bg-gray-700' };
            const { text, href } = describe(n);
            const row = (
              <div
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                  n.readAt
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    : 'border-orange-200 dark:border-orange-500/40 bg-orange-50/60 dark:bg-orange-900/20'
                } ${href ? 'hover:border-orange-300 dark:hover:border-orange-500/60 cursor-pointer' : ''}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${meta.tint}`}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{text}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatRelative(n.createdAt)}
                  </p>
                </div>
                {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
              </div>
            );
            return href ? (
              <Link key={n.id} href={href} className="block">
                {row}
              </Link>
            ) : (
              <div key={n.id}>{row}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
