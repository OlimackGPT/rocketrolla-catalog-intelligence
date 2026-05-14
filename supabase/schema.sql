create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  genre text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists revenue_rows (
  id bigint generated always as identity primary key,
  artist_id uuid references artists(id),
  track_title text,
  isrc text,
  platform text,
  country text,
  month date,
  streams bigint,
  revenue_usd numeric,
  created_at timestamptz default now()
);
