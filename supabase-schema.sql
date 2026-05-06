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

alter table public.md_calculator_profiles enable row level security;
alter table public.md_calculator_scenarios enable row level security;

create policy "users manage own md profile"
on public.md_calculator_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own md scenarios"
on public.md_calculator_scenarios
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
