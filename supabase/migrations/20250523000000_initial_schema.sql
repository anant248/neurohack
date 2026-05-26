-- ============================================================
-- Interprep — Phase 2 initial schema
-- Run in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. Profiles (mirrors auth.users, auto-populated by trigger)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- 2. Practice sessions
create table if not exists public.practice_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  question           text not null,
  eye_contact_score  integer not null check (eye_contact_score between 0 and 100),
  expression_score   integer not null check (expression_score between 0 and 100),
  ai_feedback        text,
  created_at         timestamptz not null default now()
);

-- Index for fast per-user history queries
create index if not exists practice_sessions_user_id_idx
  on public.practice_sessions (user_id, created_at desc);

-- 3. Row Level Security
alter table public.profiles         enable row level security;
alter table public.practice_sessions enable row level security;

-- Profiles: each user sees and edits only their own row
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Sessions: each user sees and inserts only their own rows
create policy "sessions: select own"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "sessions: insert own"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

-- 4. Trigger — auto-create a profile row on every new sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
