/**
 * Shared TypeScript types for PullMates frontend.
 * Mirrors backend serializers.
 */

// ---------------------------------------------------------------------------
// User types
// ---------------------------------------------------------------------------

export interface Skill {
  id: string;
  name: string;
}

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  githubUsername: string;
  reputationScore: number;
  skills: Skill[];
  links: ProfileLink[];
}

// ---------------------------------------------------------------------------
// Project types
// ---------------------------------------------------------------------------

export enum ProjectStage {
  IDEA_PRIVATE = 'IDEA_PRIVATE',
  IDEA_PUBLIC = 'IDEA_PUBLIC',
  BUILDING = 'BUILDING',
  LAUNCHED = 'LAUNCHED',
  MAINTAINED = 'MAINTAINED',
}

export interface Project {
  id: string;
  owner: User;
  title: string;
  description: string | null;
  stage: ProjectStage;
  visibility: string;
  repoUrl: string | null;
  repoSyncedData: Record<string, unknown> | null;
  tags: string[];
  rolesWanted: string[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
}

export interface ProjectMember {
  id: string;
  project: string;
  user: User;
  role: string;
  status: string;
  joinedAt: string;
}

export interface JoinRequest {
  id: string;
  project: string;
  user: User;
  message: string;
  status: string;
  createdAt: string;
}

export interface Update {
  id: string;
  project: string;
  author: User;
  body: string;
  linkedCommitSha: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Engagement types
// ---------------------------------------------------------------------------

export interface Comment {
  id: string;
  project: string;
  update: string;
  author: User;
  body: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  targetType: string;
  targetId: string;
  user: User;
  reactionType: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
