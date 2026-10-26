-- Continual Improvement Academy — certification finder results (run once, after 001_init.sql).
-- SQL Editor → New query → paste → Run. Safe to run again.
-- One row per report a visitor opens: their answers in short and what was recommended. No name or email is stored for
-- visitors who are not signed in; for signed-in users the row is linked to their account (and the organization name they typed).

create table if not exists public.finder_reports (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  user_id       uuid default auth.uid() references auth.users (id) on delete set null,
  h             text check (char_length(h) <= 40),
  sectors       text[] not null check (cardinality(sectors) between 1 and 3),
  sector_names  text check (char_length(sector_names) <= 300),
  size          text check (char_length(size) <= 4),
  held          text[] check (cardinality(held) <= 12),
  goal          text check (char_length(goal) <= 10),
  recs          text[] check (cardinality(recs) <= 12),
  accr          text[] check (cardinality(accr) <= 6),
  ready         smallint check (ready between 0 and 100),
  months_first  smallint check (months_first between 0 and 60),
  months_total  smallint check (months_total between 0 and 60),
  org           text check (char_length(org) <= 120),
  lang          text check (lang in ('ar', 'en'))
);
alter table public.finder_reports enable row level security;

drop policy if exists "finder: anyone can send" on public.finder_reports;
create policy "finder: anyone can send" on public.finder_reports for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "finder: admins read" on public.finder_reports;
create policy "finder: admins read" on public.finder_reports for select to authenticated using (public.is_admin());
