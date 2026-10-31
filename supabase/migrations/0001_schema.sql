-- Steelvault Stage 2, part 1: tables, constraints, indexes, triggers.
-- Design notes:
--  * Catalog tables (categories, sets, products, product_prices, exchange_rates) are
--    read-only for app users; they are maintained with the service role / dashboard.
--  * Each edition or variant is its own products row; variants point at their base
--    game through parent_product_id and carry their own EAN, region and photos.
--  * "Missing" is derived (catalog item with no 'owned' row), so it is never stored.

create extension if not exists pg_trgm with schema extensions;

-- ---------- Types ----------
create type public.currency_code as enum ('PLN', 'EUR', 'USD', 'GBP');
create type public.product_kind as enum ('game', 'steelbook', 'game_with_steelbook', 'other');
create type public.collection_status as enum ('owned', 'wishlist');
create type public.item_condition as enum ('sealed', 'mint', 'good', 'fair', 'poor');

-- ---------- Shared trigger ----------
create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text check (char_length(display_name) between 1 and 60),
  avatar_path text,
  preferred_currency public.currency_code not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically on sign-up (no personal data copied except a display name).
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(split_part(coalesce(new.raw_user_meta_data ->> 'display_name', ''), '@', 1), ''));
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- categories ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 80),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- sets (series / collections) ----------
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 120),
  category_id uuid references public.categories (id) on delete set null,
  release_year int check (release_year between 1970 and 2100),
  description text,
  cover_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger sets_updated before update on public.sets
  for each row execute function public.set_updated_at();
create index sets_category_idx on public.sets (category_id);

-- ---------- products ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  parent_product_id uuid references public.products (id) on delete set null,
  set_id uuid references public.sets (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 200),
  kind public.product_kind not null default 'steelbook',
  edition_name text,
  platform text not null check (platform in ('PS5', 'PS4', 'PS3', 'Xbox Series X|S', 'Xbox One', 'Switch', 'PC', 'Other')),
  region text not null check (region in ('EU', 'US', 'JP', 'UK', 'PL', 'AU', 'Other')),
  ean text check (ean ~ '^[0-9]{8,14}$'),
  product_code text check (char_length(product_code) between 3 and 30), -- CUSA / PPSA / etc.
  release_date date,
  description text,
  image_path text,
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_product_id is distinct from id)
);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();
create unique index products_ean_key on public.products (ean) where ean is not null;
create index products_code_idx on public.products (product_code);
create index products_set_idx on public.products (set_id);
create index products_category_idx on public.products (category_id);
create index products_parent_idx on public.products (parent_product_id);
create index products_platform_region_idx on public.products (platform, region);
create index products_release_idx on public.products (release_date desc);
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);

-- ---------- market price history (catalog-wide) ----------
create table public.product_prices (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric(12, 2) not null check (price >= 0),
  currency public.currency_code not null,
  source text not null check (char_length(source) between 1 and 80),
  observed_at timestamptz not null default now()
);
create index product_prices_lookup_idx on public.product_prices (product_id, observed_at desc);

-- ---------- exchange rates (base EUR; filled by an admin or scheduled job) ----------
create table public.exchange_rates (
  currency public.currency_code primary key,
  rate_per_eur numeric(14, 6) not null check (rate_per_eur > 0),
  updated_at timestamptz not null default now()
);

-- ---------- user_collection ----------
create table public.user_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  status public.collection_status not null default 'owned',
  quantity int not null default 1 check (quantity between 1 and 999), -- >1 tracks duplicates
  condition public.item_condition,
  packaging_condition public.item_condition,
  currency public.currency_code not null default 'EUR',
  purchase_price numeric(12, 2) check (purchase_price >= 0),
  current_value numeric(12, 2) check (current_value >= 0),
  purchase_date date check (purchase_date <= current_date),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, status),
  unique (id, user_id) -- target for the composite FK below
);
create trigger user_collection_updated before update on public.user_collection
  for each row execute function public.set_updated_at();
create index user_collection_user_status_idx on public.user_collection (user_id, status);
create index user_collection_product_idx on public.user_collection (product_id);
create index user_collection_tags_idx on public.user_collection using gin (tags);

-- ---------- personal photos of owned items ----------
create table public.collection_item_photos (
  id uuid primary key default gen_random_uuid(),
  collection_item_id uuid not null,
  user_id uuid not null,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  -- the photo owner must be the owner of the collection item
  foreign key (collection_item_id, user_id)
    references public.user_collection (id, user_id) on delete cascade
);
create index collection_item_photos_item_idx on public.collection_item_photos (collection_item_id);

-- ---------- collection_shares ----------
create table public.collection_shares (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  share_id text not null unique default replace(gen_random_uuid()::text, '-', ''),
  is_enabled boolean not null default false,
  show_prices boolean not null default false,
  show_wishlist boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collection_shares_updated before update on public.collection_shares
  for each row execute function public.set_updated_at();
