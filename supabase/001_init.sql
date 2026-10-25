-- Continual Improvement Academy — accounts, cloud save, feedback and requests.
-- Run once in Supabase: SQL Editor → New query → paste this file → Run.
-- Every table has row level security: a user reads and writes only their own rows; only admins read feedback and requests.

-- ---------- users' profiles (one row per account, filled automatically on sign-up) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- admins (add your own account after your first sign-in; see README) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------- the tools' saved data: one row per browser storage key ----------
create table if not exists public.user_data (
  user_id     uuid not null references auth.users (id) on delete cascade,
  key         text not null check (char_length(key) between 1 and 200),
  value       text not null check (char_length(value) <= 5000000),
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;

drop policy if exists "user_data: own rows" on public.user_data;
create policy "user_data: own rows" on public.user_data for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- feedback ("Share your feedback") ----------
create table if not exists public.feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid default auth.uid() references auth.users (id) on delete set null,
  ref         text check (char_length(ref) <= 60),
  tool        text not null check (char_length(tool) <= 60),
  rating      smallint check (rating between 1 and 5),
  recommend   text check (recommend in ('y', 'm', 'n')),
  role        text check (char_length(role) <= 20),
  useful      text check (char_length(useful) <= 5000),
  improve     text not null check (char_length(improve) between 1 and 5000),
  name        text check (char_length(name) <= 200),
  email       text check (char_length(email) <= 320),
  lang        text check (lang in ('ar', 'en'))
);
alter table public.feedback enable row level security;

drop policy if exists "feedback: anyone can send" on public.feedback;
create policy "feedback: anyone can send" on public.feedback for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "feedback: admins read" on public.feedback;
create policy "feedback: admins read" on public.feedback for select to authenticated using (public.is_admin());

-- ---------- consultation and training requests (a copy; the e-mail flow stays) ----------
create table if not exists public.service_requests (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid default auth.uid() references auth.users (id) on delete set null,
  kind        text not null check (kind in ('consult', 'training')),
  ref         text check (char_length(ref) <= 60),
  payload     jsonb not null check (pg_column_size(payload) <= 20000),
  lang        text check (lang in ('ar', 'en'))
);
alter table public.service_requests enable row level security;

drop policy if exists "requests: anyone can send" on public.service_requests;
create policy "requests: anyone can send" on public.service_requests for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "requests: admins read" on public.service_requests;
create policy "requests: admins read" on public.service_requests for select to authenticated using (public.is_admin());

-- ---------- admin overview: accounts and their last saved work ----------
create or replace function public.admin_users()
returns table (id uuid, email text, created_at timestamptz, last_seen timestamptz, keys bigint, last_saved timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.email, p.created_at, p.last_seen, count(d.key), max(d.updated_at)
  from public.profiles p left join public.user_data d on d.user_id = p.id
  where public.is_admin()
  group by p.id
  order by p.created_at desc
$$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
