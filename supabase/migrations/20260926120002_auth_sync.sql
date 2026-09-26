-- =============================================================================
-- PullMates — 000002: Auth ↔ profiles sync
-- Creates a profile whenever an auth user appears (OAuth signup), removes it
-- when the auth user is deleted, and backfills profiles for existing users.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  gh text := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'preferred_username',
    new.raw_user_meta_data ->> 'login'
  );
  base text;
  uname text;
  n integer := 0;
begin
  base := lower(coalesce(gh, split_part(coalesce(new.email, ''), '@', 1), 'user'));
  base := regexp_replace(base, '[^a-z0-9_-]', '');
  if char_length(base) < 3 then
    base := base || 'user';
  end if;
  if base in ('settings', 'new', 'edit', 'view', 'signin', 'admin', 'feed') then
    base := base || '1';
  end if;

  uname := base;
  loop
    exit when not exists (select 1 from public.profiles p where p.username = uname);
    n := n + 1;
    exit when n > 100;
    uname := base || n::text;
  end loop;

  insert into public.profiles (id, username, email, full_name, avatar_url, github_username)
  values (
    new.id,
    uname,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    coalesce(gh, '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.profiles where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_user_deleted();

-- ---------------------------------------------------------------------------
-- Backfill: users who signed in before this trigger existed (profiles table
-- is empty at this point, so username collisions are impossible).
-- ---------------------------------------------------------------------------
with candidates as (
  select
    u.id,
    u.email,
    u.raw_user_meta_data,
    coalesce(
      u.raw_user_meta_data ->> 'user_name',
      u.raw_user_meta_data ->> 'preferred_username',
      u.raw_user_meta_data ->> 'login'
    ) as gh,
    lower(
      regexp_replace(
        coalesce(
          u.raw_user_meta_data ->> 'user_name',
          u.raw_user_meta_data ->> 'preferred_username',
          u.raw_user_meta_data ->> 'login',
          split_part(coalesce(u.email, ''), '@', 1),
          'user'
        ), '[^a-z0-9_-]', '', 'g'
      )
    ) as base_username
  from auth.users u
  left join public.profiles p on p.id = u.id
  where p.id is null
),
numbered as (
  select
    c.*,
    case
      when row_number() over (partition by c.base_username order by c.id) = 1
        then c.base_username
      else c.base_username || row_number() over (partition by c.base_username order by c.id)::text
    end as username
  from candidates c
)
insert into public.profiles (id, username, email, full_name, avatar_url, github_username)
select
  n.id,
  case
    when char_length(n.username) > 30 then left(n.username, 30)
    else n.username
  end,
  n.email,
  coalesce(
    n.raw_user_meta_data ->> 'full_name',
    n.raw_user_meta_data ->> 'name',
    split_part(coalesce(n.email, ''), '@', 1)
  ),
  coalesce(
    n.raw_user_meta_data ->> 'avatar_url',
    n.raw_user_meta_data ->> 'picture'
  ),
  coalesce(n.gh, '')
from numbered n
on conflict (username) do nothing;
