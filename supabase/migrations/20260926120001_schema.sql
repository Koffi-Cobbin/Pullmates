-- =============================================================================
-- PullMates — 000001: Schema
-- Ported from backend/Backend.md (Django models) to Postgres for Supabase.
-- IDs are text (seeded slugs like 'proj-1'; new rows default to a uuid string)
-- except profiles, which key off auth user ids (uuid).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (app-level user data; id matches auth.users.id but is not FK'd so
-- demo users can be seeded without auth rows — a trigger syncs auth deletes)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key,
  username text not null unique,
  email text,
  full_name text,
  bio text,
  avatar_url text,
  github_username text not null default '',
  reputation_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_-]{3,30}$'),
  constraint profiles_username_reserved check (
    username not in ('settings', 'new', 'edit', 'view', 'signin', 'admin', 'feed')
  )
);

-- ---------------------------------------------------------------------------
-- Skills & profile links
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  id text primary key default gen_random_uuid()::text,
  name text not null unique
);

create table if not exists public.user_skills (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id text not null references public.skills (id) on delete cascade,
  primary key (user_id, skill_id)
);

create table if not exists public.profile_links (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  url text not null
);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  stage text not null default 'IDEA_PRIVATE',
  visibility text not null default 'private',
  repo_url text,
  repo_synced_data jsonb,
  tags text[] not null default '{}',
  roles_wanted text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  constraint projects_title_len check (char_length(title) between 1 and 200),
  constraint projects_stage_check check (
    stage in ('IDEA_PRIVATE', 'IDEA_PUBLIC', 'BUILDING', 'LAUNCHED', 'MAINTAINED')
  ),
  constraint projects_visibility_check check (visibility in ('public', 'private'))
);

create index if not exists projects_visibility_stage_idx
  on public.projects (visibility, stage);
create index if not exists projects_last_activity_idx
  on public.projects (last_activity_at desc);
create index if not exists projects_owner_idx
  on public.projects (owner_id);

-- ---------------------------------------------------------------------------
-- Membership & join requests
-- ---------------------------------------------------------------------------
create table if not exists public.project_members (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default '',
  status text not null default 'pending',
  joined_at timestamptz not null default now(),
  constraint project_members_status_check check (status in ('pending', 'active', 'left')),
  unique (project_id, user_id)
);

create table if not exists public.join_requests (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint join_requests_status_check check (status in ('pending', 'accepted', 'declined'))
);

-- ---------------------------------------------------------------------------
-- Updates
-- ---------------------------------------------------------------------------
create table if not exists public.updates (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  linked_commit_sha text,
  created_at timestamptz not null default now()
);

create index if not exists updates_project_idx
  on public.updates (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Comments (project always set; update_id set when commenting on an update)
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id) on delete cascade,
  update_id text references public.updates (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_update_idx
  on public.comments (update_id, created_at);

-- ---------------------------------------------------------------------------
-- Reactions (polymorphic target, as in the Django spec)
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  id text primary key default gen_random_uuid()::text,
  target_type text not null,
  target_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  constraint reactions_target_type_check check (target_type in ('project', 'update')),
  unique (target_type, target_id, user_id, reaction_type)
);

create index if not exists reactions_target_idx
  on public.reactions (target_type, target_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Feed ordering: posting an update bumps the project's last_activity_at.
-- SECURITY DEFINER so it works regardless of the caller's project RLS.
-- Uses greatest() so seeded historical timestamps are preserved.
-- ---------------------------------------------------------------------------
create or replace function public.bump_project_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects
     set last_activity_at = greatest(last_activity_at, new.created_at)
   where id = new.project_id;
  return new;
end;
$$;

drop trigger if exists updates_bump_project_activity on public.updates;
create trigger updates_bump_project_activity
  after insert on public.updates
  for each row execute function public.bump_project_activity();
