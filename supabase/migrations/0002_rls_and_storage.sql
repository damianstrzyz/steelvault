-- Steelvault Stage 2, part 2: Row Level Security and Storage.
-- (select auth.uid()) is wrapped so Postgres evaluates it once per query.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.sets enable row level security;
alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.user_collection enable row level security;
alter table public.collection_item_photos enable row level security;
alter table public.collection_shares enable row level security;

-- Catalog: readable by everyone, writable only with the service role (no write policies).
create policy "catalog read" on public.categories for select to anon, authenticated using (true);
create policy "catalog read" on public.sets for select to anon, authenticated using (true);
create policy "catalog read" on public.products for select to anon, authenticated using (true);
create policy "catalog read" on public.product_prices for select to anon, authenticated using (true);
create policy "catalog read" on public.exchange_rates for select to anon, authenticated using (true);

-- Profiles: owner only. Public pages get the display name through the sharing function.
create policy "profile select own" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profile update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Collection: each user manages only their own rows.
create policy "collection select own" on public.user_collection for select to authenticated
  using (user_id = (select auth.uid()));
create policy "collection insert own" on public.user_collection for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "collection update own" on public.user_collection for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "collection delete own" on public.user_collection for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "photos select own" on public.collection_item_photos for select to authenticated
  using (user_id = (select auth.uid()));
create policy "photos insert own" on public.collection_item_photos for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "photos delete own" on public.collection_item_photos for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "share select own" on public.collection_shares for select to authenticated
  using (user_id = (select auth.uid()));
create policy "share insert own" on public.collection_shares for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "share update own" on public.collection_shares for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "share delete own" on public.collection_shares for delete to authenticated
  using (user_id = (select auth.uid()));

-- Storage: public catalog images (read-only for clients), private per-user photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('user-photos', 'user-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Object paths in user-photos must start with the user's id: <uid>/<file>.
create policy "user photos select own" on storage.objects for select to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user photos insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user photos update own" on storage.objects for update to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
