-- Continual Improvement Academy — optional consent to Academy news (run once, after 001_init.sql).
-- SQL Editor → New query → paste → Run. Safe to run again.

alter table public.profiles add column if not exists marketing boolean not null default false;
alter table public.profiles add column if not exists marketing_at timestamptz;

-- the admin overview now also returns the news consent
drop function if exists public.admin_users();
create function public.admin_users()
returns table (id uuid, email text, created_at timestamptz, last_seen timestamptz, keys bigint, last_saved timestamptz, marketing boolean, marketing_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.email, p.created_at, p.last_seen, count(d.key), max(d.updated_at), p.marketing, p.marketing_at
  from public.profiles p left join public.user_data d on d.user_id = p.id
  where public.is_admin()
  group by p.id
  order by p.created_at desc
$$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
