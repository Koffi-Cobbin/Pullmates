-- =============================================================================
-- PullMates — 000005: Notification triggers for updates & comments
--
-- Clients may only insert notifications for themselves (RLS notifications_*),
-- so fan-out to *other* users happens here in SECURITY DEFINER triggers:
--   updates  -> project_update notifications to owner + active members
--   comments -> new_comment notifications to update author + owner + members
-- The acting author is always excluded; recipients are deduped by UNION.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New project update -> notify owner + active members (except the author)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_update_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_title text;
  v_author_username text;
  v_author_name text;
begin
  select title into v_project_title
  from public.projects where id = new.project_id;

  select username, coalesce(full_name, username)
    into v_author_username, v_author_name
  from public.profiles where id = new.author_id;

  insert into public.notifications (user_id, type, payload)
  select
    r.uid,
    'project_update',
    jsonb_build_object(
      'projectId', new.project_id,
      'projectTitle', coalesce(v_project_title, ''),
      'updateId', new.id,
      'updaterUsername', coalesce(v_author_username, ''),
      'updaterName', coalesce(v_author_name, ''),
      'updatePreview', left(new.body, 140)
    )
  from (
    select p.owner_id as uid
    from public.projects p
    where p.id = new.project_id
    union
    select m.user_id
    from public.project_members m
    where m.project_id = new.project_id
      and m.status = 'active'
  ) r
  where r.uid <> new.author_id;

  return new;
end;
$$;

drop trigger if exists updates_notify on public.updates;
create trigger updates_notify
  after insert on public.updates
  for each row execute function public.handle_new_update_notification();

-- ---------------------------------------------------------------------------
-- New comment -> notify update author (if replying to an update) + owner +
-- active members (except the comment author). update_id NULL = project-level
-- comment; the sub-select then yields no rows.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_title text;
  v_author_username text;
  v_author_name text;
begin
  select title into v_project_title
  from public.projects where id = new.project_id;

  select username, coalesce(full_name, username)
    into v_author_username, v_author_name
  from public.profiles where id = new.author_id;

  insert into public.notifications (user_id, type, payload)
  select
    r.uid,
    'new_comment',
    jsonb_build_object(
      'projectId', new.project_id,
      'projectTitle', coalesce(v_project_title, ''),
      'updateId', new.update_id,
      'commenterUsername', coalesce(v_author_username, ''),
      'commenterName', coalesce(v_author_name, ''),
      'commentPreview', left(new.body, 140)
    )
  from (
    select u.author_id as uid
    from public.updates u
    where u.id = new.update_id
    union
    select p.owner_id as uid
    from public.projects p
    where p.id = new.project_id
    union
    select m.user_id as uid
    from public.project_members m
    where m.project_id = new.project_id
      and m.status = 'active'
  ) r
  where r.uid <> new.author_id;

  return new;
end;
$$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify
  after insert on public.comments
  for each row execute function public.handle_new_comment_notification();
