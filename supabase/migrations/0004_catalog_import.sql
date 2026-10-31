-- Steelvault Stage 4: bulk catalog import path (admin only, no client access).
-- Workflow: import a CSV into catalog_import (Table Editor > Import data), then run
--   select * from public.run_catalog_import();
-- in the SQL editor. Re-running with the same rows updates instead of duplicating.

create function public.slugify(t text)
returns text language sql immutable set search_path = '' as $$
  select trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g'))
$$;

create table public.catalog_import (
  row_id bigint generated always as identity primary key,
  name text not null,
  kind text not null default 'steelbook' check (kind in ('game', 'steelbook', 'game_with_steelbook', 'other')),
  edition_name text,
  platform text not null,
  region text not null,
  ean text,
  product_code text,
  release_date date,
  description text,
  image_path text,
  category_name text,
  set_name text,
  set_year int,
  parent_ean text,   -- EAN of the base game when this row is an edition/variant
  slug text          -- filled by the import function; leave empty in the CSV
);
alter table public.catalog_import enable row level security; -- no policies: dashboard / service role only

create function public.run_catalog_import()
returns table (categories_added int, sets_added int, products_upserted int)
language plpgsql security definer set search_path = '' as $$
declare c int; s int; p int;
begin
  update public.catalog_import
     set slug = public.slugify(concat_ws(' ', name, edition_name, platform, region, coalesce(product_code, ean)));

  insert into public.categories (slug, name)
  select distinct on (public.slugify(category_name)) public.slugify(category_name), category_name
    from public.catalog_import
   where public.slugify(category_name) <> ''
   order by public.slugify(category_name)
  on conflict (slug) do nothing;
  get diagnostics c = row_count;

  insert into public.sets (slug, name, category_id, release_year)
  select distinct on (public.slugify(i.set_name))
         public.slugify(i.set_name), i.set_name,
         (select id from public.categories where slug = public.slugify(i.category_name)),
         i.set_year
    from public.catalog_import i
   where public.slugify(i.set_name) <> ''
   order by public.slugify(i.set_name)
  on conflict (slug) do nothing;
  get diagnostics s = row_count;

  insert into public.products (slug, name, kind, edition_name, platform, region, ean, product_code,
                               release_date, description, image_path, set_id, category_id)
  select distinct on (i.slug)
         i.slug, i.name, i.kind::public.product_kind, i.edition_name, i.platform, i.region,
         nullif(i.ean, ''), nullif(i.product_code, ''), i.release_date, i.description, i.image_path,
         (select id from public.sets where slug = public.slugify(i.set_name)),
         coalesce((select id from public.categories where slug = public.slugify(i.category_name)),
                  (select category_id from public.sets where slug = public.slugify(i.set_name)))
    from public.catalog_import i
   where i.slug <> ''
   order by i.slug, i.row_id
  on conflict (slug) do update set
    name = excluded.name, kind = excluded.kind, edition_name = excluded.edition_name,
    platform = excluded.platform, region = excluded.region, ean = excluded.ean,
    product_code = excluded.product_code, release_date = excluded.release_date,
    description = excluded.description, image_path = excluded.image_path,
    set_id = excluded.set_id, category_id = excluded.category_id;
  get diagnostics p = row_count;

  update public.products pr
     set parent_product_id = base.id
    from public.catalog_import i
    join public.products base on base.ean = i.parent_ean
   where pr.slug = i.slug and i.parent_ean is not null and base.id <> pr.id;

  truncate public.catalog_import;
  return query select c, s, p;
end $$;
revoke all on function public.run_catalog_import() from public, anon, authenticated;
