create table if not exists public.md_calculator_org_state (
  org_owner_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.md_calculator_memberships (
  email text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null,
  role text not null default 'rep',
  org_owner_id uuid not null references auth.users(id) on delete cascade,
  parent_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists md_calculator_memberships_user_id_idx on public.md_calculator_memberships(user_id);
create index if not exists md_calculator_memberships_org_owner_id_idx on public.md_calculator_memberships(org_owner_id);

create table if not exists public.md_calculator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  manager_name text,
  role text default 'manager',
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.md_calculator_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  saved_at timestamptz not null default now(),
  state jsonb not null default '{}'::jsonb
);

alter table public.md_calculator_org_state enable row level security;
alter table public.md_calculator_memberships enable row level security;
alter table public.md_calculator_profiles enable row level security;
alter table public.md_calculator_scenarios enable row level security;

drop policy if exists "members read same org" on public.md_calculator_memberships;
create policy "members read same org"
on public.md_calculator_memberships
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_memberships.org_owner_id
      and me.role in ('owner', 'manager')
  )
);

drop policy if exists "owner inserts org members" on public.md_calculator_memberships;
create policy "owner inserts org members"
on public.md_calculator_memberships
for insert
with check (
  exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_memberships.org_owner_id
      and me.role = 'owner'
  )
  or (
    auth.uid() = user_id
    and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    and org_owner_id = auth.uid()
    and role = 'owner'
  )
);

drop policy if exists "claim own membership" on public.md_calculator_memberships;
create policy "claim own membership"
on public.md_calculator_memberships
for update
using (
  (lower(email) = lower(coalesce(auth.jwt()->>'email', '')) and user_id is null)
  or exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_memberships.org_owner_id
      and me.role = 'owner'
  )
)
with check (
  (
    auth.uid() = user_id
    and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
  or exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_memberships.org_owner_id
      and me.role = 'owner'
  )
);

drop policy if exists "members read org state" on public.md_calculator_org_state;
create policy "members read org state"
on public.md_calculator_org_state
for select
using (
  exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_org_state.org_owner_id
  )
);

drop policy if exists "managers update org state" on public.md_calculator_org_state;
create policy "managers update org state"
on public.md_calculator_org_state
for all
using (
  exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_org_state.org_owner_id
      and me.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.md_calculator_memberships me
    where me.user_id = auth.uid()
      and me.org_owner_id = md_calculator_org_state.org_owner_id
      and me.role in ('owner', 'manager')
  )
);

drop policy if exists "users manage own md profile" on public.md_calculator_profiles;
create policy "users manage own md profile"
on public.md_calculator_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users manage own md scenarios" on public.md_calculator_scenarios;
create policy "users manage own md scenarios"
on public.md_calculator_scenarios
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
