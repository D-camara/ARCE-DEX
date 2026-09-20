create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  pokemon_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, pokemon_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_team_id text not null,
  name text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, client_team_id)
);

create table public.team_slots (
  team_id uuid not null references public.teams(id) on delete cascade,
  slot_index integer not null check (slot_index >= 0 and slot_index < 6),
  pokemon jsonb,
  updated_at timestamptz not null default now(),
  primary key (team_id, slot_index)
);

create table public.search_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  searched_at timestamptz not null default now(),
  primary key (user_id, term)
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  updated_at timestamptz not null default now()
);

alter table public.favorites enable row level security;
create policy "own rows only" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.teams enable row level security;
create policy "own rows only" on public.teams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.team_slots enable row level security;
create policy "own rows only" on public.team_slots
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  );

alter table public.search_history enable row level security;
create policy "own rows only" on public.search_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.settings enable row level security;
create policy "own rows only" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table
  public.favorites, public.teams, public.team_slots, public.search_history, public.settings;
