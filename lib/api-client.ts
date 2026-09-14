/**
 * Typed API client for PullMates backend.
 * Follows code quality standards: pure functions, immutability, composition.
 *
 * @module lib/api-client
 */

import type {
  User,
  Project,
  JoinRequest,
  Update,
  Comment,
  Reaction,
  Notification,
  PaginatedResponse,
} from './types';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export interface ApiError extends Error {
  status: number;
  statusText: string;
  body?: unknown;
}

export function createApiError(
  status: number,
  statusText: string,
  message: string,
  body?: unknown
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.status = status;
  error.statusText = statusText;
  error.body = body;
  return error;
}

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

export interface RequestInit extends globalThis.RequestInit {
  headers?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ProjectListParams extends PaginationParams {
  stage?: string;
  search?: string;
}

export interface UpdateListParams extends PaginationParams {
  project?: string;
}

export interface CommentListParams extends PaginationParams {
  update?: string;
}

export interface NotificationListParams extends PaginationParams {
  read?: boolean;
}

// ---------------------------------------------------------------------------
// Request body types
// ---------------------------------------------------------------------------

export interface CreateProjectBody {
  title: string;
  description?: string;
  stage?: string;
  visibility?: string;
  repoUrl?: string;
  tags?: string[];
  rolesWanted?: string[];
}

export interface UpdateProjectBody {
  title?: string;
  description?: string;
  stage?: string;
  visibility?: string;
  repoUrl?: string;
  tags?: string[];
  rolesWanted?: string[];
}

export interface JoinRequestBody {
  message: string;
}

export interface UpdateUpdateBody {
  body: string;
  linkedCommitSha?: string;
}

export interface CreateCommentBody {
  body: string;
}

export interface CreateReactionBody {
  targetType: string;
  targetId: string;
  reactionType: string;
}

export interface UpdateUserBody {
  bio?: string;
  avatarUrl?: string;
  skills?: Array<{ id?: string; name: string }>;
  links?: Array<{ id?: string; label: string; url: string }>;
}

// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => string | null;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  getToken: () => {
    if (typeof window === 'undefined') return null;
    // Try NextAuth session token
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((c) => c.trim().startsWith('next-auth.session-token='));
    return sessionCookie?.split('=')[1] || null;
  },
};

// ---------------------------------------------------------------------------
// Core fetch wrapper (pure function)
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  config: ApiClientConfig = DEFAULT_CONFIG
): Promise<T> {
  const token = config.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${config.baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }
    throw createApiError(
      response.status,
      response.statusText,
      `API request failed: ${response.status} ${response.statusText}`,
      body
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Query string builder (pure function)
// ---------------------------------------------------------------------------

function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.append(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

export function paginationParams(params?: PaginationParams): string {
  if (!params) return '';
  return buildQueryString(params as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------

export interface ProjectsApi {
  list: (params?: ProjectListParams) => Promise<PaginatedResponse<Project>>;
  get: (id: string) => Promise<Project>;
  create: (body: CreateProjectBody) => Promise<Project>;
  update: (id: string, body: UpdateProjectBody) => Promise<Project>;
  remove: (id: string) => Promise<void>;

  // Join requests
  listJoinRequests: (
    projectId: string,
    params?: PaginationParams
  ) => Promise<PaginatedResponse<JoinRequest>>;
  createJoinRequest: (projectId: string, body: JoinRequestBody) => Promise<JoinRequest>;

  // Updates
  listUpdates: (projectId: string, params?: UpdateListParams) => Promise<PaginatedResponse<Update>>;
  createUpdate: (projectId: string, body: UpdateUpdateBody) => Promise<Update>;

  // Reactions
  createReaction: (projectId: string, body: CreateReactionBody) => Promise<Reaction>;

  // Comments
  listComments: (
    projectId: string,
    params?: CommentListParams
  ) => Promise<PaginatedResponse<Comment>>;
  createComment: (projectId: string, body: CreateCommentBody) => Promise<Comment>;
}

function createProjectsApi(config: ApiClientConfig): ProjectsApi {
  return {
    list: (params) =>
      apiFetch<PaginatedResponse<Project>>(`/api/projects/${paginationParams(params)}`, {}, config),

    get: (id) => apiFetch<Project>(`/api/projects/${id}/`, {}, config),

    create: (body) =>
      apiFetch<Project>('/api/projects/', { method: 'POST', body: JSON.stringify(body) }, config),

    update: (id, body) =>
      apiFetch<Project>(
        `/api/projects/${id}/`,
        { method: 'PATCH', body: JSON.stringify(body) },
        config
      ),

    remove: (id) => apiFetch<void>(`/api/projects/${id}/`, { method: 'DELETE' }, config),

    listJoinRequests: (projectId, params) =>
      apiFetch<PaginatedResponse<JoinRequest>>(
        `/api/projects/${projectId}/join-requests/${paginationParams(params)}`,
        {},
        config
      ),

    createJoinRequest: (projectId, body) =>
      apiFetch<JoinRequest>(
        `/api/projects/${projectId}/join-requests/`,
        { method: 'POST', body: JSON.stringify(body) },
        config
      ),

    listUpdates: (projectId, params) =>
      apiFetch<PaginatedResponse<Update>>(
        `/api/projects/${projectId}/updates/${paginationParams(params)}`,
        {},
        config
      ),

    createUpdate: (projectId, body) =>
      apiFetch<Update>(
        `/api/projects/${projectId}/updates/`,
        { method: 'POST', body: JSON.stringify(body) },
        config
      ),

    createReaction: (projectId, body) =>
      apiFetch<Reaction>(
        `/api/projects/${projectId}/reactions/`,
        { method: 'POST', body: JSON.stringify(body) },
        config
      ),

    listComments: (projectId, params) =>
      apiFetch<PaginatedResponse<Comment>>(
        `/api/projects/${projectId}/comments/${paginationParams(params)}`,
        {},
        config
      ),

    createComment: (projectId, body) =>
      apiFetch<Comment>(
        `/api/projects/${projectId}/comments/`,
        { method: 'POST', body: JSON.stringify(body) },
        config
      ),
  };
}

// ---------------------------------------------------------------------------
// Notifications API
// ---------------------------------------------------------------------------

export interface NotificationsApi {
  list: (params?: NotificationListParams) => Promise<PaginatedResponse<Notification>>;
}

function createNotificationsApi(config: ApiClientConfig): NotificationsApi {
  return {
    list: (params) =>
      apiFetch<PaginatedResponse<Notification>>(
        `/api/notifications/${paginationParams(params)}`,
        {},
        config
      ),
  };
}

// ---------------------------------------------------------------------------
// Users API
// ---------------------------------------------------------------------------

export interface UsersApi {
  get: (username: string) => Promise<User>;
  updateMe: (body: UpdateUserBody) => Promise<User>;
}

function createUsersApi(config: ApiClientConfig): UsersApi {
  return {
    get: (username) => apiFetch<User>(`/api/users/${username}/`, {}, config),

    updateMe: (body) =>
      apiFetch<User>('/api/users/me/', { method: 'PATCH', body: JSON.stringify(body) }, config),
  };
}

// ---------------------------------------------------------------------------
// Auth API (optional login/logout helpers)
// ---------------------------------------------------------------------------

export interface AuthApi {
  login: (provider?: string) => void;
  logout: () => Promise<void>;
}

function createAuthApi(config: ApiClientConfig): AuthApi {
  return {
    login: (provider = 'github') => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `${config.baseUrl}/auth/${provider}`;
    },

    logout: async () => {
      await apiFetch<void>('/auth/logout', { method: 'POST' }, config);
    },
  };
}

// ---------------------------------------------------------------------------
// Composed API client
// ---------------------------------------------------------------------------

export interface ApiClient {
  projects: ProjectsApi;
  notifications: NotificationsApi;
  users: UsersApi;
  auth: AuthApi;
}

export function createApiClient(config: Partial<ApiClientConfig> = {}): ApiClient {
  const mergedConfig: ApiClientConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return {
    projects: createProjectsApi(mergedConfig),
    notifications: createNotificationsApi(mergedConfig),
    users: createUsersApi(mergedConfig),
    auth: createAuthApi(mergedConfig),
  };
}

// ---------------------------------------------------------------------------
// Default singleton instance
// ---------------------------------------------------------------------------

export const apiClient = createApiClient();
