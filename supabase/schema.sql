-- Stabledex schema
-- Run this in your Supabase SQL editor before running seed.sql

-- Clean up any previous partial run
drop table if exists results cascade;
drop table if exists horses cascade;
drop table if exists competitions cascade;
drop table if exists riders cascade;
drop type if exists discipline_type cascade;
drop type if exists gender_type cascade;
drop function if exists get_rankings cascade;

create type discipline_type as enum ('Show Jumping', 'Dressage', 'Eventing');
create type gender_type as enum ('Stallion', 'Mare', 'Gelding');

create table riders (
  id text primary key,
  name text not null,
  country text not null,
  fei_id text,
  date_of_birth date
);
-- Migration for existing tables: ALTER TABLE riders ADD COLUMN IF NOT EXISTS date_of_birth date;

create table horses (
  id text primary key,
  name text not null,
  breed text not null,
  studbook_number text,
  date_of_birth date,
  gender gender_type,
  sire text,
  dam text,
  country text not null,
  owner text,
  current_rider_id text references riders(id),
  created_at timestamptz default now()
);

create table competitions (
  id text primary key,
  name text not null,
  level text not null,
  discipline discipline_type not null,
  date date not null,
  location text not null,
  country text not null
);

create table results (
  id uuid primary key default gen_random_uuid(),
  horse_id text references horses(id) on delete cascade,
  rider_id text references riders(id),
  competition_id text references competitions(id) on delete cascade,
  placement integer,
  faults numeric(5,2),
  time numeric(7,3),
  class_name text,
  score numeric(5,3),
  created_at timestamptz default now()
);

-- Indexes
create index results_horse_id_idx on results(horse_id);
create index results_rider_id_idx on results(rider_id);
create index results_competition_id_idx on results(competition_id);
create index horses_name_idx on horses(name);
create index horses_breed_idx on horses(breed);

-- Row Level Security (public read)
alter table horses enable row level security;
alter table riders enable row level security;
alter table competitions enable row level security;
alter table results enable row level security;

create policy "Public read" on horses for select using (true);
create policy "Public read" on riders for select using (true);
create policy "Public read" on competitions for select using (true);
create policy "Public read" on results for select using (true);

-- Rankings Postgres function
create or replace function get_rankings(
  p_from date,
  p_discipline text default '',
  p_level text default '',
  p_country text default ''
)
returns table(
  horse_id text,
  horse_name text,
  breed text,
  rider_name text,
  rider_country text,
  discipline text,
  best_level text,
  wins bigint,
  top3 bigint,
  starts bigint,
  points bigint
)
language sql
security definer
as $$
  select
    h.id as horse_id,
    h.name as horse_name,
    h.breed,
    r.name as rider_name,
    r.country as rider_country,
    c.discipline::text as discipline,
    max(c.level) as best_level,
    count(*) filter (where res.placement = 1) as wins,
    count(*) filter (where res.placement <= 3) as top3,
    count(*) as starts,
    (count(*) filter (where res.placement = 1)) * 3 +
    (count(*) filter (where res.placement = 2)) * 2 +
    (count(*) filter (where res.placement = 3)) * 1 as points
  from results res
  join horses h on h.id = res.horse_id
  join riders r on r.id = res.rider_id
  join competitions c on c.id = res.competition_id
  where c.date >= p_from
    and (p_discipline = '' or c.discipline::text = p_discipline)
    and (p_level = '' or c.level = p_level)
    and (p_country = '' or r.country = p_country)
  group by h.id, h.name, h.breed, r.name, r.country, c.discipline
  order by points desc
  limit 100
$$;
