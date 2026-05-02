-- =============================================================================
-- MushroomIdentifiers — initial schema for the mobile app.
--
-- This migration is designed to be ADDITIVE on top of your existing web schema.
-- If a table already exists from the web app (e.g. profiles), the IF NOT EXISTS
-- guards skip it. Review before running on production.
-- =============================================================================

-- ----- profiles -----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  tier text not null default 'free' check (tier in ('free','explorer','pro','yearly','lifetime')),
  locale text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- ----- user_credits -----
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_remaining integer not null default 0,
  lifetime_remaining integer not null default 30,
  cycle_refresh_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ----- mushrooms (encyclopedia) -----
create table if not exists public.mushrooms (
  id uuid primary key default gen_random_uuid(),
  scientific_name text not null unique,
  common_names text[] not null default '{}',
  family text,
  genus text,
  edibility text not null check (edibility in ('edible','edible_with_caution','inedible','poisonous','deadly','unknown')),
  description text,
  habitat text,
  season_months integer[] not null default '{}',
  toxicity_notes text,
  lookalike_ids uuid[] not null default '{}',
  photos text[] not null default '{}',
  spore_print_color text,
  cap_size_cm numeric[],
  region text[],
  inaturalist_taxon_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mushrooms_scientific_name_idx on public.mushrooms (scientific_name);
create index if not exists mushrooms_common_names_idx on public.mushrooms using gin (common_names);
create index if not exists mushrooms_family_idx on public.mushrooms (family);
create index if not exists mushrooms_edibility_idx on public.mushrooms (edibility);

-- ----- scans -----
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  notes text,
  habitat text,
  location_lat double precision,
  location_lon double precision,
  location_name text,
  result jsonb,
  credits_used integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists scans_user_id_idx on public.scans (user_id, created_at desc);

-- ----- scan_images -----
create table if not exists public.scan_images (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  angle text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists scan_images_scan_id_idx on public.scan_images (scan_id);

-- ----- journal_entries -----
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  title text not null,
  notes text,
  scientific_name text,
  common_name text,
  edibility text,
  found_at timestamptz not null default now(),
  location_lat double precision,
  location_lon double precision,
  location_name text,
  photos text[] not null default '{}',
  weather_snapshot jsonb,
  is_favorite boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists journal_user_idx on public.journal_entries (user_id, found_at desc);
create index if not exists journal_location_idx on public.journal_entries (location_lat, location_lon);

-- ----- chat_messages -----
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_user_idx on public.chat_messages (user_id, created_at);

-- ----- achievements / gamification -----
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, code)
);

-- ----- community posts (optional) -----
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  title text not null,
  body text,
  photos text[] not null default '{}',
  location_lat double precision,
  location_lon double precision,
  upvotes integer not null default 0,
  is_expert_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- RPC: consume_credits — atomic deduction with lifetime fallback.
-- =============================================================================
create or replace function public.consume_credits(p_user_id uuid, p_amount integer)
returns json
language plpgsql
security definer
as $$
declare
  v_monthly integer;
  v_lifetime integer;
  v_take_from_monthly integer;
  v_take_from_lifetime integer;
begin
  select monthly_remaining, lifetime_remaining
    into v_monthly, v_lifetime
    from public.user_credits
   where user_id = p_user_id
   for update;

  if v_monthly is null then
    insert into public.user_credits (user_id, lifetime_remaining)
      values (p_user_id, 30)
      returning monthly_remaining, lifetime_remaining into v_monthly, v_lifetime;
  end if;

  if (v_monthly + v_lifetime) < p_amount then
    return json_build_object('success', false, 'remaining', v_monthly + v_lifetime);
  end if;

  v_take_from_monthly := least(v_monthly, p_amount);
  v_take_from_lifetime := p_amount - v_take_from_monthly;

  update public.user_credits
     set monthly_remaining  = monthly_remaining  - v_take_from_monthly,
         lifetime_remaining = lifetime_remaining - v_take_from_lifetime,
         updated_at = now()
   where user_id = p_user_id;

  return json_build_object(
    'success', true,
    'remaining', (v_monthly + v_lifetime) - p_amount
  );
end;
$$;

-- =============================================================================
-- RPC: grant_monthly_credits — called by RevenueCat webhook after renewal.
-- =============================================================================
create or replace function public.grant_monthly_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.user_credits (user_id, monthly_remaining, cycle_refresh_at)
       values (p_user_id, p_amount, now() + interval '30 days')
  on conflict (user_id) do update
    set monthly_remaining = p_amount,
        cycle_refresh_at = now() + interval '30 days',
        updated_at = now();
end;
$$;

-- =============================================================================
-- Trigger: create profile + free credits on signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
       values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.user_credits (user_id, lifetime_remaining)
       values (new.id, 30)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row-Level Security
-- =============================================================================
alter table public.profiles         enable row level security;
alter table public.user_credits     enable row level security;
alter table public.scans            enable row level security;
alter table public.scan_images      enable row level security;
alter table public.journal_entries  enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.achievements     enable row level security;
alter table public.community_posts  enable row level security;
alter table public.community_comments enable row level security;
alter table public.mushrooms        enable row level security;

-- profiles
create policy if not exists "profiles: own row read"  on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles: own row update" on public.profiles for update using (auth.uid() = id);

-- user_credits (read only — writes go through RPCs)
create policy if not exists "credits: own row read" on public.user_credits for select using (auth.uid() = user_id);

-- scans
create policy if not exists "scans: own rows" on public.scans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scan_images
create policy if not exists "scan_images: through scan" on public.scan_images for all
  using (exists (select 1 from public.scans s where s.id = scan_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.scans s where s.id = scan_id and s.user_id = auth.uid()));

-- journal_entries
create policy if not exists "journal: own rows" on public.journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chat_messages
create policy if not exists "chat: own rows" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- achievements
create policy if not exists "achievements: own rows" on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- community
create policy if not exists "posts: read all" on public.community_posts for select using (true);
create policy if not exists "posts: insert own" on public.community_posts for insert with check (auth.uid() = user_id);
create policy if not exists "posts: update own" on public.community_posts for update using (auth.uid() = user_id);
create policy if not exists "posts: delete own" on public.community_posts for delete using (auth.uid() = user_id);
create policy if not exists "comments: read all" on public.community_comments for select using (true);
create policy if not exists "comments: insert own" on public.community_comments for insert with check (auth.uid() = user_id);
create policy if not exists "comments: delete own" on public.community_comments for delete using (auth.uid() = user_id);

-- mushrooms (encyclopedia, public read)
create policy if not exists "mushrooms: read all" on public.mushrooms for select using (true);

-- =============================================================================
-- Storage buckets
-- =============================================================================
insert into storage.buckets (id, name, public)
  values ('scans', 'scans', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('journal', 'journal', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy if not exists "scans: owner upload" on storage.objects for insert
  with check (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);
create policy if not exists "scans: public read" on storage.objects for select
  using (bucket_id = 'scans');

create policy if not exists "journal: owner upload" on storage.objects for insert
  with check (bucket_id = 'journal' and (storage.foldername(name))[1] = auth.uid()::text);
create policy if not exists "journal: public read" on storage.objects for select
  using (bucket_id = 'journal');

create policy if not exists "avatars: owner upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy if not exists "avatars: public read" on storage.objects for select
  using (bucket_id = 'avatars');
