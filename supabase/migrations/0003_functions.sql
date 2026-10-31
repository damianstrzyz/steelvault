-- Steelvault Stage 2, part 3: public sharing and statistics functions.

-- Public shared view. SECURITY DEFINER bypasses RLS on purpose, but it only returns
-- rows when the owner enabled sharing, and only the columns listed here: no user id,
-- email, notes or photos. Prices appear only when the owner turned show_prices on.
create function public.get_shared_collection(p_share_id text)
returns table (
  owner_display_name text,
  product_id uuid, product_name text, product_slug text, platform text, region text,
  ean text, product_code text, image_path text, set_id uuid, category_id uuid,
  status public.collection_status, quantity int, condition public.item_condition,
  currency public.currency_code, current_value numeric
)
language sql stable security definer set search_path = '' as $$
  select pr.display_name,
         p.id, p.name, p.slug, p.platform, p.region, p.ean, p.product_code, p.image_path,
         p.set_id, p.category_id,
         uc.status, uc.quantity, uc.condition, uc.currency,
         case when cs.show_prices then uc.current_value end
  from public.collection_shares cs
  join public.profiles pr on pr.id = cs.user_id
  join public.user_collection uc on uc.user_id = cs.user_id
  join public.products p on p.id = uc.product_id
  where cs.share_id = p_share_id
    and cs.is_enabled
    and (uc.status = 'owned' or cs.show_wishlist)
$$;
revoke all on function public.get_shared_collection(text) from public;
grant execute on function public.get_shared_collection(text) to anon, authenticated;

-- Statistics for the signed-in user (SECURITY INVOKER: RLS still applies).
create function public.my_collection_counts()
returns table (catalog_total bigint, owned_distinct bigint, owned_quantity bigint, wishlist_total bigint)
language sql stable security invoker set search_path = '' as $$
  select (select count(*) from public.products),
         count(*) filter (where status = 'owned'),
         coalesce(sum(quantity) filter (where status = 'owned'), 0)::bigint,
         count(*) filter (where status = 'wishlist')
  from public.user_collection
  where user_id = (select auth.uid())
$$;

create function public.my_set_completion()
returns table (set_id uuid, set_name text, total_products bigint, owned_products bigint)
language sql stable security invoker set search_path = '' as $$
  select s.id, s.name, count(p.id), count(uc.id)
  from public.sets s
  join public.products p on p.set_id = s.id
  left join public.user_collection uc
    on uc.product_id = p.id and uc.status = 'owned' and uc.user_id = (select auth.uid())
  group by s.id, s.name
$$;

-- Totals are per currency; convert in the client with public.exchange_rates.
create function public.my_value_breakdown()
returns table (platform text, category_id uuid, currency public.currency_code,
               purchase_total numeric, value_total numeric)
language sql stable security invoker set search_path = '' as $$
  select p.platform, p.category_id, uc.currency,
         coalesce(sum(uc.purchase_price * uc.quantity), 0),
         coalesce(sum(uc.current_value * uc.quantity), 0)
  from public.user_collection uc
  join public.products p on p.id = uc.product_id
  where uc.user_id = (select auth.uid()) and uc.status = 'owned'
  group by p.platform, p.category_id, uc.currency
$$;
