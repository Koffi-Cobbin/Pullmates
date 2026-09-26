/**
 * React Query / TanStack Query keys.
 * Centralized key factory for consistent cache management.
 */

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    edit: (id: string) => ['projects', id, 'edit'] as const,
    updates: (id: string) => ['projects', id, 'updates'] as const,
    comments: (id: string) => ['projects', id, 'comments'] as const,
    reactions: (id: string) => ['projects', id, 'reactions'] as const,
    joinRequest: (projectId: string, userId: string) =>
      ['projects', projectId, 'join-request', userId] as const,
    membership: (projectId: string, userId: string) =>
      ['projects', projectId, 'membership', userId] as const,
    byOwner: (ownerId: string) => ['projects', 'owner', ownerId] as const,
  },
  feed: {
    all: ['feed'] as const,
  },
  profile: {
    detail: (username: string) => ['profile', username] as const,
    settings: ['profile', 'settings'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
} as const;
