-- =============================================================================
-- PullMates — 000003: Row Level Security
-- Mirrors the permission model in backend/Backend.md §5:
--   - public projects: readable by anyone
--   - private projects: owner + active members only
--   - writes: owner/member/author scoped
--   - notifications: strictly owner-only
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so policies never recurse through RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_project_owner(pid text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid and p.owner_id = auth.uid()
  );
$$;

create or replace function public.is_project_member(pid text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = pid
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.can_view_project(pid text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid
      and (
        p.visibility = 'public'
        or p.owner_id = auth.uid()
        or exists (
          select 1 from public.project_members m
          where m.project_id = p.id
            and m.user_id = auth.uid()
            and m.status = 'active'
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Grants (RLS then restricts what these roles may actually do)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete_own on public.profiles
  for delete using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- skills / user_skills / profile_links
-- ---------------------------------------------------------------------------
alter table public.skills enable row level security;
drop policy if exists skills_select_all on public.skills;
create policy skills_select_all on public.skills
  for select using (true);

alter table public.user_skills enable row level security;
drop policy if exists user_skills_select_all on public.user_skills;
drop policy if exists user_skills_insert_own on public.user_skills;
drop policy if exists user_skills_delete_own on public.user_skills;
create policy user_skills_select_all on public.user_skills
  for select using (true);
create policy user_skills_insert_own on public.user_skills
  for insert with check (user_id = auth.uid());
create policy user_skills_delete_own on public.user_skills
  for delete using (user_id = auth.uid());

alter table public.profile_links enable row level security;
drop policy if exists profile_links_select_all on public.profile_links;
drop policy if exists profile_links_insert_own on public.profile_links;
drop policy if exists profile_links_update_own on public.profile_links;
drop policy if exists profile_links_delete_own on public.profile_links;
create policy profile_links_select_all on public.profile_links
  for select using (true);
create policy profile_links_insert_own on public.profile_links
  for insert with check (user_id = auth.uid());
create policy profile_links_update_own on public.profile_links
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profile_links_delete_own on public.profile_links
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
drop policy if exists projects_select_visible on public.projects;
drop policy if exists projects_insert_own on public.projects;
drop policy if exists projects_update_owner on public.projects;
drop policy if exists projects_delete_owner on public.projects;
create policy projects_select_visible on public.projects
  for select using (
    visibility = 'public'
    or owner_id = auth.uid()
    or public.is_project_member(id)
  );
create policy projects_insert_own on public.projects
  for insert with check (owner_id = auth.uid());
create policy projects_update_owner on public.projects
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_delete_owner on public.projects
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- project_members
-- ---------------------------------------------------------------------------
alter table public.project_members enable row level security;
drop policy if exists project_members_select_all on public.project_members;
drop policy if exists project_members_insert_self on public.project_members;
drop policy if exists project_members_update_owner_or_self on public.project_members;
drop policy if exists project_members_delete_owner_or_self on public.project_members;
create policy project_members_select_all on public.project_members
  for select using (true);
create policy project_members_insert_self on public.project_members
  for insert with check (user_id = auth.uid());
create policy project_members_update_owner_or_self on public.project_members
  for update using (public.is_project_owner(project_id) or user_id = auth.uid())
  with check (public.is_project_owner(project_id) or user_id = auth.uid());
create policy project_members_delete_owner_or_self on public.project_members
  for delete using (public.is_project_owner(project_id) or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- join_requests
-- ---------------------------------------------------------------------------
alter table public.join_requests enable row level security;
drop policy if exists join_requests_select_involved on public.join_requests;
drop policy if exists join_requests_insert_own on public.join_requests;
drop policy if exists join_requests_update_owner on public.join_requests;
drop policy if exists join_requests_delete_involved on public.join_requests;
create policy join_requests_select_involved on public.join_requests
  for select using (
    user_id = auth.uid()
    or public.is_project_owner(project_id)
    or public.is_project_member(project_id)
  );
create policy join_requests_insert_own on public.join_requests
  for insert with check (
    user_id = auth.uid()
    and not public.is_project_owner(project_id)
  );
create policy join_requests_update_owner on public.join_requests
  for update using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));
create policy join_requests_delete_involved on public.join_requests
  for delete using (user_id = auth.uid() or public.is_project_owner(project_id));

-- ---------------------------------------------------------------------------
-- updates
-- ---------------------------------------------------------------------------
alter table public.updates enable row level security;
drop policy if exists updates_select_visible on public.updates;
drop policy if exists updates_insert_member on public.updates;
drop policy if exists updates_update_author on public.updates;
drop policy if exists updates_delete_author_or_owner on public.updates;
create policy updates_select_visible on public.updates
  for select using (public.can_view_project(project_id));
create policy updates_insert_member on public.updates
  for insert with check (
    author_id = auth.uid()
    and (public.is_project_owner(project_id) or public.is_project_member(project_id))
  );
create policy updates_update_author on public.updates
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy updates_delete_author_or_owner on public.updates
  for delete using (author_id = auth.uid() or public.is_project_owner(project_id));

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
alter table public.comments enable row level security;
drop policy if exists comments_select_visible on public.comments;
drop policy if exists comments_insert_visible on public.comments;
drop policy if exists comments_update_author on public.comments;
drop policy if exists comments_delete_author_or_owner on public.comments;
create policy comments_select_visible on public.comments
  for select using (public.can_view_project(project_id));
create policy comments_insert_visible on public.comments
  for insert with check (
    author_id = auth.uid()
    and public.can_view_project(project_id)
  );
create policy comments_update_author on public.comments
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comments_delete_author_or_owner on public.comments
  for delete using (author_id = auth.uid() or public.is_project_owner(project_id));

-- ---------------------------------------------------------------------------
-- reactions
-- ---------------------------------------------------------------------------
alter table public.reactions enable row level security;
drop policy if exists reactions_select_all on public.reactions;
drop policy if exists reactions_insert_own on public.reactions;
drop policy if exists reactions_delete_own on public.reactions;
create policy reactions_select_all on public.reactions
  for select using (true);
create policy reactions_insert_own on public.reactions
  for insert with check (user_id = auth.uid());
create policy reactions_delete_own on public.reactions
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notifications (owner-only, no exceptions)
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;
drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_insert_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_insert_own on public.notifications
  for insert with check (user_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete_own on public.notifications
  for delete using (user_id = auth.uid());
