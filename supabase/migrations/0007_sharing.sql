-- Steelvault Stage 7: collection sharing.
-- Clients can no longer write collection_shares directly. They call the two functions
-- below, which always act on auth.uid() and generate the share id server-side.

alter table public.collection_shares
  add constraint collection_shares_share_id_format check (share_id ~ '^[a-f0-9]{32}$');

drop policy if exists "share insert own" on public.collection_shares;
drop policy if exists "share update own" on public.collection_shares;
revoke insert, update on public.collection_shares from anon, authenticated;

create function public.save_collection_sharing(p_enabled boolean, p_show_prices boolean, p_show_wishlist boolean)
returns public.collection_shares
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result public.collection_shares;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  insert into public.collection_shares (user_id, is_enabled, show_prices, show_wishlist)
  values (uid, p_enabled, p_show_prices, p_show_wishlist)
  on conflict (user_id) do update
    set is_enabled = excluded.is_enabled,
        show_prices = excluded.show_prices,
        show_wishlist = excluded.show_wishlist
  returning * into result;
  return result;
end $$;

create function public.regenerate_share_id()
returns text
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  new_id text;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  update public.collection_shares
     set share_id = replace(gen_random_uuid()::text, '-', '')
   where user_id = uid
  returning share_id into new_id;
  if new_id is null then raise exception 'sharing is not set up yet'; end if;
  return new_id;
end $$;

revoke all on function public.save_collection_sharing(boolean, boolean, boolean) from public, anon;
revoke all on function public.regenerate_share_id() from public, anon;
grant execute on function public.save_collection_sharing(boolean, boolean, boolean) to authenticated;
grant execute on function public.regenerate_share_id() to authenticated;

-- Public read side. Returns nothing unless the owner enabled sharing. Never returns the
-- user id, email, notes, tags, purchase price or photos. Prices only if show_prices is on.
create function public.get_shared_collection_info(p_share_id text)
returns table (owner_display_name text, show_prices boolean, show_wishlist boolean, owned_count bigint, wishlist_count bigint)
language sql stable security definer set search_path = '' as $$
  select pr.display_name, cs.show_prices, cs.show_wishlist,
         (select count(*) from public.user_collection uc where uc.user_id = cs.user_id and uc.status = 'owned'),
         case when cs.show_wishlist
              then (select count(*) from public.user_collection uc where uc.user_id = cs.user_id and uc.status = 'wishlist')
              else 0 end
    from public.collection_shares cs
    join public.profiles pr on pr.id = cs.user_id
   where cs.share_id = p_share_id and cs.is_enabled
$$;

drop function if exists public.get_shared_collection(text);

create function public.get_shared_collection(
  p_share_id text,
  p_status public.collection_status default 'owned',
  p_search text default null,
  p_platform text default null,
  p_limit int default 48,
  p_offset int default 0
)
returns table (
  product_id uuid, product_name text, product_slug text, kind public.product_kind, edition_name text,
  platform text, region text, ean text, product_code text, release_date date, image_path text,
  set_name text, category_name text,
  status public.collection_status, quantity int, condition public.item_condition,
  currency public.currency_code, current_value numeric, total_count bigint
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.name, p.slug, p.kind, p.edition_name, p.platform, p.region, p.ean, p.product_code,
         p.release_date, p.image_path, s.name, c.name,
         uc.status, uc.quantity, uc.condition, uc.currency,
         case when cs.show_prices then uc.current_value end,
         count(*) over ()
    from public.collection_shares cs
    join public.user_collection uc on uc.user_id = cs.user_id and uc.status = p_status
    join public.products p on p.id = uc.product_id
    left join public.sets s on s.id = p.set_id
    left join public.categories c on c.id = p.category_id
   where cs.share_id = p_share_id
     and cs.is_enabled
     and (p_status = 'owned' or cs.show_wishlist)
     and (p_platform is null or p.platform = p_platform)
     and (coalesce(p_search, '') = ''
          or p.name ilike '%' || p_search || '%'
          or p.ean = p_search
          or p.product_code ilike p_search || '%')
   order by p.name, p.id
   limit least(greatest(p_limit, 1), 100)
   offset greatest(p_offset, 0)
$$;

revoke all on function public.get_shared_collection_info(text) from public;
revoke all on function public.get_shared_collection(text, public.collection_status, text, text, int, int) from public;
grant execute on function public.get_shared_collection_info(text) to anon, authenticated;
grant execute on function public.get_shared_collection(text, public.collection_status, text, text, int, int) to anon, authenticated;
