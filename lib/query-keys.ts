/**
 * React Query / TanStack Query keys.
 * Centralized key factory for consistent cache management.
 */

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    edit: (id: string) => ['projects', id, 'edit'] as const,
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
