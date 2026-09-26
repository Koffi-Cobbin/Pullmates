-- =============================================================================
-- PullMates — 000006: Join-request notifications & accept flow
--
--   insert join_requests -> notify the project owner   (type join_request)
--   update pending -> accepted:
--       * promote/insert project_members row to 'active' (atomic, definer)
--       * notify the requester                        (type join_accepted)
--   pending -> declined: silent (no notification UI for it)
-- Both functions are SECURITY DEFINER so they can write notifications and
-- project_members on behalf of the acting client (RLS owner-only writes).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New join request -> notify the project owner
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_join_request_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_title text;
  v_owner_id uuid;
  v_requester_username text;
  v_requester_name text;
begin
  select title, owner_id into v_project_title, v_owner_id
  from public.projects where id = new.project_id;

  select username, coalesce(full_name, username)
    into v_requester_username, v_requester_name
  from public.profiles where id = new.user_id;

  if v_owner_id is null or v_owner_id = new.user_id then
    return new;
  end if;

  insert into public.notifications (user_id, type, payload)
  values (
    v_owner_id,
    'join_request',
    jsonb_build_object(
      'projectId', new.project_id,
      'projectTitle', coalesce(v_project_title, ''),
      'requestId', new.id,
      'requesterUsername', coalesce(v_requester_username, ''),
      'requesterName', coalesce(v_requester_name, ''),
      'messagePreview', left(new.message, 140)
    )
  );

  return new;
end;
$$;

drop trigger if exists join_requests_notify on public.join_requests;
create trigger join_requests_notify
  after insert on public.join_requests
  for each row execute function public.handle_new_join_request_notification();

-- ---------------------------------------------------------------------------
-- pending -> accepted: promote member + notify requester
-- ---------------------------------------------------------------------------
create or replace function public.handle_join_request_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_title text;
  v_owner_id uuid;
  v_owner_username text;
  v_owner_name text;
begin
  if new.status <> 'accepted' or old.status = 'accepted' then
    return new;
  end if;

  select title, owner_id into v_project_title, v_owner_id
  from public.projects where id = new.project_id;

  select username, coalesce(full_name, username)
    into v_owner_username, v_owner_name
  from public.profiles where id = v_owner_id;

  -- promote the requester to an active member (atomic with the decision)
  insert into public.project_members (project_id, user_id, status)
  values (new.project_id, new.user_id, 'active')
  on conflict (project_id, user_id)
  do update set status = 'active', joined_at = now();

  insert into public.notifications (user_id, type, payload)
  values (
    new.user_id,
    'join_accepted',
    jsonb_build_object(
      'projectId', new.project_id,
      'projectTitle', coalesce(v_project_title, ''),
      'ownerUsername', coalesce(v_owner_username, ''),
      'ownerName', coalesce(v_owner_name, '')
    )
  );

  return new;
end;
$$;

drop trigger if exists join_requests_decided on public.join_requests;
create trigger join_requests_decided
  after update on public.join_requests
  for each row
  when (old.status = 'pending' and new.status = 'accepted')
  execute function public.handle_join_request_decision();
