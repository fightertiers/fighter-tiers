import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConnected = !!supabase;

// SQL to run in Supabase dashboard to create tables:
/*
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order int not null default 0,
  created_at timestamptz default now()
);

create table tiers (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  color text not null default '#6b7280',
  glow_class text not null default 'tier-glow-t5',
  display_order int not null default 0,
  description text,
  created_at timestamptz default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  uuid text,
  country text,
  avatar_url text,
  notes text,
  created_at timestamptz default now()
);

create table player_tiers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  tier_id uuid references tiers(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  ranked_at timestamptz default now(),
  unique(player_id, category_id)
);

create table test_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  category_id uuid references categories(id),
  tier_id uuid references tiers(id),
  notes text,
  tested_at timestamptz default now()
);

-- Enable RLS
alter table categories enable row level security;
alter table tiers enable row level security;
alter table players enable row level security;
alter table player_tiers enable row level security;
alter table test_history enable row level security;

-- Allow public read
create policy "Public read categories" on categories for select using (true);
create policy "Public read tiers" on tiers for select using (true);
create policy "Public read players" on players for select using (true);
create policy "Public read player_tiers" on player_tiers for select using (true);
create policy "Public read test_history" on test_history for select using (true);

-- Allow anon write (for admin — in production use auth)
create policy "Anon insert categories" on categories for insert with check (true);
create policy "Anon update categories" on categories for update using (true);
create policy "Anon delete categories" on categories for delete using (true);
create policy "Anon insert tiers" on tiers for insert with check (true);
create policy "Anon update tiers" on tiers for update using (true);
create policy "Anon delete tiers" on tiers for delete using (true);
create policy "Anon insert players" on players for insert with check (true);
create policy "Anon update players" on players for update using (true);
create policy "Anon delete players" on players for delete using (true);
create policy "Anon insert player_tiers" on player_tiers for insert with check (true);
create policy "Anon update player_tiers" on player_tiers for update using (true);
create policy "Anon delete player_tiers" on player_tiers for delete using (true);
create policy "Anon insert test_history" on test_history for insert with check (true);
create policy "Anon delete test_history" on test_history for delete using (true);
*/
