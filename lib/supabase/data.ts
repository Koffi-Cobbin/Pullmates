/**
 * Typed data layer: Supabase queries + mappers onto lib/types domain models.
 * All calls use the browser client; RLS enforces access server-side.
 */

import { createClient } from './client';
import type {
  Comment,
  Notification,
  ProfileLink,
  Project,
  Reaction,
  Skill,
  Update,
  User,
} from '../types';
import { ProjectStage } from '../types';

// ---------------------------------------------------------------------------
// Row types (snake_case as stored in Postgres)
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_username: string;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  stage: ProjectStage;
  visibility: string;
  repo_url: string | null;
  repo_synced_data: Record<string, unknown> | null;
  tags: string[];
  roles_wanted: string[];
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  owner: ProfileRow;
}

interface UpdateRow {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  linked_commit_sha: string | null;
  created_at: string;
  author: ProfileRow;
}

interface CommentRow {
  id: string;
  project_id: string;
  update_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  author: ProfileRow;
}

interface ReactionRow {
  id: string;
  target_type: string;
  target_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  user: ProfileRow;
}

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface ProfileDetailRow extends ProfileRow {
  user_skills: Array<{ user_id: string; skill: { id: string; name: string } }>;
  profile_links: Array<{ id: string; label: string; url: string }>;
}

const OWNER_SELECT = '*, owner:profiles!projects_owner_id_fkey(*)';

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function toUser(p: ProfileRow): User {
  return {
    id: p.id,
    username: p.username,
    email: p.email ?? '',
    bio: p.bio,
    avatarUrl: p.avatar_url,
    githubUsername: p.github_username,
    reputationScore: p.reputation_score,
    skills: [],
    links: [],
  };
}

function toProject(r: ProjectRow): Project {
  return {
    id: r.id,
    owner: toUser(r.owner),
    title: r.title,
    description: r.description,
    stage: r.stage,
    visibility: r.visibility,
    repoUrl: r.repo_url,
    repoSyncedData: r.repo_synced_data,
    tags: r.tags ?? [],
    rolesWanted: r.roles_wanted ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastActivityAt: r.last_activity_at,
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchFeedProjects(): Promise<Project[]> {
  const { data, error } = await createClient()
    .from('projects')
    .select(OWNER_SELECT)
    .eq('visibility', 'public')
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProjectRow[]).map(toProject);
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await createClient()
    .from('projects')
    .select(OWNER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toProject(data as ProjectRow) : null;
}

export async function fetchProjectUpdates(projectId: string): Promise<Update[]> {
  const { data, error } = await createClient()
    .from('updates')
    .select('*, author:profiles!updates_author_id_fkey(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as UpdateRow[]).map((r) => ({
    id: r.id,
    project: r.project_id,
    author: toUser(r.author),
    body: r.body,
    linkedCommitSha: r.linked_commit_sha,
    createdAt: r.created_at,
  }));
}

export async function fetchProjectComments(projectId: string): Promise<Comment[]> {
  const { data, error } = await createClient()
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CommentRow[]).map((r) => ({
    id: r.id,
    project: r.project_id,
    update: r.update_id ?? '',
    author: toUser(r.author),
    body: r.body,
    createdAt: r.created_at,
  }));
}

export async function fetchProjectReactions(projectId: string): Promise<Reaction[]> {
  const { data, error } = await createClient()
    .from('reactions')
    .select('*, user:profiles!reactions_user_id_fkey(*)')
    .eq('target_type', 'project')
    .eq('target_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ReactionRow[]).map((r) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    user: toUser(r.user),
    reactionType: r.reaction_type,
    createdAt: r.created_at,
  }));
}

export interface ProfileView {
  user: User;
  fullName: string | null;
  skills: Skill[];
  links: ProfileLink[];
}

export async function fetchProfileByUsername(username: string): Promise<ProfileView | null> {
  const { data, error } = await createClient()
    .from('profiles')
    .select('*, user_skills(user_id, skill:skills(id,name)), profile_links(id,label,url)')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProfileDetailRow;
  return {
    user: toUser(row),
    fullName: row.full_name,
    skills: (row.user_skills ?? []).map((s) => s.skill),
    links: (row.profile_links ?? []).map((l) => ({ id: l.id, label: l.label, url: l.url })),
  };
}

export async function fetchProfileById(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await createClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function fetchUserProjects(ownerId: string): Promise<Project[]> {
  const { data, error } = await createClient()
    .from('projects')
    .select(OWNER_SELECT)
    .eq('owner_id', ownerId)
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProjectRow[]).map(toProject);
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await createClient()
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map((r) => ({
    id: r.id,
    user: r.user_id,
    type: r.type,
    payload: r.payload,
    readAt: r.read_at,
    createdAt: r.created_at,
  }));
}

export async function fetchMyJoinRequest(
  projectId: string,
  userId: string
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await createClient()
    .from('join_requests')
    .select('id, status')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as { id: string; status: string } | null) ?? null;
}

export async function fetchIsActiveMember(projectId: string, userId: string): Promise<boolean> {
  const { count, error } = await createClient()
    .from('project_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Writes — content
// ---------------------------------------------------------------------------

export async function createProjectUpdate(input: {
  projectId: string;
  authorId: string;
  body: string;
}): Promise<void> {
  const { error } = await createClient()
    .from('updates')
    .insert({
      project_id: input.projectId,
      author_id: input.authorId,
      body: input.body,
    });
  if (error) throw error;
}

export async function createComment(input: {
  projectId: string;
  updateId: string | null;
  authorId: string;
  body: string;
}): Promise<void> {
  const { error } = await createClient()
    .from('comments')
    .insert({
      project_id: input.projectId,
      update_id: input.updateId,
      author_id: input.authorId,
      body: input.body,
    });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface CreateProjectInput {
  ownerId: string;
  title: string;
  description: string | null;
  stage: ProjectStage;
  visibility: 'public' | 'private';
  repoUrl: string | null;
  tags: string[];
  rolesWanted: string[];
  repoSyncedData?: Record<string, unknown> | null;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data, error } = await createClient()
    .from('projects')
    .insert({
      owner_id: input.ownerId,
      title: input.title,
      description: input.description,
      stage: input.stage,
      visibility: input.visibility,
      repo_url: input.repoUrl,
      tags: input.tags,
      roles_wanted: input.rolesWanted,
      repo_synced_data: input.repoSyncedData ?? null,
    })
    .select(OWNER_SELECT)
    .single();
  if (error) throw error;
  return toProject(data as ProjectRow);
}

export interface UpdateProjectInput {
  title: string;
  description: string | null;
  stage: ProjectStage;
  visibility: 'public' | 'private';
  repoUrl: string | null;
  tags: string[];
  rolesWanted: string[];
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<void> {
  const { error } = await createClient()
    .from('projects')
    .update({
      title: input.title,
      description: input.description,
      stage: input.stage,
      visibility: input.visibility,
      repo_url: input.repoUrl,
      tags: input.tags,
      roles_wanted: input.rolesWanted,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function updateMyProfile(
  userId: string,
  patch: { fullName: string; bio: string }
): Promise<void> {
  const { error } = await createClient()
    .from('profiles')
    .update({ full_name: patch.fullName, bio: patch.bio })
    .eq('id', userId);
  if (error) throw error;
}

export async function toggleReaction(
  targetType: 'project',
  targetId: string,
  userId: string,
  reactionType: string,
  hasReaction: boolean
): Promise<void> {
  const sb = createClient();
  if (hasReaction) {
    const { error } = await sb
      .from('reactions')
      .delete()
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);
    if (error) throw error;
  } else {
    const { error } = await sb
      .from('reactions')
      .insert({ target_type: targetType, target_id: targetId, user_id: userId, reaction_type: reactionType });
    if (error) throw error;
  }
}

export async function submitJoinRequest(projectId: string, userId: string, message: string): Promise<void> {
  const { error } = await createClient()
    .from('join_requests')
    .insert({ project_id: projectId, user_id: userId, message });
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await createClient()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}
