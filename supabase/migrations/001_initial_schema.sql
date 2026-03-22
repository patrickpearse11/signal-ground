-- Signal + Ground initial schema
-- Run this in Supabase Dashboard → SQL Editor

create table users (
  id uuid primary key default gen_random_uuid(),
  zip text default '91356',
  interests text[] default '{}',
  created_at timestamptz default now()
);

create table signals (
  id uuid primary key default gen_random_uuid(),
  neutral_title text,
  summary_paragraph text,
  perspectives text check (perspectives in ('balanced', 'consensus', 'divergent')),
  local_impact text,
  tags text[] default '{}',
  escalation_level int check (escalation_level between 1 and 5),
  created_at timestamptz default now()
);

create table briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date default current_date,
  content_json jsonb,
  created_at timestamptz default now()
);

create table ground_data (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('rep', 'meeting', 'event')),
  content_json jsonb,
  zip text,
  updated_at timestamptz default now()
);

create table impact_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action_type text,
  description text,
  created_at timestamptz default now()
);

-- Powers Signal tab Chokepoint cards (Panama, Suez, Hormuz, Malacca, Trans-Pacific)
-- grok_oneliner is refreshed by a scheduled Supabase Edge Function cron (Session 3)
create table trade_routes (
  id uuid primary key default gen_random_uuid(),
  route_name text,       -- e.g. "Panama Canal"
  status text,           -- e.g. "open", "congested", "closed"
  grok_oneliner text,    -- Grok-generated one-line status summary
  updated_at timestamptz default now()
);

-- Seed the 5 chokepoint routes
insert into trade_routes (route_name, status, grok_oneliner) values
  ('Panama Canal', 'unknown', 'Status pending first data sync.'),
  ('Suez Canal', 'unknown', 'Status pending first data sync.'),
  ('Strait of Hormuz', 'unknown', 'Status pending first data sync.'),
  ('Strait of Malacca', 'unknown', 'Status pending first data sync.'),
  ('Trans-Pacific Route', 'unknown', 'Status pending first data sync.');
