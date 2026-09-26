/**
 * React Query hooks wrapping the Supabase data layer.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import {
  fetchFeedProjects,
  fetchMyJoinRequest,
  fetchNotifications,
  fetchProfileById,
  fetchProfileByUsername,
  fetchProject,
  fetchProjectComments,
  fetchProjectReactions,
  fetchProjectUpdates,
  fetchUserProjects,
} from './data';

export function useFeedProjects() {
  return useQuery({
    queryKey: queryKeys.feed.all,
    queryFn: fetchFeedProjects,
  });
}

export function useProject(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });
}

export function useProjectUpdates(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.updates(projectId ?? ''),
    queryFn: () => fetchProjectUpdates(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useProjectComments(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.comments(projectId ?? ''),
    queryFn: () => fetchProjectComments(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useProjectReactions(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.reactions(projectId ?? ''),
    queryFn: () => fetchProjectReactions(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useProfile(username: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.detail(username ?? ''),
    queryFn: () => fetchProfileByUsername(username as string),
    enabled: Boolean(username),
  });
}

export function useMyProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.profile.settings, userId ?? ''],
    queryFn: () => fetchProfileById(userId as string),
    enabled: Boolean(userId),
  });
}

export function useProfileProjects(ownerId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.byOwner(ownerId ?? ''),
    queryFn: () => fetchUserProjects(ownerId as string),
    enabled: Boolean(ownerId),
  });
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: fetchNotifications,
    enabled,
  });
}

export function useMyJoinRequest(
  projectId: string | null | undefined,
  userId: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.projects.joinRequest(projectId ?? '', userId ?? ''),
    queryFn: () => fetchMyJoinRequest(projectId as string, userId as string),
    enabled: Boolean(projectId && userId),
  });
}
